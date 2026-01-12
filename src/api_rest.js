(function () {
  'use strict';
  const S = window.ShikiSDS;
  const { fetchJson, makeThrottler } = S.utils;

  const throttled = makeThrottler(S.config.rest.minDelayMs);

  function getNicknameFromUrl() {
    // профиль: https://shikimori.one/<nickname>[/...]
    const path = decodeURIComponent(location.pathname.replace(/^\/+/, ''));
    const nick = path.split('/')[0];
    return nick || null;
  }

  async function resolveUserId() {
    // Стратегия:
    // 1) если на странице есть явный user_id в data-атрибуте — берем его
    // 2) иначе пробуем /api/users/:id где :id = nickname (на практике часто работает)
    // 3) иначе можно будет добавить GraphQL-resolve (через introspection) — оставим хук

    const el = document.querySelector('[data-user_id],[data-user-id],[data-user]');
    const cand = el?.getAttribute('data-user_id') || el?.getAttribute('data-user-id') || el?.getAttribute('data-user');
    if (cand && /^\d+$/.test(cand)) return Number(cand);

    const nick = getNicknameFromUrl();
    if (!nick) throw new Error('Cannot resolve nickname from URL');

    // Попытка: v1 "Show an user" (/api/users/:id) :contentReference[oaicite:3]{index=3}
    const url = `${S.config.apiBase}/api/users/${encodeURIComponent(nick)}`;
    try {
      const u = await throttled(() => fetchJson(url));
      if (u?.id) return Number(u.id);
    } catch (_) {
      // fallback ниже
    }

    throw new Error('Cannot resolve user id (need DOM selector or add GraphQL resolve)');
  }

  async function fetchAllAnimeRates(userId) {
    const limit = S.config.rest.pageLimit;
    const base = `${S.config.apiBase}/api/users/${userId}/anime_rates`;

    let page = 1;
    const all = [];

    while (true) {
      const url = `${base}?page=${page}&limit=${limit}`;
      const chunk = await throttled(() => fetchJson(url));
      if (!Array.isArray(chunk) || chunk.length === 0) break;

      all.push(...chunk);
      if (chunk.length < limit) break;
      page += 1;
    }

    return all;
  }

  S.apiRest = { resolveUserId, fetchAllAnimeRates };
})();
