import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Bot, webhookCallback } from 'grammy';
import apiRouter from './routes/api.js';
import { setupBotHandlers } from './bot/handlers.js';
import './db/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

if (!process.env.BOT_TOKEN) {
  console.warn('⚠️  BOT_TOKEN not set — bot disabled, API only mode');
} else {
  const bot = new Bot(process.env.BOT_TOKEN);
  setupBotHandlers(bot);

  if (process.env.WEBHOOK_URL) {
    app.use('/webhook', webhookCallback(bot, 'express'));
    bot.api.setWebhook(process.env.WEBHOOK_URL);
    console.log('Bot running in webhook mode');
  } else {
    bot.start({
      onStart: () => console.log('🤖 Telegram bot started (polling)'),
    });
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
