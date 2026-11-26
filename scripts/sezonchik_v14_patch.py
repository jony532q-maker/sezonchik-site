#!/usr/bin/env python3
"""One-time, idempotent V14 static source patch. Run at repository root.
Does NOT manage inventory. Order API stays disabled until its own service is deployed.
"""
from pathlib import Path
import re
import json
from datetime import date

ROOT=Path(__file__).resolve().parents[1]
DATE="2026-11-26"
VERSION="20261126-v14"
changes=[]

def edit(path, action):
    p=ROOT/path
    if not p.exists():
        print(f"SKIPPED (not found): {path}");return
    old=p.read_text(encoding="utf-8")
    new=action(old)
    if new!=old:
        p.write_text(new,encoding="utf-8")
        changes.append(str(path))
        print(f"UPDATED: {path}")
    else:print(f"UNCHANGED: {path}")

def legal_links(page):
    prefix="../" if str(page).startswith("elki/") else ""
    return ('<nav class="sc-legal-static-v14" aria-label="Правовая информация" '
            'style="text-align:center;padding:18px 14px;font-size:12px;line-height:1.6">'
            f'<a href="{prefix}privacy.html">Политика обработки персональных данных</a> · '
            f'<a href="{prefix}consent.html">Согласие на обработку данных</a></nav>')

def update_html_common(s,page):
    for script in ('referral-v94.js','v9-premium.js','trees-catalog.js','tree-detail-shop.js','delivery-page.js'):
        pattern=r'('+re.escape(script)+r'\?v=)[^"\']+'
        s=re.sub(pattern,lambda m:m.group(1)+VERSION,s)
    if 'sc-legal-static-v14' not in s and '</body>' in s:
        s=s.replace('</body>',legal_links(page)+'\n</body>',1)
    return s

MODELS=[
  ('Селена','assets/trees/emerald-20261104/2566-main.webp','elki/serebryanaya-skazka-se-625664.html'),
  ('Стелла','assets/trees/emerald-20261104/2402-main.webp','elki/taezhnaya-stroynost-se-624027.html'),
  ('Адель','assets/trees/emerald-20261104/1717-main.webp','elki/lesnaya-nezhnost-se-417179.html'),
  ('Гармония','assets/trees/emerald-20261104/1976-main.webp','elki/lesnaya-garmoniya-se-819765.html'),
  ('Императрица','assets/trees/v92/golubaya-imperatritsa-2433-1.webp','elki/golubaya-imperatritsa-2433.html'),
  ('Жемчужина','assets/trees/emerald-20261104/2566b-main.webp','elki/taezhnaya-zhemchuzhina-se-42566v7.html'),
  ('Грация','assets/trees/emerald-20261104/2425-main.webp','elki/lesnaya-gratsiya-se-624253.html'),
  ('Метелица','assets/trees/emerald-20261104/06b-main.webp','elki/snezhnaya-metelitsa-06b.html'),
]

def static_hits():
    pieces=['<section class="v4-bestsellers" id="sales-hits" aria-labelledby="sales-hits-title">',
      '<div class="v4-wrap"><div class="v4-section-head"><h2 id="sales-hits-title">Хиты продаж</h2>',
      '<a class="v4-more-link" href="trees.html#tree-catalog">Весь каталог ↗</a></div>',
      '<div class="v4-product-grid">']
    import html
    for name,img,url in MODELS:
        name=html.escape(name);url=html.escape(url,quote=True);img=html.escape(img,quote=True)
        pieces.append(f'<article class="v4-product-card v6-product sc-hit-model-card">'
                      f'<a class="v4-product-photo" href="{url}"><img alt="Искусственная ёлка {name} — СЕЗОНЩИК" src="{img}" width="710" height="947" loading="lazy" decoding="async"></a>'
                      f'<div class="v4-product-body"><h3><a href="{url}">{name}</a></h3>'
                      f'<div class="v4-product-foot"><a class="v4-product-button sc-hit-model-action" href="{url}">Смотреть модель</a></div>'
                      '</div></article>')
    pieces.append('</div></div></section>')
    return ''.join(pieces)

def home(s):
    s=update_html_common(s,'index.html')
    pattern=r'<section class="v4-bestsellers" id="sales-hits".*?</section>'
    if re.search(pattern,s,re.S):s=re.sub(pattern,lambda _:static_hits(),s,count=1,flags=re.S)
    return s
edit('index.html',home)

def catalog(s):
    s=update_html_common(s,'trees.html')
    match=re.search(r'<article class="tree-product"[^>]*\bid="tree-11".*?</article>',s,re.S)
    if match:
        section=match.group(0)
        # Only the Selena 210 option, not similarly priced variants of another model.
        section=re.sub(r'<option\b[^>]*>\s*210\s*см\s*—\s*23\s*990\s*₽\s*</option>',
            '<option disabled hidden data-stock="sold-out" value="0">210 см — распродана</option>',section,count=1)
        s=s[:match.start()]+section+s[match.end():]
    return s
