import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ppAt, scoreSnapshots } from '../../src/web/replay-pp-timeline.js';
import { createPpEngine, replayModBits } from '../../src/web/replay-pp-engine.js';

const balanceSource = await readFile(new URL('../../src/pp_balance.zig', import.meta.url), 'utf8');
const balance = Object.fromEntries([...balanceSource.matchAll(/pub const (\w+): f64 = ([\d.]+);/g)].map(match => [match[1], Number(match[2])]));
const wasmPath = process.env.REPLAY_PP_WASM;
const wasm = wasmPath ? (await WebAssembly.instantiate(await readFile(wasmPath))).instance : null;
const mapText = `osu file format v14
[General]
Mode:0
[Metadata]
Title:replay fixture
Artist:fixture
Creator:fixture
Version:fixture
[Difficulty]
HPDrainRate:5
CircleSize:4
OverallDifficulty:8
ApproachRate:9
SliderMultiplier:1.4
SliderTickRate:1
[TimingPoints]
0,500,4,2,1,100,1,0
[HitObjects]
${Array.from({ length: 100 }, (_, index) => `${index % 2 ? 480 : 32},${index % 3 ? 96 : 288},${1000 + index * 150},1,0,0:0:0:0:`).join('\n')}`;

test('seeking uses judgement times and restores earlier pp', () => {
  const points = new Float64Array([1000, 15, 2000, 40, 3000, 22]);
  assert.equal(ppAt(points, 999), 0);
  assert.equal(ppAt(points, 2000), 40);
  assert.equal(ppAt(points, 9999), 22);
  assert.equal(ppAt(points, 1500), 15);
});

test('slider ticks do not advance difficulty and combo breaks preserve peak combo', () => {
  const events = [{ time: 1000, count: 'n300', advance: true }, { time: 1400, count: 'largeTickHits', advance: false }, { time: 1800, count: 'misses', advance: true }];
  const snapshots = scoreSnapshots(events, [{ time: 1000, combo: 30 }, { time: 1400, combo: 31 }, { time: 1800, combo: 0 }], [{ time: 1800, score: 12345 }]);
  assert.equal(snapshots[1].objects, 1);
  assert.equal(snapshots[1].state.largeTickHits, 1);
  assert.equal(snapshots[2].objects, 2);
  assert.equal(snapshots[2].state.combo, 31);
  assert.equal(snapshots[2].state.misses, 1);
  assert.equal(snapshots[2].state.legacyTotalScore, 12345);
  assert.equal(snapshots[0].state.largeTickHits, 0);
});

test('native mod arrays retain Relax/AP and the Nightcore legacy combination', () => {
  assert.equal(replayModBits([{ acronym: 'NC', settings: { speed_change: 1.12 } }, { acronym: 'RX' }]), 576 | 128);
  assert.equal(replayModBits(8192 | 8), 8192 | 8);
});

test('the browser bridge calculates changing partial states for all namespaces', { skip: !wasm }, () => {
  for (const mods of [64, 64 | 128, 64 | 8192]) {
    const engine = createPpEngine(wasm, new TextEncoder().encode(mapText), { mode: 0, mods, lazer: false, clockRate: 1.5 }, balance);
    try {
      const start = engine.calculate({ combo: 20, n300: 20 });
      const perfect = engine.calculate({ combo: 100, n300: 100 });
      const missed = engine.calculate({ combo: 40, n300: 95, misses: 5 });
      assert.ok(Number.isFinite(start) && perfect > start, `mods ${mods}: PP should follow the play`);
      assert.ok(missed < perfect, `mods ${mods}: misses must lower PP`);
    } finally { engine.destroy(); }
  }
});

test('native Nightcore and Relax use their custom rate', { skip: !wasm }, () => {
  for (const custom of [[], [{ acronym: 'RX' }]]) {
    const calculate = rate => {
      const engine = createPpEngine(wasm, new TextEncoder().encode(mapText), { mode: 0, mods: [{ acronym: 'NC', settings: { speed_change: rate } }, ...custom], lazer: true, clockRate: rate }, balance);
      try { return engine.calculate({ combo: 100, n300: 100 }); }
      finally { engine.destroy(); }
    };
    assert.ok(calculate(1.5) > calculate(1.12));
  }
});
