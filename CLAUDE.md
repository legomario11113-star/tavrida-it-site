# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static one-page marketing site for TAVRIDA.IT (IT outsourcing/outstaffing, Crimea). Plain HTML/CSS/JS — no framework, no bundler, no build step. `index.html` is currently the only page; `css/styles.css` and `js/main.js` are written to be shared by future pages (`services.html`, `contacts.html`, etc.) rather than duplicated per page. The frontend has no `package.json` of its own — but `server/` (see below) does, since it's a real Node backend.

## Commands

The static site itself has no build/lint/test tooling (no root `package.json`).

- **Preview locally**: open `index.html` directly in a browser, or `npx serve .` from the repo root.
- **Verifying visual/behavioral changes on the frontend**: there's no permanent test suite. The established pattern for this repo is to temporarily install Playwright (`npm install --no-save playwright`, `npx playwright install chromium`), drive `file:///.../index.html` with a throwaway script to screenshot at desktop (1440px) and mobile (375px) widths and check `document.documentElement.scrollWidth` for horizontal overflow, then delete `node_modules`/`package.json`/`package-lock.json`/screenshots before committing. Keep this out of git — the repo root should stay dependency-free.
- **Backend** (`server/`): `cd server && npm install && cp .env.example .env`, then `npm run dev` (nodemon) or `npm start`. See `server/README.md` for the full local-run and VPS-deploy checklist. `server/` has its own `.gitignore`-d `node_modules/`, `.env`, and `data/` (the SQLite file) — `package-lock.json` IS committed.

## Architecture

### Design tokens

All colors/spacing/radii live as CSS custom properties at the top of `css/styles.css`. Key ones: `--color-accent` (terracotta `#C4622D`), `--color-secondary` (teal `#2E7D74`), `--color-dark-bg` (`#14151E`, used for header/hero/request-form/footer), `--color-peach-bg`/`--color-mint-bg` (pastel icon/card backgrounds), `--color-bg`/`--color-bg-card` (warm off-white light sections). Fonts are Manrope (body/headings) + IBM Plex Mono (labels/numbers), loaded from Google Fonts in `<head>`. `README.md`'s design-system section is stale (lists an old `#262B39` dark color) — treat `styles.css`'s `:root` block as the source of truth.

### Design source

The visual design was reverse-engineered from a PDF export of a Claude-Design mockup the user provided (not from the original text brief, which turned out to be a rougher approximation). If a future redesign request references "the mockup" again, ask for a fresh export/screenshot rather than assuming the old text brief still applies — the two disagreed significantly last time (card styles, section colors, hero illustration, etc.).

### Request form → own backend (server/)

The `#request` section's `<form id="request-form">` no longer uses Formspree — it POSTs JSON to a self-hosted backend in `server/` (Express + better-sqlite3 + nodemailer), submitted via `fetch` from the inline `<script>` at the bottom of `index.html` (not from `js/main.js`). Important non-obvious point: **the section id is `#request`, not `#request-form`** — the form element itself owns `id="request-form"`. This split is intentional: giving both the wrapping `<section>` and the `<form>` the same id would be invalid HTML and would break `document.getElementById('request-form')` (it would resolve to the section, not the form, since it's first in document order). All in-page anchors (`header`, hero CTA, footer CTA) point to `#request`.

The inline script's `API_URL` constant is currently `http://localhost:3000/api/request` with a `// TODO: заменить на адрес сервера после деплоя` comment — it must be updated to the real backend URL once `server/` is deployed (see `server/README.md`). The frontend sends JSON (`first_name`, `last_name`, `email`, `phone`, `message`, `website`) and expects `{ ok: true }` / `{ ok: false, error }` back — not Formspree's `{ errors: [...] }` shape.

`server/routes/request.js` has its own honeypot field (`website`, matching the hidden input in the form) — unrelated to Formspree's old `_gotcha`/`_subject` fields, which were removed from the form entirely along with the `action` attribute.

`js/main.js`'s `initRequestForm()` function is dead code — it looks for a `[data-request-form]` attribute that doesn't exist on the form (removed back when the form was first wired to Formspree, and still absent now). It's harmless (returns early, no-op) but was intentionally left alone rather than removed, since form-related tasks have repeatedly been scoped to `index.html`/`server/` only. Don't be confused into thinking form submission is handled there; the real logic is the inline script in `index.html`, which now talks to `server/`.

### FAQ section

Rendered as always-expanded cards (no accordion/collapse JS) — this matches the reference mockup, which showed every answer visible at once rather than a click-to-expand pattern. Don't reintroduce accordion behavior unless asked.

### Icons

All icons are inline SVG (hand-written paths), no icon library/sprite sheet.

---

# Русская версия

Ниже — полный перевод этого файла на русский. Технически это дубликат
английской версии выше; правь обе части синхронно, если меняешь контент.

## Что это

Статический одностраничный сайт-визитка TAVRIDA.IT (IT-аутсорсинг/аутстаффинг,
Крым). Чистые HTML/CSS/JS — без фреймворка, без сборщика, без шага сборки.
`index.html` сейчас единственная страница; `css/styles.css` и `js/main.js`
написаны так, чтобы их переиспользовали будущие страницы (`services.html`,
`contacts.html` и т.д.), а не дублировали для каждой. У самого фронтенда нет
своего `package.json` — а вот у `server/` (см. ниже) есть, это настоящий
Node-бэкенд.

