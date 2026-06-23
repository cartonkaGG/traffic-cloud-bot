# Traffic Cloud Bot

Telegram бот з Mini App для заливу трафіку в канали. Користувачі обирають напрямок (крипто, трейдинг, спорт, новини тощо) та джерело трафіку (TikTok, Reels, Shorts, TG спам). Адмін додає офери з ціною, бот відстежує вхід/вихід підписників у каналах.

## Стек

- **Backend:** Node.js, Express, grammY, SQLite
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts
- **Design:** UI/UX Pro Max (Dark OLED, gold + purple)

## Швидкий старт

### 1. Створи бота в Telegram

1. Напиши [@BotFather](https://t.me/BotFather)
2. `/newbot` → отримай `BOT_TOKEN`
3. `/newapp` → прив'яжи Mini App до бота
4. `/setdomain` → вкажи домен (для dev використовуй ngrok)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Відредагуй .env — встав BOT_TOKEN та свій Telegram ID в ADMIN_TELEGRAM_IDS
npm install
npm run db:seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Тунель для Mini App (локальна розробка)

```bash
ngrok http 5173
```

Скопіюй HTTPS URL в:
- `WEBAPP_URL` в `backend/.env`
- BotFather → Menu Button / Web App URL

## Налаштування бота для відстеження каналів

1. Додай бота **адміністратором** у TG канал
2. Увімкни права: перегляд учасників, запрошення користувачів
3. У BotFather увімкни **Privacy Mode** → OFF (для `chat_member` updates)
4. Канал автоматично з'явиться в Mini App → «Канали»

## Функціонал

| Розділ | Опис |
|--------|------|
| Головна | Баланс, графік заробітку, статистика |
| Офери | Фільтр по категорії + джерелу трафіку |
| Канали | Вхід/вихід підписників, діаграми |
| Виплата | Запит виводу на USDT гаманець |
| Адмін | Додавання оферів, схвалення виплат |

## Production

```bash
cd frontend && npm run build
# Розмісти dist/ на HTTPS хостингу (Vercel, Cloudflare Pages)
# Backend на VPS з WEBHOOK_URL=https://your-api.com/webhook
```

## Структура

```
traffic-cloud-bot/
├── backend/
│   ├── src/
│   │   ├── bot/handlers.js    # Telegram bot logic
│   │   ├── routes/api.js      # REST API
│   │   ├── db/                # SQLite
│   │   └── middleware/auth.js # Telegram initData validation
│   └── data/                  # SQLite database
└── frontend/
    └── src/
        ├── pages/               # Mini App screens
        └── components/          # UI, charts, nav
```

## Змінні середовища

| Змінна | Опис |
|--------|------|
| `BOT_TOKEN` | Токен від BotFather |
| `ADMIN_TELEGRAM_IDS` | ID адмінів через кому |
| `WEBAPP_URL` | URL Mini App (HTTPS) |
| `PORT` | Порт API (default 3001) |
| `WEBHOOK_URL` | Для production webhook |

## Отримати свій Telegram ID

Напиши [@userinfobot](https://t.me/userinfobot) — скопіюй ID в `ADMIN_TELEGRAM_IDS`.
