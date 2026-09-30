# Sunny & Stacy Games 2.8.0 — проверка изменений

Дата: 2026-09-30. Включает предыдущий delta Shared Game Systems и последний Story Dice Interaction + Audio Assets. Последний delta заменяет ранее предложенное выравнивание громкости: новые MP3 не нормализуются.

## Реализовано

- Общие заголовки четырёх игр, theme-aware elevation/glow, моментальный предпросмотр темы в setup/Settings с отменой. Общие кнопочные и wheel-контролы.
- Wordly: лимиты подсказок 1/1/2/2/3/3, сохранение использованного бюджета, честное сообщение при завершении подсказкой, перенос зелёных букв с блокировкой ввода на время анимации.
- Story Dice: единая поверхность, все подписи внутри, измеряемая адаптивная раскладка; меню Reroll/Remove по нажатию, Enter/Space, Escape, закрытие снаружи/повторным нажатием; меню не участвует в layout. Пустой стол показывает инструкции, заполненный — только кубики.
- MP3: исходные байты и volume=1; один переиспользуемый канал на эффект исключает накопление одинаковых звуков. Tile clack — каждый reveal; wrong buzz — неверный Wordly-ответ; victory — победа Wordly/TTT; correct/wrong — существующие события Dobble/TTT; dice-roll — add/reroll. UI click доступен общему helper, новые звуки на каждый произвольный UI-клик не добавлялись. Whoosh удаления не изменён.
- Победа: 3s без изменения уровня, линейный fade 1.2s, stop/reset; следующий раунд и pagehide останавливают воспроизведение. Sound OFF блокирует запуск и останавливает текущие эффекты.

## Проверки

- Все 13 Node suites PASS: генерация/движение Dobble (648000 кадров), адаптация, контент/storage, композиция, TTT, Wordly, Story Dice и новая проверка аудио-envelope.
- Story Dice layout: 390×844, 412×915, 844×390, 915×412, 820×1180, 1024×768, 1366×768, 1920×1080; максимум 10 Story / 18 Sentence; длиннейшие Time-подписи, собственные границы каждого элемента, отсутствие перекрытия/прокрутки на этой матрице, reflow после удаления, whoosh ON/OFF. Найденное расхождение ширины текста на 1920px исправлено и проверено отдельно повторно.
- Story Dice interaction: все три режима; видимость инструкций, единая структура, переключение/закрытие меню, клавиатура, неизменная геометрия при открытии, сохранение ID при reroll, анимация удаления.
- Story Dice acceptance: собственные uploaded images, bags, grammar/filter preservation, 18 dice, 8 themes и missing set PASS.
- Wordly acceptance: ввод, попытки/подсказки, carry animation, Sound OFF, проигрыш/победа, 8 размеров экрана, все темы, uploaded images PASS.
- Shared systems: setup/live preview, Cancel/commit всех 8 тем в каждой игре без изменения игрового состояния PASS. Wheel: keyboard/disabled options; отдельно реальная мышь, wheel и drag PASS.
- TTT polish: reveal/steal/steal off, повторный раунд, общий chooser/редактор PASS.
- Victory integration: реальные игровые победы Wordly/TTT с инструментированным Audio — исходный уровень, 3s hold, fade, новый раунд, повторная победа, Sound OFF PASS.
- Все шесть настоящих MP3 успешно декодированы браузером. SHA-256 каждой копии совпадает с файлом из Downloads. Длительности: click 1.992s, clack 1.296s, wrong 1.752s, victory 8.098s, correct 2.116s, roll 1.254s. Источник victory не обрезан.
- Консоль финальной Story Dice страницы, Wordly acceptance и victory integration: ошибок/предупреждений не найдено.
- Dobble engine/layout/motion/sizing/render/viewport, TTT engine/task-presentation и Story Dice engine/pools побайтно совпадают с pre-shared-ui-2.7.1. Аудиомодули изменены по запросу.

Автоматизированные браузерные результаты: tests/2.8.0-browser-results.json. Проверки запускаются кнопкой на соответствующих tests/*.html.

## Запуск и ручная проверка

Распакуйте архив целиком, в папке sunny-stacy-games выполните `node serve.mjs`, откройте http://127.0.0.1:4173. Node.js 18+, npm dependencies не требуются. Для Node-проверок: `npm test` (или команды из package.json по отдельности).

1. Story Dice → Sentence → Play. Прочитайте пустую инструкцию, добавьте кубик: инструкция исчезает.
2. Нажмите кубик → Reroll; затем Remove. Проверьте закрытие по Escape/нажатию снаружи и отсутствие смещения соседей.
3. Добавьте по три кубика каждой категории и уменьшите окно до телефона.
4. С Sound ON оцените roll, whoosh, Wordly tile clack и победу; начните следующий раунд во время победного звука. Повторите с Sound OFF.
5. В любой игре переключите темы в подготовке/Settings и отмените: игровой прогресс остаётся.

## Ограничения

Громкость новых файлов специально не балансировалась; субъективную слышимость в ClassIn и на устройствах оцениваем вручную. Физический сенсорный экран/стилус не использовались; обработчик обычного click общий для этих устройств. На экстремально маленьком окне, где минимально читаемый текст физически не помещается, стол допускает вертикальную прокрутку вместо перекрытия/обрезки; на проверенной матрице прокрутки нет. Отображение некоторых новых emoji зависит от системных шрифтов Windows.

Storage/repository, IndexedDB для изображений, локальные настройки и content-set architecture не менялись. Сервер/облако не добавлялись.

## Изменённые/созданные файлы относительно 2.7.1

- assets/audio/correct-chime.mp3
- assets/audio/dice-roll.mp3
- assets/audio/tile-clack.mp3
- assets/audio/ui-click.mp3
- assets/audio/victory.mp3
- assets/audio/wrong-soft-buzz.mp3
- games/dobble/dobble.js
- games/dobble/index.html
- games/dobble/settings.js
- games/dobble/sound.js
- games/story-dice/game.css
- games/story-dice/game.js
- games/story-dice/index.html
- games/story-dice/layout.js
- games/story-dice/sound.js
- games/tic-tac-toe/game.js
- games/tic-tac-toe/index.html
- games/wordly/engine.js
- games/wordly/game.js
- games/wordly/index.html
- package.json
- README.md
- serve.mjs
- shared/audio-levels.js
- shared/audio.js
- shared/celebration.js
- shared/game-system.css
- shared/selection-controls.js
- shared/setup-preview.js
- shared/ui.js
- shared/wheel-picker.js
- tests/2.8.0-browser-results.json
- tests/audio-assets.html
- tests/audio-assets.test.mjs
- tests/audio-integration.html
- tests/celebration-browser.js
- tests/content.test.mjs
- tests/dice-interaction.html
- tests/dice-layout.js
- tests/gameplay-polish.test.mjs
- tests/shared-system.html
- tests/shared-system.js
- tests/story-dice-browser.js
- tests/ttt-polish2.test.mjs
- tests/wheel-interaction.html
- tests/wordly-browser.js
- tests/wordly.test.mjs
- SHARED-SYSTEMS-TEST-REPORT.md
