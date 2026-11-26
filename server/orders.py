import asyncio
import hashlib
import json
import os
import re
import sqlite3
import ssl
import time
from contextlib import closing, suppress
from datetime import date, datetime
from pathlib import Path
from uuid import UUID
from zoneinfo import ZoneInfo

from aiohttp import ClientError, ClientSession, ClientTimeout, web

MAX_ENDPOINT = "https://platform-api2.max.ru/messages"
LOCAL_ZONE = ZoneInfo("Asia/Vladivostok")
METHODS = {
    "pickup": "Самовывоз",
    "delivery": "Доставка до двери по Хабаровску",
    "express": "Экспресс-доставка · подтвердить срок",
}


def clean_text(payload, key, limit, required=True):
    value = payload.get(key, "")
    if not isinstance(value, str):
        raise ValueError(key)
    value = " ".join(value.split())
    if len(value) > limit or (required and not value):
        raise ValueError(key)
    return value


def parse_order(payload):
    if not isinstance(payload, dict) or payload.get("website"):
        raise ValueError("payload")
    if payload.get("consent") is not True:
        raise ValueError("consent")
    raw_id = clean_text(payload, "id", 36)
    order_id = UUID(raw_id, version=4)
    if str(order_id) != raw_id:
        raise ValueError("id")
    phone = clean_text(payload, "phone", 30)
    if not re.fullmatch(r"\+?[0-9 ().-]+", phone):
        raise ValueError("phone")
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        digits = "7" + digits
    elif len(digits) == 11 and digits.startswith("8"):
        digits = "7" + digits[1:]
    if not 10 <= len(digits) <= 15:
        raise ValueError("phone")
    method = clean_text(payload, "method", 10)
    if method not in METHODS:
        raise ValueError("method")
    day = clean_text(payload, "date", 10, required=False)
    if day and (date.fromisoformat(day).isoformat() != day or date.fromisoformat(day) < datetime.now(LOCAL_ZONE).date()):
        raise ValueError("date")
    height = payload.get("height")
    if type(height) is not int or not 60 <= height <= 500:
        raise ValueError("height")
    price = payload.get("price")
    if type(price) is not int or not 0 <= price <= 1_000_000:
        raise ValueError("price")
    ref = payload.get("ref")
    return {
        "id": raw_id,
        "model": clean_text(payload, "model", 100),
        "article": clean_text(payload, "article", 50, required=False),
        "height": height,
        "price": price,
        "method": method,
        "address": clean_text(payload, "address", 200, required=False) if method != "pickup" else "",
        "date": day,
        "name": clean_text(payload, "name", 80, required=False),
        "consent": True,
        "phone": "+" + digits,
        "ref": ref if ref in ("01", "02", "03", "04") else "",
    }


def order_number(order_id):
    return order_id.split("-")[0].upper()


def message_for(order):
    lines = [
        "🎄 Новая заявка с сайта · " + order_number(order["id"]),
        "Модель: " + order["model"] + (f' ({order["article"]})' if order["article"] else ""),
        f'Высота: {order["height"]} см',
        "Получение: " + METHODS[order["method"]],
        "Дата: " + (date.fromisoformat(order["date"]).strftime("%d.%m.%Y") if order["date"] else "согласуем"),
        "Имя: " + (order["name"] or "не указано"),
        "Телефон: " + order["phone"],
    ]
    if order["price"]:
        amount = f'{order["price"]:,}'.replace(",", " ")
        lines.append(f"Цена на витрине: {amount} ₽")
    if order["address"]:
        lines.append("Адрес: " + order["address"])
    if order["ref"]:
        lines.append("Промокод партнёра: " + order["ref"])
    lines.append("Подтвердите покупателю наличие, итоговую сумму и время.")
    return "\n".join(lines)


