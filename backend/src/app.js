import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Bot, webhookCallback } from 'grammy';
import apiRouter from './routes/api.js';
import { setupBotHandlers } from './bot/handlers.js';
import { seedIfEmpty } from './db/seed.js';
import './db/database.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

seedIfEmpty();

if (process.env.BOT_TOKEN && (process.env.VERCEL || process.env.WEBHOOK_URL)) {
  const bot = new Bot(process.env.BOT_TOKEN);
  setupBotHandlers(bot);

  const webhookUrl =
    process.env.WEBHOOK_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}/_/backend/webhook`;

  app.use('/webhook', webhookCallback(bot, 'express'));
  bot.api.setWebhook(webhookUrl).catch(console.error);
}

export default app;
