var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/@soundtouchjs/core/.dist/AbstractSamplePipe.js
var AbstractSamplePipe = class {
  /**
   * Constructs an AbstractSamplePipe.
   * @param options Constructor options.
   *
   * @remarks
   * When `createBuffers` is true, both factories are required so subclasses can
   * control exact buffer implementations without unsafe casting.
   */
  constructor({ createBuffers = false, inputBufferFactory, outputBufferFactory } = {}) {
    /**
     * Input buffer for audio samples.
     */
    __publicField(this, "_inputBuffer");
    /**
     * Output buffer for processed audio samples.
     */
    __publicField(this, "_outputBuffer");
    if (createBuffers) {
      if (!inputBufferFactory || !outputBufferFactory) {
        throw new Error("buffer factories are required when createBuffers is true");
      }
      this._inputBuffer = inputBufferFactory();
      this._outputBuffer = outputBufferFactory();
    } else {
      this._inputBuffer = null;
      this._outputBuffer = null;
    }
  }
  /**
   * Gets the input buffer.
   * @returns The current input buffer instance, or null if not set.
   */
  get inputBuffer() {
    return this._inputBuffer;
  }
  /**
   * Sets the input buffer.
   * @param inputBuffer The new input buffer instance, or null to unset.
   */
  set inputBuffer(inputBuffer) {
    this._inputBuffer = inputBuffer;
  }
  /**
   * Gets the output buffer.
   * @returns The current output buffer instance, or null if not set.
   */
  get outputBuffer() {
    return this._outputBuffer;
  }
  /**
   * Sets the output buffer.
   * @param outputBuffer The new output buffer instance, or null to unset.
   */
  set outputBuffer(outputBuffer) {
    this._outputBuffer = outputBuffer;
  }
  /**
   * Clears both input and output buffers.
   *
   * @remarks
   * Resets the state of both input and output buffers, if present, by calling their `clear()` methods.
   */
  clear() {
    this._inputBuffer?.clear();
    this._outputBuffer?.clear();
  }
};

