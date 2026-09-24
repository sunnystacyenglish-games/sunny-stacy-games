# Sunny & Stacy Games — 2.4 / Approved themes

Существующий HTML/CSS/JavaScript-проект: Hub → My Sets → Editor → Dobble. Без backend и внешних библиотек.

## Запуск

1. Распакуйте sunny-stacy-games-2.4-themes.zip целиком.
2. Откройте терминал в папке sunny-stacy-games (рядом с package.json).
3. С Node.js 18+ выполните: node serve.mjs
4. Откройте http://127.0.0.1:4173. Оставьте терминал открытым; Ctrl+C останавливает сервер.

npm install не требуется. Альтернатива: python -m http.server 4173 --bind 127.0.0.1

Всегда используйте тот же адрес: localhost и 127.0.0.1 имеют разные хранилища. Запуск через file:// не поддерживается. Старый Sunny-Stacy-Dobble.html относится к Stage 1.

## Workflow преподавателя

1. My Sets → + New Set. Введите имя и один источник: Emoji, Paste image URL либо Upload / Paste images → Continue.
2. Введите Word и изображение; + Add item создаёт строку с выбранным общим источником.
3. В Upload: Browse / Replace, перетаскивание в область или фокус на Word/любом поле нужной строки и Ctrl+V. Remove удаляет картинку. Вставка текста в Word работает как обычно.
4. Добавьте минимум 5 валидных элементов (слово и изображение). Save Set → My Sets → Edit после обновления: источник и изображения сохранены.
5. Play открывает окно подготовки Dobble: название набора, количество концептов, 1–4 карточки, 2–10 элементов, режим представления и движение. Все варианты видимы; недоступные отключены. Изменение числа карточек или режима сразу уточняет допустимые значения. Cancel ничего не сохраняет; Play запоминает настройки и запускает игру с ними. Settings внутри игры остаётся доступным.
6. Проверьте Images, Words, Word + Image, Score, Auto next cards, Sound, Fullscreen и темы.
7. Создайте 25 или 40 концептов: каждый станет целью один раз до следующего перемешанного цикла. Поднабор из 13 больше не выбирается.
8. Duplicate, Export JSON, Import JSON, Delete с подтверждением — в My Sets. Built-in Animals 1 редактируется только как копия.

Смена общего источника требует подтверждения. Старые изображения остаются активными и сохранёнными до явной замены; рядом показана подсказка. Это позволяет постепенно переводить смешанный набор на новый формат. Наборы без imageSource открываются автоматически; для старых смешанных наборов есть Existing mixed sources.

## Генерация карточек

RotationPool хранит перемешанную очередь целей и счётчики использования отвлекающих концептов. Цели не повторяются до исчерпания очереди; на границе циклов нет подряд одинаковой цели. Отвлекающие концепты берутся из наименее использованных со случайным порядком при равенстве.

Каждая карточка содержит цель и уникальные отвлекающие элементы. Любые две карточки пересекаются ровно по одному concept ID. Минимум концептов = 1 + количество карточек × (элементов на карточке − 1).

| Элементов | 1 карточка | 2 карточки | 3 карточки | 4 карточки |
|---|---:|---:|---:|---:|
| 2 | 2 | 3 | 4 | 5 |
| 3 | 3 | 5 | 7 | 9 |
| 4 | 4 | 7 | 10 | 13 |
| 5 | 5 | 9 | 13 | 17 |
| 6 | 6 | 11 | 16 | 21 |
| 7 | 7 | 13 | 19 | 25 |
| 8 | 8 | 15 | 22 | 29 |
| 9 | 9 | 17 | 25 | 33 |
| 10 | 10 | 19 | 28 | 37 |

Mixed: 1–2 карточки, ответ всегда IMAGE ↔ WORD. Для одной карточки образец всегда противоположного типа: Images → слово, Words → картинка, Mixed → противоположность текущей цели. Новая система гарантирует корректность текущих карточек, но не заявляется полной проективной колодой. Исходная константа DECK сохранена и проверяется отдельно. GameSession, score, блокировка повторного ответа и таймер сохранены. Номер раунда удалён из UI.

## Размеры, viewport, движение и звук

Максимум элементов: min(10, floor((S−1)/C)+1). Он пересчитывается при смене набора/числа карточек, а все S концептов остаются в очереди.

