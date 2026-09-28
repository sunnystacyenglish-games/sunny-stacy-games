# Delta 2.4.1 — 28 сентября 2026

## Автоматические тесты

Все семь Node-наборов PASS: 10078 deck/round checks; 648000 motion frames (минимальное перемещение 0.302 диаметра); content/JSON/storage validation; 20000 rotation rounds; 7743 adaptive rounds; ID resolution, links, Unicode semantics; 180 новых композиционных проверок с иерархией размеров и повёрнутыми footprint.

## Браузер

- delta.html: A–G, K PASS. Явный existing/missing ID, отсутствие fallback, импорт X с сохранением X, импорт Y без замены X, явные Use this set / выбор локального набора, Copy Game Link без per/items, pre-game всегда перед стартом.
- H PASS: 390×844, 412×915, 844×390, 915×412, 820×1180, 1024×768 — две полные круглые карточки видны; resize сохраняет IDs/target/score/scale/angle.
- viewport.html: 10 viewport размеров, три режима, 1/2 карточки, наборы 5–19, 1–4 card configurations, resize PASS. Проверка дожидается завершения асинхронной раскладки; прежняя мгновенная проверка фиксировала её промежуточное состояние.
- flexible.html: 66 сочетаний размера/режима/скорости, 45 кадров каждое — нет пересечений или выхода за круг, углы и ранги неизменны.
- I: гарантия rank ratio 2.15, shuffle и стабильность — Node + визуальная проверка. Безопасная подгонка плотных карточек может уменьшить абсолютные размеры, сохраняя отношение рангов.
- J: editor-semantics.html PASS. Inline Enter a word / Enter an emoji, запрет сохранения/Play, исправление возвращает возможность сохранить.
- editor-inputs.html PASS: PNG drop/paste, удаление изображения, minimum 5, Blob persistence, повторное открытие.
- browser.html PASS: PNG/JPEG/WEBP, edit, duplicate independence, import/export с изображениями, invalid JSON, built-in protection, corrupted record handling.
- pregame.html PASS: вход из библиотеки, 4 видимых card options, mixed constraints, Cancel без изменения remembered settings, запуск с автоматической плотностью.
- version.html PASS: 390/1280 px, Hub/My Sets/Editor/Dobble/pre-game, v2.4.1 из package.json.
- layout.html: 15 страниц/размеров PASS без горизонтального переполнения.

Визуально проверены 2-card Images на desktop и 390×844, кнопки Settings/Fullscreen доступны. Fullscreen переключает UI в Exit fullscreen и обратно без пересоздания карточек. В консолях delta, rendering, pregame, semantic editor и gameplay новых ошибок нет.

## Сохранено

motion.js, sound.js, engine.js, theme-view.js, themes.css и shared/themes.js побайтно совпадают с исходной 2.4.0. Данные пользователя не мигрировались и не менялись. Storage/семантика/импорт расширены в существующих repository и validation слоях.

## Изменённые файлы

package.json; games/dobble/config.js, dobble.js, index.html, settings.js, viewport.js, dobble.css, layout.js, sizing.js, render.js; shared/ui.js, storage.js, sets.js, transfer.js, content-rules.js, teacher.css; sets/editor.js; tests/adaptive.test.mjs, config.test.mjs, composition.test.mjs, viewport-tests.js, pregame.js, version.html; README.md, TEST-REPORT.md.

Добавлены: games/dobble/resolution.js; tests/delta.html, delta-browser.js, editor-semantics.html.

## Практические ограничения

Нет облака: ID без локального набора требует JSON. Старые JSON без ID требуют явного Use this set. Обычный импорт в библиотеку по-прежнему создаёт копию. Readability сверхдлинных слов ограничена размером экрана; плотная композиция подгоняется целиком. Физические устройства и ClassIn не проверялись.
