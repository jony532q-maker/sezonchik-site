СЕЗОНЩИК — автоматическая подготовка новых размеров на GitHub

Уже обнаружено в репозитории:
- apply_tree_sizes.py
- README.md (инструкция из предыдущего архива)
- trees.html остался неизменённым

Чтобы Github сам подготовил изменения без компьютера:

1) Откройте https://github.com/jony532q-maker/sezonchik-site
2) Add file -> Create new file.
3) В поле имени файла введите:
   .github/workflows/sezonchik-new-sizes.yml
4) Вставьте содержимое приложенного файла sezonchik-new-sizes.yml.
5) Commit changes.
6) Во вкладке Actions выберите «СЕЗОНЩИК — обновление размеров ёлок».
7) Run workflow -> оставьте include_400 выключенным -> Run.
8) В результате будет создана отдельная ветка и, если разрешено, черновик Pull Request.
   Это НЕ обновляет сайт до вашего ручного подтверждения и слияния изменений.

Если GitHub откажет в push:
Settings -> Actions -> General -> Workflow permissions -> Read and write permissions -> Save.
Если откажет в создании Pull Request, там же разрешите
«Allow GitHub Actions to create and approve pull requests»
или откройте ссылку сравнения из логов Actions.

ВНИМАНИЕ:
Все 16 базовых новых цен являются проектными, ещё не утверждены.
Высоту 2108 / 400 см (проект 79 990 ₽) включайте только после проверки.
Проверяйте правки на ПК и телефоне перед Merge pull request.
