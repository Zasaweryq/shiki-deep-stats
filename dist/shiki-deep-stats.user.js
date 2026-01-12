// ==UserScript==
// @name         Shikimori Deep Stats (Anime Only)
// @namespace    https://github.com/Zasaweryq/shiki-deep-stats
// @version      0.4.0
// @description  Deep profile stats (anime) with UI + charts
// @match        https://shikimori.one/*
// @match        https://shikimori.me/*
// @match        https://shikimori.org/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      shikimori.one
// @connect      shikimori.me
// @connect      shikimori.org

// --- Option A: Chart.js from CDN (быстро стартануть)
// @require      https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js

// --- Your modules (pin to commit for stability)
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/ns.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/utils.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/styles.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/api_rest.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/api_gql.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/analytics.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/charts.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/ui.js
// @require https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/src/main.js
// ==/UserScript==

// @downloadURL  https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/dist/shiki-deep-stats.user.js
// @updateURL    https://raw.githubusercontent.com/Zasaweryq/shiki-deep-stats/main/dist/shiki-deep-stats.user.js

(function () {
  'use strict';

  // @require модули уже загрузились, просто стартуем
  const boot = () => window.ShikiSDS?.init?.();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