Элементы получают независимый относительный scale из центрированного распределения при создании карточки. Большинство близки к базовому размеру; при почти одинаковых scale добавляется умеренное различие. На resize scale не меняется. Длинная сторона изображений и ширина слов ограничены примерно 20% диаметра; длинные слова подгоняются отдельно. Узкая сторона панорамных картинок может быть меньше 5%, чтобы сохранить пропорции.

Карточка подбирается по оставшейся высоте и ширине окна, с CSS media queries и ResizeObserver. Изменение окна/fullscreen не создаёт новую цель и не сбрасывает счёт. На узких экранах карточки размещаются вертикально; если минимальный удобный размер не помещается, разрешена прокрутка. На коротком landscape-экране в режиме одной карточки скрыт повторяющийся заголовок Find the match, но подсказка остаётся.

Одобренные physics и sound модули не изменены.

AABB рассчитывается по размерам слова/картинки и повороту при создании/resize и кешируется. Каждое слово масштабируется независимо. Для 5–10 элементов используется компактная раскладка. Padding 0,25 px на сторону; углы AABB остаются внутри круга. Анимационный цикл не читает DOM-геометрию. Slow 0,07 и Medium 0,13 сохранены; Fast 0,275 диаметра/с (+25%).

Wrong длится 0,54 с; амплитуда повышена с 0,065 до 0,08775 (+35%). Плавная огибающая, характер и wiggle сохранены. Воспринимаемую громкость нужно окончательно оценить на оборудовании урока.

## Хранилище

setRepository в shared/sets.js изолирует UI от IndexedDB-адаптера shared/database.js. База sunny-stacy-content, store sets. Набор хранится атомарно: id, name, imageSource, items, Blob изображений. Копии получают новые IDs; настройки Dobble остаются в localStorage.

Upload/drop/paste используют общий readUpload: PNG/JPEG/WEBP до 10 MB, декодирование и уменьшение до 512 px, хранение PNG Blob. Нет локальных путей и base64 в localStorage. До 3 MB на сохранённое изображение, 24 MB изображений на набор, 5–500 концептов при сохранении. Старые наборы из 1–4 элементов читаются и редактируются, но Play отключён; их данные автоматически не меняются.

JSON schema sunny-stacy-content-set version 1 обратно совместима: imageSource необязателен для старых файлов. Uploads входят в JSON как data URLs; импорт создаёт новый набор. Лимит импорта 40 MB. URL остаются HTTPS-ссылками.

## Тесты

npm test запускает logic, motion, content, rotation и adaptive. Можно отдельно запустить node tests/logic.test.mjs, node tests/motion.test.mjs, node tests/content.test.mjs, node tests/rotation.test.mjs.

Браузерные страницы:
- /tests/browser.html — хранилище, форматы, перенос, защита demo.
- /tests/editor-inputs.html — drop, paste handler, Remove, сохранение и повторное открытие. Синтетические DOM-события; реальный Ctrl+V проверен отдельно через браузер.
- /tests/flexible.html — реальные границы 1–10 элементов, режимы и движение; кнопка создания 40 разных животных.
- /tests/viewport.html — вся заданная матрица экранов, маленькие наборы, random-size bounds и сохранение игры при resize.
- /tests/layout.html — Hub, My Sets, новый и заполненный Editor, Dobble при 390/768/1280 px.

Автотесты удаляют только свои временные наборы. Demo из отдельной кнопки остаётся в My Sets. Результаты — TEST-REPORT.md.

## Файлы предыдущего Stage 2.2

Изменены: sets/editor.js, sets/editor.html, shared/teacher.css, shared/storage.js; games/dobble/engine.js, settings.js, dobble.js, index.html, dobble.css, layout.js, render.js; tests/motion.test.mjs, flexible.js, flexible.html, editor-inputs.js; package.json, README.md, TEST-REPORT.md.

Добавлены: games/dobble/sizing.js, games/dobble/viewport.js; tests/adaptive.test.mjs, tests/viewport.html, tests/viewport-tests.js.

IndexedDB, import/export, RotationPool, speeds, motion.js и sound.js сохранены.

## Ограничения

Нет backend, аккаунтов, синхронизации и публичных ссылок. Данные привязаны к браузеру/origin; очистка данных сайта удаляет их. JSON — резервная копия. После reload игры начинается новый цикл целей.

Для Upload буфер должен содержать настоящий image blob. Текст/URL не конвертируется в картинку. Сайты могут блокировать внешние изображения; GIF не поддерживается. Ошибка загрузки изображения объясняется в игре, картинка не подменяется словом в Mixed.

