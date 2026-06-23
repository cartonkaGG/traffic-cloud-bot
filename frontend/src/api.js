const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  getMe: () => request('/me'),
  getCategories: () => request('/categories'),
  getSources: () => request('/sources'),
  getOffers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/offers${q ? `?${q}` : ''}`);
  },
  getOffer: (id) => request(`/offers/${id}`),
  getCampaigns: () => request('/campaigns'),
  createCampaign: (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  getChannels: () => request('/channels'),
  linkChannelOffer: (id, offer_id) =>
    request(`/channels/${id}/offer`, { method: 'PUT', body: JSON.stringify({ offer_id }) }),
  getChannelStats: (id) => request(`/channels/${id}/stats`),
  getEarningsChart: () => request('/earnings/chart'),
  getPayouts: () => request('/payouts'),
  requestPayout: (data) => request('/payouts', { method: 'POST', body: JSON.stringify(data) }),
  admin: {
    createOffer: (data) => request('/admin/offers', { method: 'POST', body: JSON.stringify(data) }),
    updateOffer: (id, data) => request(`/admin/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteOffer: (id) => request(`/admin/offers/${id}`, { method: 'DELETE' }),
    createCategory: (data) => request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    createSource: (data) => request('/admin/sources', { method: 'POST', body: JSON.stringify(data) }),
    getPayouts: () => request('/admin/payouts'),
    updatePayout: (id, status) =>
      request(`/admin/payouts/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getStats: () => request('/admin/stats'),
  },
};

export function initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#030712');
    tg.setBackgroundColor('#030712');
  }
  return tg;
}
