#!/usr/bin/env python3
import tempfile, shutil, subprocess, sys
from pathlib import Path
script=Path(__file__).with_name('sezonchik_v14_patch.py')
with tempfile.TemporaryDirectory() as temp:
 root=Path(temp)
 (root/'scripts').mkdir();(root/'server').mkdir();(root/'elki').mkdir()
 shutil.copy(script,root/'scripts/sezonchik_v14_patch.py')
 template={
 'index.html':'''<html><body><main><section class="v4-bestsellers" id="sales-hits" aria-labelledby="sales-hits-title"><div>Селена 210 см — 23990</div></section></main><script src="referral-v94.js?v=10.1"></script></body></html>''',
 'trees.html':'''<html><body><article class="tree-product" id="tree-11"><select><option value="15990">180 см — 15 990 ₽</option><option data-season-price="29000" value="23990">210 см — 23 990 ₽</option></select></article><script src="referral-v94.js?v=10.1"></script></body></html>''',
 'elki/serebryanaya-skazka-se-625664.html':'''<html><head><meta content="размеры 180, 210, 270, 300 см"><script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Селена","offers":[{"name":"Селена, 180 см","price":15990},{"name":"Селена, 210 см","price":23990}]}]}</script></head><body><div class="shop-variants"><button data-size="210" data-price="23990">210 см</button></div><tr><td><a class="seo-size-order" href="../trees.html?book=tree-11&amp;size=210#tree-11">210 см</a></td><td class="seo-price">Сейчас: 23 990 ₽</td></tr><script src="../referral-v94.js?v=10.1"></script></body></html>''',
 'tree-detail-shop.js':'''choose(sizes.find(button => button.dataset.size === requestedSize) || sizes[0]);
if (!button) return;
    choose(button);''',
 'dostavka.html':'<html><body><main>Доставка</main><script src="referral-v94.js?v=10.1"></script></body></html>',
 'elki-komsomolsk-na-amure.html':'<html><body>Доставка за один день — 0 ₽</body></html>',
 'delivery-page.js':"estimate: 'Доставка за один день — 0 ₽',\nestimate: 'Доставка за один день — 0 ₽',",
 'trees-catalog.js':'Комсомольск-на-Амуре · доставка за один день · 0 ₽ до пункта выдачи ТК',
 'v9-premium.js':'''const order = {
      article: 'x'
};
bookForm.elements.name.required = websiteOrder;
bookForm.elements.date.required = websiteOrder;
address.required = needsAddress && usesWebsiteOrders();''',
 'server/orders.py':'''import os
from aiohttp import web
from datetime import date,datetime
from zoneinfo import ZoneInfo
LOCAL_ZONE=ZoneInfo('Asia/Vladivostok')
def clean_text(*args,**kwargs):pass
def parse_order(payload):
    raw_id = clean_text(payload, "id", 36)
    day = clean_text(payload, "date", 10)
    if date.fromisoformat(day).isoformat() != day or date.fromisoformat(day) < datetime.now(LOCAL_ZONE).date():
        raise ValueError('date')
    return {
        "name": clean_text(payload, "name", 80),
        "address": clean_text(payload, "address", 200) if method != "pickup" else "",
    }
def message_for(order):
    lines=[
      "Дата: " + date.fromisoformat(order["date"]).strftime("%d.%m.%Y"),
      "Имя: " + order["name"],
    ]
    return '\\n'.join(lines)
def make_app(orders, origin, token, user_id, tls):
    async def health(_request):
        return web.Response(text='OK')
    app = web.Application()
    app.router.add_get("/health", health)
    return app
''',
 'sitemap.xml':'<urlset><url><loc>https://sezonchik27.ru/</loc><lastmod>2026-11-22</lastmod></url></urlset>'}
 for path,content in template.items():
  p=root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content,encoding='utf-8')
 def run():
  r=subprocess.run([sys.executable,str(root/'scripts/sezonchik_v14_patch.py')],cwd=root,text=True,capture_output=True)
  assert r.returncode==0,(r.stdout,r.stderr)
  return r.stdout
 print(run())
 home=(root/'index.html').read_text();sel=(root/'elki/serebryanaya-skazka-se-625664.html').read_text();catalog=(root/'trees.html').read_text()
 assert home.count('sc-hit-model-card')==8
 assert '210 см — распродана' in catalog
 assert '23 990 ₽' not in sel
 assert '210 см · распродана' in sel
 assert 'consent' in (root/'server/orders.py').read_text()
 assert '/config' in (root/'server/orders.py').read_text()
 assert 'v=20261126-v14' in home
 assert 'privacy.html' in home
 first={p: (root/p).read_bytes() for p in template}
 print(run())
 assert all(first[p]==(root/p).read_bytes() for p in template),"Non-idempotent patch"
 subprocess.run([sys.executable,'-m','py_compile',str(root/'server/orders.py')],check=True)
 print('PASS: 8 cards, Selena 210, booking privacy, cache version, backend config, idempotency')
