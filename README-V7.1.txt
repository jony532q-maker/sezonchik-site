СЕЗОНЩИК V7.1 — SUPABASE ПОДКЛЮЧЁН

Уже сделано:
- Project URL и Publishable key вставлены в supabase-config.js;
- admin.html подключён к проекту Supabase;
- bicycles.html может получать каталог из таблицы products;
- сохранён резервный статический каталог: если база пуста или недоступна, сайт продолжает показывать текущие товары;
- загрузка фото идёт в публичный bucket products после входа администратора.

ОСТАЛОСЬ 2 ДЕЙСТВИЯ В SUPABASE:
1) SQL Editor → New query → вставить содержимое supabase-setup.sql → Run.
2) Authentication → Users → Add user → создать email и пароль администратора.

ПОСЛЕ ЗАГРУЗКИ АРХИВА НА GITHUB:
- админка: https://sezonchik27.ru/admin.html
- каталог: https://sezonchik27.ru/bicycles.html

ПЕРВЫЙ ЗАПУСК:
- войти в admin.html;
- нажать «Импортировать текущий каталог» только один раз;
- проверить, что товары появились;
- затем цены, наличие, характеристики и фотографии можно менять с телефона.

БЕЗОПАСНОСТЬ:
Publishable key предназначен для клиентского сайта и защищается правилами RLS. Secret/service_role key в файлы сайта добавлять нельзя.