// node_modules/@soundtouchjs/core/.dist/FifoSampleBuffer.js
var BYTES_PER_SAMPLE = 4;
var SAMPLES_PER_FRAME = 2;
var BYTES_PER_FRAME = BYTES_PER_SAMPLE * SAMPLES_PER_FRAME;
var DEFAULT_MAX_FRAMES = 131072;
var FifoSampleBuffer = class {
  /**
   * Creates a new FifoSampleBuffer.
   * @param maxFrames Maximum number of frames for buffer allocation.
   */
  constructor(maxFrames = DEFAULT_MAX_FRAMES) {
    /**
     * Backing ArrayBuffer for sample storage.
     * @remarks
     * Underlying memory for the buffer, which may be resized as needed.
     */
    __publicField(this, "_buffer");
    /**
     * Float32Array view of the buffer.
     * @remarks
     * Provides direct access to the sample data for reading and writing.
     */
    __publicField(this, "_vector");
    /**
     * Current read position (frame index).
     * @remarks
     * Indicates the logical start of readable data within the buffer.
     */
    __publicField(this, "_position");
    /**
     * Number of frames currently stored.
     * @remarks
     * Represents the number of complete stereo frames available for reading.
     */
    __publicField(this, "_frameCount");
    this._buffer = new ArrayBuffer(0, {
      maxByteLength: maxFrames * BYTES_PER_FRAME
    });
    this._vector = new Float32Array(this._buffer);
    this._position = 0;
    this._frameCount = 0;
  }
  /**
   * Returns the Float32Array view of the buffer.
   * @returns The Float32Array containing the sample data.
   */
  get vector() {
    return this._vector;
  }
  /**
   * Returns the current read position (frame index).
   * @returns The current frame index for reading.
   */
  get position() {
    return this._position;
  }
  /**
   * Returns the start sample index for reading.
   * @returns The sample index corresponding to the start of readable data.
   */
  get startIndex() {
    return this._position * 2;
  }
  /**
   * Returns the number of frames currently stored.
   * @returns The number of complete frames available for reading.
   */
  get frameCount() {
    return this._frameCount;
  }
  /**
   * Returns the end sample index for reading.
   * @returns The sample index corresponding to the end of readable data.
   */
  get endIndex() {
    return (this._position + this._frameCount) * 2;
  }
  /**
   * Clears the buffer and resets position and frame count.
   * @remarks
   * Fills the buffer with zeros and resets all internal state.
   */
  clear() {
    this._vector.fill(0);
    this._position = 0;
    this._frameCount = 0;
  }
  /**
   * Adds empty frames to the buffer.
   * @param numFrames Number of frames to add.
   */
  put(numFrames) {
    this._frameCount += numFrames;
  }
  /**
   * Adds samples to the buffer from a Float32Array.
   * @param samples Source samples (interleaved stereo).
   * @param position Start frame index in source.
   * @param numFrames Number of frames to copy (default: all available).
   * @remarks
   * Automatically grows the buffer if needed. Only complete frames are appended.
   */
  putSamples(samples, position = 0, numFrames = 0) {
    const sourceOffset = position * 2;
    if (!(numFrames >= 0) || numFrames === 0) {
      numFrames = (samples.length - sourceOffset) / 2;
    }
    const numSamples = numFrames * 2;
    this.ensureCapacity(numFrames + this._frameCount);
    const destOffset = this.endIndex;
    this._vector.set(samples.subarray(sourceOffset, sourceOffset + numSamples), destOffset);
    this._frameCount += numFrames;
  }
  /**
   * Adds samples from another FifoSampleBuffer.
   * @param buffer Source buffer.
   * @param position Start frame index in source buffer.
   * @param numFrames Number of frames to copy (default: all available).
   */
  putBuffer(buffer, position = 0, numFrames = 0) {
    if (!(numFrames >= 0) || numFrames === 0) {
      numFrames = buffer.frameCount - position;
    }
    this.putSamples(buffer.vector, buffer.position + position, numFrames);
  }
  /**
   * Advances the read position and reduces frame count.
   * @param numFrames Number of frames to receive (default: all available).
   * @remarks
   * Consumed frames are no longer available for reading.
   */
  receive(numFrames) {
    if (numFrames === void 0 || !(numFrames >= 0) || numFrames > this._frameCount) {
      numFrames = this._frameCount;
    }
    this._frameCount -= numFrames;
    this._position += numFrames;
  }
  /**
   * Copies and receives samples into an output array.
   * @param output Destination Float32Array.
   * @param numFrames Number of frames to copy and receive.
   * @remarks
   * Advances the read position after copying.
   */
  receiveSamples(output, numFrames = 0) {
    const numSamples = numFrames * 2;
    const sourceOffset = this.startIndex;
    output.set(this._vector.subarray(sourceOffset, sourceOffset + numSamples));
    this.receive(numFrames);
  }
  /**
   * Extracts samples into an output array without advancing position.
   * @param output Destination Float32Array.
   * @param position Start frame index in buffer.
   * @param numFrames Number of frames to extract.
   */
  extract(output, position = 0, numFrames = 0) {
    const sourceOffset = this.startIndex + position * 2;
    const numSamples = numFrames * 2;
    output.set(this._vector.subarray(sourceOffset, sourceOffset + numSamples));
  }
  /**
   * Ensures the buffer has capacity for at least numFrames.
   * @param numFrames Minimum number of frames required.
   * @remarks
   * Grows the buffer if needed, preserving all readable frames in order.
   */
  ensureCapacity(numFrames = 0) {
    const minLength = Math.floor(numFrames * SAMPLES_PER_FRAME);
    if (this._vector.length < minLength) {
      const newByteLength = minLength * BYTES_PER_SAMPLE;
      if (newByteLength <= this._buffer.maxByteLength) {
        this.rewind();
        this._buffer.resize(newByteLength);
        this._vector = new Float32Array(this._buffer);
      } else {
        const newMaxBytes = newByteLength * 2;
        const newBuffer = new ArrayBuffer(newByteLength, {
          maxByteLength: newMaxBytes
        });
        const newVector = new Float32Array(newBuffer);
        newVector.set(this._vector.subarray(this.startIndex, this.endIndex));
        this._buffer = newBuffer;
        this._vector = newVector;
        this._position = 0;
      }
    } else {
      this.rewind();
    }
  }
  /**
   * Ensures buffer has capacity for additional frames.
   * @param numFrames Number of additional frames required.
   */
  ensureAdditionalCapacity(numFrames = 0) {
    this.ensureCapacity(this._frameCount + numFrames);
  }
  /**
   * Moves all unread samples to the start of the buffer.
   * @remarks
   * Compacts the buffer so that all unread samples are at the beginning, freeing space for new data.
   */
  rewind() {
    if (this._position > 0) {
      this._vector.set(this._vector.subarray(this.startIndex, this.endIndex));
      this._position = 0;
    }
  }
};

