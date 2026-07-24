СЕЗОНЩИК V7.0 — МОБИЛЬНАЯ АДМИНКА

Уже сделано:
- admin.html: добавление, изменение и удаление товаров с телефона;
- загрузка фото в Supabase Storage;
- изменение цены, наличия, характеристик, хитов и новинок;
- импорт текущего каталога одной кнопкой;
- каталог bicycles.html получает товары из Supabase;
- если Supabase не настроен или база пуста, старый статический каталог продолжает работать.

ОСТАЛОСЬ 3 ДЕЙСТВИЯ:
1) В Supabase SQL Editor запустить файл supabase-setup.sql.
2) В Supabase Authentication → Users создать пользователя администратора (email + пароль).
3) Supabase → Connect → API keys: скопировать Publishable key и вставить в supabase-config.js вместо PASTE_PUBLISHABLE_KEY_HERE.

Важно: используйте только Publishable key (или legacy anon). Никогда не вставляйте Secret/service_role key в сайт.

После загрузки файлов на GitHub:
- админка: https://sezonchik27.ru/admin.html
- каталог: https://sezonchik27.ru/bicycles.html

Первый вход:
- войти в admin.html;
- нажать «Импортировать текущий каталог»;
- затем менять товары с телефона.
