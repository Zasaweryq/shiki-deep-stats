(function () {
  'use strict';

  const pageWin = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  const S = pageWin.ShikiSDS = pageWin.ShikiSDS || {};
  // зеркалим в sandbox window, чтобы остальные модули точно видели
  window.ShikiSDS = S;
  if (typeof unsafeWindow !== 'undefined') unsafeWindow.ShikiSDS = S;

  S.version = S.version || '0.1.0';

  S.config = Object.assign({
    apiBase: location.origin,
    rest: { pageLimit: 5000, minDelayMs: 350 },
    gql: { endpoint: '/api/graphql' },
    ui: { modalHeight: '86vh' },
    hotTakes: { likeUserScore: 8, dislikeUserScore: 6.5, crowdLike: 8, crowdDislike: 7.2, deltaStrong: 1.2, maxItems: 20 }
  }, S.config || {});
})();
