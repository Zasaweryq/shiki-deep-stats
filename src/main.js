(function () {
  'use strict';
  const S = window.ShikiSDS;

  async function run() {
    S.styles.inject();

    const userId = await S.apiRest.resolveUserId();
    const rates = await S.apiRest.fetchAllAnimeRates(userId);

    const animeIds = rates.map(r => Number(r.anime?.id)).filter(Boolean);
    const animeById = await S.apiGql.fetchAnimeByIds(animeIds);

    const computed = S.analytics.compute(rates, animeById);
    S.last = { userId, rates, animeById, computed };

    S.ui.openModal({
      title: `Deep Stats — anime`,
      tabs: [
        { name: 'Сводка', render: (root) => renderSummary(root, computed) },
        { name: 'Графики', render: (root) => renderCharts(root, computed) },
        { name: 'Жанры/студии', render: (root) => renderTables(root, computed) },
        { name: 'Hot takes', render: (root) => renderHotTakes(root, computed) },
        { name: 'RAW', render: (root) => renderRaw(root, S.last) },
      ]
    });
  }

  function renderSummary(root, c) {
    root.innerHTML = `
      <div style="display:flex; gap:12px; flex-wrap:wrap">
        <div><b>Всего</b>: ${c.counts.total}</div>
        <div><b>Оценено</b>: ${c.counts.scoredCount}</div>
        <div><b>Средняя твоя</b>: ${fmt(c.averages.userAvg)}</div>
        <div><b>Средняя Shiki (по оцененным)</b>: ${fmt(c.averages.crowdAvgOnScored)}</div>
        <div><b>Δ avg/med/std</b>: ${fmt(c.delta.avg)} / ${fmt(c.delta.median)} / ${fmt(c.delta.std)} (${c.delta.count})</div>
      </div>
      <hr style="opacity:.15; margin:12px 0"/>
      <div><b>Статусы</b></div>
      <pre style="white-space:pre-wrap; opacity:.9">${escapeHtml(JSON.stringify(c.statusCounts, null, 2))}</pre>
    `;
  }

  function renderCharts(root, c) {
    root.innerHTML = `
      <div style="height:260px"><canvas id="sdsChart1"></canvas></div>
    `;
    const canvas = root.querySelector('#sdsChart1');
    const labels = c.dist.map(x => String(x.score));
    const data = c.dist.map(x => x.count);
    S.charts.renderBar(canvas, labels, data, 'Распределение оценок');
  }

  function renderTables(root, c) {
    root.innerHTML = `
      <h3 style="margin:0 0 8px">Жанры</h3>
      ${tableHtml(c.genresTable.slice(0, 50), ['name','count','avgUser','avgCrowd','avgDelta'])}
      <hr style="opacity:.15; margin:12px 0"/>
      <h3 style="margin:0 0 8px">Студии</h3>
      ${tableHtml(c.studiosTable.slice(0, 50), ['name','count','avgUser','avgCrowd'])}
    `;
  }

  function renderHotTakes(root, c) {
    const h = c.hot;
    root.innerHTML = `
      <h3 style="margin:0 0 8px">Тебе нравится — людям нет</h3>
      ${hotList(h.youLikeTheyDont)}
      <h3 style="margin:12px 0 8px">Людям нравится — тебе нет</h3>
      ${hotList(h.theyLikeYouDont)}
      <hr style="opacity:.15; margin:12px 0"/>
      <h3 style="margin:0 0 8px">ТОП Δ+</h3>
      ${hotList(h.deltaPlus)}
      <h3 style="margin:12px 0 8px">ТОП Δ-</h3>
      ${hotList(h.deltaMinus)}
    `;
  }

  function renderRaw(root, data) {
    root.innerHTML = `<pre style="white-space:pre-wrap">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
  }

  function hotList(items) {
    if (!items?.length) return `<div style="opacity:.75">Пусто</div>`;
    return `
      <ol style="margin:0; padding-left:18px">
        ${items.map(x => `
          <li>
            <a href="${x.url}" target="_blank" rel="noreferrer">${escapeHtml(x.title)}</a>
            — <b>${x.user}</b> vs ${fmt(x.crowd)} (Δ ${fmt(x.delta)})
          </li>
        `).join('')}
      </ol>
    `;
  }

  function tableHtml(rows, cols) {
    const head = cols.map(c => `<th style="text-align:left; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,.08)">${escapeHtml(c)}</th>`).join('');
    const body = rows.map(r => `
      <tr>
        ${cols.map(c => `<td style="padding:6px 8px; border-bottom:1px solid rgba(255,255,255,.06)">${escapeHtml(fmtCell(r[c]))}</td>`).join('')}
      </tr>
    `).join('');
    return `<table style="width:100%; border-collapse:collapse; font-size:13px">
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
  }

  function fmt(n) { return (Number.isFinite(n) ? n.toFixed(2) : '—'); }
  function fmtCell(v) { return (typeof v === 'number' ? fmt(v) : (v ?? '—')); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function init() {
    if (!S.ui.isProfilePage()) return;
    S.styles.inject();
    S.ui.mountButton(() => run().catch(err => {
      console.error('[ShikiSDS] run failed', err);
      alert(`ShikiSDS error:\n${err.message || err}`);
    }));
  }

  S.init = init;
  S.run = run;
  S.open = () => S.run();
  S.close = () => S.ui.closeModal();
})();