// node_modules/@soundtouchjs/core/.dist/Stretch.js
var FifoStretchBufferAdapter = class {
  constructor() {
    __publicField(this, "buffer");
    __publicField(this, "fallbackBuffer");
    __publicField(this, "fallbackScratch");
    this.buffer = null;
    this.fallbackBuffer = new FifoSampleBuffer();
    this.fallbackScratch = new Float32Array(0);
  }
  /**
   * @param buffer Source buffer to expose through FIFO-style reads.
   */
  setBuffer(buffer) {
    if (buffer instanceof FifoSampleBuffer) {
      this.buffer = buffer;
      return;
    }
    const frameCount = buffer.frameCount;
    if (frameCount > 0) {
      const sampleCount = frameCount * 2;
      if (this.fallbackScratch.length < sampleCount) {
        this.fallbackScratch = new Float32Array(sampleCount);
      }
      buffer.extract(this.fallbackScratch, 0, frameCount);
      this.fallbackBuffer.clear();
      this.fallbackBuffer.putSamples(this.fallbackScratch, 0, frameCount);
      buffer.receive(frameCount);
    } else {
      this.fallbackBuffer.clear();
    }
    this.buffer = this.fallbackBuffer;
  }
  /**
   * Returns the currently bound FIFO buffer.
   * @throws Error when `setBuffer` has not been called yet.
   */
  getBoundBuffer() {
    if (this.buffer === null) {
      throw new Error("buffer is not set");
    }
    return this.buffer;
  }
  get frameCount() {
    return this.getBoundBuffer().frameCount;
  }
  get startIndex() {
    return this.getBoundBuffer().startIndex;
  }
  readSample(sampleIndex) {
    const boundBuffer = this.getBoundBuffer();
    const start = boundBuffer.startIndex;
    const end = start + boundBuffer.frameCount * 2;
    if (sampleIndex < start || sampleIndex >= end) {
      return 0;
    }
    return boundBuffer.vector[sampleIndex];
  }
  readSubarray(start, end) {
    return this.getBoundBuffer().vector.subarray(start, end);
  }
  receive(numFrames) {
    this.getBoundBuffer().receive(numFrames);
  }
  receiveSamples(output, numFrames) {
    this.getBoundBuffer().receiveSamples(output, numFrames);
  }
};
var GenericStretchWriteBufferAdapter = class {
  constructor() {
    __publicField(this, "buffer");
    this.buffer = null;
  }
  setOutputBuffer(buffer) {
    this.buffer = buffer;
  }
  /**
   * Returns the currently bound output buffer.
   * @throws Error when `setOutputBuffer` has not been called.
   */
  getBoundBuffer() {
    if (this.buffer === null) {
      throw new Error("output buffer is not set");
    }
    return this.buffer;
  }
  appendSamples(samples, numFrames) {
    this.getBoundBuffer().putSamples(samples, 0, numFrames);
  }
  putFrom(source, position, numFrames) {
    const sourceStart = source.startIndex + position * 2;
    const sourceEnd = sourceStart + numFrames * 2;
    const chunk = source.readSubarray(sourceStart, sourceEnd);
    this.getBoundBuffer().putSamples(chunk, 0, numFrames);
  }
};
var createFifoStretchInputBufferAdapter = () => new FifoStretchBufferAdapter();
var USE_AUTO_SEQUENCE_LEN = 0;
var DEFAULT_SEQUENCE_MS = USE_AUTO_SEQUENCE_LEN;
var USE_AUTO_SEEKWINDOW_LEN = 0;
var DEFAULT_SEEKWINDOW_MS = USE_AUTO_SEEKWINDOW_LEN;
var DEFAULT_OVERLAP_MS = 8;
var AUTOSEQ_TEMPO_LOW = 0.25;
var AUTOSEQ_TEMPO_TOP = 4;
var AUTOSEQ_AT_MIN = 125;
var AUTOSEQ_AT_MAX = 50;
var AUTOSEQ_K = (AUTOSEQ_AT_MAX - AUTOSEQ_AT_MIN) / (AUTOSEQ_TEMPO_TOP - AUTOSEQ_TEMPO_LOW);
var AUTOSEQ_C = AUTOSEQ_AT_MIN - AUTOSEQ_K * AUTOSEQ_TEMPO_LOW;
var AUTOSEEK_AT_MIN = 25;
var AUTOSEEK_AT_MAX = 15;
var AUTOSEEK_K = (AUTOSEEK_AT_MAX - AUTOSEEK_AT_MIN) / (AUTOSEQ_TEMPO_TOP - AUTOSEQ_TEMPO_LOW);
var AUTOSEEK_C = AUTOSEEK_AT_MIN - AUTOSEEK_K * AUTOSEQ_TEMPO_LOW;
var NORMALIZED_CORRELATION_EPSILON = 1e-12;
var QUICK_SEEK_FALLBACK_THRESHOLD = 256;
var QUICK_SEEK_MIN_VALID_CANDIDATES = 8;
var Stretch = class _Stretch extends AbstractSamplePipe {
  /**
   * Creates a Stretch instance.
   * @param options Constructor options.
   */
  constructor({ sampleRate = 44100, createBuffers = false, inputBufferAdapterFactory = createFifoStretchInputBufferAdapter, sampleBufferFactory = () => new FifoSampleBuffer() } = {}) {
    super({
      createBuffers,
      inputBufferFactory: sampleBufferFactory,
      outputBufferFactory: sampleBufferFactory
    });
    __publicField(this, "inputBufferAdapterFactory");
    __publicField(this, "sampleBufferFactory");
    __publicField(this, "inputBufferAdapter");
    __publicField(this, "outputBufferAdapter");
    __publicField(this, "overlapScratch");
    __publicField(this, "_quickSeek");
    __publicField(this, "midBufferDirty");
    __publicField(this, "midBuffer");
    __publicField(this, "refMidBuffer");
    __publicField(this, "refMidBufferEnergy");
    __publicField(this, "overlapLength");
    __publicField(this, "autoSeqSetting");
    __publicField(this, "autoSeekSetting");
    __publicField(this, "_tempo");
    __publicField(this, "sampleRate");
    __publicField(this, "_overlapMs");
    __publicField(this, "sequenceMs");
    __publicField(this, "seekWindowMs");
    __publicField(this, "seekWindowLength");
    __publicField(this, "seekLength");
    __publicField(this, "nominalSkip");
    __publicField(this, "skipFract");
    __publicField(this, "sampleReq");
    this.inputBufferAdapterFactory = inputBufferAdapterFactory;
    this.sampleBufferFactory = sampleBufferFactory;
    this.inputBufferAdapter = inputBufferAdapterFactory();
    this.outputBufferAdapter = new GenericStretchWriteBufferAdapter();
    this.overlapScratch = new Float32Array(0);
    this._quickSeek = true;
    this.midBufferDirty = true;
    this.midBuffer = null;
    this.refMidBufferEnergy = 0;
    this.overlapLength = 0;
    this.autoSeqSetting = true;
    this.autoSeekSetting = true;
    this._tempo = 1;
    this.setParameters(sampleRate, DEFAULT_SEQUENCE_MS, DEFAULT_SEEKWINDOW_MS, DEFAULT_OVERLAP_MS);
  }
  clear() {
    super.clear();
    this.clearMidBuffer();
  }
  clearMidBuffer() {
    this.midBufferDirty = true;
    if (this.midBuffer) {
      this.midBuffer.fill(0);
    }
    if (this.refMidBuffer) {
      this.refMidBuffer.fill(0);
    }
    this.skipFract = 0;
  }
  setParameters(sampleRate, sequenceMs, seekWindowMs, overlapMs) {
    if (sampleRate > 0) {
      this.sampleRate = sampleRate;
    }
    if (overlapMs > 0) {
      this._overlapMs = overlapMs;
    }
    if (sequenceMs > 0) {
      this.sequenceMs = sequenceMs;
      this.autoSeqSetting = false;
    } else {
      this.autoSeqSetting = true;
    }
    if (seekWindowMs > 0) {
      this.seekWindowMs = seekWindowMs;
      this.autoSeekSetting = false;
    } else {
      this.autoSeekSetting = true;
    }
    this.calculateSequenceParameters();
    this.calculateOverlapLength(this._overlapMs);
    this.updateTempoDerivedState();
  }
  set tempo(newTempo) {
    this._tempo = newTempo;
    this.updateTempoDerivedState();
  }
  get tempo() {
    return this._tempo;
  }
  get inputChunkSize() {
    return this.sampleReq;
  }
  get outputChunkSize() {
    return this.overlapLength + Math.max(0, this.seekWindowLength - 2 * this.overlapLength);
  }
  calculateOverlapLength(overlapInMsec = 0) {
    let newOvl = this.sampleRate * overlapInMsec / 1e3;
    newOvl = newOvl < 16 ? 16 : newOvl;
    newOvl -= newOvl % 8;
    if (newOvl === this.overlapLength && this.midBuffer !== null) {
      return;
    }
    this.overlapLength = newOvl;
    const needed = this.overlapLength * 2;
    if (!this.refMidBuffer || this.refMidBuffer.length < needed) {
      this.refMidBuffer = new Float32Array(needed);
    }
    if (!this.midBuffer || this.midBuffer.length < needed) {
      this.midBuffer = new Float32Array(needed);
    }
  }
  checkLimits(x, mi, ma) {
    return x < mi ? mi : x > ma ? ma : x;
  }
  calculateSequenceParameters() {
    if (this.autoSeqSetting) {
      let seq = AUTOSEQ_C + AUTOSEQ_K * this._tempo;
      seq = this.checkLimits(seq, AUTOSEQ_AT_MAX, AUTOSEQ_AT_MIN);
      this.sequenceMs = Math.floor(seq + 0.5);
    }
    if (this.autoSeekSetting) {
      let seek = AUTOSEEK_C + AUTOSEEK_K * this._tempo;
      seek = this.checkLimits(seek, AUTOSEEK_AT_MAX, AUTOSEEK_AT_MIN);
      this.seekWindowMs = Math.floor(seek + 0.5);
    }
    this.seekWindowLength = Math.floor(this.sampleRate * this.sequenceMs / 1e3);
    this.seekLength = Math.floor(this.sampleRate * this.seekWindowMs / 1e3);
    this.normalizeWindowInvariants();
  }
  normalizeWindowInvariants() {
    this.seekLength = Math.max(1, this.seekLength);
    this.seekWindowLength = Math.max(this.seekWindowLength, this.overlapLength);
  }
  updateTempoDerivedState() {
    this.calculateSequenceParameters();
    this.nominalSkip = this._tempo * (this.seekWindowLength - this.overlapLength);
    this.skipFract = 0;
    const intskip = Math.floor(this.nominalSkip + 0.5);
    this.sampleReq = Math.max(intskip + this.overlapLength, this.seekWindowLength) + this.seekLength;
  }
  /**
   * Whether the fast multi-pass seek algorithm is active.
   * @returns `true` if quick seek is enabled (default); `false` for exhaustive search.
   */
  get quickSeek() {
    return this._quickSeek;
  }
  set quickSeek(enable) {
    this._quickSeek = enable;
  }
  /**
   * Current overlap crossfade length in milliseconds.
   * @returns The overlap period used at the current sample rate.
   */
  get overlapMs() {
    return this._overlapMs;
  }
  /**
   * Sets the overlap crossfade length and recalculates derived parameters.
   * @param ms Overlap period in milliseconds (must be > 0).
   */
  set overlapMs(ms) {
    if (ms > 0) {
      this._overlapMs = ms;
      this.calculateOverlapLength(this._overlapMs);
      this.calculateSequenceParameters();
      this.updateTempoDerivedState();
    }
  }
  /**
   * Applies a partial set of WSOLA timing parameters.
   *
   * @remarks
   * Only the provided fields are updated; omitted fields remain unchanged.
   * Pass `sequenceMs: 0` or `seekWindowMs: 0` to switch that dimension back to auto-calculation.
   *
   * @param params Partial set of WSOLA timing parameters to apply.
   *
   * @example
   * stretch.setStretchParameters({ overlapMs: 12, quickSeek: false });
   */
  setStretchParameters(params) {
    if (params.quickSeek !== void 0) {
      this._quickSeek = params.quickSeek;
    }
    let needsRecalc = false;
    if (params.sequenceMs !== void 0) {
      if (params.sequenceMs > 0) {
        this.sequenceMs = params.sequenceMs;
        this.autoSeqSetting = false;
      } else {
        this.autoSeqSetting = true;
      }
      needsRecalc = true;
    }
    if (params.seekWindowMs !== void 0) {
      if (params.seekWindowMs > 0) {
        this.seekWindowMs = params.seekWindowMs;
        this.autoSeekSetting = false;
      } else {
        this.autoSeekSetting = true;
      }
      needsRecalc = true;
    }
    if (params.overlapMs !== void 0 && params.overlapMs > 0) {
      this._overlapMs = params.overlapMs;
      this.calculateOverlapLength(this._overlapMs);
      needsRecalc = true;
    }
    if (needsRecalc) {
      this.calculateSequenceParameters();
      this.updateTempoDerivedState();
    }
  }
  clone() {
    const result = new _Stretch({
      createBuffers: false,
      inputBufferAdapterFactory: this.inputBufferAdapterFactory,
      sampleBufferFactory: this.sampleBufferFactory
    });
    result.tempo = this._tempo;
    result.setParameters(this.sampleRate, this.sequenceMs, this.seekWindowMs, this._overlapMs);
    return result;
  }
  seekBestOverlapPosition(inputBuffer) {
    const resolvedInputBuffer = inputBuffer ?? this.getInputBufferAdapter();
    if (!this._quickSeek || this.seekLength <= QUICK_SEEK_FALLBACK_THRESHOLD) {
      return this.seekBestOverlapPositionStereo(resolvedInputBuffer);
    }
    return this.seekBestOverlapPositionStereoQuick(resolvedInputBuffer);
  }
  seekBestOverlapPositionStereo(inputBuffer) {
    let bestOffset;
    let bestCorrelation;
    let correlation;
    this.preCalculateCorrelationReferenceStereo();
    bestOffset = 0;
    bestCorrelation = -Infinity;
    for (let i = 0; i < this.seekLength; i++) {
      correlation = this.calculateCrossCorrelationStereo(2 * i, this.refMidBuffer, inputBuffer);
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = i;
      }
    }
    return bestOffset;
  }
  seekBestOverlapPositionStereoQuick(inputBuffer) {
    let bestOffset;
    let bestCorrelation;
    let correlation;
    let correlationOffset;
    let tempOffset;
    let evaluatedCandidates;
    this.preCalculateCorrelationReferenceStereo();
    bestCorrelation = this.calculateCrossCorrelationStereo(0, this.refMidBuffer, inputBuffer);
    evaluatedCandidates = 1;
    bestOffset = 0;
    correlationOffset = 0;
    for (let scanCount = 0; scanCount < 4; scanCount++) {
      let previousTempOffset = Number.MIN_SAFE_INTEGER;
      const scanOffsets = this.getQuickScanOffsets(scanCount);
      for (const scanOffset of scanOffsets) {
        tempOffset = correlationOffset + scanOffset;
        if (tempOffset === previousTempOffset) {
          continue;
        }
        previousTempOffset = tempOffset;
        if (tempOffset < 0) {
          continue;
        }
        if (tempOffset >= this.seekLength) {
          continue;
        }
        correlation = this.calculateCrossCorrelationStereo(2 * tempOffset, this.refMidBuffer, inputBuffer);
        evaluatedCandidates++;
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = tempOffset;
        }
      }
      correlationOffset = bestOffset;
    }
    if (evaluatedCandidates < QUICK_SEEK_MIN_VALID_CANDIDATES) {
      return this.seekBestOverlapPositionStereo(inputBuffer);
    }
    return bestOffset;
  }
  getQuickScanOffsets(stage) {
    const maxOffset = Math.max(1, this.seekLength - 1);
    if (stage === 0) {
      return this.generateFractionalScanOffsets(maxOffset, 2, 1, 14, 24);
    }
    if (stage === 1) {
      return this.generateSymmetricScanOffsets(maxOffset, 0.2);
    }
    if (stage === 2) {
      return this.generateSymmetricScanOffsets(maxOffset, 0.06);
    }
    return this.generateSymmetricScanOffsets(maxOffset, 0.015);
  }
  generateFractionalScanOffsets(maxOffset, startNumerator, stepNumerator, denominator, steps) {
    const offsets = [];
    const seen = /* @__PURE__ */ new Set();
    const safeDenominator = Math.max(1, denominator);
    const safeSteps = Math.max(1, steps);
    for (let i = 0; i < safeSteps; i++) {
      const numerator = startNumerator + i * stepNumerator;
      const value = Math.round(maxOffset * numerator / safeDenominator);
      if (value <= 0 || value >= this.seekLength || seen.has(value)) {
        continue;
      }
      seen.add(value);
      offsets.push(value);
    }
    return offsets;
  }
  generateSymmetricScanOffsets(maxOffset, spanRatio) {
    const span = Math.max(1, Math.round(maxOffset * spanRatio));
    const scales = [1, 0.75, 0.5, 0.25];
    const negative = [];
    const positive = [];
    const seen = /* @__PURE__ */ new Set();
    for (const scale of scales) {
      const magnitude = Math.max(1, Math.round(span * scale));
      const neg = -magnitude;
      const pos = magnitude;
      if (!seen.has(neg)) {
        seen.add(neg);
        negative.push(neg);
      }
      if (!seen.has(pos)) {
        seen.add(pos);
        positive.push(pos);
      }
    }
    return negative.concat(positive);
  }
  preCalculateCorrelationReferenceStereo() {
    let energy = 0;
    for (let i = 0; i < this.overlapLength; i++) {
      const temp = i * (this.overlapLength - i);
      const ctx = i * 2;
      const left = this.midBuffer[ctx] * temp;
      const right = this.midBuffer[ctx + 1] * temp;
      this.refMidBuffer[ctx] = left;
      this.refMidBuffer[ctx + 1] = right;
      energy += left * left + right * right;
    }
    this.refMidBufferEnergy = energy;
  }
  calculateCrossCorrelationStereo(mixingPos, compare, inputBuffer) {
    mixingPos += inputBuffer.startIndex;
    let dot = 0;
    let sourceEnergy = 0;
    const calcLength = 2 * this.overlapLength;
    const source = inputBuffer.readSubarray(mixingPos, mixingPos + calcLength);
    for (let i = 0; i < calcLength; i += 2) {
      const sourceLeft = i < source.length ? source[i] : 0;
      const sourceRight = i + 1 < source.length ? source[i + 1] : 0;
      const compareLeft = compare[i];
      const compareRight = compare[i + 1];
      dot += sourceLeft * compareLeft + sourceRight * compareRight;
      sourceEnergy += sourceLeft * sourceLeft + sourceRight * sourceRight;
    }
    if (sourceEnergy <= NORMALIZED_CORRELATION_EPSILON || this.refMidBufferEnergy <= NORMALIZED_CORRELATION_EPSILON) {
      return -1;
    }
    return dot / Math.sqrt(sourceEnergy * this.refMidBufferEnergy);
  }
  overlapStereo(inputPosition, inputBuffer, outputBuffer) {
    inputPosition += inputBuffer.startIndex;
    const overlapSamples = this.overlapLength * 2;
    if (this.overlapScratch.length < overlapSamples) {
      this.overlapScratch = new Float32Array(overlapSamples);
    }
    const output = this.overlapScratch;
    const input = inputBuffer.readSubarray(inputPosition, inputPosition + overlapSamples);
    const frameScale = 1 / this.overlapLength;
    for (let i = 0; i < this.overlapLength; i++) {
      const tempFrame = (this.overlapLength - i) * frameScale;
      const fi = i * frameScale;
      const ctx = 2 * i;
      const inputLeft = ctx < input.length ? input[ctx] : 0;
      const inputRight = ctx + 1 < input.length ? input[ctx + 1] : 0;
      output[ctx] = inputLeft * fi + this.midBuffer[ctx] * tempFrame;
      output[ctx + 1] = inputRight * fi + this.midBuffer[ctx + 1] * tempFrame;
    }
    outputBuffer.appendSamples(output, this.overlapLength);
  }
  process() {
    const inputBuffer = this.getInputBufferAdapter();
    const outputBuffer = this.getOutputBufferAdapter();
    if (!this.bootstrapMidBuffer(inputBuffer)) {
      return;
    }
    while (inputBuffer.frameCount >= this.sampleReq) {
      this.processOneWindow(inputBuffer, outputBuffer);
    }
  }
  bootstrapMidBuffer(inputBuffer) {
    if (!this.midBufferDirty) {
      return true;
    }
    if (inputBuffer.frameCount < this.overlapLength) {
      return false;
    }
    const needed = this.overlapLength * 2;
    if (!this.midBuffer || this.midBuffer.length < needed) {
      this.midBuffer = new Float32Array(needed);
    }
    inputBuffer.receiveSamples(this.midBuffer, this.overlapLength);
    this.midBufferDirty = false;
    return true;
  }
  processOneWindow(inputBuffer, outputBuffer) {
    const offset = this.seekBestOverlapPosition(inputBuffer);
    this.overlapStereo(2 * Math.floor(offset), inputBuffer, outputBuffer);
    const middleFrames = this.seekWindowLength - 2 * this.overlapLength;
    if (middleFrames > 0) {
      outputBuffer.putFrom(inputBuffer, offset + this.overlapLength, middleFrames);
    }
    this.captureOverlapHistory(offset, inputBuffer);
    this.advanceInputByNominalSkip(inputBuffer);
  }
  captureOverlapHistory(offset, inputBuffer) {
    const start = inputBuffer.startIndex + 2 * (offset + this.seekWindowLength - this.overlapLength);
    this.midBuffer.set(inputBuffer.readSubarray(start, start + 2 * this.overlapLength));
  }
  advanceInputByNominalSkip(inputBuffer) {
    this.skipFract += this.nominalSkip;
    const overlapSkip = Math.floor(this.skipFract);
    this.skipFract -= overlapSkip;
    inputBuffer.receive(overlapSkip);
  }
  getInputBufferAdapter() {
    if (this._inputBuffer === null) {
      throw new Error("inputBuffer is not set");
    }
    this.inputBufferAdapter.setBuffer(this._inputBuffer);
    return this.inputBufferAdapter;
  }
  getOutputBufferAdapter() {
    if (this._outputBuffer === null) {
      throw new Error("outputBuffer is not set");
    }
    this.outputBufferAdapter.setOutputBuffer(this._outputBuffer);
    return this.outputBufferAdapter;
  }
};

