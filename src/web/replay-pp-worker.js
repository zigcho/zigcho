import { createPpEngine } from './replay-pp-engine.js';
import { scoreSnapshots } from './replay-pp-timeline.js';

self.onmessage = async ({ data }) => {
  let engine;
  try {
    if (!(data.map instanceof Uint8Array) || !data.map.length || data.map.length > 32 * 1024 * 1024 || !Number.isInteger(data.mode) || data.mode < 0 || data.mode > 3 || !Number.isFinite(data.clockRate) || data.clockRate < .01 || data.clockRate > 100) throw new Error('invalid replay pp input');
    const snapshots = scoreSnapshots(data.events, data.combos, data.scores);
    const [response, config] = await Promise.all([fetch('/assets/replay-pp/zigcho_pp.wasm'), fetch('/assets/replay-pp/config.json')]);
    if (!response.ok || !config.ok) throw new Error('live pp calculator is unavailable');
    const { instance } = await WebAssembly.instantiateStreaming(response);
    engine = createPpEngine(instance, data.map, data, await config.json());
    const points = new Float64Array(snapshots.length * 2);
    for (let index = 0; index < snapshots.length; index++) {
      points[index * 2] = snapshots[index].time;
      points[index * 2 + 1] = engine.calculate(snapshots[index].state);
      if (index % 25 === 0 || index + 1 === snapshots.length) self.postMessage({ points: points.slice(0, (index + 1) * 2), complete: index + 1 === snapshots.length });
    }
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'live pp is unavailable' });
  } finally {
    engine?.destroy();
  }
};
