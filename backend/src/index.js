import app from './app.js';

const PORT = process.env.PORT || 3001;

if (process.env.BOT_TOKEN && !process.env.WEBHOOK_URL && !process.env.VERCEL) {
  const { Bot } = await import('grammy');
  const { setupBotHandlers } = await import('./bot/handlers.js');
  const bot = new Bot(process.env.BOT_TOKEN);
  setupBotHandlers(bot);
  bot.start({
    onStart: () => console.log('🤖 Telegram bot started (polling)'),
  });
}

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