// src/player/TimeStretch.ts
function timeStretchChannels(L, R, sampleRate, tempo) {
  const inFrames = L.length;
  const st = new Stretch({ createBuffers: true });
  st.setParameters(sampleRate, 0, 0, 0);
  st.tempo = tempo;
  const inBuf = st.inputBuffer;
  const outBuf = st.outputBuffer;
  if (inBuf === null || outBuf === null) {
    throw new Error("SoundTouch Stretch did not allocate its input/output buffers");
  }
  const CHUNK = 8192;
  const interleaved = new Float32Array(CHUNK * 2);
  const scratch = new Float32Array(CHUNK * 2 * 8);
  const outChunks = [];
  let outFrames = 0;
  const drain = () => {
    let avail = outBuf.frameCount;
    while (avail > 0) {
      const take = Math.min(avail, scratch.length / 2);
      outBuf.extract(scratch, 0, take);
      outBuf.receive(take);
      outChunks.push(scratch.slice(0, take * 2));
      outFrames += take;
      avail = outBuf.frameCount;
    }
  };
  let pos = 0;
  while (pos < inFrames) {
    const n = Math.min(CHUNK, inFrames - pos);
    for (let i = 0; i < n; i++) {
      interleaved[i * 2] = L[pos + i];
      interleaved[i * 2 + 1] = R[pos + i];
    }
    inBuf.putSamples(interleaved, 0, n);
    pos += n;
    st.process();
    drain();
  }
  drain();
  const frames = Math.max(1, outFrames);
  const oL = new Float32Array(frames);
  const oR = new Float32Array(frames);
  let w = 0;
  for (const c of outChunks) {
    const n = c.length / 2;
    for (let i = 0; i < n; i++) {
      oL[w] = c[i * 2];
      oR[w] = c[i * 2 + 1];
      w++;
    }
  }
  return { L: oL, R: oR };
}

// src/player/stretchWorker.ts
self.onmessage = (e) => {
  try {
    const { L, R, sampleRate, tempo } = e.data;
    const out = timeStretchChannels(L, R, sampleRate, tempo);
    const transfer = out.L.buffer === out.R.buffer ? [out.L.buffer] : [out.L.buffer, out.R.buffer];
    self.postMessage({ L: out.L, R: out.R }, transfer);
  } catch (err) {
    self.postMessage({ error: err instanceof Error ? err.message : String(err) });
  }
};