edit('trees.html',catalog)

def selena(s):
    s=update_html_common(s,'elki/serebryanaya-skazka-se-625664.html')
    s=s.replace('размеры 180, 210, 270, 300 см','размеры 180, 270, 300 см; 210 см распродана')
    s=s.replace('180, 210, 270, 300 см | СЕЗОНЩИК','180, 270, 300 см | СЕЗОНЩИК')
    # Make the size unavailable even without JavaScript.
    s=re.sub(r'(<button\b[^>]*\bdata-size="210"[^>]*)(>\s*210 см\s*</button>)',
             lambda m: m.group(1).rstrip('>')+' disabled aria-disabled="true"'+m.group(2).replace('210 см','210 см · распродана'),s,count=1)
    # Static HTML table: remove the link and the old price entirely for the sold-out size.
    tr=re.compile(r'<tr><td><a\s+class="seo-size-order"\s+href="[^\"]*size=210[^\"]*"[^>]*>210\s*см</a></td><td class="seo-price">.*?</td></tr>',re.S)
    s=tr.sub('<tr><td><span class="sc-selena-size-unavailable">210 см — распродана</span></td><td class="seo-price">Нет в наличии · без нового поступления</td></tr>',s,count=1)
    # Static fallback variants: don't leave a purchase link for 210 cm.
    s=re.sub(r'<li><a href="[^\"]*size=210[^\"]*">210\s*см\s*—\s*23\s*990\s*₽</a></li>',
             '<li>210 см — распродана</li>',s,count=1)
    pattern=r'(<script type="application/ld\+json">)(.*?)(</script>)'
    def schema(m):
        try:
            data=json.loads(m.group(2));modified=False
            for item in data.get('@graph',[]):
                if item.get('@type')=='Product' and 'Селена' in item.get('name',''):
                    before=item.get('offers',[])
                    item['offers']=[v for v in before if not re.search(r'210\s*см',v.get('name',''))]
                    modified=len(before)!=len(item['offers'])
            if modified:return m.group(1)+json.dumps(data,ensure_ascii=False,separators=(',',':'))+m.group(3)
        except (ValueError,TypeError):pass
        return m.group(0)
    return re.sub(pattern,schema,s,count=1,flags=re.S)
edit('elki/serebryanaya-skazka-se-625664.html',selena)
# Other individual tree pages also use the shared script; update its cache key.
for product_page in sorted((ROOT/'elki').glob('*.html')):
    rel=str(product_page.relative_to(ROOT))
    if rel=='elki/serebryanaya-skazka-se-625664.html':continue
    if 'referral-v94.js?v=' in product_page.read_text(encoding='utf-8'):
        edit(rel,lambda text,path=rel:update_html_common(text,path))

def tree_detail_js(s):
    old="sizes.find(button => button.dataset.size === requestedSize) || sizes[0]"
    new="sizes.find(button => button.dataset.size === requestedSize && !button.disabled) || sizes.find(button => !button.disabled) || sizes[0]"
    s=s.replace(old,new)
    s=s.replace("if (!button) return;\n    choose(button);","if (!button || button.disabled) return;\n    choose(button);")
    return s
edit('tree-detail-shop.js',tree_detail_js)

def delivery(s):
    return update_html_common(s,'dostavka.html')
edit('dostavka.html',delivery)

def regional(s):
    s=update_html_common(s,'elki-komsomolsk-na-amure.html')
    s=s.replace('Доставка за один день — 0 ₽','Доставка 0 ₽ · срок подтвердим до оплаты')
    s=s.replace('Бесплатная доставка за один день из Хабаровска','Бесплатная доставка из Хабаровска')
    s=s.replace('Бесплатная доставка за один день из Хабаровска до пункта выдачи ТК','Бесплатная доставка до пункта выдачи ТК')
    s=s.replace('Доставка за один день.','Срок доставки подтвердим до оплаты.')
    return s
edit('elki-komsomolsk-na-amure.html',regional)

def delivery_js(s):
    s=s.replace("estimate: 'Доставка за один день — 0 ₽',","estimate: 'Доставка 0 ₽ · срок подтвердим до оплаты',",1)
    s=s.replace("estimate: 'Доставка за один день — 0 ₽',","estimate: 'Доставка 0 ₽ до ПВЗ · срок подтвердим до оплаты',",1)
    return s
edit('delivery-page.js',delivery_js)

