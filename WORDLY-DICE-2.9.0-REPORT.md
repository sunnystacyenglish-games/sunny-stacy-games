# Sunny & Stacy Games 2.9.0

Дата: 2026-10-01. Delta Wordly Spelling + Story Dice.

## Результат

- Random допускает повтор любого слова. Mastery перемешивает первый проход, исключает успешно пройденные concepts и переносит ошибки в следующий перемешанный проход. Завершение показывает количество слов; Play again начинает новую сессию.
- Реальный focusable text input обрабатывает input, composition, удаление и Enter через общую игровую логику. Custom QWERTY переключает inputmode и фокус, чтобы не вызывать одновременно системную клавиатуру.
- Wordly адаптируется к visualViewport; вся сетка и управление помещаются без прокрутки страницы. Свечение следует реальной сетке. Статус отражает фактическое количество закреплённых позиций.
- Новый tile-clack.wav загружается и декодируется заранее через Web Audio. Один звук на открытие клетки, один на общий перенос зелёных букв. Победный звук ждёт окончания clack. WAV не нормализован и не подрезан кодом; длительность около 67 мс.
- Story Dice рассчитывает квадратные клетки по обеим доступным сторонам. Метаданные находятся сверху; изображение с подписью образуют общую центрированную группу. Меню Reroll / Remove сохранено.

## Проверки

Все 15 Node suites прошли: npm test (в этой среде выполнены напрямую через node из package.json).
Включая 648000 кадров Dobble, 20000 адаптивных раундов, Tic-Tac-Toe, Wordly, Story Dice, 100 Mastery-сессий и аудио.

Браузерные проверки в Codex IAB:
- tests/wordly.html: игровая логика, клавиатура, подсказки, перенос букв, темы и responsive — PASS.
- tests/wordly-mastery.html: input-only ввод, composition/delete/Enter, custom/native переключение, повтор ошибок, завершение и сброс — PASS.
- tests/wordly-height.html: 7 размеров от 320×568 до 1024×768, клавиатура открыта/закрыта, уменьшение visual viewport — PASS.
- tests/tile-playback.html: реальное декодирование/воспроизведение нового WAV — PASS.
- tests/wordly-clack.html: 3 открытия + один перенос двух зелёных, все звуки закончены до victory, Sound OFF — PASS.
- tests/dice-layout.html: 16 стандартных раскладок, квадратность и границы содержимого — PASS.
- tests/dice-interaction.html: Story/Concept/Sentence, click/keyboard, закрытие, стабильная геометрия, reroll/remove, empty state — PASS.

Файлы Dobble и Tic-Tac-Toe, а также engine/pools Story Dice побайтово совпадают с архивом 2.8.0. Новый WAV совпадает с исходным Downloads/tile clack1.wav: SHA256 53D405C85301B51A33DFC380BE47C6DD53CCAE44E148D2C634B2042EA8826D0A.

## Ограничения

ClassIn и физический телефон с Chrome не были доступны для прямого теста. Проверены реальный desktop input, input-only/composition-события и моделирование уменьшенного visual viewport; окончательную совместимость с клавиатурой ClassIn/телефона нужно проверить на этих устройствах.
Mastery охватывает совместимые слова при выбранном фильтре длины. Прогресс сессии не сохраняется после reload; настройки сохраняются.
При 18 кубиках на очень маленьком экране длинные подписи могут уменьшаться до 7 px, метаданные — до 6 px. Геометрия помещается без прокрутки, но комфорт чтения на таком экране ограничен.
Старые отчёты в проекте описывают предыдущие версии.

## Изменённые файлы

- package.json, serve.mjs, README.md
- games/wordly/game.js, game.css, index.html, settings.js
- games/story-dice/game.js, game.css, layout.js
- shared/audio.js, game-system.css
- tests/audio-assets.test.mjs, audio-integration.html, dice-layout.js, story-dice-browser.js, wordly-browser.js, wordly-session.js

Новые модули: games/wordly/session.js, native-input.js; shared/tile-audio.js, visual-viewport.js; assets/audio/tile-clack.wav.
Новые проверки: wordly-mastery.test.mjs, tile-audio.test.mjs; wordly-mastery.html, wordly-height.html, wordly-clack.html, tile-playback.html, mobile-delta-preview.html. tile-sound.html — историческая диагностика старого MP3.

## Запуск и ручная проверка

1. Распаковать архив целиком. В папке sunny-stacy-games выполнить node serve.mjs (Node.js 18+).
2. Открыть http://127.0.0.1:4173/ на том же компьютере.
3. Wordly → набор → No Repeats / Mastery → Play. Ошибиться в одном слове, остальные пройти; ошибочное вернётся после завершения прохода. Завершить его и проверить Play again.
4. С включённым Sound отправить ответ с несколькими зелёными буквами: звук на каждое открытие, затем один общий звук переноса. Проверить ввод с клавиатуры и custom QWERTY.
5. Story Dice → Sentence → добавить по три кубика каждой категории. Проверить квадратность, TIME и доступность нижних кнопок; нажать кубик → Reroll / Remove.
6. На телефоне повторить без fullscreen и с системной клавиатурой; в ClassIn проверить физический ввод.

Наборы/изображения по-прежнему хранятся в IndexedDB через существующий repository. Миграций и изменений image storage нет.

Финальная проверка: tests/dice-layout.html?short=1 — все 8 раскладок PASS (390×650, 360×640, 320×568, 844×320 × Story/Sentence). Консоль финальных Dice layout и Wordly clack прогонов: 0 warnings/errors.