class Orders:
    def __init__(self, path):
        self.path = path
        with closing(self.connect()) as db, db:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("""CREATE TABLE IF NOT EXISTS orders (
              id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, payload TEXT,
              ready_at REAL NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
            )""")

    def connect(self):
        return sqlite3.connect(self.path, timeout=3)

    def accept(self, order):
        payload = json.dumps(order, ensure_ascii=False, sort_keys=True)
        fingerprint = hashlib.sha256(payload.encode()).hexdigest()
        now = time.time()
        with closing(self.connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT fingerprint FROM orders WHERE id=?", (order["id"],)).fetchone()
            if row:
                return 200 if row[0] == fingerprint else 409
            db.execute("DELETE FROM orders WHERE payload IS NULL AND ready_at < ?", (now - 7 * 86400,))
            db.execute(
                "INSERT INTO orders(id, fingerprint, payload, ready_at) VALUES(?,?,?,?)",
                (order["id"], fingerprint, payload, now),
            )
            return 201

    def claim(self):
        now = time.time()
        with closing(self.connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute(
                "SELECT id, payload, attempts FROM orders WHERE payload IS NOT NULL AND ready_at <= ? "
                "ORDER BY ready_at LIMIT 1",
                (now,),
            ).fetchone()
            if not row:
                return None
            order_id, payload, attempts = row
            db.execute(
                "UPDATE orders SET ready_at=?, attempts=? WHERE id=?",
                (now + 60, attempts + 1, order_id),
            )
            return json.loads(payload), attempts + 1

    def finish(self, order_id, attempts, sent):
        with closing(self.connect()) as db, db:
            if sent:
                db.execute("UPDATE orders SET payload=NULL, ready_at=? WHERE id=?", (time.time(), order_id))
            else:
                delay = min(900, 10 * 2 ** min(attempts - 1, 7))
                db.execute("UPDATE orders SET ready_at=? WHERE id=?", (time.time() + delay, order_id))


async def notify_max(session, token, user_id, order, tls):
    async with session.post(
        MAX_ENDPOINT,
        params={"user_id": user_id, "disable_link_preview": "true"},
        headers={"Authorization": token},
        json={"text": message_for(order), "notify": True},
        ssl=tls,
        allow_redirects=False,
    ) as response:
        if response.status != 200:
            return False
        result = await response.json()
        message = result.get("message") if isinstance(result, dict) else None
        return isinstance(message, dict) and isinstance(message.get("body"), dict) and bool(message["body"].get("mid"))


async def work(orders, token, user_id, tls):
    async with ClientSession(timeout=ClientTimeout(total=8)) as session:
        while True:
            try:
                item = await asyncio.to_thread(orders.claim)
                if item is None:
                    await asyncio.sleep(1)
                    continue
                order, attempts = item
                try:
                    sent = await notify_max(session, token, user_id, order, tls)
                except (ClientError, TimeoutError, ValueError):
                    sent = False
                await asyncio.to_thread(orders.finish, order["id"], attempts, sent)
                if not sent:
                    print(f"MAX delivery pending: {order_number(order['id'])}; attempt {attempts}", flush=True)
                await asyncio.sleep(0.6)
            except sqlite3.Error:
                print("Order queue temporarily unavailable.", flush=True)
                await asyncio.sleep(2)


def make_app(orders, origin, token, user_id, tls):
    recent = []

    async def receive(request):
        if request.headers.get("Origin") != origin:
            raise web.HTTPForbidden()
        headers = {"Access-Control-Allow-Origin": origin, "Vary": "Origin"}
        if request.method == "OPTIONS":
            headers.update({
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "600",
            })
            return web.Response(status=204, headers=headers)
        if os.environ.get("ORDERS_ENABLED", "0") != "1":
            return web.json_response({"error": "not_enabled"}, status=503, headers=headers)
        if request.content_type != "application/json":
            return web.json_response({"error": "format"}, status=415, headers=headers)
        try:
            order = parse_order(await request.json())
        except web.HTTPRequestEntityTooLarge:
            return web.json_response({"error": "size"}, status=413, headers=headers)
        except (TypeError, ValueError):
            return web.json_response({"error": "invalid_order"}, status=400, headers=headers)
        now = time.monotonic()
        recent[:] = [event for event in recent if now - event < 60]
        if len(recent) >= 30:
            return web.json_response({"error": "busy"}, status=429, headers=headers)
        recent.append(now)
        try:
            status = await asyncio.to_thread(orders.accept, order)
        except sqlite3.Error:
            return web.json_response({"error": "unavailable"}, status=503, headers=headers)
        if status == 409:
            return web.json_response({"error": "conflict"}, status=status, headers=headers)
        return web.json_response({"order_number": order_number(order["id"])}, status=status, headers=headers)

    async def worker_context(_app):
        worker = asyncio.create_task(work(orders, token, user_id, tls))
        try:
            yield
        finally:
            worker.cancel()
            with suppress(asyncio.CancelledError):
                await worker

    async def config(_request):
        # No client-side access until HTTPS, Russian-hosted DB and MAX bot are ready.
        is_enabled = os.environ.get("ORDERS_ENABLED", "0") == "1"
        return web.json_response(
            {"enabled": is_enabled, "privacy_url": origin + "/privacy.html"},
            headers={"Access-Control-Allow-Origin": origin,
                     "Vary": "Origin", "Cache-Control": "no-store"},
        )

    async def health(_request):
        return web.Response(text="OK")

    app = web.Application(client_max_size=4096)
    app.router.add_route("POST", "/orders", receive)
    app.router.add_route("OPTIONS", "/orders", receive)
    app.router.add_get("/health", health)
    app.router.add_get("/config", config)
    app.cleanup_ctx.append(worker_context)
    return app


def main():
    os.umask(0o077)
    token = os.environ["MAX_BOT_TOKEN"].strip()
    user_id = os.environ["MAX_USER_ID"].strip()
    if not token or not re.fullmatch(r"[1-9][0-9]{0,18}", user_id):
        raise SystemExit("Set MAX_BOT_TOKEN and MAX_USER_ID.")
    tls = ssl.create_default_context()
    if ca_file := os.environ.get("MAX_CA_FILE"):
        tls.load_verify_locations(cafile=ca_file)
    db_path = Path(os.environ.get("ORDERS_DB", "./data/orders.sqlite3"))
    db_path.parent.mkdir(parents=True, exist_ok=True)
    origin = os.environ.get("SITE_ORIGIN", "https://sezonchik27.ru").rstrip("/")
    app = make_app(Orders(db_path), origin, token, user_id, tls)
    web.run_app(app, host=os.environ.get("BIND_HOST", "127.0.0.1"), port=int(os.environ.get("PORT", "8081")), access_log=None)


if __name__ == "__main__":
    main()