## Команды

У статического сайта нет инструментов сборки/линта/тестов (нет `package.json`
в корне).

- **Локальный просмотр**: открыть `index.html` прямо в браузере, либо
  `npx serve .` из корня репозитория.
- **Проверка визуальных/поведенческих изменений во фронтенде**: постоянного
  набора тестов нет. Сложившийся для этого репозитория паттерн — временно
  установить Playwright (`npm install --no-save playwright`,
  `npx playwright install chromium`), прогнать `file:///.../index.html`
  одноразовым скриптом, сделать скриншоты на десктопной (1440px) и мобильной
  (375px) ширине, проверить `document.documentElement.scrollWidth` на
  горизонтальное переполнение, а затем удалить
  `node_modules`/`package.json`/`package-lock.json`/скриншоты перед коммитом.
  Всё это не должно попадать в git — корень репозитория должен оставаться без
  зависимостей.
- **Backend** (`server/`): `cd server && npm install && cp .env.example .env`,
  затем `npm run dev` (nodemon) или `npm start`. Полный чек-лист локального
  запуска и деплоя на VPS — в `server/README.md`. У `server/` свой
  `.gitignore`-нутый `node_modules/`, `.env` и `data/` (файл SQLite) —
  `package-lock.json` при этом закоммичен.

## Архитектура

### Дизайн-токены

Все цвета/отступы/радиусы вынесены в CSS custom properties в начале
`css/styles.css`. Ключевые: `--color-accent` (терракотовый `#C4622D`),
`--color-secondary` (бирюзовый `#2E7D74`), `--color-dark-bg` (`#14151E`,
используется для шапки/hero/формы заявки/футера), `--color-peach-bg`/
`--color-mint-bg` (пастельные подложки иконок/карточек), `--color-bg`/
`--color-bg-card` (тёплые светлые секции). Шрифты — Manrope (текст/заголовки)
+ IBM Plex Mono (лейблы/цифры), подключены из Google Fonts в `<head>`.
Раздел «дизайн-система» в `README.md` устарел (там указан старый тёмный цвет
`#262B39`) — источником истины считать блок `:root` в `styles.css`.

### Источник дизайна

Визуальный дизайн был восстановлен по PDF-экспорту макета Claude Design,
который прислал пользователь (а не по исходному текстовому брифу — тот
оказался более грубым приближением). Если в будущем запросе на редизайн снова
упомянут «макет», нужно попросить свежий экспорт/скриншот, а не считать, что
старый текстовый бриф всё ещё актуален — в прошлый раз они заметно расходились
(стиль карточек, цвета секций, иллюстрация в hero и т.д.).

### Форма заявки → собственный backend (server/)

Форма `<form id="request-form">` внутри секции `#request` больше не использует
Formspree — она отправляет JSON на свой собственный backend в `server/`
(Express + better-sqlite3 + nodemailer), через `fetch` из инлайнового
`<script>` в конце `index.html` (а не из `js/main.js`). Важный неочевидный
момент: **id секции — `#request`, а не `#request-form`** — сам элемент
`<form>` владеет id `request-form`. Это разделение сделано намеренно: если и
обёртка `<section>`, и `<form>` получат одинаковый id, это будет невалидный
HTML и сломает `document.getElementById('request-form')` (он вернёт секцию, а
не форму, так как она первая в порядке документа). Все внутренние якоря
(шапка, кнопка в hero, кнопка в футере) ведут на `#request`.

Константа `API_URL` в инлайновом скрипте сейчас равна
`http://localhost:3000/api/request` с комментарием
`// TODO: заменить на адрес сервера после деплоя` — её нужно обновить на
реальный адрес backend после деплоя `server/` (см. `server/README.md`).
Фронтенд шлёт JSON (`first_name`, `last_name`, `email`, `phone`, `message`,
`website`) и ждёт в ответ `{ ok: true }` / `{ ok: false, error }` — это НЕ
формат Formspree (`{ errors: [...] }`).

У `server/routes/request.js` свой honeypot-механизм (поле `website`,
совпадает со скрытым полем в форме) — он не связан со старыми полями
Formspree `_gotcha`/`_subject`, которые вместе с атрибутом `action` были
полностью убраны из формы.

Функция `initRequestForm()` в `js/main.js` — мёртвый код: она ищет атрибут
`[data-request-form]`, которого на форме нет (его убрали ещё когда форму
впервые подключали к Formspree, и его до сих пор нет). Функция безобидна
(просто выходит рано, ничего не делает), но её намеренно оставили как есть, а
не удалили, поскольку задачи по форме раз за разом ограничивались только
`index.html`/`server/`. Не путать: обработка отправки формы происходит не там,
а в инлайновом скрипте в `index.html`, который теперь обращается к `server/`.

### Секция FAQ

Отрендерена как всегда развёрнутые карточки (без аккордеона/JS для
сворачивания) — это соответствует референсному макету, где все ответы были
видны одновременно, а не по клику. Не возвращать поведение аккордеона без
явного запроса.

### Иконки

Все иконки — инлайновый SVG (пути написаны руками), без библиотеки
иконок/спрайтов.
