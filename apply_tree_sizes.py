#!/usr/bin/env python3
# coding: utf-8
"""СЕЗОНЩИК: подготовка отдельного ZIP-патча с 17 новыми высотами (проект цен).
Не изменяет исходные файлы репозитория. Python >= 3.9, без зависимостей.
"""
import argparse
import copy
import html
import json
import re
import sys
import zipfile
from pathlib import Path

PRODUCTS = {
    "Таёжная королева": ("elki/taezhnaya-koroleva-se-421356.html", {300: 41990}),
    "Лесная грация": ("elki/lesnaya-gratsiya-se-624253.html", {300: 42990}),
    "Серебряная сказка": ("elki/serebryanaya-skazka-se-625664.html", {270: 39990, 300: 45990}),
    "Хвойная симфония": ("elki/hvoynaya-simfoniya-se-325426.html", {240: 25990}),
    "Лесная гармония": ("elki/lesnaya-garmoniya-se-819765.html", {150: 8990, 180: 11990, 240: 21990}),
    "Таёжная жемчужина": ("elki/taezhnaya-zhemchuzhina-se-42566v7.html", {270: 35990, 300: 42990}),
    "Снежная грация": ("elki/snezhnaya-gratsiya-se-62134f9.html", {240: 26990, 270: 31990}),
    "Хвойная красавица": ("elki/hvoynaya-krasavitsa-se-823264.html", {210: 16990, 240: 23990, 270: 29990}),
    "Северная Дымка": ("elki/severnaya-dymka-2108.html", {400: 79990}),
    "Снежный Бархат": ("elki/snezhnyy-barhat-2229.html", {270: 24990}),
}
EXPECTED_NEW = sum(len(v[1]) for v in PRODUCTS.values())
assert EXPECTED_NEW == 17

ARTICLE_RE = re.compile(r'<article\b[^>]*class="[^"]*\btree-product\b[^"]*"[^>]*>.*?</article>', re.S)
SELECT_RE = re.compile(r'<select\b[^>]*aria-label="Высота и цена[^"]*"[^>]*>.*?</select>', re.S)
OPTION_RE = re.compile(r'<option\b[^>]*value="(\d+)"[^>]*>(.*?)</option>', re.S)
TABLE_RE = re.compile(r'<table class="seo-variant-table"[^>]*>.*?</table>', re.S)
TABLE_ROW_RE = re.compile(r'<tr><td>(\d+) см</td><td class="seo-price">([\d \u00a0]+) ₽</td></tr>')
JSON_RE = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)


def money(n):
    return f"{int(n):,}".replace(",", " ")


def catalog_variants(article):
    match = SELECT_RE.search(article)
    if not match:
        raise ValueError("Не найден выпадающий список высот в карточке")
    items = [(int(h), int(p)) for p, title in OPTION_RE.findall(match.group(0))
             for h in re.findall(r'^\s*(\d+)\s*см', html.unescape(title))]
    if not items or len(items) != len(OPTION_RE.findall(match.group(0))):
        raise ValueError("Не удалось прочитать все размеры и цены карточки")
    return dict(items)


def patch_card(card, name, additions):
    before = catalog_variants(card)
    if any(h in before and before[h] != p for h, p in additions.items()):
        raise ValueError(f"{name}: новая цена конфликтует с существующим размером")
    variants = {**before, **additions}
    changed_count = len(set(additions) - set(before))

    def change_select(match):
        original = match.group(0)
        opts = ''.join(f'<option value="{p}">{h} см — {money(p)} ₽</option>'
                       for h, p in sorted(variants.items()))
        return re.sub(r'(?<=\>).*?(?=</select>)', opts, original, count=1, flags=re.S)

    card2, num = SELECT_RE.subn(change_select, card, count=1)
    if num != 1:
        raise ValueError(f"{name}: нельзя заменить размеры в списке")
    card2, num = re.subn(
        r'data-heights="[\d ]+"',
        'data-heights="' + ' '.join(str(h) for h in sorted(variants)) + '"',
        card2, count=1)
    if num != 1:
        raise ValueError(f"{name}: не удалось обновить фильтр высоты")
    oldmin = min(before)
    newmin = min(variants)
    if oldmin != newmin:
        current = variants[newmin]
        card2, num = re.subn(r'(<strong class="tree-price">)([^<]*)(</strong>)',
                             lambda m: m.group(1) + f'{current:,} ₽' + m.group(3),
                             card2, count=1)
        if num != 1:
            raise ValueError(f"{name}: нет отображаемой стартовой цены")
    assert catalog_variants(card2) == variants
    return card2, changed_count


