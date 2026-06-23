import db from '../db/database.js';

function getOrCreateUser(from) {
  let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(from.id));
  if (!user) {
    const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map((id) => id.trim());
    const isAdmin = adminIds.includes(String(from.id)) ? 1 : 0;
    const result = db
      .prepare(
        'INSERT INTO users (telegram_id, username, first_name, is_admin) VALUES (?, ?, ?, ?)'
      )
      .run(String(from.id), from.username || null, from.first_name || null, isAdmin);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }
  return user;
}

function recordChannelEvent(chatId, eventType, userTelegramId) {
  const channel = db.prepare('SELECT * FROM channels WHERE telegram_chat_id = ?').get(String(chatId));
  if (!channel) return;

  db.prepare('INSERT INTO channel_events (channel_id, event_type, user_telegram_id) VALUES (?, ?, ?)').run(
    channel.id,
    eventType,
    userTelegramId || null
  );

  const today = new Date().toISOString().split('T')[0];
  const col = eventType === 'join' ? 'joins' : 'leaves';

  db.prepare(
    `INSERT INTO channel_daily_stats (channel_id, date, ${col}) VALUES (?, ?, 1)
     ON CONFLICT(channel_id, date) DO UPDATE SET ${col} = ${col} + 1`
  ).run(channel.id, today);

  if (eventType === 'join' && channel.offer_id) {
    const offer = db.prepare('SELECT price_per_user FROM offers WHERE id = ?').get(channel.offer_id);
    if (offer) {
      const owner = db.prepare('SELECT * FROM users WHERE id = ?').get(channel.owner_id);
      if (owner) {
        db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(
          offer.price_per_user,
          owner.id
        );
      }
    }
  }

  const netChange = eventType === 'join' ? 1 : -1;
  db.prepare('UPDATE channels SET subscriber_count = MAX(0, subscriber_count + ?) WHERE id = ?').run(
    netChange,
    channel.id
  );
}

export function setupBotHandlers(bot) {
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

  bot.command('start', async (ctx) => {
    getOrCreateUser(ctx.from);
    await ctx.reply(
      '🚀 *Traffic Cloud*\n\nПлатформа для заливу трафіку в Telegram канали.\n\nОбери офер, джерело трафіку та заробляй!',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Відкрити Traffic Cloud', web_app: { url: webappUrl } }],
            [{ text: '📊 Мій баланс', callback_data: 'balance' }],
          ],
        },
      }
    );
  });

  bot.callbackQuery('balance', async (ctx) => {
    const user = getOrCreateUser(ctx.from);
    await ctx.answerCallbackQuery();
    await ctx.reply(`💰 Ваш баланс: *$${user.balance.toFixed(2)}*`, { parse_mode: 'Markdown' });
  });

  bot.on('my_chat_member', async (ctx) => {
    const update = ctx.myChatMember;
    const chat = update.chat;
    const newStatus = update.new_chat_member.status;
    const oldStatus = update.old_chat_member.status;

    if (chat.type !== 'channel') return;

    const becameAdmin =
      (oldStatus === 'left' || oldStatus === 'member') &&
      (newStatus === 'administrator' || newStatus === 'creator');

    if (becameAdmin) {
      const user = getOrCreateUser(update.from);
      const existing = db
        .prepare('SELECT * FROM channels WHERE telegram_chat_id = ?')
        .get(String(chat.id));

      if (!existing) {
        db.prepare(
          'INSERT INTO channels (telegram_chat_id, title, owner_id) VALUES (?, ?, ?)'
        ).run(String(chat.id), chat.title || 'Channel', user.id);
      }

      await ctx.api.sendMessage(
        update.from.id,
        `✅ Бот додано до каналу *${chat.title}*\n\nТепер відстежуємо підписників. Відкрий Mini App щоб прив'язати офер.`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  bot.on('chat_member', async (ctx) => {
    const update = ctx.chatMember;
    const chat = update.chat;
    const newStatus = update.new_chat_member.status;
    const oldStatus = update.old_chat_member.status;
    const userId = String(update.new_chat_member.user.id);

    if (chat.type !== 'channel') return;

    const joined =
      (oldStatus === 'left' || oldStatus === 'kicked') &&
      (newStatus === 'member' || newStatus === 'administrator' || newStatus === 'creator');

    const left =
      (newStatus === 'left' || newStatus === 'kicked') &&
      (oldStatus === 'member' || oldStatus === 'administrator' || oldStatus === 'creator');

    if (joined) recordChannelEvent(chat.id, 'join', userId);
    if (left) recordChannelEvent(chat.id, 'leave', userId);
  });

  bot.command('admin', async (ctx) => {
    const user = getOrCreateUser(ctx.from);
    if (!user.is_admin) {
      return ctx.reply('⛔ Доступ заборонено');
    }
    await ctx.reply('⚙️ Адмін-панель', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔧 Адмін панель', web_app: { url: `${webappUrl}?page=admin` } }],
        ],
      },
    });
  });
}