Прозрачные поля изображения входят в его прямоугольник. Очень длинные слова на маленьком экране уменьшаются индивидуально. Одинаковые картинки/слова у разных IDs могут быть визуально неоднозначны: выбирайте различимые концепты.

Нет autosave и слияния правок разных вкладок; есть предупреждение о несохранённых изменениях. Реальный ClassIn, все браузеры и акустическое качество на колонках ученика не проверялись.

## Обновление Pre-game settings

Общая проверка контента находится в shared/content-rules.js: минимум 5 валидных концептов для новых записей и запуска игры. Структурная проверка старых записей отделена от проверки возможности игры. Хранилище IndexedDB и формат изображений не менялись.

games/dobble/config.js используется и окном подготовки, и Settings внутри игры. Значения уменьшаются до ближайшего допустимого; параметры запуска передаются через query и сохраняются в localStorage. Это локальные ссылки: без доступного в этом браузере набора они не переносят контент на другое устройство.

Крупные элементы дополнительно увеличены, маленькие (scale ≤ 1) сохранены без изменения. Физика, скорости, звук и ротация не менялись.

Изменены: shared/sets.js, storage.js, ui.js, teacher.css; sets/library.js, editor.js, editor.html; games/dobble/settings.js, dobble.js, index.html, sizing.js; tests/adaptive.test.mjs, content.test.mjs, editor-inputs.js; package.json, README.md, TEST-REPORT.md.
Добавлены: shared/content-rules.js, games/dobble/config.js, tests/config.test.mjs, tests/pregame.html, tests/pregame.js.

Проверка вручную: создайте 5 элементов → Save → My Sets → Play → выберите 4 карточки (доступно 2 элемента) → Word ↔ Image (3–4 карточки отключатся) → Slow → Play. Откройте Settings и убедитесь, что значения совпадают. Вернитесь в My Sets: настройки запомнены. У старого набора с менее чем 5 элементами Play отключён; Edit доступен.

Автотесты: npm test. Браузерный сценарий: /tests/pregame.html → Run pre-game checks.

## Global version & card composition (25 September 2026)

Текущая версия проекта остаётся 2.3.0, как в package.json. Это единственный источник номера: shared/version.js экспортирует APP_VERSION, читая package.json; shared/app.js добавляет общую подпись страниц и диалогов. Для обновления номера меняйте только поле version в package.json. Будущим страницам достаточно подключить shared/styles.css и модуль shared/app.js с правильным относительным путём. Подпись не принимает клики; снизу зарезервированы 24 px с учётом safe area.

layout.js теперь выбирает позиции из нескольких допустимых кандидатов по расстоянию и балансу покрытия, размещая крупные реальные footprint первыми. Фиксированная сетка удалена. Изображения имеют случайный угол от −40° до +40°, слова — от −20° до +20°. Размер и угол выбираются один раз при создании карточки; движение меняет только положение. Измеренные повёрнутые AABB используются и для размещения, и для прежней физики. При resize композиция пересчитывается с тем же seed под новые размеры; размерный коэффициент и угол сохраняются.

Файлы этого обновления: shared/version.js и app.js (новые); shared/styles.css; index.html, sets/index.html, sets/editor.html, games/dobble/index.html; games/dobble/layout.js, render.js, viewport.js; serve.mjs, package.json; tests/composition.test.mjs и version.html (новые), tests/motion.test.mjs и flexible.js; README.md, TEST-REPORT.md. Physics, sound, sizing и engine не изменены. Cloud Sets не входит в это обновление.

Проверка: npm test; /tests/flexible.html, /tests/version.html, /tests/viewport.html. Для визуальной проверки откройте набор с 40 концептами, выберите 10 элементов и Off, нажмите New cards несколько раз; затем Fast: положение меняется, угол остаётся прежним.

## Themes 2.4

Eight approved themes are available in pre-game and in-game Settings: Nature, Space, Candy, Ocean, Chalkboard, Board Game, Notebook, Magic School. Choice persists in the existing browser settings and game URL. Legacy playful/clean values map to Notebook; night maps to Space.

Theme assets are bundled locally in shared/theme-assets; no external image services are required. Decoration is non-interactive and outside the card layout. Magic School retains the cauldron at bottom-left and the two candles at bottom-right. Space and Magic School have distinct card glows.
