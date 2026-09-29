# Tic-Tac-Toe polish delta 2 — 2.5.2

## Изменения
- Reveal Answer снимает blur без таймера, изменения хода, board или bag. Кнопка остаётся на месте, но disabled; каждый новый TASK/STEAL_TASK сбрасывает её. После ручного Reveal оценка сразу поступает в движок; без Reveal используется только 140 мс визуального перехода (0 при reduced motion), затем обычные анимации разрешения хода.
- Steal ON/OFF в pre-game, ON по умолчанию. OFF: ошибка не берёт второй концепт, освобождает клетку и передаёт ход. Следующий игрок может выбрать ту же клетку. Настройка хранится вместе с остальными TTT preferences, в URL steal=true/false и сохраняется после Play Again. В середине игры переключатель не предлагается.
- Victory sting: 1.32 с, восходящие ноты и заключительный аккорд, один вызов на победу. Sound OFF отключает; draw не вызывает. Аудио не блокирует игру.
- Twin cannons: 32 частицы слева и 32 справа, начальная скорость вверх/внутрь, гравитация, вариации размеров, скорости и вращения. Лёгкий requestAnimationFrame без зависимостей. Частицы удаляются после падения; аварийный предел 3.2 с. Play Again/pagehide очищают слой. Reduced motion отключает частицы. Слой не принимает pointer events и остаётся под native modal/backdrop.
- Один Play в My Sets и редакторе: shared/game-chooser.js показывает два доступных варианта и имя текущего набора. Открытие/Cancel/Escape не запускают игру. URL передаёт точный ID в существующую подготовку игры. PLAYABLE_GAMES — единый расширяемый список.

## Сохранение Dobble
SHA-256 сравнение с work/pre-ttt-polish-2.5.1: ноль изменённых файлов во всём games/dobble, включая assets. shared/ui.js (существующая подготовка Dobble), game-shell.js и game-shell.css также побайтово прежние. Меняется только глобальная версия в package.json. Хранилище контента и shuffled-bag архитектура сохранены.

## Проверки
- Все 10 Node suites: PASS. Новые проверки: Steal OFF для обоих стартующих игроков, отсутствие дополнительного bag draw, повторный выбор той же клетки, завершение уже начатого steal; ON default / remembered OFF / URL override; 64 частицы и два источника, подъём/верхняя точка/падение на четырёх размерах, длительность звука, cleanup и reduced-motion suppression.
- tests/ttt-polish2.html: оба blur mode, ручной Reveal без оценки после ожидания 900 мс, немедленная оценка уже раскрытого ответа, новый скрытый steal, OFF и Play Again, единый Play/Cancel/обе игры и выбранный ID, Play из сохранённого редактора. PASS.
- tests/pregame.html: обновлён вход через Choose a game; прежние настройки и валидация Dobble. PASS.
- tests/tictactoe.html: 8 размеров, длинные задания, повторные клики, все темы, линии, draw, Play Again, missing ID и drawer. PASS.
- tests/celebration.html: 72 комбинации клеток/размеров, стабильный центр и кнопки, темы/blur, один victory layer и один шестинотный sting, Sound OFF, cleanup, draw, Play Again. PASS.
- tests/gameplay-polish.html: текущий короткий reveal, доступность скрытого ответа, safe theme preview и rollback, неизменность Dobble раунда, размеры и движение. PASS.
- Консоль приложения: без ошибок. Проверка звука автоматизирована через AudioContext spy; живое звучание в ClassIn требует проверки на уроке.

## Файлы
Изменены: package.json, README.md; games/tic-tac-toe/{celebration.js,engine.js,game.css,game.js,index.html,settings.js,task-presentation.js}; sets/{editor.js,library.js}.
Добавлен shared/game-chooser.js.
Тесты: новые tests/ttt-polish2.{html,test.mjs}, tests/ttt-polish2-browser.js; обновлены tests/{celebration-browser.js,gameplay-polish.js,gameplay-polish.test.mjs,pregame.js,tictactoe-browser.js,tictactoe-extra.js} под новые требования. Этот отчёт добавлен.

## Запуск / ручная проверка
1. Распакуйте sunny-stacy-games-2.5.2.zip. В каталоге с package.json выполните node serve.mjs (Node 18+, npm install не нужен).
2. Откройте http://127.0.0.1:4173/sets/. Play → Choose a game → Tic-Tac-Toe. Набор уже выбран.
3. Выберите Word Blur, Steal OFF. Play → любая клетка → Reveal Answer. Ответ остаётся открытым сколько нужно; Correct/Incorrect разрешают ход. После ошибки соперник свободно выбирает клетку.
4. Повторите с Picture Blur и Steal ON: ошибка даёт сопернику новый скрытый концепт на ту же клетку.
5. Соберите линию, проверьте звук/две пушки/Play Again; повторите с Sound OFF. Draw не празднуется.
6. В My Sets откройте Play, нажмите Cancel/Escape; затем выберите Dobble: прежняя подготовка с тем же набором.

Мобильные размеры проверены браузерными viewport, не физическими устройствами. Для очень длинного контента доступна прокрутка внутри задания. Контент остаётся локальным: перенос на другой компьютер через JSON.
