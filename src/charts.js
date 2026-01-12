(function () {
  'use strict';
  const S = window.ShikiSDS;

  function ensureChartJs() {
    if (!window.Chart) throw new Error('Chart.js not found. Add @require chart.js or implement fallback.');
    return window.Chart;
  }

  function renderBar(canvas, labels, data, title) {
    const Chart = ensureChartJs();
    return new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels, datasets: [{ label: title, data }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: !!title, text: title } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  S.charts = { renderBar };
})();
