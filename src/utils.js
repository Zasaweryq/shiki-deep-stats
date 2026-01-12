(function () {
  'use strict';
  const S = window.ShikiSDS;

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Простой throttle: гарантирует минимальную паузу между вызовами
  function makeThrottler(minDelayMs) {
    let last = 0;
    let chain = Promise.resolve();

    return async function throttled(fn) {
      chain = chain.then(async () => {
        const now = Date.now();
        const wait = Math.max(0, (last + minDelayMs) - now);
        if (wait) await sleep(wait);
        last = Date.now();
        return fn();
      });
      return chain;
    };
  }

  function gmRequestJson({ method = 'GET', url, headers = {}, data = null, timeout = 60000 }) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest !== 'function') {
        reject(new Error('GM_xmlhttpRequest is not available'));
        return;
      }
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        data,
        timeout,
        responseType: 'json',
        onload: (res) => {
          // Tampermonkey: res.response уже объект; Violentmonkey иногда кладет строку в responseText
          const ok = res.status >= 200 && res.status < 300;
          const body = res.response ?? (res.responseText ? JSON.parse(res.responseText) : null);
          if (!ok) reject(new Error(`HTTP ${res.status}: ${res.statusText}`));
          else resolve(body);
        },
        onerror: () => reject(new Error('Network error')),
        ontimeout: () => reject(new Error('Timeout')),
      });
    });
  }

  async function fetchJson(url, opts = {}) {
    // Основной транспорт: GM_xmlhttpRequest (можно добавить заголовки; плюс меньше сюрпризов с CORS)
    const method = opts.method || 'GET';
    const headers = Object.assign({
      'Accept': 'application/json',
      // 'User-Agent' обычно запрещен в fetch, но через GM_xmlhttpRequest иногда проходит.
      // Даже если не пройдет — у нас все равно есть throttling и запросы с сайта.
      'X-Requested-With': 'ShikiSDS',
    }, opts.headers || {});

    const data = opts.body ?? null;
    return gmRequestJson({ method, url, headers, data });
  }

  function median(arr) {
    const a = arr.filter(Number.isFinite).slice().sort((x, y) => x - y);
    if (!a.length) return null;
    const mid = Math.floor(a.length / 2);
    return (a.length % 2) ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  }

  function mean(arr) {
    const a = arr.filter(Number.isFinite);
    if (!a.length) return null;
    return a.reduce((s, x) => s + x, 0) / a.length;
  }

  function std(arr) {
    const a = arr.filter(Number.isFinite);
    if (a.length < 2) return null;
    const m = mean(a);
    const v = a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
    return Math.sqrt(v);
  }

  S.utils = { sleep, makeThrottler, fetchJson, median, mean, std };
})();
