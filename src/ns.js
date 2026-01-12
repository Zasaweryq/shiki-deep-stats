(function () {
  'use strict';

  const root = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  root.ShikiSDS = root.ShikiSDS || {};
  const S = root.ShikiSDS;

  S.version = S.version || '0.1.0';

  S.config = Object.assign({
    apiBase: location.origin,          // https://shikimori.one|me|org
    rest: {
      pageLimit: 5000,
      minDelayMs: 350,                 // throttle под 5 rps (рекомендация: лимит 5rps / 90rpm) :contentReference[oaicite:1]{index=1}
    },
    gql: {
      endpoint: '/api/graphql',
    },
    ui: {
      modalHeight: '86vh',
    },
    hotTakes: {
      // “мягкие” пороги + всегда показываем ТОП Δ
      likeUserScore: 8.0,
      dislikeUserScore: 6.5,
      crowdLike: 8.0,
      crowdDislike: 7.2,
      deltaStrong: 1.2,
      maxItems: 20,
    }
  }, S.config || {});

})();
