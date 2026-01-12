(function () {
  'use strict';
  const S = window.ShikiSDS;
  const { mean, median, std } = S.utils;

  const VALID_STATUSES = ['completed', 'dropped', 'watching', 'planned', 'on_hold', 'rewatching'];

  function compute(rates, animeById) {
    const total = rates.length;

    const scored = rates.filter(r => Number(r.score) > 0);
    const scoredCount = scored.length;

    const userScores = scored.map(r => Number(r.score));
    const crowdScores = scored
      .map(r => Number(animeById.get(Number(r.anime?.id))?.score))
      .filter(Number.isFinite);

    const deltas = scored
      .map(r => {
        const a = animeById.get(Number(r.anime?.id));
        const crowd = Number(a?.score);
        const user = Number(r.score);
        if (!Number.isFinite(crowd) || !Number.isFinite(user)) return null;
        return user - crowd;
      })
      .filter(Number.isFinite);

    const statusCounts = Object.fromEntries(VALID_STATUSES.map(s => [s, 0]));
    for (const r of rates) {
      const st = r.status;
      if (st in statusCounts) statusCounts[st] += 1;
      else statusCounts[st] = (statusCounts[st] || 0) + 1;
    }

    const dist = Array.from({ length: 11 }, (_, score) => ({
      score,
      count: scored.filter(r => Number(r.score) === score).length
    }));

    const { genresTable, studiosTable } = buildGenreStudioTables(scored, animeById);

    const hot = buildHotTakes(scored, animeById);

    return {
      counts: { total, scoredCount },
      averages: {
        userAvg: mean(userScores),
        crowdAvgOnScored: mean(crowdScores),
      },
      delta: {
        avg: mean(deltas),
        median: median(deltas),
        std: std(deltas),
        count: deltas.length,
      },
      statusCounts,
      dist,
      genresTable,
      studiosTable,
      hot,
    };
  }

  function buildGenreStudioTables(scoredRates, animeById) {
    const gMap = new Map(); // id -> agg
    const sMap = new Map();

    for (const r of scoredRates) {
      const a = animeById.get(Number(r.anime?.id));
      if (!a) continue;

      const user = Number(r.score);
      const crowd = Number(a.score);
      const delta = (Number.isFinite(crowd) ? user - crowd : null);

      for (const g of (a.genres || [])) {
        const key = Number(g.id);
        if (!gMap.has(key)) gMap.set(key, { id: key, name: g.russian || g.name, count: 0, userSum: 0, crowdSum: 0, deltaSum: 0, crowdCount: 0, deltaCount: 0 });
        const it = gMap.get(key);
        it.count += 1;
        it.userSum += user;
        if (Number.isFinite(crowd)) { it.crowdSum += crowd; it.crowdCount += 1; }
        if (Number.isFinite(delta)) { it.deltaSum += delta; it.deltaCount += 1; }
      }

      for (const s of (a.studios || [])) {
        const key = String(s.name || 'Unknown');
        if (!sMap.has(key)) sMap.set(key, { name: key, count: 0, userSum: 0, crowdSum: 0, crowdCount: 0 });
        const it = sMap.get(key);
        it.count += 1;
        it.userSum += user;
        if (Number.isFinite(crowd)) { it.crowdSum += crowd; it.crowdCount += 1; }
      }
    }

    const genresTable = Array.from(gMap.values()).map(x => ({
      id: x.id,
      name: x.name,
      count: x.count,
      avgUser: x.userSum / x.count,
      avgCrowd: x.crowdCount ? (x.crowdSum / x.crowdCount) : null,
      avgDelta: x.deltaCount ? (x.deltaSum / x.deltaCount) : null,
    })).sort((a, b) => b.count - a.count);

    const studiosTable = Array.from(sMap.values()).map(x => ({
      name: x.name,
      count: x.count,
      avgUser: x.userSum / x.count,
      avgCrowd: x.crowdCount ? (x.crowdSum / x.crowdCount) : null,
    })).sort((a, b) => b.count - a.count);

    return { genresTable, studiosTable };
  }

  function buildHotTakes(scoredRates, animeById) {
    const cfg = S.config.hotTakes;

    const rows = scoredRates.map(r => {
      const id = Number(r.anime?.id);
      const a = animeById.get(id);
      if (!a) return null;

      const user = Number(r.score);
      const crowd = Number(a.score);
      if (!Number.isFinite(user) || !Number.isFinite(crowd)) return null;

      const delta = user - crowd;
      return {
        id,
        title: a.russian || a.name,
        url: a.url,
        user,
        crowd,
        delta,
      };
    }).filter(Boolean);

    const deltaPlus = rows.slice().sort((a, b) => b.delta - a.delta).slice(0, cfg.maxItems);
    const deltaMinus = rows.slice().sort((a, b) => a.delta - b.delta).slice(0, cfg.maxItems);

    const youLikeTheyDont = rows.filter(x =>
      (x.user >= cfg.likeUserScore && x.crowd <= cfg.crowdDislike) || (x.delta >= cfg.deltaStrong)
    ).sort((a, b) => b.delta - a.delta).slice(0, cfg.maxItems);

    const theyLikeYouDont = rows.filter(x =>
      (x.user <= cfg.dislikeUserScore && x.crowd >= cfg.crowdLike) || (x.delta <= -cfg.deltaStrong)
    ).sort((a, b) => a.delta - b.delta).slice(0, cfg.maxItems);

    return { youLikeTheyDont, theyLikeYouDont, deltaPlus, deltaMinus };
  }

  S.analytics = { compute };
})();