def patch_catalog(source, include_400):
    pending = {k: v[1].copy() for k, v in PRODUCTS.items()}
    if not include_400:
        pending["Северная Дымка"].clear()
    seen = set()
    applied = []

    def process_article(m):
        article = m.group(0)
        title = re.search(r'<h2>([^<]+)</h2>', article)
        name = html.unescape(title.group(1)) if title else None
        if name not in pending:
            return article
        if name in seen:
            raise ValueError(f"Дубликат карточки {name}")
        seen.add(name)
        changed, count = patch_card(article, name, pending[name])
        applied.extend([(name, h, price) for h, price in pending[name].items()])
        return changed

    out = ARTICLE_RE.sub(process_article, source)
    if set(pending) != seen:
        raise ValueError(f"Нет ожидаемых карточек: {set(pending)-seen}")
    if include_400:
        def add_option(m):
            inner = m.group(0)
            if '<option value="400">' not in inner:
                inner = inner.replace('</select>', '<option value="400">400 см</option></select>')
            return inner
        out, count = re.subn(r'<select id="tree-height">.*?</select>', add_option, out,
                             count=1, flags=re.S)
        if count != 1:
            raise ValueError("Не найден общий фильтр высоты")
    count_before = len(ARTICLE_RE.findall(source))
    if len(ARTICLE_RE.findall(out)) != count_before:
        raise ValueError("После обновления изменилось число моделей")
    for name, h, p in applied:
        assert f'{h} см — {money(p)} ₽' in out
    return out, applied


def patch_detail(source, name, additions):
    table_match = TABLE_RE.search(source)
    if not table_match:
        raise ValueError(f"{name}: таблица размеров не найдена")
    table = table_match.group()
    body_match = re.search(r'(<tbody>)(.*?)(</tbody>)', table, flags=re.S)
    if not body_match:
        raise ValueError(f"{name}: нет tbody")
    body = body_match.group(2)
    current = {}
    for h, p in TABLE_ROW_RE.findall(body):
        h = int(h)
        if h in current:
            raise ValueError(f"{name}: дублируются размеры")
        current[h] = int(p.replace(" ", "").replace("\u00a0", ""))
    if not current:
        raise ValueError(f"{name}: не удалось считать цены в таблице")
    if any(h in current and current[h] != price for h, price in additions.items()):
        raise ValueError(f"{name}: конфликт существующих цен")
    combined = {**current, **additions}
    new_rows = ''.join(f'<tr><td>{h} см</td><td class="seo-price">{money(p)} ₽</td></tr>'
                       for h, p in sorted(combined.items()))
    new_table = table[:body_match.start(2)] + new_rows + table[body_match.end(2):]
    out = source[:table_match.start()] + new_table + source[table_match.end():]

    # Поддерживаем описание и OG-теги, включая вторую верстку страниц V9.2.
    old_heights = ', '.join(map(str, sorted(current)))
    new_heights = ', '.join(map(str, sorted(combined)))
    if old_heights != new_heights:
        out = out.replace('размеры ' + old_heights + ' см',
                          'размеры ' + new_heights + ' см')
        out = out.replace('размеры: ' + old_heights + ' см',
                          'размеры: ' + new_heights + ' см')
        out = out.replace('— ' + old_heights + ' см |',
                          '— ' + new_heights + ' см |')
    if min(combined.values()) != min(current.values()):
        old_price, new_price = money(min(current.values())), money(min(combined.values()))
        out = out.replace('цены от ' + old_price + ' ₽',
                          'цены от ' + new_price + ' ₽')
        out = out.replace('Цены от ' + old_price + ' ₽',
                          'Цены от ' + new_price + ' ₽')

    scripts_updated = [0]
    def update_json(m):
        try:
            data = json.loads(m.group(2))
        except json.JSONDecodeError:
            return m.group(0)
        products = [x for x in data.get('@graph', []) if x.get('@type') == 'Product'] \
                   if isinstance(data.get('@graph'), list) else []
        if data.get('@type') == 'Product':
            products.append(data)
        if not products:
            return m.group(0)
        product = products[0]
        orig = product.get('offers')
        if not isinstance(orig, list) or not orig:
            raise ValueError(f"{name}: в JSON-LD нет предложений товара")
        existing = {}
        for offer in orig:
            title = offer.get('name', '')
            matches = re.search(r',\s*(\d+)\s*см$', title)
            if not matches:
                raise ValueError(f"{name}: размер не определен в JSON-LD")
            existing[int(matches.group(1))] = offer
        if set(existing) != set(current):
            raise ValueError(f"{name}: JSON-LD и таблица расходятся до правки")
        offers = []
        for h, p in sorted(combined.items()):
            if h in existing:
                offer = copy.deepcopy(existing[h])
            else:
                offer = copy.deepcopy(orig[0])
                offer['name'] = f'{name}, {h} см'
                offer['price'] = p
            if int(offer['price']) != p:
                raise ValueError(f"{name}: цена в JSON-LD не соответствует таблице")
            offers.append(offer)
        product['offers'] = offers
        scripts_updated[0] += 1
        # Поменять только содержимое JSON-LD; остальные стили и функции не трогать.
        return m.group(1) + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + m.group(3)

    out = JSON_RE.sub(update_json, out)
    if scripts_updated[0] != 1:
        raise ValueError(f"{name}: ожидается ровно один JSON-LD с Product")
    body_after = re.search(r'(<tbody>)(.*?)(</tbody>)',
                           TABLE_RE.search(out).group(), flags=re.S).group(2)
    after = {int(h): int(p.replace(' ', '').replace('\u00a0', ''))
             for h, p in TABLE_ROW_RE.findall(body_after)}
    if after != combined:
        raise ValueError(f"{name}: контроль таблицы не пройден")
    return out