def catalog_js(s):
    s=s.replace('Комсомольск-на-Амуре · доставка за один день · 0 ₽ до пункта выдачи ТК','Комсомольск-на-Амуре · доставка 0 ₽ до пункта выдачи ТК · срок уточним')
    s=s.replace('Биробиджан · доставка из Хабаровска за один день · 0 ₽','Биробиджан · доставка из Хабаровска 0 ₽ · срок уточним')
    return s
edit('trees-catalog.js',catalog_js)

def booking_js(s):
    s=s.replace("const order = {\n      article:","const order = {\n      consent: Boolean(bookForm.querySelector('[data-sc-order-consent]')?.checked),\n      article:")
    s=s.replace('bookForm.elements.name.required = websiteOrder;','bookForm.elements.name.required = false;')
    s=s.replace('bookForm.elements.date.required = websiteOrder;','bookForm.elements.date.required = false;')
    s=s.replace('address.required = needsAddress && usesWebsiteOrders();','address.required = false;')
    s=s.replace('Доставка за один день — 0 ₽ до пункта выдачи ТК в Комсомольске-на-Амуре.', 'Доставка 0 ₽ до пункта выдачи ТК в Комсомольске-на-Амуре. Срок подтвердим до оплаты.')
    s=s.replace('Доставка до Биробиджана за один день — 0 ₽.', 'Доставка до Биробиджана 0 ₽. Срок и место получения согласуем.')
    return s
edit('v9-premium.js',booking_js)

def backend(s):
    if 'async def config(_request):' not in s:
        marker='    async def health(_request):\n'
        cfg='''    async def config(_request):
        # No client-side access until HTTPS, Russian-hosted DB and MAX bot are ready.
        is_enabled = os.environ.get("ORDERS_ENABLED", "0") == "1"
        return web.json_response(
            {"enabled": is_enabled, "privacy_url": origin + "/privacy.html"},
            headers={"Access-Control-Allow-Origin": origin,
                     "Vary": "Origin", "Cache-Control": "no-store"},
        )

'''
        if marker not in s:raise RuntimeError('Missing backend health anchor')
        s=s.replace(marker,cfg+marker,1)
        s=s.replace('app.router.add_get("/health", health)','app.router.add_get("/health", health)\n    app.router.add_get("/config", config)',1)
    # Reject direct orders until explicitly enabled after deployment checks.
    if '"error": "not_enabled"' not in s:
        anchor='        if request.content_type != "application/json":\n'
        gate='        if os.environ.get("ORDERS_ENABLED", "0") != "1":\n            return web.json_response({"error": "not_enabled"}, status=503, headers=headers)\n'
        if anchor in s:s=s.replace(anchor,gate+anchor,1)
    # Prevent accepting a direct order without the separate checkbox.
    if 'payload.get("consent") is not True' not in s:
        s=s.replace('    raw_id = clean_text(payload, "id", 36)',
                    '    if payload.get("consent") is not True:\n        raise ValueError("consent")\n    raw_id = clean_text(payload, "id", 36)',1)
    # Day and name are optional: phone-only inquiry should work.
    s=s.replace('day = clean_text(payload, "date", 10)',
                'day = clean_text(payload, "date", 10, required=False)')
    s=s.replace('if date.fromisoformat(day).isoformat() != day or date.fromisoformat(day) < datetime.now(LOCAL_ZONE).date():',
                'if day and (date.fromisoformat(day).isoformat() != day or date.fromisoformat(day) < datetime.now(LOCAL_ZONE).date()):')
    s=s.replace('"name": clean_text(payload, "name", 80),',
                '"name": clean_text(payload, "name", 80, required=False),\n        "consent": True,')
    s=s.replace('"address": clean_text(payload, "address", 200) if method != "pickup" else "",',
                '"address": clean_text(payload, "address", 200, required=False) if method != "pickup" else "",')
    s=s.replace('"Дата: " + date.fromisoformat(order["date"]).strftime("%d.%m.%Y"),',
                '"Дата: " + (date.fromisoformat(order["date"]).strftime("%d.%m.%Y") if order["date"] else "согласуем"),')
    s=s.replace('"Имя: " + order["name"],','"Имя: " + (order["name"] or "не указано"),')
    return s
edit('server/orders.py',backend)

def sitemap(s):
    for url in ('https://sezonchik27.ru/','https://sezonchik27.ru/trees.html',
                'https://sezonchik27.ru/elki/serebryanaya-skazka-se-625664.html',
                'https://sezonchik27.ru/elki-komsomolsk-na-amure.html'):
        pat=r'(<loc>'+re.escape(url)+r'</loc>\s*<lastmod>)[^<]*(</lastmod>)'
        s=re.sub(pat,lambda m:m.group(1)+DATE+m.group(2),s,count=1)
    # Do NOT add ad-only /dostavka.html (noindex) into sitemap.
    return s
edit('sitemap.xml',sitemap)
print('PATCH COMPLETE. Files changed:',len(changes))
