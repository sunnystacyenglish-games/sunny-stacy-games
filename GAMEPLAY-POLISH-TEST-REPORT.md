# Gameplay polish — 2.5.1

## Реализовано
- Точные восемь пар тематических маркеров, логические X/O не меняются.
- Picture Blur / Word Blur, сохранение режима, раскрытие на 600 мс после обеих оценок. Новый концепт перехвата снова скрыт. Изображения используют нейтральный alt, скрытый ответ исключён из accessibility tree и выделения.
- TASK и STEAL_TASK: один непрозрачный dialog в центре visual viewport, независимо от клетки. Высота стабильна при обновлении содержимого; прокручивается только область задания, кнопки остаются видимыми. Background блокируется native showModal.
- Победа: старые маркеры/линия, четыре ноты за 690 мс, один 48-частичный burst, очистка через 1650 мс. Через 450 мс открывается центральный result dialog. Без звука при Sound OFF; без частиц при reduced motion. Ничья без победного звука и конфетти.
- Play Again сохраняет настройки и shuffled bag, чередует стартующего, удаляет линию и частицы. pagehide очищает частицы.
- Обе игры используют shared/settings-preview.js: снимок, live theme, Done, rollback Cancel/Escape. Dobble сохраняет DOM текущего раунда и геометрию границы карточек при смене темы; структурные настройки применяются на Done.
- Dobble: диапазон 13–14% / 24–25% диаметра, отношение 1.8. Цели описывают исходную ширину/высоту до поворота; collision footprint учитывает поворот существующим способом. Без изменений скоростей или физики.

## Проверки 29 сентября 2026
Все 9 Node suites прошли: 10078 логических проверок, 648000 кадров движения (минимальное перемещение каждого элемента 0.350 диаметра), 20000 раундов ротации, 7743 adaptive cases, 180 композиций, 10000 TTT bag draws, 900 иерархий размеров, preview rollback, victory cleanup/reduced-motion suppression.

Браузер:
- celebration.html: 72 случая (9 клеток × 8 размеров), TASK → reveal → STEAL, центрирование с точностью 1px, одинаковая геометрия, кнопки внутри viewport; все 8 тем и оба blur mode. Победа Sound ON/OFF: ровно один burst, ON ровно 4 дополнительные ноты, OFF нет audio calls; winner/name/marker, blocking modal, cleanup, starter, mode persistence. Draw: без линии/частиц. PASS.
- tictactoe.html: 8 размеров с длинными фразами, двойные клики, удачный/неудачный steal, занятые клетки; 8 тем с победой и Play Again, все направления линии и ничья, missing-set, drawer. PASS.
- tictactoe-extra.html: победа перехватом, Sound ON/OFF, Blob images, exact/different JSON import, bag continuity. PASS.
- gameplay-polish.html: blur accessibility/reveal timing, safe preview и полный Cancel rollback, все темы Dobble без remount/reflow; реальные Animals 1 во всех скоростях. Fast: все 12 объектов прошли более 0.12 диаметра от начальной точки; границы и пересечения проверялись каждый кадр. PASS.
- polish.html: 32 сочетания 1–4 карточек и 8 размеров, Hub и hover/touch/focus drawer. PASS.
- viewport.html: режимы, resize, малые наборы. PASS.
- regression.html: storage, editor input/semantics, pregame, global version, layout, rendered flexible modes. PASS.
- delta.html: authoritative ID, JSON import, copy link, responsive cards, Hub setup. PASS.

Размеры: 390×844, 412×915, 844×390, 915×412, 820×1180, 1024×768, 1366×768, 1920×1080.
Проверена консоль демо и новых browser suites: без ошибок. Старый тест steal имел фиксированное ожидание, слишком короткое для нового reveal; заменено ожиданием готовности состояния, повторный прогон PASS.

SHA-256 сравнение с work/pre-gameplay-polish-2.5.0: Dobble engine/motion/render/layout/viewport/dobble.css/sound, TTT engine, shared game-shell.js/css полностью неизменны.

## Изменённые файлы
- package.json, README.md; добавлен этот отчёт.
- games/dobble/{dobble.js,index.html,settings.js,sizing.js}.
- games/tic-tac-toe/{game.js,game.css,index.html,markers.js,settings.js}; новые celebration.js, task-presentation.js.
- Новый shared/settings-preview.js.
- tests/{adaptive.test.mjs,tictactoe-browser.js,tictactoe-extra.js,viewport-tests.js}.
- Новые tests/{gameplay-polish.test.mjs,gameplay-polish.html,gameplay-polish.js,celebration.html,celebration-browser.js}.

## Запуск и ручная проверка
Распакуйте архив, в каталоге с package.json выполните node serve.mjs. Откройте http://127.0.0.1:4173. Node.js 18+, npm install не нужен.
My Sets → Play → Tic-Tac-Toe → режим/имена/тема/звук → Play. Выберите любую клетку: центрированное задание. Incorrect раскрывает ответ и затем даёт новый концепт сопернику в том же окне. Соберите линию, проверьте победу и Play Again. Повторите при Sound OFF и втором blur mode.
Dobble → Animals 1 → 2 cards → Images → Fast: оцените размеры и свободное движение. Settings → тема → Cancel / Done: карточки и счёт сохраняются.

## Хранилище и ограничения
Storage architecture не менялась: общий set repository, IndexedDB для наборов/Blob, настройки локальные. Облака нет. Звук программно проверен через AudioContext spy; акустику/передачу звука ClassIn требуется оценить на реальном уроке. Мобильные и ClassIn-размеры проверялись в браузере, не на физических устройствах. Большие тексты могут требовать прокрутки внутри задания. Blur — учебное визуальное скрытие, не защита от просмотра исходного DOM.
