export function ppAt(points, time) {
  let low = 0, high = points.length / 2;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (points[middle * 2] <= time) low = middle + 1;
    else high = middle;
  }
  return low ? points[(low - 1) * 2 + 1] : 0;
}

export function scoreSnapshots(events, combos, scores) {
  if (events.length > 100000 || combos.length > 200000 || scores.length > 200000) throw new Error('replay has too many judgements');
  const state = { combo: 0, nGeki: 0, nKatu: 0, n300: 0, n100: 0, n50: 0, misses: 0, largeTickHits: 0, smallTickHits: 0, sliderEndHits: 0, legacyTotalScore: 0 };
  let comboIndex = 0, scoreIndex = 0, objects = 0, lastTime = -Infinity;
  const snapshots = [];
  const ordered = events.filter(event => Number.isFinite(event.time)).sort((a, b) => a.time - b.time);
  for (let index = 0; index < ordered.length; index++) {
    const event = ordered[index];
    if (event.count && Object.hasOwn(state, event.count)) state[event.count]++;
    if (event.advance) objects++;
    while (comboIndex < combos.length && combos[comboIndex].time <= event.time) {
      state.combo = Math.max(state.combo, combos[comboIndex++].combo);
    }
    while (scoreIndex < scores.length && scores[scoreIndex].time <= event.time) state.legacyTotalScore = Math.max(0, Math.round(scores[scoreIndex++].score));
    if (!objects || (index + 1 < ordered.length && ordered[index + 1].time === event.time)) continue;
    if (event.time - lastTime < 200 && event.count !== 'misses' && index + 1 < ordered.length) continue;
    snapshots.push({ time: event.time, objects, state: { ...state } });
    lastTime = event.time;
    if (snapshots.length > 15000) throw new Error('replay is too long for live pp');
  }
  return snapshots;
}