def main():
    parser = argparse.ArgumentParser(description='Создать ZIP-патч 17 размеров к сайту СЕЗОНЩИК')
    parser.add_argument('repository', type=Path, help='Папка сайта, где находится trees.html')
    parser.add_argument('--include-400', action='store_true',
                        help='Включить НЕПОДТВЕРЖДЁННУЮ ёлку 2108 / 400 см (79 990 ₽)')
    parser.add_argument('--output', type=Path, default=Path('SEZONCHIK_NEW_SIZES_PATCH.zip'))
    args = parser.parse_args()

    repo = args.repository.resolve()
    if not (repo / 'trees.html').is_file():
        parser.error("trees.html не найден в указанном каталоге")
    expected = [Path('trees.html')] + [Path(v[0]) for v in PRODUCTS.values()]
    for path in expected:
        if not (repo / path).is_file():
            parser.error(f"Отсутствует исходный файл: {path}")

    original = (repo / 'trees.html').read_text(encoding='utf-8')
    new_catalog, changes = patch_catalog(original, args.include_400)
    if len(changes) != (17 if args.include_400 else 16):
        raise ValueError("Неверное количество добавленных размеров")
    output_files = {'trees.html': new_catalog}
    for name, (path, variants) in PRODUCTS.items():
        if not variants or (name == 'Северная Дымка' and not args.include_400):
            continue
        original_detail = (repo / path).read_text(encoding='utf-8')
        output_files[path] = patch_detail(original_detail, name, variants)
    if args.output.is_dir():
        raise ValueError("Укажите путь к ZIP, а не к папке")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for path, content in output_files.items():
            archive.writestr(path, content)
        archive.writestr('PATCH_INFO.txt',
            'СЕЗОНЩИК — пакет изменений размеров ёлок\n'
            f'Добавлено: {len(changes)} размеров; моделей: {len(set(x[0] for x in changes))}\n'
            'Розничные цены из таблицы от 27.10.2026 имеют статус ПРОЕКТ.\n'
            'НЕ ЗАГРУЖАТЬ НА БОЕВОЙ САЙТ БЕЗ УТВЕРЖДЕНИЯ ЦЕН.\n'
            'Проверить наличие, выбор размера, фильтры, карточки товаров и бронь.\n'
            + '\n'.join(f'{name}: {h} см — {money(price)} ₽'
                        for name, h, price in sorted(changes)) + '\n')
    print(f'Создано: {args.output}; файлов: {len(output_files)}; размеров: {len(changes)}')
    print("Исходный каталог и карточки не изменялись.")
    if not args.include_400:
        print("2108 / 400 см НЕ включён: цена и наличие требуют подтверждения.")


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, AssertionError) as error:
        sys.exit(f'ОШИБКА: {error}')
