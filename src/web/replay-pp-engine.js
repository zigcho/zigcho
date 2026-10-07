const legacyBits = { NF: 1, EZ: 2, TD: 4, HD: 8, HR: 16, SD: 32, DT: 64, RX: 128, HT: 256, NC: 576, FL: 1024, AT: 2048, SO: 4096, AP: 8192, PF: 16416, '4K': 32768, '5K': 65536, '6K': 131072, '7K': 262144, '8K': 524288, FI: 1048576, RD: 2097152, CN: 4194304, TP: 8388608, '9K': 16777216, CO: 33554432, '1K': 67108864, '3K': 134217728, '2K': 268435456, V2: 536870912, MR: 1073741824 };
const fields = ['combo', 'largeTickHits', 'smallTickHits', 'sliderEndHits', 'nGeki', 'nKatu', 'n300', 'n100', 'n50', 'misses', 'legacyTotalScore'];

export function replayModBits(mods) {
  if (Number.isInteger(mods)) return mods >>> 0;
  return Array.isArray(mods) ? mods.reduce((bits, mod) => bits | (legacyBits[mod.acronym] || 0), 0) >>> 0 : 0;
}

export function createPpEngine(instance, map, options, balance) {
  const wasm = instance.exports, allocations = [];
  const alloc = bytes => {
    const pointer = wasm.zigcho_pp_alloc(bytes.length);
    if (!pointer) throw new Error('live pp ran out of memory');
    allocations.push([pointer, bytes.length]);
    new Uint8Array(wasm.memory.buffer, pointer, bytes.length).set(bytes);
    return pointer;
  };
  const destroy = () => { for (const [pointer, length] of allocations.splice(0)) wasm.zigcho_pp_free(pointer, length); };
  try {
    const mapPointer = alloc(map), mods = replayModBits(options.mods);
    const inputPointer = alloc(new Uint8Array(52)), outputPointer = alloc(new Uint8Array(24));
    const json = new TextEncoder().encode(JSON.stringify(Array.isArray(options.mods) ? options.mods : []));
    const modsPointer = alloc(json);
    const autopilot = !!(mods & 8192), relax = !autopilot && !!(mods & 128);
    let multiplier = 1;
    if (relax) {
      let adjustment = Math.pow(options.clockRate, balance.rate_exponent);
      if (mods & 8) adjustment *= balance.hidden_multiplier;
      if (mods & 16) adjustment *= balance.hard_rock_multiplier;
      if (mods & 1024) adjustment *= balance.flashlight_multiplier;
      multiplier = balance.base_multiplier * Math.max(.9, Math.min(1.1, adjustment));
    }
    return {
      calculate(state) {
        const input = new DataView(wasm.memory.buffer, inputPointer, 52);
        input.setUint8(0, options.mode);
        input.setUint8(1, options.lazer ? 1 : 0);
        input.setUint32(4, mods, true);
        fields.forEach((field, index) => input.setUint32(8 + index * 4, state[field] || 0, true));
        const code = options.lazer && relax
          ? wasm.zigcho_relax_pp_calculate(mapPointer, map.length, inputPointer, options.clockRate, outputPointer)
          : options.lazer && !autopilot
            ? wasm.zigcho_lazer_pp_calculate(mapPointer, map.length, modsPointer, json.length, inputPointer, outputPointer)
            : wasm.zigcho_pp_calculate(mapPointer, map.length, inputPointer, outputPointer);
        if (code !== 0) throw new Error('live pp calculation failed');
        const pp = new DataView(wasm.memory.buffer, outputPointer, 24).getFloat64(0, true) * multiplier;
        if (!Number.isFinite(pp) || pp < 0) throw new Error('invalid live pp result');
        return pp;
      },
      destroy,
    };
  } catch (error) { destroy(); throw error; }
}
