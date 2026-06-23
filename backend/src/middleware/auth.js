import crypto from 'crypto';
import db from '../db/database.js';

export function validateInitData(initData) {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) return null;

  const authDate = parseInt(params.get('auth_date') || '0', 10);
  if (Date.now() / 1000 - authDate > 86400) return null;

  const userStr = params.get('user');
  if (!userStr) return null;

  return JSON.parse(userStr);
}

export function authMiddleware(req, res, next) {
  const initData = req.headers['x-telegram-init-data'] || req.query.initData;
  const tgUser = validateInitData(initData);

  if (!tgUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(tgUser.id));

  if (!user) {
    const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map((id) => id.trim());
    const isAdmin = adminIds.includes(String(tgUser.id)) ? 1 : 0;

    const result = db
      .prepare(
        'INSERT INTO users (telegram_id, username, first_name, is_admin) VALUES (?, ?, ?, ?)'
      )
      .run(String(tgUser.id), tgUser.username || null, tgUser.first_name || null, isAdmin);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }

  req.user = user;
  req.tgUser = tgUser;
  next();
}

export function adminMiddleware(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
