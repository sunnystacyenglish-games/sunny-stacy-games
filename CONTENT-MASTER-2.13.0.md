# Sunny & Stacy Games 2.13.0 — Content Library / Scene / I Spy

Проверено 6 октября 2026 года.

## Что изменено

- My Content объединяет Concept Sets, Scene, Bridge, Sentence Correction и Card Decks. + Create открывает выбор типа. Контент редактируется на отдельной странице; игровые Content / Themes / Gameplay остаются в настройках игр.
- Scene: слева сцена и компактная библиотека Elements, справа независимо прокручиваемые Targets. Активный Target разворачивается; добавление фокусирует Prompt; выбор ответов сохраняет прокрутку. Есть перемещение, размер, дублирование и удаление объектов, частичный выход за край с возможностью вернуть объект.
- File / Clipboard / URL используют общий импорт изображения в локальные assets. URL скачивается, не остаётся hotlink. PNG/JPEG/WEBP сохраняются в исходном разрешении, включая прозрачность; ошибки оставляют прежнее изображение.
- Ответы Target могут быть объектами, невидимыми в игре прямоугольными hotspot-регионами или их сочетанием. Области можно рисовать, перемещать, менять размер и повторно использовать.
- I Spy: найденные ответы учитываются по Target + answer ID; повторный ответ нейтрален; правильный объект имеет приоритет над областью. Сцена не прыгает при смене задания. Подсветка учитывает альфа-канал изображения, выход за край обрезается.
- После последнего задания: обычная обратная связь, однократная победа, конфетти около 1.7 секунды и плавное окно результата. Reduced motion убирает движение.
- Sentence Correction получил компактные карточки и контекстное удаление. Новый пункт фокусирует поле Incorrect.
- Hub: компактная сетка 4 / 2 / 1, игровые превью Story Dice и I Spy, без большого верхнего баннера.

## Архитектура и совместимость

`shared/content-library.js` — публичный repository-фасад. Он использует существующее IndexedDB-хранилище activities и прежние стабильные IDs. Concept Sets и папки продолжают использовать свои существующие repositories. Backend, аккаунты и облако не добавлены.

Scene content version 2 хранит `targets[].answers[]` с типом object или hotspot; `hotspots[]` хранит нормализованные координаты. `shared/activity/scene.js` преобразует прежние objectIds в ответы без изменения ID исходного контента. Миграция при чтении не переписывает сохранённый оригинал автоматически. Игровая ссылка `?activity=ID` ссылается на авторский контент; отдельная копия на игру не создаётся.

Изображения сохраняются Blob-объектами в activityAssets. JSON bundle включает переносимые данные изображений. Обновления схемы не сбрасывают старые Concept Sets, папки и игровые ссылки.

## Проверки

Все 19 Node-наборов из package.json прошли: Dobble, движение/коллизии/композиция, адаптация, контент, Tic-Tac-Toe, Wordly, Story Dice, аудио-контракты, activity/editor validation, I Spy и hotspots.

Браузерные сценарии прошли:
- tests/content-scene.html: Create → Scene → upload → draw → save → reopen → export/import → I Spy; невидимые регионы, hybrid precedence, стабильная сцена, 50 assets, компактные Targets, desktop/tablet/mobile.
- tests/image-input.html: File / ClipboardEvent с изображением / реальный URL fetch → persisted assets, исходные 1920×1080, alpha, ошибочный URL, объект + hotspot одного Target, Save/Reopen, прокрутка Target 18.
- tests/i-spy.html: ответы/ошибки/повторы, переход, победа ровно один раз, конфетти, Play again, настройки, повреждённые media, неизменность авторского контента.
- tests/editors.html и tests/editors-responsive.html: Bridge/Sentence/Card Deck workflow и мобильная ширина 390px.
- tests/setup-menu.html: настройки всех четырёх существующих игр, временные исключения и прежние IDs.
- tests/browser.html: Concept Set create/edit/duplicate/export/import, PNG/JPEG/WEBP, защита встроенного набора, повреждённые данные.
- Hub осмотрен в desktop/mobile; проверены колонки на 850px и 390px, отсутствие горизонтального переполнения.
В успешных сценариях импорта и на Hub ошибок console нет; I Spy harness не обнаружил runtime exceptions. Тесты отказа media намеренно вызывают ошибки загрузки ресурсов.

## Ограничения

- Данные локальны для браузера и адреса сайта. Для переноса используйте Export/Import. localhost и 127.0.0.1 — разные хранилища.
- Максимум: 50 assets, 50 размещённых объектов, 100 hotspots, 20 Targets; отдельное изображение до 10 MB / 40 мегапикселей, импортируемый bundle до 40 MB.
- Уже уменьшенные в прежней версии фоны нельзя восстановить автоматически: загрузите исходный файл повторно.
- Внешний сайт может блокировать URL-import через CORS; можно скачать изображение и выбрать Upload file.
- Clipboard проверен браузерным событием с реальным image File; системный буфер разных ОС, физический touch и ClassIn отдельно не проверялись. Аудио проверено по вызовам/ассетам, не через удалённые динамики ученика.

## Запуск и ручная проверка

Распакуйте архив. В папке sunny-stacy-games выполните `node serve.mjs` (Node.js 18+, без установки зависимостей). Откройте http://127.0.0.1:4173 и оставьте сервер работающим. file:// не поддерживается.

My Content → + Create → Scene → задайте имя → Add image для фона → Add image в Elements → выберите элемент → Add to scene → Add target → Prompt → Select from scene → выберите объект / Draw hotspots → Done → Done → Save → Play I Spy. После игры вернитесь в My Content и переоткройте сцену; затем перезагрузите страницу. Для проверки старого контента откройте существующий Concept Set и запустите любую прежнюю игру.

## Основные файлы

Новые: content/editor.html, content/editor.js, content/editor.css; shared/content-library.js; shared/activity/scene.js; shared/editors/image-input.js; shared/completion.js; sets/content-library.js; tests/hotspots.test.mjs; tests/content-scene.html и .js; tests/image-input.html и image-input-browser.js; tests/fixtures/background-1920.png.

Изменённые: index.html; shared/home.js и home.css; sets/index.html, library.js, editor.html; activities/index.html и index.js; shared/activity/repository.js и limits.js; shared/editors/register.js, models.js, common.js, scene.js, sentences.js, editors.css; games/i-spy/engine.js, game.js, game.css, index.html; навигационные подписи My Content в игровых HTML/shared UI; package.json, shared/version.js; соответствующие editor/I Spy browser и unit tests; README.md.
