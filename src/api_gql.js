(function () {
  'use strict';
  const S = window.ShikiSDS;
  const { fetchJson, makeThrottler } = S.utils;

  const throttled = makeThrottler(S.config.rest.minDelayMs);

  let cachedAnimeFields = null;

  async function gql(query, variables = {}) {
    const url = `${S.config.apiBase}${S.config.gql.endpoint}`;
    return throttled(() => fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    })).then((res) => {
      if (res?.errors?.length) {
        const msg = res.errors.map(e => e.message).join('\n');
        throw new Error(msg);
      }
      return res.data;
    });
  }

  async function introspectAnimeFields() {
    if (cachedAnimeFields) return cachedAnimeFields;
    const q = `query { __type(name:"Anime"){ fields { name } } }`;
    const data = await gql(q);
    cachedAnimeFields = new Set((data?.__type?.fields || []).map(f => f.name));
    return cachedAnimeFields;
  }

  function pickAnimeSelection(fieldsSet) {
    // Базовый набор + "сложные" даты как IncompleteDate (year/month/day/date)
    const want = [
      'id', 'name', 'russian', 'url', 'score',
      'kind', 'status', 'episodes', 'episodesAired', 'duration', 'rating', 'nextEpisodeAt',
      'genres', 'studios',
      'releasedOn', 'airedOn',
    ];

    const has = (n) => fieldsSet.has(n);
    const parts = [];

    for (const f of want) {
      if (!has(f)) continue;

      if (f === 'genres') parts.push(`genres { id name russian }`);
      else if (f === 'studios') parts.push(`studios { id name }`);
      else if (f === 'releasedOn' || f === 'airedOn') parts.push(`${f} { year month day date }`);
      else parts.push(f);
    }

    return parts.join('\n');
  }

  async function fetchAnimeByIds(ids) {
    const uniq = Array.from(new Set(ids.filter(Boolean)));
    if (!uniq.length) return new Map();

    const fields = await introspectAnimeFields();
    const selection = pickAnimeSelection(fields);

    const chunkSize = 60;
    const out = new Map();

    for (let i = 0; i < uniq.length; i += chunkSize) {
      const chunk = uniq.slice(i, i + chunkSize);

      // ВАЖНО: Shikimori ожидает ids как String
      const idsStr = chunk.join(',');

      const q = `
        query($ids: String!) {
          animes(ids: $ids) {
            ${selection}
          }
        }
      `;

      const data = await gql(q, { ids: idsStr });

      for (const a of (data?.animes || [])) {
        out.set(Number(a.id), a);
      }
    }

    return out;
  }

  S.apiGql = { gql, introspectAnimeFields, fetchAnimeByIds };
})();
