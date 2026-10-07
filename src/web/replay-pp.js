import { combineLN, convertBeatmapToMania } from './replayviewer.js';
import { ppAt } from './replay-pp-timeline.js';

function replayEvents(session) {
  const { mode, modDiff, beatmap, renderer } = session;
  const events = [], holds = new Map();
  if (renderer.hitResults.length > 100000) throw new Error('replay has too many judgements');
  const sliderEnds = new Map(renderer.hitResults.filter(result => !result.isSliderSub && result.displayTime !== undefined).map(result => [result.objectIndex, result.displayTime]));
  const notes = mode === 3 && !modDiff.isLazer ? new Map(convertBeatmapToMania(beatmap, modDiff).objects.filter(note => note.kind === 'hold').map(note => [note.sourceIndex, note])) : null;
  for (const result of renderer.hitResults) {
    let time = result.time, count = null, advance = true;
    const hit = result.judgement > 0;
    if (mode === 0) {
      if (result.isSliderSub) {
        advance = false;
        if (modDiff.isLazer && hit) count = result.accMax === 150 ? 'sliderEndHits' : result.time === sliderEnds.get(result.objectIndex) ? 'smallTickHits' : 'largeTickHits';
      } else {
        if (!modDiff.isLazer) time = result.displayTime ?? time;
        count = hit ? 'n' + result.judgement : 'misses';
      }
    } else if (mode === 1) {
      if (result.comboIgnore) continue;
      count = hit ? result.judgement === 300 ? 'n300' : 'n100' : 'misses';
    } else if (mode === 2) {
      if (result.catchType === 'banana') continue;
      advance = result.catchType !== 'tinyDroplet';
      count = hit ? result.catchType === 'fruit' ? 'n300' : advance ? 'n100' : 'n50' : advance ? 'misses' : 'nKatu';
    } else if (result.subResult && notes) {
      let hold = holds.get(result.objectIndex);
      if (!hold) holds.set(result.objectIndex, hold = { time });
      hold.time = Math.max(hold.time, time);
      if (result.subResult === 'head') { hold.head = result.judgement; hold.headTime = time; }
      else if (result.subResult === 'tail') { hold.tail = result.judgement; hold.tailTime = time; }
      else if (!hit) hold.bodyBroken = true;
      continue;
    } else {
      if (result.subResult === 'body') continue;
      advance = result.subResult !== 'head';
      count = result.judgement === 305 ? 'nGeki' : result.judgement === 200 ? 'nKatu' : hit ? 'n' + result.judgement : 'misses';
    }
    events.push({ time, count, advance });
  }
  for (const [index, hold] of holds) {
    const note = notes.get(index);
    if (!note) continue;
    const judgement = combineLN(hold, note, modDiff);
    events.push({ time: hold.time, count: judgement === 305 ? 'nGeki' : judgement === 200 ? 'nKatu' : judgement ? 'n' + judgement : 'misses', advance: true });
  }
  return events;
}

export function createReplayPpCounter(stage, session, score) {
  const counter = document.createElement('div');
  counter.className = 'replay-player-pp';
  counter.setAttribute('aria-label', 'replay performance points');
  counter.innerHTML = '<strong>—<span>pp</span></strong><small>calculating pp…</small>';
  stage.append(counter);
  const value = counter.querySelector('strong'), label = counter.querySelector('small');
  const saved = score.pp !== null && score.pp !== undefined && Number.isFinite(Number(score.pp)) && Number(score.pp) >= 0 ? Number(score.pp) : null;
  let worker = null, timer = null, points = null, last = '', destroyed = false;
  const paint = (pp, text) => {
    const formatted = pp === null ? '—' : pp.toFixed(2);
    if (last !== formatted + text) {
      value.replaceChildren(document.createTextNode(formatted), Object.assign(document.createElement('span'), { textContent: 'pp' }));
      label.textContent = text;
      last = formatted + text;
    }
  };
  const stopWorker = () => { clearTimeout(timer); worker?.terminate(); worker = null; };
  const fallback = () => { stopWorker(); paint(null, 'live pp unavailable'); };
  let mods = session.replay.scoreInfo?.mods ?? session.replay.mods;
  if (typeof Worker !== 'function') fallback();
  else try {
    worker = new Worker('/assets/replay-pp-worker.js', { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (destroyed) return;
      if (!(data.points instanceof Float64Array) || !data.points.length) {
        counter.title = data.error || 'live pp is unavailable for this replay';
        return fallback();
      }
      points = data.points;
      if (data.complete) stopWorker();
    };
    worker.onerror = fallback;
    timer = setTimeout(fallback, 30000);
    const map = new Uint8Array(session.beatmap.rawOsu).slice();
    const events = replayEvents(session).sort((a, b) => a.time - b.time);
    const scores = events.map(event => ({ time: event.time, score: session.renderer.scoreAt(event.time) }));
    worker.postMessage({ map, mode: session.mode, mods, lazer: score.client === 'lazer', clockRate: session.speed, events, combos: session.renderer.comboFrames, scores }, [map.buffer]);
  } catch { fallback(); }
  return {
    update(presentationTime) {
      if (destroyed) return;
      if (saved !== null && presentationTime >= session.player.durationMs - 1) paint(saved, 'saved pp');
      else if (points) {
        const mapTime = session.timeMapper.toMapTime(presentationTime) - session.renderer.oldOffsetMs;
        if (worker && mapTime > points[points.length - 2]) paint(null, 'calculating pp…');
        else paint(ppAt(points, mapTime), 'live pp');
      }
    },
    destroy() { destroyed = true; stopWorker(); counter.remove(); },
  };
}
