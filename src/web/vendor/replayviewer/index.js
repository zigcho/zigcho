var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/lzma/src/lzma_worker.js
var require_lzma_worker = __commonJS({
  "node_modules/lzma/src/lzma_worker.js"(exports) {
    var LZMA2 = function() {
      "use strict";
      var action_compress = 1, action_decompress = 2, action_progress = 3, wait = typeof setImmediate == "function" ? setImmediate : setTimeout, __4294967296 = 4294967296, N1_longLit = [4294967295, -__4294967296], MIN_VALUE = [0, -9223372036854776e3], P0_longLit = [0, 0], P1_longLit = [1, 0];
      function update_progress(percent, cbn) {
        postMessage({
          action: action_progress,
          cbn,
          result: percent
        });
      }
      function initDim(len) {
        var a = [];
        a[len - 1] = void 0;
        return a;
      }
      function add2(a, b) {
        return create(a[0] + b[0], a[1] + b[1]);
      }
      function and(a, b) {
        return makeFromBits(~~Math.max(Math.min(a[1] / __4294967296, 2147483647), -2147483648) & ~~Math.max(Math.min(b[1] / __4294967296, 2147483647), -2147483648), lowBits_0(a) & lowBits_0(b));
      }
      function compare(a, b) {
        var nega, negb;
        if (a[0] == b[0] && a[1] == b[1]) {
          return 0;
        }
        nega = a[1] < 0;
        negb = b[1] < 0;
        if (nega && !negb) {
          return -1;
        }
        if (!nega && negb) {
          return 1;
        }
        if (sub(a, b)[1] < 0) {
          return -1;
        }
        return 1;
      }
      function create(valueLow, valueHigh) {
        var diffHigh, diffLow;
        valueHigh %= 18446744073709552e3;
        valueLow %= 18446744073709552e3;
        diffHigh = valueHigh % __4294967296;
        diffLow = Math.floor(valueLow / __4294967296) * __4294967296;
        valueHigh = valueHigh - diffHigh + diffLow;
        valueLow = valueLow - diffLow + diffHigh;
        while (valueLow < 0) {
          valueLow += __4294967296;
          valueHigh -= __4294967296;
        }
        while (valueLow > 4294967295) {
          valueLow -= __4294967296;
          valueHigh += __4294967296;
        }
        valueHigh = valueHigh % 18446744073709552e3;
        while (valueHigh > 9223372032559809e3) {
          valueHigh -= 18446744073709552e3;
        }
        while (valueHigh < -9223372036854776e3) {
          valueHigh += 18446744073709552e3;
        }
        return [valueLow, valueHigh];
      }
      function eq(a, b) {
        return a[0] == b[0] && a[1] == b[1];
      }
      function fromInt(value) {
        if (value >= 0) {
          return [value, 0];
        } else {
          return [value + __4294967296, -__4294967296];
        }
      }
      function lowBits_0(a) {
        if (a[0] >= 2147483648) {
          return ~~Math.max(Math.min(a[0] - __4294967296, 2147483647), -2147483648);
        } else {
          return ~~Math.max(Math.min(a[0], 2147483647), -2147483648);
        }
      }
      function makeFromBits(highBits, lowBits) {
        var high, low;
        high = highBits * __4294967296;
        low = lowBits;
        if (lowBits < 0) {
          low += __4294967296;
        }
        return [low, high];
      }
      function pwrAsDouble(n) {
        if (n <= 30) {
          return 1 << n;
        } else {
          return pwrAsDouble(30) * pwrAsDouble(n - 30);
        }
      }
      function shl(a, n) {
        var diff, newHigh, newLow, twoToN;
        n &= 63;
        if (eq(a, MIN_VALUE)) {
          if (!n) {
            return a;
          }
          return P0_longLit;
        }
        if (a[1] < 0) {
          throw new Error("Neg");
        }
        twoToN = pwrAsDouble(n);
        newHigh = a[1] * twoToN % 18446744073709552e3;
        newLow = a[0] * twoToN;
        diff = newLow - newLow % __4294967296;
        newHigh += diff;
        newLow -= diff;
        if (newHigh >= 9223372036854776e3) {
          newHigh -= 18446744073709552e3;
        }
        return [newLow, newHigh];
      }
      function shr(a, n) {
        var shiftFact;
        n &= 63;
        shiftFact = pwrAsDouble(n);
        return create(Math.floor(a[0] / shiftFact), a[1] / shiftFact);
      }
      function shru(a, n) {
        var sr;
        n &= 63;
        sr = shr(a, n);
        if (a[1] < 0) {
          sr = add2(sr, shl([2, 0], 63 - n));
        }
        return sr;
      }
      function sub(a, b) {
        return create(a[0] - b[0], a[1] - b[1]);
      }
      function $ByteArrayInputStream(this$static, buf) {
        this$static.buf = buf;
        this$static.pos = 0;
        this$static.count = buf.length;
        return this$static;
      }
      function $read(this$static) {
        if (this$static.pos >= this$static.count)
          return -1;
        return this$static.buf[this$static.pos++] & 255;
      }
      function $read_0(this$static, buf, off, len) {
        if (this$static.pos >= this$static.count)
          return -1;
        len = Math.min(len, this$static.count - this$static.pos);
        arraycopy(this$static.buf, this$static.pos, buf, off, len);
        this$static.pos += len;
        return len;
      }
      function $ByteArrayOutputStream(this$static) {
        this$static.buf = initDim(32);
        this$static.count = 0;
        return this$static;
      }
      function $toByteArray(this$static) {
        var data = this$static.buf;
        data.length = this$static.count;
        return data;
      }
      function $write(this$static, b) {
        this$static.buf[this$static.count++] = b << 24 >> 24;
      }
      function $write_0(this$static, buf, off, len) {
        arraycopy(buf, off, this$static.buf, this$static.count, len);
        this$static.count += len;
      }
      function $getChars(this$static, srcBegin, srcEnd, dst, dstBegin) {
        var srcIdx;
        for (srcIdx = srcBegin; srcIdx < srcEnd; ++srcIdx) {
          dst[dstBegin++] = this$static.charCodeAt(srcIdx);
        }
      }
      function arraycopy(src, srcOfs, dest, destOfs, len) {
        for (var i = 0; i < len; ++i) {
          dest[destOfs + i] = src[srcOfs + i];
        }
      }
      function $configure(this$static, encoder) {
        $SetDictionarySize_0(encoder, 1 << this$static.s);
        encoder._numFastBytes = this$static.f;
        $SetMatchFinder(encoder, this$static.m);
        encoder._numLiteralPosStateBits = 0;
        encoder._numLiteralContextBits = 3;
        encoder._posStateBits = 2;
        encoder._posStateMask = 3;
      }
      function $init(this$static, input, output, length_0, mode) {
        var encoder, i;
        if (compare(length_0, N1_longLit) < 0)
          throw new Error("invalid length " + length_0);
        this$static.length_0 = length_0;
        encoder = $Encoder({});
        $configure(mode, encoder);
        encoder._writeEndMark = typeof LZMA2.disableEndMark == "undefined";
        $WriteCoderProperties(encoder, output);
        for (i = 0; i < 64; i += 8)
          $write(output, lowBits_0(shr(length_0, i)) & 255);
        this$static.chunker = (encoder._needReleaseMFStream = 0, encoder._inStream = input, encoder._finished = 0, $Create_2(encoder), encoder._rangeEncoder.Stream = output, $Init_4(encoder), $FillDistancesPrices(encoder), $FillAlignPrices(encoder), encoder._lenEncoder._tableSize = encoder._numFastBytes + 1 - 2, $UpdateTables(encoder._lenEncoder, 1 << encoder._posStateBits), encoder._repMatchLenEncoder._tableSize = encoder._numFastBytes + 1 - 2, $UpdateTables(encoder._repMatchLenEncoder, 1 << encoder._posStateBits), encoder.nowPos64 = P0_longLit, void 0, $Chunker_0({}, encoder));
      }
      function $LZMAByteArrayCompressor(this$static, data, mode) {
        this$static.output = $ByteArrayOutputStream({});
        $init(this$static, $ByteArrayInputStream({}, data), this$static.output, fromInt(data.length), mode);
        return this$static;
      }
      function $init_0(this$static, input, output) {
        var decoder, hex_length = "", i, properties = [], r, tmp_length;
        for (i = 0; i < 5; ++i) {
          r = $read(input);
          if (r == -1)
            throw new Error("truncated input");
          properties[i] = r << 24 >> 24;
        }
        decoder = $Decoder({});
        if (!$SetDecoderProperties(decoder, properties)) {
          throw new Error("corrupted input");
        }
        for (i = 0; i < 64; i += 8) {
          r = $read(input);
          if (r == -1)
            throw new Error("truncated input");
          r = r.toString(16);
          if (r.length == 1)
            r = "0" + r;
          hex_length = r + "" + hex_length;
        }
        if (/^0+$|^f+$/i.test(hex_length)) {
          this$static.length_0 = N1_longLit;
        } else {
          tmp_length = parseInt(hex_length, 16);
          if (tmp_length > 4294967295) {
            this$static.length_0 = N1_longLit;
          } else {
            this$static.length_0 = fromInt(tmp_length);
          }
        }
        this$static.chunker = $CodeInChunks(decoder, input, output, this$static.length_0);
      }
      function $LZMAByteArrayDecompressor(this$static, data) {
        this$static.output = $ByteArrayOutputStream({});
        $init_0(this$static, $ByteArrayInputStream({}, data), this$static.output);
        return this$static;
      }
      function $Create_4(this$static, keepSizeBefore, keepSizeAfter, keepSizeReserv) {
        var blockSize;
        this$static._keepSizeBefore = keepSizeBefore;
        this$static._keepSizeAfter = keepSizeAfter;
        blockSize = keepSizeBefore + keepSizeAfter + keepSizeReserv;
        if (this$static._bufferBase == null || this$static._blockSize != blockSize) {
          this$static._bufferBase = null;
          this$static._blockSize = blockSize;
          this$static._bufferBase = initDim(this$static._blockSize);
        }
        this$static._pointerToLastSafePosition = this$static._blockSize - keepSizeAfter;
      }
      function $GetIndexByte(this$static, index) {
        return this$static._bufferBase[this$static._bufferOffset + this$static._pos + index];
      }
      function $GetMatchLen(this$static, index, distance, limit) {
        var i, pby;
        if (this$static._streamEndWasReached) {
          if (this$static._pos + index + limit > this$static._streamPos) {
            limit = this$static._streamPos - (this$static._pos + index);
          }
        }
        ++distance;
        pby = this$static._bufferOffset + this$static._pos + index;
        for (i = 0; i < limit && this$static._bufferBase[pby + i] == this$static._bufferBase[pby + i - distance]; ++i) {
        }
        return i;
      }
      function $GetNumAvailableBytes(this$static) {
        return this$static._streamPos - this$static._pos;
      }
      function $MoveBlock(this$static) {
        var i, numBytes, offset;
        offset = this$static._bufferOffset + this$static._pos - this$static._keepSizeBefore;
        if (offset > 0) {
          --offset;
        }
        numBytes = this$static._bufferOffset + this$static._streamPos - offset;
        for (i = 0; i < numBytes; ++i) {
          this$static._bufferBase[i] = this$static._bufferBase[offset + i];
        }
        this$static._bufferOffset -= offset;
      }
      function $MovePos_1(this$static) {
        var pointerToPostion;
        ++this$static._pos;
        if (this$static._pos > this$static._posLimit) {
          pointerToPostion = this$static._bufferOffset + this$static._pos;
          if (pointerToPostion > this$static._pointerToLastSafePosition) {
            $MoveBlock(this$static);
          }
          $ReadBlock(this$static);
        }
      }
      function $ReadBlock(this$static) {
        var numReadBytes, pointerToPostion, size;
        if (this$static._streamEndWasReached)
          return;
        while (1) {
          size = -this$static._bufferOffset + this$static._blockSize - this$static._streamPos;
          if (!size)
            return;
          numReadBytes = $read_0(this$static._stream, this$static._bufferBase, this$static._bufferOffset + this$static._streamPos, size);
          if (numReadBytes == -1) {
            this$static._posLimit = this$static._streamPos;
            pointerToPostion = this$static._bufferOffset + this$static._posLimit;
            if (pointerToPostion > this$static._pointerToLastSafePosition) {
              this$static._posLimit = this$static._pointerToLastSafePosition - this$static._bufferOffset;
            }
            this$static._streamEndWasReached = 1;
            return;
          }
          this$static._streamPos += numReadBytes;
          if (this$static._streamPos >= this$static._pos + this$static._keepSizeAfter) {
            this$static._posLimit = this$static._streamPos - this$static._keepSizeAfter;
          }
        }
      }
      function $ReduceOffsets(this$static, subValue) {
        this$static._bufferOffset += subValue;
        this$static._posLimit -= subValue;
        this$static._pos -= subValue;
        this$static._streamPos -= subValue;
      }
      var CrcTable = function() {
        var i, j, r, CrcTable2 = [];
        for (i = 0; i < 256; ++i) {
          r = i;
          for (j = 0; j < 8; ++j)
            if ((r & 1) != 0) {
              r = r >>> 1 ^ -306674912;
            } else {
              r >>>= 1;
            }
          CrcTable2[i] = r;
        }
        return CrcTable2;
      }();
      function $Create_3(this$static, historySize, keepAddBufferBefore, matchMaxLen, keepAddBufferAfter) {
        var cyclicBufferSize, hs, windowReservSize;
        if (historySize < 1073741567) {
          this$static._cutValue = 16 + (matchMaxLen >> 1);
          windowReservSize = ~~((historySize + keepAddBufferBefore + matchMaxLen + keepAddBufferAfter) / 2) + 256;
          $Create_4(this$static, historySize + keepAddBufferBefore, matchMaxLen + keepAddBufferAfter, windowReservSize);
          this$static._matchMaxLen = matchMaxLen;
          cyclicBufferSize = historySize + 1;
          if (this$static._cyclicBufferSize != cyclicBufferSize) {
            this$static._son = initDim((this$static._cyclicBufferSize = cyclicBufferSize) * 2);
          }
          hs = 65536;
          if (this$static.HASH_ARRAY) {
            hs = historySize - 1;
            hs |= hs >> 1;
            hs |= hs >> 2;
            hs |= hs >> 4;
            hs |= hs >> 8;
            hs >>= 1;
            hs |= 65535;
            if (hs > 16777216)
              hs >>= 1;
            this$static._hashMask = hs;
            ++hs;
            hs += this$static.kFixHashSize;
          }
          if (hs != this$static._hashSizeSum) {
            this$static._hash = initDim(this$static._hashSizeSum = hs);
          }
        }
      }
      function $GetMatches(this$static, distances) {
        var count, cur, curMatch, curMatch2, curMatch3, cyclicPos, delta, hash2Value, hash3Value, hashValue, len, len0, len1, lenLimit, matchMinPos, maxLen, offset, pby1, ptr0, ptr1, temp;
        if (this$static._pos + this$static._matchMaxLen <= this$static._streamPos) {
          lenLimit = this$static._matchMaxLen;
        } else {
          lenLimit = this$static._streamPos - this$static._pos;
          if (lenLimit < this$static.kMinMatchCheck) {
            $MovePos_0(this$static);
            return 0;
          }
        }
        offset = 0;
        matchMinPos = this$static._pos > this$static._cyclicBufferSize ? this$static._pos - this$static._cyclicBufferSize : 0;
        cur = this$static._bufferOffset + this$static._pos;
        maxLen = 1;
        hash2Value = 0;
        hash3Value = 0;
        if (this$static.HASH_ARRAY) {
          temp = CrcTable[this$static._bufferBase[cur] & 255] ^ this$static._bufferBase[cur + 1] & 255;
          hash2Value = temp & 1023;
          temp ^= (this$static._bufferBase[cur + 2] & 255) << 8;
          hash3Value = temp & 65535;
          hashValue = (temp ^ CrcTable[this$static._bufferBase[cur + 3] & 255] << 5) & this$static._hashMask;
        } else {
          hashValue = this$static._bufferBase[cur] & 255 ^ (this$static._bufferBase[cur + 1] & 255) << 8;
        }
        curMatch = this$static._hash[this$static.kFixHashSize + hashValue] || 0;
        if (this$static.HASH_ARRAY) {
          curMatch2 = this$static._hash[hash2Value] || 0;
          curMatch3 = this$static._hash[1024 + hash3Value] || 0;
          this$static._hash[hash2Value] = this$static._pos;
          this$static._hash[1024 + hash3Value] = this$static._pos;
          if (curMatch2 > matchMinPos) {
            if (this$static._bufferBase[this$static._bufferOffset + curMatch2] == this$static._bufferBase[cur]) {
              distances[offset++] = maxLen = 2;
              distances[offset++] = this$static._pos - curMatch2 - 1;
            }
          }
          if (curMatch3 > matchMinPos) {
            if (this$static._bufferBase[this$static._bufferOffset + curMatch3] == this$static._bufferBase[cur]) {
              if (curMatch3 == curMatch2) {
                offset -= 2;
              }
              distances[offset++] = maxLen = 3;
              distances[offset++] = this$static._pos - curMatch3 - 1;
              curMatch2 = curMatch3;
            }
          }
          if (offset != 0 && curMatch2 == curMatch) {
            offset -= 2;
            maxLen = 1;
          }
        }
        this$static._hash[this$static.kFixHashSize + hashValue] = this$static._pos;
        ptr0 = (this$static._cyclicBufferPos << 1) + 1;
        ptr1 = this$static._cyclicBufferPos << 1;
        len0 = len1 = this$static.kNumHashDirectBytes;
        if (this$static.kNumHashDirectBytes != 0) {
          if (curMatch > matchMinPos) {
            if (this$static._bufferBase[this$static._bufferOffset + curMatch + this$static.kNumHashDirectBytes] != this$static._bufferBase[cur + this$static.kNumHashDirectBytes]) {
              distances[offset++] = maxLen = this$static.kNumHashDirectBytes;
              distances[offset++] = this$static._pos - curMatch - 1;
            }
          }
        }
        count = this$static._cutValue;
        while (1) {
          if (curMatch <= matchMinPos || count-- == 0) {
            this$static._son[ptr0] = this$static._son[ptr1] = 0;
            break;
          }
          delta = this$static._pos - curMatch;
          cyclicPos = (delta <= this$static._cyclicBufferPos ? this$static._cyclicBufferPos - delta : this$static._cyclicBufferPos - delta + this$static._cyclicBufferSize) << 1;
          pby1 = this$static._bufferOffset + curMatch;
          len = len0 < len1 ? len0 : len1;
          if (this$static._bufferBase[pby1 + len] == this$static._bufferBase[cur + len]) {
            while (++len != lenLimit) {
              if (this$static._bufferBase[pby1 + len] != this$static._bufferBase[cur + len]) {
                break;
              }
            }
            if (maxLen < len) {
              distances[offset++] = maxLen = len;
              distances[offset++] = delta - 1;
              if (len == lenLimit) {
                this$static._son[ptr1] = this$static._son[cyclicPos];
                this$static._son[ptr0] = this$static._son[cyclicPos + 1];
                break;
              }
            }
          }
          if ((this$static._bufferBase[pby1 + len] & 255) < (this$static._bufferBase[cur + len] & 255)) {
            this$static._son[ptr1] = curMatch;
            ptr1 = cyclicPos + 1;
            curMatch = this$static._son[ptr1];
            len1 = len;
          } else {
            this$static._son[ptr0] = curMatch;
            ptr0 = cyclicPos;
            curMatch = this$static._son[ptr0];
            len0 = len;
          }
        }
        $MovePos_0(this$static);
        return offset;
      }
      function $Init_5(this$static) {
        this$static._bufferOffset = 0;
        this$static._pos = 0;
        this$static._streamPos = 0;
        this$static._streamEndWasReached = 0;
        $ReadBlock(this$static);
        this$static._cyclicBufferPos = 0;
        $ReduceOffsets(this$static, -1);
      }
      function $MovePos_0(this$static) {
        var subValue;
        if (++this$static._cyclicBufferPos >= this$static._cyclicBufferSize) {
          this$static._cyclicBufferPos = 0;
        }
        $MovePos_1(this$static);
        if (this$static._pos == 1073741823) {
          subValue = this$static._pos - this$static._cyclicBufferSize;
          $NormalizeLinks(this$static._son, this$static._cyclicBufferSize * 2, subValue);
          $NormalizeLinks(this$static._hash, this$static._hashSizeSum, subValue);
          $ReduceOffsets(this$static, subValue);
        }
      }
      function $NormalizeLinks(items, numItems, subValue) {
        var i, value;
        for (i = 0; i < numItems; ++i) {
          value = items[i] || 0;
          if (value <= subValue) {
            value = 0;
          } else {
            value -= subValue;
          }
          items[i] = value;
        }
      }
      function $SetType(this$static, numHashBytes) {
        this$static.HASH_ARRAY = numHashBytes > 2;
        if (this$static.HASH_ARRAY) {
          this$static.kNumHashDirectBytes = 0;
          this$static.kMinMatchCheck = 4;
          this$static.kFixHashSize = 66560;
        } else {
          this$static.kNumHashDirectBytes = 2;
          this$static.kMinMatchCheck = 3;
          this$static.kFixHashSize = 0;
        }
      }
      function $Skip(this$static, num) {
        var count, cur, curMatch, cyclicPos, delta, hash2Value, hash3Value, hashValue, len, len0, len1, lenLimit, matchMinPos, pby1, ptr0, ptr1, temp;
        do {
          if (this$static._pos + this$static._matchMaxLen <= this$static._streamPos) {
            lenLimit = this$static._matchMaxLen;
          } else {
            lenLimit = this$static._streamPos - this$static._pos;
            if (lenLimit < this$static.kMinMatchCheck) {
              $MovePos_0(this$static);
              continue;
            }
          }
          matchMinPos = this$static._pos > this$static._cyclicBufferSize ? this$static._pos - this$static._cyclicBufferSize : 0;
          cur = this$static._bufferOffset + this$static._pos;
          if (this$static.HASH_ARRAY) {
            temp = CrcTable[this$static._bufferBase[cur] & 255] ^ this$static._bufferBase[cur + 1] & 255;
            hash2Value = temp & 1023;
            this$static._hash[hash2Value] = this$static._pos;
            temp ^= (this$static._bufferBase[cur + 2] & 255) << 8;
            hash3Value = temp & 65535;
            this$static._hash[1024 + hash3Value] = this$static._pos;
            hashValue = (temp ^ CrcTable[this$static._bufferBase[cur + 3] & 255] << 5) & this$static._hashMask;
          } else {
            hashValue = this$static._bufferBase[cur] & 255 ^ (this$static._bufferBase[cur + 1] & 255) << 8;
          }
          curMatch = this$static._hash[this$static.kFixHashSize + hashValue];
          this$static._hash[this$static.kFixHashSize + hashValue] = this$static._pos;
          ptr0 = (this$static._cyclicBufferPos << 1) + 1;
          ptr1 = this$static._cyclicBufferPos << 1;
          len0 = len1 = this$static.kNumHashDirectBytes;
          count = this$static._cutValue;
          while (1) {
            if (curMatch <= matchMinPos || count-- == 0) {
              this$static._son[ptr0] = this$static._son[ptr1] = 0;
              break;
            }
            delta = this$static._pos - curMatch;
            cyclicPos = (delta <= this$static._cyclicBufferPos ? this$static._cyclicBufferPos - delta : this$static._cyclicBufferPos - delta + this$static._cyclicBufferSize) << 1;
            pby1 = this$static._bufferOffset + curMatch;
            len = len0 < len1 ? len0 : len1;
            if (this$static._bufferBase[pby1 + len] == this$static._bufferBase[cur + len]) {
              while (++len != lenLimit) {
                if (this$static._bufferBase[pby1 + len] != this$static._bufferBase[cur + len]) {
                  break;
                }
              }
              if (len == lenLimit) {
                this$static._son[ptr1] = this$static._son[cyclicPos];
                this$static._son[ptr0] = this$static._son[cyclicPos + 1];
                break;
              }
            }
            if ((this$static._bufferBase[pby1 + len] & 255) < (this$static._bufferBase[cur + len] & 255)) {
              this$static._son[ptr1] = curMatch;
              ptr1 = cyclicPos + 1;
              curMatch = this$static._son[ptr1];
              len1 = len;
            } else {
              this$static._son[ptr0] = curMatch;
              ptr0 = cyclicPos;
              curMatch = this$static._son[ptr0];
              len0 = len;
            }
          }
          $MovePos_0(this$static);
        } while (--num != 0);
      }
      function $CopyBlock(this$static, distance, len) {
        var pos = this$static._pos - distance - 1;
        if (pos < 0) {
          pos += this$static._windowSize;
        }
        for (; len != 0; --len) {
          if (pos >= this$static._windowSize) {
            pos = 0;
          }
          this$static._buffer[this$static._pos++] = this$static._buffer[pos++];
          if (this$static._pos >= this$static._windowSize) {
            $Flush_0(this$static);
          }
        }
      }
      function $Create_5(this$static, windowSize) {
        if (this$static._buffer == null || this$static._windowSize != windowSize) {
          this$static._buffer = initDim(windowSize);
        }
        this$static._windowSize = windowSize;
        this$static._pos = 0;
        this$static._streamPos = 0;
      }
      function $Flush_0(this$static) {
        var size = this$static._pos - this$static._streamPos;
        if (!size) {
          return;
        }
        $write_0(this$static._stream, this$static._buffer, this$static._streamPos, size);
        if (this$static._pos >= this$static._windowSize) {
          this$static._pos = 0;
        }
        this$static._streamPos = this$static._pos;
      }
      function $GetByte(this$static, distance) {
        var pos = this$static._pos - distance - 1;
        if (pos < 0) {
          pos += this$static._windowSize;
        }
        return this$static._buffer[pos];
      }
      function $PutByte(this$static, b) {
        this$static._buffer[this$static._pos++] = b;
        if (this$static._pos >= this$static._windowSize) {
          $Flush_0(this$static);
        }
      }
      function $ReleaseStream(this$static) {
        $Flush_0(this$static);
        this$static._stream = null;
      }
      function GetLenToPosState(len) {
        len -= 2;
        if (len < 4) {
          return len;
        }
        return 3;
      }
      function StateUpdateChar(index) {
        if (index < 4) {
          return 0;
        }
        if (index < 10) {
          return index - 3;
        }
        return index - 6;
      }
      function $Chunker_0(this$static, encoder) {
        this$static.encoder = encoder;
        this$static.decoder = null;
        this$static.alive = 1;
        return this$static;
      }
      function $Chunker(this$static, decoder) {
        this$static.decoder = decoder;
        this$static.encoder = null;
        this$static.alive = 1;
        return this$static;
      }
      function $processChunk(this$static) {
        if (!this$static.alive) {
          throw new Error("bad state");
        }
        if (this$static.encoder) {
          $processEncoderChunk(this$static);
        } else {
          $processDecoderChunk(this$static);
        }
        return this$static.alive;
      }
      function $processDecoderChunk(this$static) {
        var result = $CodeOneChunk(this$static.decoder);
        if (result == -1) {
          throw new Error("corrupted input");
        }
        this$static.inBytesProcessed = N1_longLit;
        this$static.outBytesProcessed = this$static.decoder.nowPos64;
        if (result || compare(this$static.decoder.outSize, P0_longLit) >= 0 && compare(this$static.decoder.nowPos64, this$static.decoder.outSize) >= 0) {
          $Flush_0(this$static.decoder.m_OutWindow);
          $ReleaseStream(this$static.decoder.m_OutWindow);
          this$static.decoder.m_RangeDecoder.Stream = null;
          this$static.alive = 0;
        }
      }
      function $processEncoderChunk(this$static) {
        $CodeOneBlock(this$static.encoder, this$static.encoder.processedInSize, this$static.encoder.processedOutSize, this$static.encoder.finished);
        this$static.inBytesProcessed = this$static.encoder.processedInSize[0];
        if (this$static.encoder.finished[0]) {
          $ReleaseStreams(this$static.encoder);
          this$static.alive = 0;
        }
      }
      function $CodeInChunks(this$static, inStream, outStream, outSize) {
        this$static.m_RangeDecoder.Stream = inStream;
        $ReleaseStream(this$static.m_OutWindow);
        this$static.m_OutWindow._stream = outStream;
        $Init_1(this$static);
        this$static.state = 0;
        this$static.rep0 = 0;
        this$static.rep1 = 0;
        this$static.rep2 = 0;
        this$static.rep3 = 0;
        this$static.outSize = outSize;
        this$static.nowPos64 = P0_longLit;
        this$static.prevByte = 0;
        return $Chunker({}, this$static);
      }
      function $CodeOneChunk(this$static) {
        var decoder2, distance, len, numDirectBits, posSlot, posState;
        posState = lowBits_0(this$static.nowPos64) & this$static.m_PosStateMask;
        if (!$DecodeBit(this$static.m_RangeDecoder, this$static.m_IsMatchDecoders, (this$static.state << 4) + posState)) {
          decoder2 = $GetDecoder(this$static.m_LiteralDecoder, lowBits_0(this$static.nowPos64), this$static.prevByte);
          if (this$static.state < 7) {
            this$static.prevByte = $DecodeNormal(decoder2, this$static.m_RangeDecoder);
          } else {
            this$static.prevByte = $DecodeWithMatchByte(decoder2, this$static.m_RangeDecoder, $GetByte(this$static.m_OutWindow, this$static.rep0));
          }
          $PutByte(this$static.m_OutWindow, this$static.prevByte);
          this$static.state = StateUpdateChar(this$static.state);
          this$static.nowPos64 = add2(this$static.nowPos64, P1_longLit);
        } else {
          if ($DecodeBit(this$static.m_RangeDecoder, this$static.m_IsRepDecoders, this$static.state)) {
            len = 0;
            if (!$DecodeBit(this$static.m_RangeDecoder, this$static.m_IsRepG0Decoders, this$static.state)) {
              if (!$DecodeBit(this$static.m_RangeDecoder, this$static.m_IsRep0LongDecoders, (this$static.state << 4) + posState)) {
                this$static.state = this$static.state < 7 ? 9 : 11;
                len = 1;
              }
            } else {
              if (!$DecodeBit(this$static.m_RangeDecoder, this$static.m_IsRepG1Decoders, this$static.state)) {
                distance = this$static.rep1;
              } else {
                if (!$DecodeBit(this$static.m_RangeDecoder, this$static.m_IsRepG2Decoders, this$static.state)) {
                  distance = this$static.rep2;
                } else {
                  distance = this$static.rep3;
                  this$static.rep3 = this$static.rep2;
                }
                this$static.rep2 = this$static.rep1;
              }
              this$static.rep1 = this$static.rep0;
              this$static.rep0 = distance;
            }
            if (!len) {
              len = $Decode(this$static.m_RepLenDecoder, this$static.m_RangeDecoder, posState) + 2;
              this$static.state = this$static.state < 7 ? 8 : 11;
            }
          } else {
            this$static.rep3 = this$static.rep2;
            this$static.rep2 = this$static.rep1;
            this$static.rep1 = this$static.rep0;
            len = 2 + $Decode(this$static.m_LenDecoder, this$static.m_RangeDecoder, posState);
            this$static.state = this$static.state < 7 ? 7 : 10;
            posSlot = $Decode_0(this$static.m_PosSlotDecoder[GetLenToPosState(len)], this$static.m_RangeDecoder);
            if (posSlot >= 4) {
              numDirectBits = (posSlot >> 1) - 1;
              this$static.rep0 = (2 | posSlot & 1) << numDirectBits;
              if (posSlot < 14) {
                this$static.rep0 += ReverseDecode(this$static.m_PosDecoders, this$static.rep0 - posSlot - 1, this$static.m_RangeDecoder, numDirectBits);
              } else {
                this$static.rep0 += $DecodeDirectBits(this$static.m_RangeDecoder, numDirectBits - 4) << 4;
                this$static.rep0 += $ReverseDecode(this$static.m_PosAlignDecoder, this$static.m_RangeDecoder);
                if (this$static.rep0 < 0) {
                  if (this$static.rep0 == -1) {
                    return 1;
                  }
                  return -1;
                }
              }
            } else
              this$static.rep0 = posSlot;
          }
          if (compare(fromInt(this$static.rep0), this$static.nowPos64) >= 0 || this$static.rep0 >= this$static.m_DictionarySizeCheck) {
            return -1;
          }
          $CopyBlock(this$static.m_OutWindow, this$static.rep0, len);
          this$static.nowPos64 = add2(this$static.nowPos64, fromInt(len));
          this$static.prevByte = $GetByte(this$static.m_OutWindow, 0);
        }
        return 0;
      }
      function $Decoder(this$static) {
        this$static.m_OutWindow = {};
        this$static.m_RangeDecoder = {};
        this$static.m_IsMatchDecoders = initDim(192);
        this$static.m_IsRepDecoders = initDim(12);
        this$static.m_IsRepG0Decoders = initDim(12);
        this$static.m_IsRepG1Decoders = initDim(12);
        this$static.m_IsRepG2Decoders = initDim(12);
        this$static.m_IsRep0LongDecoders = initDim(192);
        this$static.m_PosSlotDecoder = initDim(4);
        this$static.m_PosDecoders = initDim(114);
        this$static.m_PosAlignDecoder = $BitTreeDecoder({}, 4);
        this$static.m_LenDecoder = $Decoder$LenDecoder({});
        this$static.m_RepLenDecoder = $Decoder$LenDecoder({});
        this$static.m_LiteralDecoder = {};
        for (var i = 0; i < 4; ++i) {
          this$static.m_PosSlotDecoder[i] = $BitTreeDecoder({}, 6);
        }
        return this$static;
      }
      function $Init_1(this$static) {
        this$static.m_OutWindow._streamPos = 0;
        this$static.m_OutWindow._pos = 0;
        InitBitModels(this$static.m_IsMatchDecoders);
        InitBitModels(this$static.m_IsRep0LongDecoders);
        InitBitModels(this$static.m_IsRepDecoders);
        InitBitModels(this$static.m_IsRepG0Decoders);
        InitBitModels(this$static.m_IsRepG1Decoders);
        InitBitModels(this$static.m_IsRepG2Decoders);
        InitBitModels(this$static.m_PosDecoders);
        $Init_0(this$static.m_LiteralDecoder);
        for (var i = 0; i < 4; ++i) {
          InitBitModels(this$static.m_PosSlotDecoder[i].Models);
        }
        $Init(this$static.m_LenDecoder);
        $Init(this$static.m_RepLenDecoder);
        InitBitModels(this$static.m_PosAlignDecoder.Models);
        $Init_8(this$static.m_RangeDecoder);
      }
      function $SetDecoderProperties(this$static, properties) {
        var dictionarySize, i, lc, lp, pb, remainder, val;
        if (properties.length < 5)
          return 0;
        val = properties[0] & 255;
        lc = val % 9;
        remainder = ~~(val / 9);
        lp = remainder % 5;
        pb = ~~(remainder / 5);
        dictionarySize = 0;
        for (i = 0; i < 4; ++i) {
          dictionarySize += (properties[1 + i] & 255) << i * 8;
        }
        if (dictionarySize > 99999999 || !$SetLcLpPb(this$static, lc, lp, pb)) {
          return 0;
        }
        return $SetDictionarySize(this$static, dictionarySize);
      }
      function $SetDictionarySize(this$static, dictionarySize) {
        if (dictionarySize < 0) {
          return 0;
        }
        if (this$static.m_DictionarySize != dictionarySize) {
          this$static.m_DictionarySize = dictionarySize;
          this$static.m_DictionarySizeCheck = Math.max(this$static.m_DictionarySize, 1);
          $Create_5(this$static.m_OutWindow, Math.max(this$static.m_DictionarySizeCheck, 4096));
        }
        return 1;
      }
      function $SetLcLpPb(this$static, lc, lp, pb) {
        if (lc > 8 || lp > 4 || pb > 4) {
          return 0;
        }
        $Create_0(this$static.m_LiteralDecoder, lp, lc);
        var numPosStates = 1 << pb;
        $Create(this$static.m_LenDecoder, numPosStates);
        $Create(this$static.m_RepLenDecoder, numPosStates);
        this$static.m_PosStateMask = numPosStates - 1;
        return 1;
      }
      function $Create(this$static, numPosStates) {
        for (; this$static.m_NumPosStates < numPosStates; ++this$static.m_NumPosStates) {
          this$static.m_LowCoder[this$static.m_NumPosStates] = $BitTreeDecoder({}, 3);
          this$static.m_MidCoder[this$static.m_NumPosStates] = $BitTreeDecoder({}, 3);
        }
      }
      function $Decode(this$static, rangeDecoder, posState) {
        if (!$DecodeBit(rangeDecoder, this$static.m_Choice, 0)) {
          return $Decode_0(this$static.m_LowCoder[posState], rangeDecoder);
        }
        var symbol = 8;
        if (!$DecodeBit(rangeDecoder, this$static.m_Choice, 1)) {
          symbol += $Decode_0(this$static.m_MidCoder[posState], rangeDecoder);
        } else {
          symbol += 8 + $Decode_0(this$static.m_HighCoder, rangeDecoder);
        }
        return symbol;
      }
      function $Decoder$LenDecoder(this$static) {
        this$static.m_Choice = initDim(2);
        this$static.m_LowCoder = initDim(16);
        this$static.m_MidCoder = initDim(16);
        this$static.m_HighCoder = $BitTreeDecoder({}, 8);
        this$static.m_NumPosStates = 0;
        return this$static;
      }
      function $Init(this$static) {
        InitBitModels(this$static.m_Choice);
        for (var posState = 0; posState < this$static.m_NumPosStates; ++posState) {
          InitBitModels(this$static.m_LowCoder[posState].Models);
          InitBitModels(this$static.m_MidCoder[posState].Models);
        }
        InitBitModels(this$static.m_HighCoder.Models);
      }
      function $Create_0(this$static, numPosBits, numPrevBits) {
        var i, numStates;
        if (this$static.m_Coders != null && this$static.m_NumPrevBits == numPrevBits && this$static.m_NumPosBits == numPosBits)
          return;
        this$static.m_NumPosBits = numPosBits;
        this$static.m_PosMask = (1 << numPosBits) - 1;
        this$static.m_NumPrevBits = numPrevBits;
        numStates = 1 << this$static.m_NumPrevBits + this$static.m_NumPosBits;
        this$static.m_Coders = initDim(numStates);
        for (i = 0; i < numStates; ++i)
          this$static.m_Coders[i] = $Decoder$LiteralDecoder$Decoder2({});
      }
      function $GetDecoder(this$static, pos, prevByte) {
        return this$static.m_Coders[((pos & this$static.m_PosMask) << this$static.m_NumPrevBits) + ((prevByte & 255) >>> 8 - this$static.m_NumPrevBits)];
      }
      function $Init_0(this$static) {
        var i, numStates;
        numStates = 1 << this$static.m_NumPrevBits + this$static.m_NumPosBits;
        for (i = 0; i < numStates; ++i) {
          InitBitModels(this$static.m_Coders[i].m_Decoders);
        }
      }
      function $DecodeNormal(this$static, rangeDecoder) {
        var symbol = 1;
        do {
          symbol = symbol << 1 | $DecodeBit(rangeDecoder, this$static.m_Decoders, symbol);
        } while (symbol < 256);
        return symbol << 24 >> 24;
      }
      function $DecodeWithMatchByte(this$static, rangeDecoder, matchByte) {
        var bit, matchBit, symbol = 1;
        do {
          matchBit = matchByte >> 7 & 1;
          matchByte <<= 1;
          bit = $DecodeBit(rangeDecoder, this$static.m_Decoders, (1 + matchBit << 8) + symbol);
          symbol = symbol << 1 | bit;
          if (matchBit != bit) {
            while (symbol < 256) {
              symbol = symbol << 1 | $DecodeBit(rangeDecoder, this$static.m_Decoders, symbol);
            }
            break;
          }
        } while (symbol < 256);
        return symbol << 24 >> 24;
      }
      function $Decoder$LiteralDecoder$Decoder2(this$static) {
        this$static.m_Decoders = initDim(768);
        return this$static;
      }
      var g_FastPos = function() {
        var j, k, slotFast, c = 2, g_FastPos2 = [0, 1];
        for (slotFast = 2; slotFast < 22; ++slotFast) {
          k = 1 << (slotFast >> 1) - 1;
          for (j = 0; j < k; ++j, ++c)
            g_FastPos2[c] = slotFast << 24 >> 24;
        }
        return g_FastPos2;
      }();
      function $Backward(this$static, cur) {
        var backCur, backMem, posMem, posPrev;
        this$static._optimumEndIndex = cur;
        posMem = this$static._optimum[cur].PosPrev;
        backMem = this$static._optimum[cur].BackPrev;
        do {
          if (this$static._optimum[cur].Prev1IsChar) {
            $MakeAsChar(this$static._optimum[posMem]);
            this$static._optimum[posMem].PosPrev = posMem - 1;
            if (this$static._optimum[cur].Prev2) {
              this$static._optimum[posMem - 1].Prev1IsChar = 0;
              this$static._optimum[posMem - 1].PosPrev = this$static._optimum[cur].PosPrev2;
              this$static._optimum[posMem - 1].BackPrev = this$static._optimum[cur].BackPrev2;
            }
          }
          posPrev = posMem;
          backCur = backMem;
          backMem = this$static._optimum[posPrev].BackPrev;
          posMem = this$static._optimum[posPrev].PosPrev;
          this$static._optimum[posPrev].BackPrev = backCur;
          this$static._optimum[posPrev].PosPrev = cur;
          cur = posPrev;
        } while (cur > 0);
        this$static.backRes = this$static._optimum[0].BackPrev;
        this$static._optimumCurrentIndex = this$static._optimum[0].PosPrev;
        return this$static._optimumCurrentIndex;
      }
      function $BaseInit(this$static) {
        this$static._state = 0;
        this$static._previousByte = 0;
        for (var i = 0; i < 4; ++i) {
          this$static._repDistances[i] = 0;
        }
      }
      function $CodeOneBlock(this$static, inSize, outSize, finished) {
        var baseVal, complexState, curByte, distance, footerBits, i, len, lenToPosState, matchByte, pos, posReduced, posSlot, posState, progressPosValuePrev, subCoder;
        inSize[0] = P0_longLit;
        outSize[0] = P0_longLit;
        finished[0] = 1;
        if (this$static._inStream) {
          this$static._matchFinder._stream = this$static._inStream;
          $Init_5(this$static._matchFinder);
          this$static._needReleaseMFStream = 1;
          this$static._inStream = null;
        }
        if (this$static._finished) {
          return;
        }
        this$static._finished = 1;
        progressPosValuePrev = this$static.nowPos64;
        if (eq(this$static.nowPos64, P0_longLit)) {
          if (!$GetNumAvailableBytes(this$static._matchFinder)) {
            $Flush(this$static, lowBits_0(this$static.nowPos64));
            return;
          }
          $ReadMatchDistances(this$static);
          posState = lowBits_0(this$static.nowPos64) & this$static._posStateMask;
          $Encode_3(this$static._rangeEncoder, this$static._isMatch, (this$static._state << 4) + posState, 0);
          this$static._state = StateUpdateChar(this$static._state);
          curByte = $GetIndexByte(this$static._matchFinder, -this$static._additionalOffset);
          $Encode_1($GetSubCoder(this$static._literalEncoder, lowBits_0(this$static.nowPos64), this$static._previousByte), this$static._rangeEncoder, curByte);
          this$static._previousByte = curByte;
          --this$static._additionalOffset;
          this$static.nowPos64 = add2(this$static.nowPos64, P1_longLit);
        }
        if (!$GetNumAvailableBytes(this$static._matchFinder)) {
          $Flush(this$static, lowBits_0(this$static.nowPos64));
          return;
        }
        while (1) {
          len = $GetOptimum(this$static, lowBits_0(this$static.nowPos64));
          pos = this$static.backRes;
          posState = lowBits_0(this$static.nowPos64) & this$static._posStateMask;
          complexState = (this$static._state << 4) + posState;
          if (len == 1 && pos == -1) {
            $Encode_3(this$static._rangeEncoder, this$static._isMatch, complexState, 0);
            curByte = $GetIndexByte(this$static._matchFinder, -this$static._additionalOffset);
            subCoder = $GetSubCoder(this$static._literalEncoder, lowBits_0(this$static.nowPos64), this$static._previousByte);
            if (this$static._state < 7) {
              $Encode_1(subCoder, this$static._rangeEncoder, curByte);
            } else {
              matchByte = $GetIndexByte(this$static._matchFinder, -this$static._repDistances[0] - 1 - this$static._additionalOffset);
              $EncodeMatched(subCoder, this$static._rangeEncoder, matchByte, curByte);
            }
            this$static._previousByte = curByte;
            this$static._state = StateUpdateChar(this$static._state);
          } else {
            $Encode_3(this$static._rangeEncoder, this$static._isMatch, complexState, 1);
            if (pos < 4) {
              $Encode_3(this$static._rangeEncoder, this$static._isRep, this$static._state, 1);
              if (!pos) {
                $Encode_3(this$static._rangeEncoder, this$static._isRepG0, this$static._state, 0);
                if (len == 1) {
                  $Encode_3(this$static._rangeEncoder, this$static._isRep0Long, complexState, 0);
                } else {
                  $Encode_3(this$static._rangeEncoder, this$static._isRep0Long, complexState, 1);
                }
              } else {
                $Encode_3(this$static._rangeEncoder, this$static._isRepG0, this$static._state, 1);
                if (pos == 1) {
                  $Encode_3(this$static._rangeEncoder, this$static._isRepG1, this$static._state, 0);
                } else {
                  $Encode_3(this$static._rangeEncoder, this$static._isRepG1, this$static._state, 1);
                  $Encode_3(this$static._rangeEncoder, this$static._isRepG2, this$static._state, pos - 2);
                }
              }
              if (len == 1) {
                this$static._state = this$static._state < 7 ? 9 : 11;
              } else {
                $Encode_0(this$static._repMatchLenEncoder, this$static._rangeEncoder, len - 2, posState);
                this$static._state = this$static._state < 7 ? 8 : 11;
              }
              distance = this$static._repDistances[pos];
              if (pos != 0) {
                for (i = pos; i >= 1; --i) {
                  this$static._repDistances[i] = this$static._repDistances[i - 1];
                }
                this$static._repDistances[0] = distance;
              }
            } else {
              $Encode_3(this$static._rangeEncoder, this$static._isRep, this$static._state, 0);
              this$static._state = this$static._state < 7 ? 7 : 10;
              $Encode_0(this$static._lenEncoder, this$static._rangeEncoder, len - 2, posState);
              pos -= 4;
              posSlot = GetPosSlot(pos);
              lenToPosState = GetLenToPosState(len);
              $Encode_2(this$static._posSlotEncoder[lenToPosState], this$static._rangeEncoder, posSlot);
              if (posSlot >= 4) {
                footerBits = (posSlot >> 1) - 1;
                baseVal = (2 | posSlot & 1) << footerBits;
                posReduced = pos - baseVal;
                if (posSlot < 14) {
                  ReverseEncode(this$static._posEncoders, baseVal - posSlot - 1, this$static._rangeEncoder, footerBits, posReduced);
                } else {
                  $EncodeDirectBits(this$static._rangeEncoder, posReduced >> 4, footerBits - 4);
                  $ReverseEncode(this$static._posAlignEncoder, this$static._rangeEncoder, posReduced & 15);
                  ++this$static._alignPriceCount;
                }
              }
              distance = pos;
              for (i = 3; i >= 1; --i) {
                this$static._repDistances[i] = this$static._repDistances[i - 1];
              }
              this$static._repDistances[0] = distance;
              ++this$static._matchPriceCount;
            }
            this$static._previousByte = $GetIndexByte(this$static._matchFinder, len - 1 - this$static._additionalOffset);
          }
          this$static._additionalOffset -= len;
          this$static.nowPos64 = add2(this$static.nowPos64, fromInt(len));
          if (!this$static._additionalOffset) {
            if (this$static._matchPriceCount >= 128) {
              $FillDistancesPrices(this$static);
            }
            if (this$static._alignPriceCount >= 16) {
              $FillAlignPrices(this$static);
            }
            inSize[0] = this$static.nowPos64;
            outSize[0] = $GetProcessedSizeAdd(this$static._rangeEncoder);
            if (!$GetNumAvailableBytes(this$static._matchFinder)) {
              $Flush(this$static, lowBits_0(this$static.nowPos64));
              return;
            }
            if (compare(sub(this$static.nowPos64, progressPosValuePrev), [4096, 0]) >= 0) {
              this$static._finished = 0;
              finished[0] = 0;
              return;
            }
          }
        }
      }
      function $Create_2(this$static) {
        var bt, numHashBytes;
        if (!this$static._matchFinder) {
          bt = {};
          numHashBytes = 4;
          if (!this$static._matchFinderType) {
            numHashBytes = 2;
          }
          $SetType(bt, numHashBytes);
          this$static._matchFinder = bt;
        }
        $Create_1(this$static._literalEncoder, this$static._numLiteralPosStateBits, this$static._numLiteralContextBits);
        if (this$static._dictionarySize == this$static._dictionarySizePrev && this$static._numFastBytesPrev == this$static._numFastBytes) {
          return;
        }
        $Create_3(this$static._matchFinder, this$static._dictionarySize, 4096, this$static._numFastBytes, 274);
        this$static._dictionarySizePrev = this$static._dictionarySize;
        this$static._numFastBytesPrev = this$static._numFastBytes;
      }
      function $Encoder(this$static) {
        var i;
        this$static._repDistances = initDim(4);
        this$static._optimum = [];
        this$static._rangeEncoder = {};
        this$static._isMatch = initDim(192);
        this$static._isRep = initDim(12);
        this$static._isRepG0 = initDim(12);
        this$static._isRepG1 = initDim(12);
        this$static._isRepG2 = initDim(12);
        this$static._isRep0Long = initDim(192);
        this$static._posSlotEncoder = [];
        this$static._posEncoders = initDim(114);
        this$static._posAlignEncoder = $BitTreeEncoder({}, 4);
        this$static._lenEncoder = $Encoder$LenPriceTableEncoder({});
        this$static._repMatchLenEncoder = $Encoder$LenPriceTableEncoder({});
        this$static._literalEncoder = {};
        this$static._matchDistances = [];
        this$static._posSlotPrices = [];
        this$static._distancesPrices = [];
        this$static._alignPrices = initDim(16);
        this$static.reps = initDim(4);
        this$static.repLens = initDim(4);
        this$static.processedInSize = [P0_longLit];
        this$static.processedOutSize = [P0_longLit];
        this$static.finished = [0];
        this$static.properties = initDim(5);
        this$static.tempPrices = initDim(128);
        this$static._longestMatchLength = 0;
        this$static._matchFinderType = 1;
        this$static._numDistancePairs = 0;
        this$static._numFastBytesPrev = -1;
        this$static.backRes = 0;
        for (i = 0; i < 4096; ++i) {
          this$static._optimum[i] = {};
        }
        for (i = 0; i < 4; ++i) {
          this$static._posSlotEncoder[i] = $BitTreeEncoder({}, 6);
        }
        return this$static;
      }
      function $FillAlignPrices(this$static) {
        for (var i = 0; i < 16; ++i) {
          this$static._alignPrices[i] = $ReverseGetPrice(this$static._posAlignEncoder, i);
        }
        this$static._alignPriceCount = 0;
      }
      function $FillDistancesPrices(this$static) {
        var baseVal, encoder, footerBits, i, lenToPosState, posSlot, st, st2;
        for (i = 4; i < 128; ++i) {
          posSlot = GetPosSlot(i);
          footerBits = (posSlot >> 1) - 1;
          baseVal = (2 | posSlot & 1) << footerBits;
          this$static.tempPrices[i] = ReverseGetPrice(this$static._posEncoders, baseVal - posSlot - 1, footerBits, i - baseVal);
        }
        for (lenToPosState = 0; lenToPosState < 4; ++lenToPosState) {
          encoder = this$static._posSlotEncoder[lenToPosState];
          st = lenToPosState << 6;
          for (posSlot = 0; posSlot < this$static._distTableSize; ++posSlot) {
            this$static._posSlotPrices[st + posSlot] = $GetPrice_1(encoder, posSlot);
          }
          for (posSlot = 14; posSlot < this$static._distTableSize; ++posSlot) {
            this$static._posSlotPrices[st + posSlot] += (posSlot >> 1) - 1 - 4 << 6;
          }
          st2 = lenToPosState * 128;
          for (i = 0; i < 4; ++i) {
            this$static._distancesPrices[st2 + i] = this$static._posSlotPrices[st + i];
          }
          for (; i < 128; ++i) {
            this$static._distancesPrices[st2 + i] = this$static._posSlotPrices[st + GetPosSlot(i)] + this$static.tempPrices[i];
          }
        }
        this$static._matchPriceCount = 0;
      }
      function $Flush(this$static, nowPos) {
        $ReleaseMFStream(this$static);
        $WriteEndMarker(this$static, nowPos & this$static._posStateMask);
        for (var i = 0; i < 5; ++i) {
          $ShiftLow(this$static._rangeEncoder);
        }
      }
      function $GetOptimum(this$static, position) {
        var cur, curAnd1Price, curAndLenCharPrice, curAndLenPrice, curBack, curPrice, currentByte, distance, i, len, lenEnd, lenMain, lenRes, lenTest, lenTest2, lenTestTemp, matchByte, matchPrice, newLen, nextIsChar, nextMatchPrice, nextOptimum, nextRepMatchPrice, normalMatchPrice, numAvailableBytes, numAvailableBytesFull, numDistancePairs, offs, offset, opt, optimum, pos, posPrev, posState, posStateNext, price_4, repIndex, repLen, repMatchPrice, repMaxIndex, shortRepPrice, startLen, state, state2, t, price, price_0, price_1, price_2, price_3;
        if (this$static._optimumEndIndex != this$static._optimumCurrentIndex) {
          lenRes = this$static._optimum[this$static._optimumCurrentIndex].PosPrev - this$static._optimumCurrentIndex;
          this$static.backRes = this$static._optimum[this$static._optimumCurrentIndex].BackPrev;
          this$static._optimumCurrentIndex = this$static._optimum[this$static._optimumCurrentIndex].PosPrev;
          return lenRes;
        }
        this$static._optimumCurrentIndex = this$static._optimumEndIndex = 0;
        if (this$static._longestMatchWasFound) {
          lenMain = this$static._longestMatchLength;
          this$static._longestMatchWasFound = 0;
        } else {
          lenMain = $ReadMatchDistances(this$static);
        }
        numDistancePairs = this$static._numDistancePairs;
        numAvailableBytes = $GetNumAvailableBytes(this$static._matchFinder) + 1;
        if (numAvailableBytes < 2) {
          this$static.backRes = -1;
          return 1;
        }
        if (numAvailableBytes > 273) {
          numAvailableBytes = 273;
        }
        repMaxIndex = 0;
        for (i = 0; i < 4; ++i) {
          this$static.reps[i] = this$static._repDistances[i];
          this$static.repLens[i] = $GetMatchLen(this$static._matchFinder, -1, this$static.reps[i], 273);
          if (this$static.repLens[i] > this$static.repLens[repMaxIndex]) {
            repMaxIndex = i;
          }
        }
        if (this$static.repLens[repMaxIndex] >= this$static._numFastBytes) {
          this$static.backRes = repMaxIndex;
          lenRes = this$static.repLens[repMaxIndex];
          $MovePos(this$static, lenRes - 1);
          return lenRes;
        }
        if (lenMain >= this$static._numFastBytes) {
          this$static.backRes = this$static._matchDistances[numDistancePairs - 1] + 4;
          $MovePos(this$static, lenMain - 1);
          return lenMain;
        }
        currentByte = $GetIndexByte(this$static._matchFinder, -1);
        matchByte = $GetIndexByte(this$static._matchFinder, -this$static._repDistances[0] - 1 - 1);
        if (lenMain < 2 && currentByte != matchByte && this$static.repLens[repMaxIndex] < 2) {
          this$static.backRes = -1;
          return 1;
        }
        this$static._optimum[0].State = this$static._state;
        posState = position & this$static._posStateMask;
        this$static._optimum[1].Price = ProbPrices[this$static._isMatch[(this$static._state << 4) + posState] >>> 2] + $GetPrice_0($GetSubCoder(this$static._literalEncoder, position, this$static._previousByte), this$static._state >= 7, matchByte, currentByte);
        $MakeAsChar(this$static._optimum[1]);
        matchPrice = ProbPrices[2048 - this$static._isMatch[(this$static._state << 4) + posState] >>> 2];
        repMatchPrice = matchPrice + ProbPrices[2048 - this$static._isRep[this$static._state] >>> 2];
        if (matchByte == currentByte) {
          shortRepPrice = repMatchPrice + $GetRepLen1Price(this$static, this$static._state, posState);
          if (shortRepPrice < this$static._optimum[1].Price) {
            this$static._optimum[1].Price = shortRepPrice;
            $MakeAsShortRep(this$static._optimum[1]);
          }
        }
        lenEnd = lenMain >= this$static.repLens[repMaxIndex] ? lenMain : this$static.repLens[repMaxIndex];
        if (lenEnd < 2) {
          this$static.backRes = this$static._optimum[1].BackPrev;
          return 1;
        }
        this$static._optimum[1].PosPrev = 0;
        this$static._optimum[0].Backs0 = this$static.reps[0];
        this$static._optimum[0].Backs1 = this$static.reps[1];
        this$static._optimum[0].Backs2 = this$static.reps[2];
        this$static._optimum[0].Backs3 = this$static.reps[3];
        len = lenEnd;
        do {
          this$static._optimum[len--].Price = 268435455;
        } while (len >= 2);
        for (i = 0; i < 4; ++i) {
          repLen = this$static.repLens[i];
          if (repLen < 2) {
            continue;
          }
          price_4 = repMatchPrice + $GetPureRepPrice(this$static, i, this$static._state, posState);
          do {
            curAndLenPrice = price_4 + $GetPrice(this$static._repMatchLenEncoder, repLen - 2, posState);
            optimum = this$static._optimum[repLen];
            if (curAndLenPrice < optimum.Price) {
              optimum.Price = curAndLenPrice;
              optimum.PosPrev = 0;
              optimum.BackPrev = i;
              optimum.Prev1IsChar = 0;
            }
          } while (--repLen >= 2);
        }
        normalMatchPrice = matchPrice + ProbPrices[this$static._isRep[this$static._state] >>> 2];
        len = this$static.repLens[0] >= 2 ? this$static.repLens[0] + 1 : 2;
        if (len <= lenMain) {
          offs = 0;
          while (len > this$static._matchDistances[offs]) {
            offs += 2;
          }
          for (; ; ++len) {
            distance = this$static._matchDistances[offs + 1];
            curAndLenPrice = normalMatchPrice + $GetPosLenPrice(this$static, distance, len, posState);
            optimum = this$static._optimum[len];
            if (curAndLenPrice < optimum.Price) {
              optimum.Price = curAndLenPrice;
              optimum.PosPrev = 0;
              optimum.BackPrev = distance + 4;
              optimum.Prev1IsChar = 0;
            }
            if (len == this$static._matchDistances[offs]) {
              offs += 2;
              if (offs == numDistancePairs) {
                break;
              }
            }
          }
        }
        cur = 0;
        while (1) {
          ++cur;
          if (cur == lenEnd) {
            return $Backward(this$static, cur);
          }
          newLen = $ReadMatchDistances(this$static);
          numDistancePairs = this$static._numDistancePairs;
          if (newLen >= this$static._numFastBytes) {
            this$static._longestMatchLength = newLen;
            this$static._longestMatchWasFound = 1;
            return $Backward(this$static, cur);
          }
          ++position;
          posPrev = this$static._optimum[cur].PosPrev;
          if (this$static._optimum[cur].Prev1IsChar) {
            --posPrev;
            if (this$static._optimum[cur].Prev2) {
              state = this$static._optimum[this$static._optimum[cur].PosPrev2].State;
              if (this$static._optimum[cur].BackPrev2 < 4) {
                state = state < 7 ? 8 : 11;
              } else {
                state = state < 7 ? 7 : 10;
              }
            } else {
              state = this$static._optimum[posPrev].State;
            }
            state = StateUpdateChar(state);
          } else {
            state = this$static._optimum[posPrev].State;
          }
          if (posPrev == cur - 1) {
            if (!this$static._optimum[cur].BackPrev) {
              state = state < 7 ? 9 : 11;
            } else {
              state = StateUpdateChar(state);
            }
          } else {
            if (this$static._optimum[cur].Prev1IsChar && this$static._optimum[cur].Prev2) {
              posPrev = this$static._optimum[cur].PosPrev2;
              pos = this$static._optimum[cur].BackPrev2;
              state = state < 7 ? 8 : 11;
            } else {
              pos = this$static._optimum[cur].BackPrev;
              if (pos < 4) {
                state = state < 7 ? 8 : 11;
              } else {
                state = state < 7 ? 7 : 10;
              }
            }
            opt = this$static._optimum[posPrev];
            if (pos < 4) {
              if (!pos) {
                this$static.reps[0] = opt.Backs0;
                this$static.reps[1] = opt.Backs1;
                this$static.reps[2] = opt.Backs2;
                this$static.reps[3] = opt.Backs3;
              } else if (pos == 1) {
                this$static.reps[0] = opt.Backs1;
                this$static.reps[1] = opt.Backs0;
                this$static.reps[2] = opt.Backs2;
                this$static.reps[3] = opt.Backs3;
              } else if (pos == 2) {
                this$static.reps[0] = opt.Backs2;
                this$static.reps[1] = opt.Backs0;
                this$static.reps[2] = opt.Backs1;
                this$static.reps[3] = opt.Backs3;
              } else {
                this$static.reps[0] = opt.Backs3;
                this$static.reps[1] = opt.Backs0;
                this$static.reps[2] = opt.Backs1;
                this$static.reps[3] = opt.Backs2;
              }
            } else {
              this$static.reps[0] = pos - 4;
              this$static.reps[1] = opt.Backs0;
              this$static.reps[2] = opt.Backs1;
              this$static.reps[3] = opt.Backs2;
            }
          }
          this$static._optimum[cur].State = state;
          this$static._optimum[cur].Backs0 = this$static.reps[0];
          this$static._optimum[cur].Backs1 = this$static.reps[1];
          this$static._optimum[cur].Backs2 = this$static.reps[2];
          this$static._optimum[cur].Backs3 = this$static.reps[3];
          curPrice = this$static._optimum[cur].Price;
          currentByte = $GetIndexByte(this$static._matchFinder, -1);
          matchByte = $GetIndexByte(this$static._matchFinder, -this$static.reps[0] - 1 - 1);
          posState = position & this$static._posStateMask;
          curAnd1Price = curPrice + ProbPrices[this$static._isMatch[(state << 4) + posState] >>> 2] + $GetPrice_0($GetSubCoder(this$static._literalEncoder, position, $GetIndexByte(this$static._matchFinder, -2)), state >= 7, matchByte, currentByte);
          nextOptimum = this$static._optimum[cur + 1];
          nextIsChar = 0;
          if (curAnd1Price < nextOptimum.Price) {
            nextOptimum.Price = curAnd1Price;
            nextOptimum.PosPrev = cur;
            nextOptimum.BackPrev = -1;
            nextOptimum.Prev1IsChar = 0;
            nextIsChar = 1;
          }
          matchPrice = curPrice + ProbPrices[2048 - this$static._isMatch[(state << 4) + posState] >>> 2];
          repMatchPrice = matchPrice + ProbPrices[2048 - this$static._isRep[state] >>> 2];
          if (matchByte == currentByte && !(nextOptimum.PosPrev < cur && !nextOptimum.BackPrev)) {
            shortRepPrice = repMatchPrice + (ProbPrices[this$static._isRepG0[state] >>> 2] + ProbPrices[this$static._isRep0Long[(state << 4) + posState] >>> 2]);
            if (shortRepPrice <= nextOptimum.Price) {
              nextOptimum.Price = shortRepPrice;
              nextOptimum.PosPrev = cur;
              nextOptimum.BackPrev = 0;
              nextOptimum.Prev1IsChar = 0;
              nextIsChar = 1;
            }
          }
          numAvailableBytesFull = $GetNumAvailableBytes(this$static._matchFinder) + 1;
          numAvailableBytesFull = 4095 - cur < numAvailableBytesFull ? 4095 - cur : numAvailableBytesFull;
          numAvailableBytes = numAvailableBytesFull;
          if (numAvailableBytes < 2) {
            continue;
          }
          if (numAvailableBytes > this$static._numFastBytes) {
            numAvailableBytes = this$static._numFastBytes;
          }
          if (!nextIsChar && matchByte != currentByte) {
            t = Math.min(numAvailableBytesFull - 1, this$static._numFastBytes);
            lenTest2 = $GetMatchLen(this$static._matchFinder, 0, this$static.reps[0], t);
            if (lenTest2 >= 2) {
              state2 = StateUpdateChar(state);
              posStateNext = position + 1 & this$static._posStateMask;
              nextRepMatchPrice = curAnd1Price + ProbPrices[2048 - this$static._isMatch[(state2 << 4) + posStateNext] >>> 2] + ProbPrices[2048 - this$static._isRep[state2] >>> 2];
              offset = cur + 1 + lenTest2;
              while (lenEnd < offset) {
                this$static._optimum[++lenEnd].Price = 268435455;
              }
              curAndLenPrice = nextRepMatchPrice + (price = $GetPrice(this$static._repMatchLenEncoder, lenTest2 - 2, posStateNext), price + $GetPureRepPrice(this$static, 0, state2, posStateNext));
              optimum = this$static._optimum[offset];
              if (curAndLenPrice < optimum.Price) {
                optimum.Price = curAndLenPrice;
                optimum.PosPrev = cur + 1;
                optimum.BackPrev = 0;
                optimum.Prev1IsChar = 1;
                optimum.Prev2 = 0;
              }
            }
          }
          startLen = 2;
          for (repIndex = 0; repIndex < 4; ++repIndex) {
            lenTest = $GetMatchLen(this$static._matchFinder, -1, this$static.reps[repIndex], numAvailableBytes);
            if (lenTest < 2) {
              continue;
            }
            lenTestTemp = lenTest;
            do {
              while (lenEnd < cur + lenTest) {
                this$static._optimum[++lenEnd].Price = 268435455;
              }
              curAndLenPrice = repMatchPrice + (price_0 = $GetPrice(this$static._repMatchLenEncoder, lenTest - 2, posState), price_0 + $GetPureRepPrice(this$static, repIndex, state, posState));
              optimum = this$static._optimum[cur + lenTest];
              if (curAndLenPrice < optimum.Price) {
                optimum.Price = curAndLenPrice;
                optimum.PosPrev = cur;
                optimum.BackPrev = repIndex;
                optimum.Prev1IsChar = 0;
              }
            } while (--lenTest >= 2);
            lenTest = lenTestTemp;
            if (!repIndex) {
              startLen = lenTest + 1;
            }
            if (lenTest < numAvailableBytesFull) {
              t = Math.min(numAvailableBytesFull - 1 - lenTest, this$static._numFastBytes);
              lenTest2 = $GetMatchLen(this$static._matchFinder, lenTest, this$static.reps[repIndex], t);
              if (lenTest2 >= 2) {
                state2 = state < 7 ? 8 : 11;
                posStateNext = position + lenTest & this$static._posStateMask;
                curAndLenCharPrice = repMatchPrice + (price_1 = $GetPrice(this$static._repMatchLenEncoder, lenTest - 2, posState), price_1 + $GetPureRepPrice(this$static, repIndex, state, posState)) + ProbPrices[this$static._isMatch[(state2 << 4) + posStateNext] >>> 2] + $GetPrice_0($GetSubCoder(this$static._literalEncoder, position + lenTest, $GetIndexByte(this$static._matchFinder, lenTest - 1 - 1)), 1, $GetIndexByte(this$static._matchFinder, lenTest - 1 - (this$static.reps[repIndex] + 1)), $GetIndexByte(this$static._matchFinder, lenTest - 1));
                state2 = StateUpdateChar(state2);
                posStateNext = position + lenTest + 1 & this$static._posStateMask;
                nextMatchPrice = curAndLenCharPrice + ProbPrices[2048 - this$static._isMatch[(state2 << 4) + posStateNext] >>> 2];
                nextRepMatchPrice = nextMatchPrice + ProbPrices[2048 - this$static._isRep[state2] >>> 2];
                offset = lenTest + 1 + lenTest2;
                while (lenEnd < cur + offset) {
                  this$static._optimum[++lenEnd].Price = 268435455;
                }
                curAndLenPrice = nextRepMatchPrice + (price_2 = $GetPrice(this$static._repMatchLenEncoder, lenTest2 - 2, posStateNext), price_2 + $GetPureRepPrice(this$static, 0, state2, posStateNext));
                optimum = this$static._optimum[cur + offset];
                if (curAndLenPrice < optimum.Price) {
                  optimum.Price = curAndLenPrice;
                  optimum.PosPrev = cur + lenTest + 1;
                  optimum.BackPrev = 0;
                  optimum.Prev1IsChar = 1;
                  optimum.Prev2 = 1;
                  optimum.PosPrev2 = cur;
                  optimum.BackPrev2 = repIndex;
                }
              }
            }
          }
          if (newLen > numAvailableBytes) {
            newLen = numAvailableBytes;
            for (numDistancePairs = 0; newLen > this$static._matchDistances[numDistancePairs]; numDistancePairs += 2) {
            }
            this$static._matchDistances[numDistancePairs] = newLen;
            numDistancePairs += 2;
          }
          if (newLen >= startLen) {
            normalMatchPrice = matchPrice + ProbPrices[this$static._isRep[state] >>> 2];
            while (lenEnd < cur + newLen) {
              this$static._optimum[++lenEnd].Price = 268435455;
            }
            offs = 0;
            while (startLen > this$static._matchDistances[offs]) {
              offs += 2;
            }
            for (lenTest = startLen; ; ++lenTest) {
              curBack = this$static._matchDistances[offs + 1];
              curAndLenPrice = normalMatchPrice + $GetPosLenPrice(this$static, curBack, lenTest, posState);
              optimum = this$static._optimum[cur + lenTest];
              if (curAndLenPrice < optimum.Price) {
                optimum.Price = curAndLenPrice;
                optimum.PosPrev = cur;
                optimum.BackPrev = curBack + 4;
                optimum.Prev1IsChar = 0;
              }
              if (lenTest == this$static._matchDistances[offs]) {
                if (lenTest < numAvailableBytesFull) {
                  t = Math.min(numAvailableBytesFull - 1 - lenTest, this$static._numFastBytes);
                  lenTest2 = $GetMatchLen(this$static._matchFinder, lenTest, curBack, t);
                  if (lenTest2 >= 2) {
                    state2 = state < 7 ? 7 : 10;
                    posStateNext = position + lenTest & this$static._posStateMask;
                    curAndLenCharPrice = curAndLenPrice + ProbPrices[this$static._isMatch[(state2 << 4) + posStateNext] >>> 2] + $GetPrice_0($GetSubCoder(this$static._literalEncoder, position + lenTest, $GetIndexByte(this$static._matchFinder, lenTest - 1 - 1)), 1, $GetIndexByte(this$static._matchFinder, lenTest - (curBack + 1) - 1), $GetIndexByte(this$static._matchFinder, lenTest - 1));
                    state2 = StateUpdateChar(state2);
                    posStateNext = position + lenTest + 1 & this$static._posStateMask;
                    nextMatchPrice = curAndLenCharPrice + ProbPrices[2048 - this$static._isMatch[(state2 << 4) + posStateNext] >>> 2];
                    nextRepMatchPrice = nextMatchPrice + ProbPrices[2048 - this$static._isRep[state2] >>> 2];
                    offset = lenTest + 1 + lenTest2;
                    while (lenEnd < cur + offset) {
                      this$static._optimum[++lenEnd].Price = 268435455;
                    }
                    curAndLenPrice = nextRepMatchPrice + (price_3 = $GetPrice(this$static._repMatchLenEncoder, lenTest2 - 2, posStateNext), price_3 + $GetPureRepPrice(this$static, 0, state2, posStateNext));
                    optimum = this$static._optimum[cur + offset];
                    if (curAndLenPrice < optimum.Price) {
                      optimum.Price = curAndLenPrice;
                      optimum.PosPrev = cur + lenTest + 1;
                      optimum.BackPrev = 0;
                      optimum.Prev1IsChar = 1;
                      optimum.Prev2 = 1;
                      optimum.PosPrev2 = cur;
                      optimum.BackPrev2 = curBack + 4;
                    }
                  }
                }
                offs += 2;
                if (offs == numDistancePairs)
                  break;
              }
            }
          }
        }
      }
      function $GetPosLenPrice(this$static, pos, len, posState) {
        var price, lenToPosState = GetLenToPosState(len);
        if (pos < 128) {
          price = this$static._distancesPrices[lenToPosState * 128 + pos];
        } else {
          price = this$static._posSlotPrices[(lenToPosState << 6) + GetPosSlot2(pos)] + this$static._alignPrices[pos & 15];
        }
        return price + $GetPrice(this$static._lenEncoder, len - 2, posState);
      }
      function $GetPureRepPrice(this$static, repIndex, state, posState) {
        var price;
        if (!repIndex) {
          price = ProbPrices[this$static._isRepG0[state] >>> 2];
          price += ProbPrices[2048 - this$static._isRep0Long[(state << 4) + posState] >>> 2];
        } else {
          price = ProbPrices[2048 - this$static._isRepG0[state] >>> 2];
          if (repIndex == 1) {
            price += ProbPrices[this$static._isRepG1[state] >>> 2];
          } else {
            price += ProbPrices[2048 - this$static._isRepG1[state] >>> 2];
            price += GetPrice(this$static._isRepG2[state], repIndex - 2);
          }
        }
        return price;
      }
      function $GetRepLen1Price(this$static, state, posState) {
        return ProbPrices[this$static._isRepG0[state] >>> 2] + ProbPrices[this$static._isRep0Long[(state << 4) + posState] >>> 2];
      }
      function $Init_4(this$static) {
        $BaseInit(this$static);
        $Init_9(this$static._rangeEncoder);
        InitBitModels(this$static._isMatch);
        InitBitModels(this$static._isRep0Long);
        InitBitModels(this$static._isRep);
        InitBitModels(this$static._isRepG0);
        InitBitModels(this$static._isRepG1);
        InitBitModels(this$static._isRepG2);
        InitBitModels(this$static._posEncoders);
        $Init_3(this$static._literalEncoder);
        for (var i = 0; i < 4; ++i) {
          InitBitModels(this$static._posSlotEncoder[i].Models);
        }
        $Init_2(this$static._lenEncoder, 1 << this$static._posStateBits);
        $Init_2(this$static._repMatchLenEncoder, 1 << this$static._posStateBits);
        InitBitModels(this$static._posAlignEncoder.Models);
        this$static._longestMatchWasFound = 0;
        this$static._optimumEndIndex = 0;
        this$static._optimumCurrentIndex = 0;
        this$static._additionalOffset = 0;
      }
      function $MovePos(this$static, num) {
        if (num > 0) {
          $Skip(this$static._matchFinder, num);
          this$static._additionalOffset += num;
        }
      }
      function $ReadMatchDistances(this$static) {
        var lenRes = 0;
        this$static._numDistancePairs = $GetMatches(this$static._matchFinder, this$static._matchDistances);
        if (this$static._numDistancePairs > 0) {
          lenRes = this$static._matchDistances[this$static._numDistancePairs - 2];
          if (lenRes == this$static._numFastBytes)
            lenRes += $GetMatchLen(this$static._matchFinder, lenRes - 1, this$static._matchDistances[this$static._numDistancePairs - 1], 273 - lenRes);
        }
        ++this$static._additionalOffset;
        return lenRes;
      }
      function $ReleaseMFStream(this$static) {
        if (this$static._matchFinder && this$static._needReleaseMFStream) {
          this$static._matchFinder._stream = null;
          this$static._needReleaseMFStream = 0;
        }
      }
      function $ReleaseStreams(this$static) {
        $ReleaseMFStream(this$static);
        this$static._rangeEncoder.Stream = null;
      }
      function $SetDictionarySize_0(this$static, dictionarySize) {
        this$static._dictionarySize = dictionarySize;
        for (var dicLogSize = 0; dictionarySize > 1 << dicLogSize; ++dicLogSize) {
        }
        this$static._distTableSize = dicLogSize * 2;
      }
      function $SetMatchFinder(this$static, matchFinderIndex) {
        var matchFinderIndexPrev = this$static._matchFinderType;
        this$static._matchFinderType = matchFinderIndex;
        if (this$static._matchFinder && matchFinderIndexPrev != this$static._matchFinderType) {
          this$static._dictionarySizePrev = -1;
          this$static._matchFinder = null;
        }
      }
      function $WriteCoderProperties(this$static, outStream) {
        this$static.properties[0] = (this$static._posStateBits * 5 + this$static._numLiteralPosStateBits) * 9 + this$static._numLiteralContextBits << 24 >> 24;
        for (var i = 0; i < 4; ++i) {
          this$static.properties[1 + i] = this$static._dictionarySize >> 8 * i << 24 >> 24;
        }
        $write_0(outStream, this$static.properties, 0, 5);
      }
      function $WriteEndMarker(this$static, posState) {
        if (!this$static._writeEndMark) {
          return;
        }
        $Encode_3(this$static._rangeEncoder, this$static._isMatch, (this$static._state << 4) + posState, 1);
        $Encode_3(this$static._rangeEncoder, this$static._isRep, this$static._state, 0);
        this$static._state = this$static._state < 7 ? 7 : 10;
        $Encode_0(this$static._lenEncoder, this$static._rangeEncoder, 0, posState);
        var lenToPosState = GetLenToPosState(2);
        $Encode_2(this$static._posSlotEncoder[lenToPosState], this$static._rangeEncoder, 63);
        $EncodeDirectBits(this$static._rangeEncoder, 67108863, 26);
        $ReverseEncode(this$static._posAlignEncoder, this$static._rangeEncoder, 15);
      }
      function GetPosSlot(pos) {
        if (pos < 2048) {
          return g_FastPos[pos];
        }
        if (pos < 2097152) {
          return g_FastPos[pos >> 10] + 20;
        }
        return g_FastPos[pos >> 20] + 40;
      }
      function GetPosSlot2(pos) {
        if (pos < 131072) {
          return g_FastPos[pos >> 6] + 12;
        }
        if (pos < 134217728) {
          return g_FastPos[pos >> 16] + 32;
        }
        return g_FastPos[pos >> 26] + 52;
      }
      function $Encode(this$static, rangeEncoder, symbol, posState) {
        if (symbol < 8) {
          $Encode_3(rangeEncoder, this$static._choice, 0, 0);
          $Encode_2(this$static._lowCoder[posState], rangeEncoder, symbol);
        } else {
          symbol -= 8;
          $Encode_3(rangeEncoder, this$static._choice, 0, 1);
          if (symbol < 8) {
            $Encode_3(rangeEncoder, this$static._choice, 1, 0);
            $Encode_2(this$static._midCoder[posState], rangeEncoder, symbol);
          } else {
            $Encode_3(rangeEncoder, this$static._choice, 1, 1);
            $Encode_2(this$static._highCoder, rangeEncoder, symbol - 8);
          }
        }
      }
      function $Encoder$LenEncoder(this$static) {
        this$static._choice = initDim(2);
        this$static._lowCoder = initDim(16);
        this$static._midCoder = initDim(16);
        this$static._highCoder = $BitTreeEncoder({}, 8);
        for (var posState = 0; posState < 16; ++posState) {
          this$static._lowCoder[posState] = $BitTreeEncoder({}, 3);
          this$static._midCoder[posState] = $BitTreeEncoder({}, 3);
        }
        return this$static;
      }
      function $Init_2(this$static, numPosStates) {
        InitBitModels(this$static._choice);
        for (var posState = 0; posState < numPosStates; ++posState) {
          InitBitModels(this$static._lowCoder[posState].Models);
          InitBitModels(this$static._midCoder[posState].Models);
        }
        InitBitModels(this$static._highCoder.Models);
      }
      function $SetPrices(this$static, posState, numSymbols, prices, st) {
        var a0, a1, b0, b1, i;
        a0 = ProbPrices[this$static._choice[0] >>> 2];
        a1 = ProbPrices[2048 - this$static._choice[0] >>> 2];
        b0 = a1 + ProbPrices[this$static._choice[1] >>> 2];
        b1 = a1 + ProbPrices[2048 - this$static._choice[1] >>> 2];
        i = 0;
        for (i = 0; i < 8; ++i) {
          if (i >= numSymbols)
            return;
          prices[st + i] = a0 + $GetPrice_1(this$static._lowCoder[posState], i);
        }
        for (; i < 16; ++i) {
          if (i >= numSymbols)
            return;
          prices[st + i] = b0 + $GetPrice_1(this$static._midCoder[posState], i - 8);
        }
        for (; i < numSymbols; ++i) {
          prices[st + i] = b1 + $GetPrice_1(this$static._highCoder, i - 8 - 8);
        }
      }
      function $Encode_0(this$static, rangeEncoder, symbol, posState) {
        $Encode(this$static, rangeEncoder, symbol, posState);
        if (--this$static._counters[posState] == 0) {
          $SetPrices(this$static, posState, this$static._tableSize, this$static._prices, posState * 272);
          this$static._counters[posState] = this$static._tableSize;
        }
      }
      function $Encoder$LenPriceTableEncoder(this$static) {
        $Encoder$LenEncoder(this$static);
        this$static._prices = [];
        this$static._counters = [];
        return this$static;
      }
      function $GetPrice(this$static, symbol, posState) {
        return this$static._prices[posState * 272 + symbol];
      }
      function $UpdateTables(this$static, numPosStates) {
        for (var posState = 0; posState < numPosStates; ++posState) {
          $SetPrices(this$static, posState, this$static._tableSize, this$static._prices, posState * 272);
          this$static._counters[posState] = this$static._tableSize;
        }
      }
      function $Create_1(this$static, numPosBits, numPrevBits) {
        var i, numStates;
        if (this$static.m_Coders != null && this$static.m_NumPrevBits == numPrevBits && this$static.m_NumPosBits == numPosBits) {
          return;
        }
        this$static.m_NumPosBits = numPosBits;
        this$static.m_PosMask = (1 << numPosBits) - 1;
        this$static.m_NumPrevBits = numPrevBits;
        numStates = 1 << this$static.m_NumPrevBits + this$static.m_NumPosBits;
        this$static.m_Coders = initDim(numStates);
        for (i = 0; i < numStates; ++i) {
          this$static.m_Coders[i] = $Encoder$LiteralEncoder$Encoder2({});
        }
      }
      function $GetSubCoder(this$static, pos, prevByte) {
        return this$static.m_Coders[((pos & this$static.m_PosMask) << this$static.m_NumPrevBits) + ((prevByte & 255) >>> 8 - this$static.m_NumPrevBits)];
      }
      function $Init_3(this$static) {
        var i, numStates = 1 << this$static.m_NumPrevBits + this$static.m_NumPosBits;
        for (i = 0; i < numStates; ++i) {
          InitBitModels(this$static.m_Coders[i].m_Encoders);
        }
      }
      function $Encode_1(this$static, rangeEncoder, symbol) {
        var bit, i, context = 1;
        for (i = 7; i >= 0; --i) {
          bit = symbol >> i & 1;
          $Encode_3(rangeEncoder, this$static.m_Encoders, context, bit);
          context = context << 1 | bit;
        }
      }
      function $EncodeMatched(this$static, rangeEncoder, matchByte, symbol) {
        var bit, i, matchBit, state, same = 1, context = 1;
        for (i = 7; i >= 0; --i) {
          bit = symbol >> i & 1;
          state = context;
          if (same) {
            matchBit = matchByte >> i & 1;
            state += 1 + matchBit << 8;
            same = matchBit == bit;
          }
          $Encode_3(rangeEncoder, this$static.m_Encoders, state, bit);
          context = context << 1 | bit;
        }
      }
      function $Encoder$LiteralEncoder$Encoder2(this$static) {
        this$static.m_Encoders = initDim(768);
        return this$static;
      }
      function $GetPrice_0(this$static, matchMode, matchByte, symbol) {
        var bit, context = 1, i = 7, matchBit, price = 0;
        if (matchMode) {
          for (; i >= 0; --i) {
            matchBit = matchByte >> i & 1;
            bit = symbol >> i & 1;
            price += GetPrice(this$static.m_Encoders[(1 + matchBit << 8) + context], bit);
            context = context << 1 | bit;
            if (matchBit != bit) {
              --i;
              break;
            }
          }
        }
        for (; i >= 0; --i) {
          bit = symbol >> i & 1;
          price += GetPrice(this$static.m_Encoders[context], bit);
          context = context << 1 | bit;
        }
        return price;
      }
      function $MakeAsChar(this$static) {
        this$static.BackPrev = -1;
        this$static.Prev1IsChar = 0;
      }
      function $MakeAsShortRep(this$static) {
        this$static.BackPrev = 0;
        this$static.Prev1IsChar = 0;
      }
      function $BitTreeDecoder(this$static, numBitLevels) {
        this$static.NumBitLevels = numBitLevels;
        this$static.Models = initDim(1 << numBitLevels);
        return this$static;
      }
      function $Decode_0(this$static, rangeDecoder) {
        var bitIndex, m = 1;
        for (bitIndex = this$static.NumBitLevels; bitIndex != 0; --bitIndex) {
          m = (m << 1) + $DecodeBit(rangeDecoder, this$static.Models, m);
        }
        return m - (1 << this$static.NumBitLevels);
      }
      function $ReverseDecode(this$static, rangeDecoder) {
        var bit, bitIndex, m = 1, symbol = 0;
        for (bitIndex = 0; bitIndex < this$static.NumBitLevels; ++bitIndex) {
          bit = $DecodeBit(rangeDecoder, this$static.Models, m);
          m <<= 1;
          m += bit;
          symbol |= bit << bitIndex;
        }
        return symbol;
      }
      function ReverseDecode(Models, startIndex, rangeDecoder, NumBitLevels) {
        var bit, bitIndex, m = 1, symbol = 0;
        for (bitIndex = 0; bitIndex < NumBitLevels; ++bitIndex) {
          bit = $DecodeBit(rangeDecoder, Models, startIndex + m);
          m <<= 1;
          m += bit;
          symbol |= bit << bitIndex;
        }
        return symbol;
      }
      function $BitTreeEncoder(this$static, numBitLevels) {
        this$static.NumBitLevels = numBitLevels;
        this$static.Models = initDim(1 << numBitLevels);
        return this$static;
      }
      function $Encode_2(this$static, rangeEncoder, symbol) {
        var bit, bitIndex, m = 1;
        for (bitIndex = this$static.NumBitLevels; bitIndex != 0; ) {
          --bitIndex;
          bit = symbol >>> bitIndex & 1;
          $Encode_3(rangeEncoder, this$static.Models, m, bit);
          m = m << 1 | bit;
        }
      }
      function $GetPrice_1(this$static, symbol) {
        var bit, bitIndex, m = 1, price = 0;
        for (bitIndex = this$static.NumBitLevels; bitIndex != 0; ) {
          --bitIndex;
          bit = symbol >>> bitIndex & 1;
          price += GetPrice(this$static.Models[m], bit);
          m = (m << 1) + bit;
        }
        return price;
      }
      function $ReverseEncode(this$static, rangeEncoder, symbol) {
        var bit, i, m = 1;
        for (i = 0; i < this$static.NumBitLevels; ++i) {
          bit = symbol & 1;
          $Encode_3(rangeEncoder, this$static.Models, m, bit);
          m = m << 1 | bit;
          symbol >>= 1;
        }
      }
      function $ReverseGetPrice(this$static, symbol) {
        var bit, i, m = 1, price = 0;
        for (i = this$static.NumBitLevels; i != 0; --i) {
          bit = symbol & 1;
          symbol >>>= 1;
          price += GetPrice(this$static.Models[m], bit);
          m = m << 1 | bit;
        }
        return price;
      }
      function ReverseEncode(Models, startIndex, rangeEncoder, NumBitLevels, symbol) {
        var bit, i, m = 1;
        for (i = 0; i < NumBitLevels; ++i) {
          bit = symbol & 1;
          $Encode_3(rangeEncoder, Models, startIndex + m, bit);
          m = m << 1 | bit;
          symbol >>= 1;
        }
      }
      function ReverseGetPrice(Models, startIndex, NumBitLevels, symbol) {
        var bit, i, m = 1, price = 0;
        for (i = NumBitLevels; i != 0; --i) {
          bit = symbol & 1;
          symbol >>>= 1;
          price += ProbPrices[((Models[startIndex + m] - bit ^ -bit) & 2047) >>> 2];
          m = m << 1 | bit;
        }
        return price;
      }
      function $DecodeBit(this$static, probs, index) {
        var newBound, prob = probs[index];
        newBound = (this$static.Range >>> 11) * prob;
        if ((this$static.Code ^ -2147483648) < (newBound ^ -2147483648)) {
          this$static.Range = newBound;
          probs[index] = prob + (2048 - prob >>> 5) << 16 >> 16;
          if (!(this$static.Range & -16777216)) {
            this$static.Code = this$static.Code << 8 | $read(this$static.Stream);
            this$static.Range <<= 8;
          }
          return 0;
        } else {
          this$static.Range -= newBound;
          this$static.Code -= newBound;
          probs[index] = prob - (prob >>> 5) << 16 >> 16;
          if (!(this$static.Range & -16777216)) {
            this$static.Code = this$static.Code << 8 | $read(this$static.Stream);
            this$static.Range <<= 8;
          }
          return 1;
        }
      }
      function $DecodeDirectBits(this$static, numTotalBits) {
        var i, t, result = 0;
        for (i = numTotalBits; i != 0; --i) {
          this$static.Range >>>= 1;
          t = this$static.Code - this$static.Range >>> 31;
          this$static.Code -= this$static.Range & t - 1;
          result = result << 1 | 1 - t;
          if (!(this$static.Range & -16777216)) {
            this$static.Code = this$static.Code << 8 | $read(this$static.Stream);
            this$static.Range <<= 8;
          }
        }
        return result;
      }
      function $Init_8(this$static) {
        this$static.Code = 0;
        this$static.Range = -1;
        for (var i = 0; i < 5; ++i) {
          this$static.Code = this$static.Code << 8 | $read(this$static.Stream);
        }
      }
      function InitBitModels(probs) {
        for (var i = probs.length - 1; i >= 0; --i) {
          probs[i] = 1024;
        }
      }
      var ProbPrices = function() {
        var end, i, j, start, ProbPrices2 = [];
        for (i = 8; i >= 0; --i) {
          start = 1 << 9 - i - 1;
          end = 1 << 9 - i;
          for (j = start; j < end; ++j) {
            ProbPrices2[j] = (i << 6) + (end - j << 6 >>> 9 - i - 1);
          }
        }
        return ProbPrices2;
      }();
      function $Encode_3(this$static, probs, index, symbol) {
        var newBound, prob = probs[index];
        newBound = (this$static.Range >>> 11) * prob;
        if (!symbol) {
          this$static.Range = newBound;
          probs[index] = prob + (2048 - prob >>> 5) << 16 >> 16;
        } else {
          this$static.Low = add2(this$static.Low, and(fromInt(newBound), [4294967295, 0]));
          this$static.Range -= newBound;
          probs[index] = prob - (prob >>> 5) << 16 >> 16;
        }
        if (!(this$static.Range & -16777216)) {
          this$static.Range <<= 8;
          $ShiftLow(this$static);
        }
      }
      function $EncodeDirectBits(this$static, v, numTotalBits) {
        for (var i = numTotalBits - 1; i >= 0; --i) {
          this$static.Range >>>= 1;
          if ((v >>> i & 1) == 1) {
            this$static.Low = add2(this$static.Low, fromInt(this$static.Range));
          }
          if (!(this$static.Range & -16777216)) {
            this$static.Range <<= 8;
            $ShiftLow(this$static);
          }
        }
      }
      function $GetProcessedSizeAdd(this$static) {
        return add2(add2(fromInt(this$static._cacheSize), this$static._position), [4, 0]);
      }
      function $Init_9(this$static) {
        this$static._position = P0_longLit;
        this$static.Low = P0_longLit;
        this$static.Range = -1;
        this$static._cacheSize = 1;
        this$static._cache = 0;
      }
      function $ShiftLow(this$static) {
        var temp, LowHi = lowBits_0(shru(this$static.Low, 32));
        if (LowHi != 0 || compare(this$static.Low, [4278190080, 0]) < 0) {
          this$static._position = add2(this$static._position, fromInt(this$static._cacheSize));
          temp = this$static._cache;
          do {
            $write(this$static.Stream, temp + LowHi);
            temp = 255;
          } while (--this$static._cacheSize != 0);
          this$static._cache = lowBits_0(this$static.Low) >>> 24;
        }
        ++this$static._cacheSize;
        this$static.Low = shl(and(this$static.Low, [16777215, 0]), 8);
      }
      function GetPrice(Prob, symbol) {
        return ProbPrices[((Prob - symbol ^ -symbol) & 2047) >>> 2];
      }
      function decode(utf) {
        var i = 0, j = 0, x, y, z, l = utf.length, buf = [], charCodes = [];
        for (; i < l; ++i, ++j) {
          x = utf[i] & 255;
          if (!(x & 128)) {
            if (!x) {
              return utf;
            }
            charCodes[j] = x;
          } else if ((x & 224) == 192) {
            if (i + 1 >= l) {
              return utf;
            }
            y = utf[++i] & 255;
            if ((y & 192) != 128) {
              return utf;
            }
            charCodes[j] = (x & 31) << 6 | y & 63;
          } else if ((x & 240) == 224) {
            if (i + 2 >= l) {
              return utf;
            }
            y = utf[++i] & 255;
            if ((y & 192) != 128) {
              return utf;
            }
            z = utf[++i] & 255;
            if ((z & 192) != 128) {
              return utf;
            }
            charCodes[j] = (x & 15) << 12 | (y & 63) << 6 | z & 63;
          } else {
            return utf;
          }
          if (j == 16383) {
            buf.push(String.fromCharCode.apply(String, charCodes));
            j = -1;
          }
        }
        if (j > 0) {
          charCodes.length = j;
          buf.push(String.fromCharCode.apply(String, charCodes));
        }
        return buf.join("");
      }
      function encode(s) {
        var ch3, chars = [], data, elen = 0, i, l = s.length;
        if (typeof s == "object") {
          return s;
        } else {
          $getChars(s, 0, l, chars, 0);
        }
        for (i = 0; i < l; ++i) {
          ch3 = chars[i];
          if (ch3 >= 1 && ch3 <= 127) {
            ++elen;
          } else if (!ch3 || ch3 >= 128 && ch3 <= 2047) {
            elen += 2;
          } else {
            elen += 3;
          }
        }
        data = [];
        elen = 0;
        for (i = 0; i < l; ++i) {
          ch3 = chars[i];
          if (ch3 >= 1 && ch3 <= 127) {
            data[elen++] = ch3 << 24 >> 24;
          } else if (!ch3 || ch3 >= 128 && ch3 <= 2047) {
            data[elen++] = (192 | ch3 >> 6 & 31) << 24 >> 24;
            data[elen++] = (128 | ch3 & 63) << 24 >> 24;
          } else {
            data[elen++] = (224 | ch3 >> 12 & 15) << 24 >> 24;
            data[elen++] = (128 | ch3 >> 6 & 63) << 24 >> 24;
            data[elen++] = (128 | ch3 & 63) << 24 >> 24;
          }
        }
        return data;
      }
      function toDouble(a) {
        return a[1] + a[0];
      }
      function compress(str, mode, on_finish, on_progress) {
        var this$static = {}, percent, cbn, sync = typeof on_finish == "undefined" && typeof on_progress == "undefined";
        if (typeof on_finish != "function") {
          cbn = on_finish;
          on_finish = on_progress = 0;
        }
        on_progress = on_progress || function(percent2) {
          if (typeof cbn == "undefined")
            return;
          return update_progress(percent2, cbn);
        };
        on_finish = on_finish || function(res, err2) {
          if (typeof cbn == "undefined")
            return;
          return postMessage({
            action: action_compress,
            cbn,
            result: res,
            error: err2
          });
        };
        if (sync) {
          this$static.c = $LZMAByteArrayCompressor({}, encode(str), get_mode_obj(mode));
          while ($processChunk(this$static.c.chunker))
            ;
          return $toByteArray(this$static.c.output);
        }
        try {
          this$static.c = $LZMAByteArrayCompressor({}, encode(str), get_mode_obj(mode));
          on_progress(0);
        } catch (err2) {
          return on_finish(null, err2);
        }
        function do_action() {
          try {
            var res, start = (/* @__PURE__ */ new Date()).getTime();
            while ($processChunk(this$static.c.chunker)) {
              percent = toDouble(this$static.c.chunker.inBytesProcessed) / toDouble(this$static.c.length_0);
              if ((/* @__PURE__ */ new Date()).getTime() - start > 200) {
                on_progress(percent);
                wait(do_action, 0);
                return 0;
              }
            }
            on_progress(1);
            res = $toByteArray(this$static.c.output);
            wait(on_finish.bind(null, res), 0);
          } catch (err2) {
            on_finish(null, err2);
          }
        }
        wait(do_action, 0);
      }
      function decompress(byte_arr, on_finish, on_progress) {
        var this$static = {}, percent, cbn, has_progress, len, sync = typeof on_finish == "undefined" && typeof on_progress == "undefined";
        if (typeof on_finish != "function") {
          cbn = on_finish;
          on_finish = on_progress = 0;
        }
        on_progress = on_progress || function(percent2) {
          if (typeof cbn == "undefined")
            return;
          return update_progress(has_progress ? percent2 : -1, cbn);
        };
        on_finish = on_finish || function(res, err2) {
          if (typeof cbn == "undefined")
            return;
          return postMessage({
            action: action_decompress,
            cbn,
            result: res,
            error: err2
          });
        };
        if (sync) {
          this$static.d = $LZMAByteArrayDecompressor({}, byte_arr);
          while ($processChunk(this$static.d.chunker))
            ;
          return decode($toByteArray(this$static.d.output));
        }
        try {
          this$static.d = $LZMAByteArrayDecompressor({}, byte_arr);
          len = toDouble(this$static.d.length_0);
          has_progress = len > -1;
          on_progress(0);
        } catch (err2) {
          return on_finish(null, err2);
        }
        function do_action() {
          try {
            var res, i = 0, start = (/* @__PURE__ */ new Date()).getTime();
            while ($processChunk(this$static.d.chunker)) {
              if (++i % 1e3 == 0 && (/* @__PURE__ */ new Date()).getTime() - start > 200) {
                if (has_progress) {
                  percent = toDouble(this$static.d.chunker.decoder.nowPos64) / len;
                  on_progress(percent);
                }
                wait(do_action, 0);
                return 0;
              }
            }
            on_progress(1);
            res = decode($toByteArray(this$static.d.output));
            wait(on_finish.bind(null, res), 0);
          } catch (err2) {
            on_finish(null, err2);
          }
        }
        wait(do_action, 0);
      }
      var get_mode_obj = /* @__PURE__ */ function() {
        var modes = [
          { s: 16, f: 64, m: 0 },
          { s: 20, f: 64, m: 0 },
          { s: 19, f: 64, m: 1 },
          { s: 20, f: 64, m: 1 },
          { s: 21, f: 128, m: 1 },
          { s: 22, f: 128, m: 1 },
          { s: 23, f: 128, m: 1 },
          { s: 24, f: 255, m: 1 },
          { s: 25, f: 255, m: 1 }
        ];
        return function(mode) {
          return modes[mode - 1] || modes[6];
        };
      }();
      if (typeof onmessage != "undefined" && (typeof window == "undefined" || typeof window.document == "undefined")) {
        (function() {
          onmessage = function(e) {
            if (e && e.data) {
              if (e.data.action == action_decompress) {
                LZMA2.decompress(e.data.data, e.data.cbn);
              } else if (e.data.action == action_compress) {
                LZMA2.compress(e.data.data, e.data.mode, e.data.cbn);
              }
            }
          };
        })();
      }
      return {
        /** xs */
        compress,
        decompress
        /** xe */
        /// co:compress:   compress
        /// do:decompress: decompress
      };
    }();
    exports.LZMA = exports.LZMA_WORKER = LZMA2;
  }
});

// src/parsers/ReplayParser.ts
var import_lzma_worker = __toESM(require_lzma_worker(), 1);
var OsrReader = class {
  constructor(buffer) {
    this.offset = 0;
    this.view = new DataView(buffer);
  }
  readByte() {
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }
  readShort() {
    const val = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return val;
  }
  readInt() {
    const val = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return val;
  }
  readLong() {
    const val = this.view.getBigInt64(this.offset, true);
    this.offset += 8;
    return val;
  }
  readULEB128() {
    let result = 0;
    let shift = 0;
    while (true) {
      const byte = this.readByte();
      result |= (byte & 127) << shift;
      if ((byte & 128) === 0)
        break;
      shift += 7;
    }
    return result;
  }
  readString() {
    const marker = this.readByte();
    if (marker === 0)
      return "";
    if (marker !== 11) {
      throw new Error(`Unexpected string marker: 0x${marker.toString(16)}`);
    }
    const length = this.readULEB128();
    const bytes = new Uint8Array(this.view.buffer, this.offset, length);
    this.offset += length;
    return new TextDecoder("utf-8").decode(bytes);
  }
  readBytes(length) {
    const bytes = new Uint8Array(this.view.buffer, this.offset, length);
    this.offset += length;
    return bytes;
  }
  bytesRemaining() {
    return this.view.byteLength - this.offset;
  }
};
function decompressLzma(data) {
  return new Promise((resolve, reject) => {
    import_lzma_worker.LZMA.decompress(
      data,
      (result, error) => {
        if (error) {
          reject(error);
          return;
        }
        if (typeof result === "string") {
          const encoder = new TextEncoder();
          resolve(encoder.encode(result));
        } else {
          resolve(new Uint8Array(result));
        }
      }
    );
  });
}
async function parseReplay(buffer) {
  const reader = new OsrReader(buffer);
  const mode = reader.readByte();
  const gameVersion = reader.readInt();
  const beatmapHash = reader.readString();
  const username = reader.readString();
  const replayHash = reader.readString();
  const count300 = reader.readShort();
  const count100 = reader.readShort();
  const count50 = reader.readShort();
  const countGeki = reader.readShort();
  const countKatu = reader.readShort();
  const countMiss = reader.readShort();
  const score = reader.readInt();
  const maxCombo = reader.readShort();
  const perfect = reader.readByte() === 1;
  const mods = reader.readInt();
  const lifebarGraph = reader.readString();
  const timestamp = reader.readLong();
  const compressedDataLength = reader.readInt();
  const compressedData = reader.readBytes(compressedDataLength);
  const replayId = reader.readLong();
  let scoreInfo;
  if (reader.bytesRemaining() >= 4) {
    const scoreInfoLength = reader.readInt();
    if (scoreInfoLength > 0) {
      const scoreInfoBytes = reader.readBytes(scoreInfoLength);
      const scoreInfoJsonBytes = await decompressLzma(scoreInfoBytes);
      const scoreInfoJson = new TextDecoder("utf-8").decode(scoreInfoJsonBytes);
      scoreInfo = JSON.parse(scoreInfoJson);
    }
  }
  const decompressed = await decompressLzma(compressedData);
  const frameText = new TextDecoder("utf-8").decode(decompressed);
  const isLazer = scoreInfo !== void 0 || gameVersion >= 3e7;
  const remapLazerKeys = isLazer && mode === 0;
  const rawFrames = frameText.split(",");
  const frames = [];
  for (const raw of rawFrames) {
    const trimmed = raw.trim();
    if (!trimmed)
      continue;
    const parts = trimmed.split("|");
    if (parts.length < 4)
      continue;
    const timeDelta = parseInt(parts[0] ?? "0", 10);
    if (timeDelta === -12345)
      continue;
    const x = parseFloat(parts[1] ?? "0");
    const y = parseFloat(parts[2] ?? "0");
    let keys = parseInt(parts[3] ?? "0", 10);
    if (remapLazerKeys) {
      if (keys & 1)
        keys |= 4;
      if (keys & 2)
        keys |= 8;
    }
    frames.push({ timeDelta, x, y, keys });
  }
  return {
    mode,
    gameVersion,
    beatmapHash,
    username,
    replayHash,
    count300,
    count100,
    count50,
    countGeki,
    countKatu,
    countMiss,
    score,
    maxCombo,
    perfect,
    mods,
    lifebarGraph,
    timestamp,
    frames,
    replayId,
    scoreInfo
  };
}

// src/parsers/BeatmapParser.ts
var DEFAULT_HIT_SAMPLE = { normalSet: 0, additionSet: 0, index: 0, volume: 0, filename: "" };
function parseHitSample(raw) {
  if (raw === "" || raw === void 0)
    return DEFAULT_HIT_SAMPLE;
  const p = raw.split(":");
  return {
    normalSet: parseInt(p[0] ?? "0", 10) || 0,
    additionSet: parseInt(p[1] ?? "0", 10) || 0,
    index: parseInt(p[2] ?? "0", 10) || 0,
    volume: parseInt(p[3] ?? "0", 10) || 0,
    filename: (p[4] ?? "").trim()
  };
}
function parseBeatmap(text) {
  const data = {
    mode: 0,
    title: "",
    artist: "",
    version: "",
    audioFilename: "",
    audioLeadIn: 0,
    approachRate: 0,
    circleSize: 0,
    overallDifficulty: 0,
    hpDrainRate: 0,
    sliderMultiplier: 1,
    sliderTickRate: 1,
    stackLeniency: 0.7,
    formatVersion: 14,
    timingPoints: [],
    hitObjects: [],
    maniaHolds: [],
    breaks: []
  };
  const lines = text.split(/\r?\n/);
  let section = "";
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "")
      continue;
    const m = /^osu file format v(\d+)\s*$/i.exec(line);
    if (m)
      data.formatVersion = parseInt(m[1] ?? "14", 10) || 14;
    break;
  }
  let arExplicit = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("//"))
      continue;
    const sectionMatch = /^\[(\w+)\]$/.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1] ?? "";
      continue;
    }
    switch (section) {
      case "General": {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1)
          break;
        const key = line.slice(0, colonIdx).trim();
        const val = line.slice(colonIdx + 1).trim();
        if (key === "AudioFilename")
          data.audioFilename = val;
        else if (key === "AudioLeadIn")
          data.audioLeadIn = parseInt(val, 10) || 0;
        else if (key === "Mode") {
          const m = parseInt(val, 10);
          if (m === 0 || m === 1 || m === 2 || m === 3)
            data.mode = m;
        } else if (key === "StackLeniency") {
          const v = parseFloat(val);
          if (!isNaN(v))
            data.stackLeniency = v;
        }
        break;
      }
      case "Metadata": {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1)
          break;
        const key = line.slice(0, colonIdx).trim();
        const val = line.slice(colonIdx + 1).trim();
        if (key === "Title")
          data.title = val;
        else if (key === "Artist")
          data.artist = val;
        else if (key === "Version")
          data.version = val;
        break;
      }
      case "Difficulty": {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1)
          break;
        const key = line.slice(0, colonIdx).trim();
        const val = parseFloat(line.slice(colonIdx + 1).trim());
        if (key === "HPDrainRate")
          data.hpDrainRate = val;
        else if (key === "CircleSize")
          data.circleSize = val;
        else if (key === "OverallDifficulty")
          data.overallDifficulty = val;
        else if (key === "ApproachRate") {
          data.approachRate = val;
          arExplicit = true;
        } else if (key === "SliderMultiplier")
          data.sliderMultiplier = val;
        else if (key === "SliderTickRate")
          data.sliderTickRate = val;
        break;
      }
      case "Events": {
        const parts = line.split(",");
        if (parts.length < 3)
          break;
        const kind = (parts[0] ?? "").trim();
        if (kind !== "2" && kind.toLowerCase() !== "break")
          break;
        const startTime = parseInt(parts[1] ?? "0", 10);
        const endTime = parseInt(parts[2] ?? "0", 10);
        if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
          data.breaks.push({ startTime, endTime });
        }
        break;
      }
      case "TimingPoints": {
        const parts = line.split(",");
        if (parts.length < 2)
          break;
        const time = parseInt(parts[0] ?? "0", 10);
        const beatLength = parseFloat(parts[1] ?? "0");
        const meter = parseInt(parts[2] ?? "4", 10);
        const uninherited = parseInt(parts[6] ?? "1", 10);
        const effects = parseInt(parts[7] ?? "0", 10);
        const rawVol = parseInt(parts[5] ?? "", 10);
        const volume = Number.isFinite(rawVol) ? Math.max(0, Math.min(100, rawVol)) : 100;
        const tp = {
          time,
          beatLength,
          meter,
          inherited: uninherited === 0,
          sampleSet: parseInt(parts[3] ?? "0", 10) || 0,
          sampleIndex: parseInt(parts[4] ?? "0", 10) || 0,
          volume,
          kiai: (effects & 1) !== 0
        };
        data.timingPoints.push(tp);
        break;
      }
      case "HitObjects": {
        const parts = line.split(",");
        if (parts.length < 5)
          break;
        const x = parseInt(parts[0] ?? "0", 10);
        const y = parseInt(parts[1] ?? "0", 10);
        const time = parseInt(parts[2] ?? "0", 10);
        const typeFlags = parseInt(parts[3] ?? "0", 10);
        const hitSound = parseInt(parts[4] ?? "0", 10);
        const newCombo = (typeFlags & 4) !== 0;
        const comboSkip = typeFlags >> 4 & 7;
        let obj = null;
        if (typeFlags & 1) {
          const circle = {
            type: "circle",
            x,
            y,
            time,
            hitSound,
            hitSample: parseHitSample(parts[5] ?? ""),
            newCombo,
            comboSkip,
            stackHeight: 0
          };
          obj = circle;
        } else if (typeFlags & 2) {
          const curveRaw = parts[5] ?? "";
          const slides = parseInt(parts[6] ?? "1", 10);
          const length = parseFloat(parts[7] ?? "0");
          const pipeParts = curveRaw.split("|");
          const curveTypeChar = (pipeParts[0] ?? "B").trim();
          const curveType = ["B", "L", "P", "C"].includes(curveTypeChar) ? curveTypeChar : "B";
          const curvePoints = [{ x, y }];
          for (let i = 1; i < pipeParts.length; i++) {
            const cp = pipeParts[i]?.split(":");
            if (cp && cp.length >= 2) {
              curvePoints.push({
                x: parseInt(cp[0] ?? "0", 10),
                y: parseInt(cp[1] ?? "0", 10)
              });
            }
          }
          const edgeSoundsRaw = parts[8] ?? "";
          const edgeSounds = edgeSoundsRaw !== "" ? edgeSoundsRaw.split("|").map((s) => parseInt(s, 10) || 0) : [];
          while (edgeSounds.length < slides + 1)
            edgeSounds.push(hitSound);
          const edgeSetsRaw = parts[9] ?? "";
          const edgeSets = [];
          if (edgeSetsRaw !== "") {
            for (const entry of edgeSetsRaw.split("|")) {
              const [ns, as] = entry.split(":");
              edgeSets.push({
                normalSet: parseInt(ns ?? "0", 10) || 0,
                additionSet: parseInt(as ?? "0", 10) || 0
              });
            }
          }
          while (edgeSets.length < slides + 1)
            edgeSets.push({ normalSet: 0, additionSet: 0 });
          const slider = {
            type: "slider",
            x,
            y,
            time,
            curveType,
            curvePoints,
            slides,
            length,
            hitSound,
            hitSample: parseHitSample(parts[10] ?? ""),
            newCombo,
            comboSkip,
            edgeSounds,
            edgeSets,
            stackHeight: 0
          };
          obj = slider;
        } else if (typeFlags & 8) {
          const endTime = parseInt(parts[5] ?? "0", 10);
          const spinner = {
            type: "spinner",
            time,
            endTime,
            hitSound,
            hitSample: parseHitSample(parts[6] ?? "")
          };
          obj = spinner;
        } else if (typeFlags & 128) {
          const tailRaw = parts[5] ?? "";
          const colon = tailRaw.indexOf(":");
          const endTime = parseInt(colon === -1 ? tailRaw : tailRaw.slice(0, colon), 10);
          const sampleRaw = colon === -1 ? "" : tailRaw.slice(colon + 1);
          const hold = {
            type: "hold",
            x,
            time,
            endTime,
            hitSound,
            hitSample: parseHitSample(sampleRaw)
          };
          data.maniaHolds.push(hold);
        }
        if (obj !== null)
          data.hitObjects.push(obj);
        break;
      }
    }
  }
  if (!arExplicit)
    data.approachRate = data.overallDifficulty;
  data.timingPoints.sort((a, b) => {
    if (a.time !== b.time)
      return a.time - b.time;
    if (!a.inherited && b.inherited)
      return -1;
    if (a.inherited && !b.inherited)
      return 1;
    return 0;
  });
  data.hitObjects.sort((a, b) => a.time - b.time);
  return data;
}

// node_modules/fflate/esm/browser.js
var ch2 = {};
var wk = function(c, id, msg, transfer, cb) {
  var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
    c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
  ], { type: "text/javascript" }))));
  w.onmessage = function(e) {
    var d = e.data, ed = d.$e$;
    if (ed) {
      var err2 = new Error(ed[0]);
      err2["code"] = ed[1];
      err2.stack = ed[2];
      cb(err2, null);
    } else
      cb(null, d);
  };
  w.postMessage(msg, transfer);
  return w;
};
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add2 = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add2 = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add2;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var wcln = function(fn, fnStr, td2) {
  var dt = fn();
  var st = fn.toString();
  var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
  for (var i = 0; i < dt.length; ++i) {
    var v = dt[i], k = ks[i];
    if (typeof v == "function") {
      fnStr += ";" + k + "=";
      var st_1 = v.toString();
      if (v.prototype) {
        if (st_1.indexOf("[native code]") != -1) {
          var spInd = st_1.indexOf(" ", 8) + 1;
          fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
        } else {
          fnStr += st_1;
          for (var t in v.prototype)
            fnStr += ";" + k + ".prototype." + t + "=" + v.prototype[t].toString();
        }
      } else
        fnStr += st_1;
    } else
      td2[k] = v;
  }
  return fnStr;
};
var ch = [];
var cbfs = function(v) {
  var tl = [];
  for (var k in v) {
    if (v[k].buffer) {
      tl.push((v[k] = new v[k].constructor(v[k])).buffer);
    }
  }
  return tl;
};
var wrkr = function(fns, init, id, cb) {
  if (!ch[id]) {
    var fnStr = "", td_1 = {}, m = fns.length - 1;
    for (var i = 0; i < m; ++i)
      fnStr = wcln(fns[i], fnStr, td_1);
    ch[id] = { c: wcln(fns[m], fnStr, td_1), e: td_1 };
  }
  var td2 = mrg({}, ch[id].e);
  return wk(ch[id].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
};
var bInflt = function() {
  return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt];
};
var pbf = function(msg) {
  return postMessage(msg, [msg.buffer]);
};
var gopt = function(o) {
  return o && {
    out: o.size && new u8(o.size),
    dictionary: o.dictionary
  };
};
var cbify = function(dat, opts, fns, init, id, cb) {
  var w = wrkr(fns, init, id, function(err2, dat2) {
    w.terminate();
    cb(err2, dat2);
  });
  w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
  return function() {
    w.terminate();
  };
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflate(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  return cbify(data, opts, [
    bInflt
  ], function(ev) {
    return pbf(inflateSync(ev.data[0], gopt(ev.data[1])));
  }, 1, cb);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var mt = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
  fn();
};
function unzip(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  var term = [];
  var tAll = function() {
    for (var i2 = 0; i2 < term.length; ++i2)
      term[i2]();
  };
  var files = {};
  var cbd = function(a, b) {
    mt(function() {
      cb(a, b);
    });
  };
  mt(function() {
    cbd = cb;
  });
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558) {
      cbd(err(13, 0, 1), null);
      return tAll;
    }
  }
  ;
  var lft = b2(data, e + 8);
  if (lft) {
    var c = lft;
    var o = b4(data, e + 16);
    var z = b4(data, e - 20) == 117853008;
    if (z) {
      var ze = b4(data, e - 12);
      z = b4(data, ze) == 101075792;
      if (z) {
        c = lft = b4(data, ze + 32);
        o = b4(data, ze + 48);
      }
    }
    var fltr = opts && opts.filter;
    var _loop_3 = function(i2) {
      var _a2 = zh(data, o, z), c_1 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
      o = no;
      var cbl = function(e2, d) {
        if (e2) {
          tAll();
          cbd(e2, null);
        } else {
          if (d)
            files[fn] = d;
          if (!--lft)
            cbd(null, files);
        }
      };
      if (!fltr || fltr({
        name: fn,
        size: sc,
        originalSize: su,
        compression: c_1
      })) {
        if (!c_1)
          cbl(null, slc(data, b, b + sc));
        else if (c_1 == 8) {
          var infl = data.subarray(b, b + sc);
          if (su < 524288 || sc > 0.8 * su) {
            try {
              cbl(null, inflateSync(infl, { out: new u8(su) }));
            } catch (e2) {
              cbl(e2, null);
            }
          } else
            term.push(inflate(infl, { size: su }, cbl));
        } else
          cbl(err(14, "unknown compression type " + c_1, 1), null);
      } else
        cbl(null, null);
    };
    for (var i = 0; i < c; ++i) {
      _loop_3(i);
    }
  } else
    cbd(null, {});
  return tAll;
}

// src/utils/md5.ts
var S = [
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21
];
var K = new Uint32Array(64);
for (let i = 0; i < 64; i++) {
  K[i] = Math.abs(Math.sin(i + 1)) * 4294967296 >>> 0;
}
function rotl(x, n) {
  return x << n | x >>> 32 - n;
}
function md5(data) {
  const msgLen = data.length;
  const padLen = msgLen % 64 < 56 ? 56 - msgLen % 64 : 120 - msgLen % 64;
  const padded = new Uint8Array(msgLen + padLen + 8);
  padded.set(data);
  padded[msgLen] = 128;
  const dv = new DataView(padded.buffer);
  const bitLo = msgLen * 8 >>> 0;
  const bitHi = Math.floor(msgLen / 536870912) >>> 0;
  dv.setUint32(msgLen + padLen, bitLo, true);
  dv.setUint32(msgLen + padLen + 4, bitHi, true);
  let a0 = 1732584193;
  let b0 = 4023233417;
  let c0 = 2562383102;
  let d0 = 271733878;
  for (let blk = 0; blk < padded.length; blk += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = dv.getUint32(blk + j * 4, true);
    }
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f;
      let g;
      if (i < 16) {
        f = b & c | ~b & d;
        g = i;
      } else if (i < 32) {
        f = d & b | ~d & c;
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = 7 * i % 16;
      }
      f = f + a + K[i] + M[g] >>> 0;
      a = d;
      d = c;
      c = b;
      b = b + rotl(f, S[i]) >>> 0;
    }
    a0 = a0 + a >>> 0;
    b0 = b0 + b >>> 0;
    c0 = c0 + c >>> 0;
    d0 = d0 + d >>> 0;
  }
  let hex = "";
  for (const word of [a0, b0, c0, d0]) {
    for (let byte = 0; byte < 4; byte++) {
      hex += (word >>> byte * 8 & 255).toString(16).padStart(2, "0");
    }
  }
  return hex;
}

// src/storyboard/StoryboardParser.ts
var LATEST_FORMAT_VERSION = 14;
var MAX_PARSE_VALUE = 2147483647;
var MAX_COORDINATE_VALUE = 131072;
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([".mp4", ".mov", ".avi", ".flv", ".mpg", ".wmv", ".m4v"]);
var SECTIONS = /* @__PURE__ */ new Set([
  "General",
  "Editor",
  "Metadata",
  "Difficulty",
  "Events",
  "TimingPoints",
  "Colours",
  "HitObjects",
  "Variables",
  "Fonts",
  "CatchTheBeat",
  "Mania"
]);
var EVENT_TYPES = { Background: 0, Video: 1, Break: 2, Colour: 3, Sprite: 4, Sample: 5, Animation: 6 };
var LAYER_NAMES = ["Background", "Fail", "Pass", "Foreground", "Overlay", "Video"];
var ORIGIN_NAMES = [
  "TopLeft",
  "Centre",
  "CentreLeft",
  "TopRight",
  "BottomCentre",
  "TopCentre",
  "Custom",
  "CentreRight",
  "BottomLeft",
  "BottomRight"
];
var FLOAT_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
var INT_RE = /^[+-]?\d+$/;
function parseFloat32(input, limit = MAX_PARSE_VALUE) {
  const s = input.trim();
  if (!FLOAT_RE.test(s))
    throw new Error(`bad float "${input}"`);
  const v = Math.fround(Number(s));
  if (v < -limit || v > limit || Number.isNaN(v))
    throw new Error(`float out of range "${input}"`);
  return v;
}
function parseDouble(input, limit = MAX_PARSE_VALUE) {
  const s = input.trim();
  if (!FLOAT_RE.test(s))
    throw new Error(`bad double "${input}"`);
  const v = Number(s);
  if (v < -limit || v > limit || Number.isNaN(v))
    throw new Error(`double out of range "${input}"`);
  return v;
}
function parseInt32(input, limit = MAX_PARSE_VALUE) {
  const s = input.trim();
  if (!INT_RE.test(s))
    throw new Error(`bad int "${input}"`);
  const v = Number(s);
  if (v < -2147483648 || v > 2147483647 || v < -limit || v > limit)
    throw new Error(`int out of range "${input}"`);
  return v;
}
function parseEnum(names, value) {
  const s = value.trim();
  const i = names.indexOf(s);
  if (i >= 0)
    return i;
  if (INT_RE.test(s)) {
    const v = Number(s);
    return v >= -2147483648 && v <= 2147483647 ? v : null;
  }
  return null;
}
function cleanFilename(path) {
  return path.replace(/\\\\/g, "\\").replace(/^"+|"+$/g, "").replace(/\\/g, "/");
}
function extensionOf(path) {
  const dot = path.lastIndexOf(".");
  if (dot < 0 || dot === path.length - 1 || path.indexOf("/", dot) >= 0)
    return "";
  return path.slice(dot).toLowerCase();
}
function newGroup() {
  return {
    x: [],
    y: [],
    scale: [],
    vectorScale: [],
    rotation: [],
    colour: [],
    alpha: [],
    blending: [],
    flipH: [],
    flipV: [],
    startTime: Infinity,
    endTime: -Infinity,
    hasCommands: false
  };
}
function newLayer(name, depth, masking = true) {
  return { name, depth, masking, visibleWhenPassing: true, visibleWhenFailing: true, elements: [] };
}
function parseStoryboard(osuText, osbText = null) {
  const st = {
    formatVersion: readFormatVersion(osuText),
    variables: /* @__PURE__ */ new Map(),
    layers: /* @__PURE__ */ new Map(),
    minimumLayerDepth: 0,
    sprite: null,
    group: null,
    groupOffset: 0,
    seq: 0,
    widescreen: false,
    useSkinSprites: false,
    epilepsyWarning: false,
    backgroundFile: ""
  };
  st.layers.set("Video", newLayer("Video", 4, false));
  st.layers.set("Background", newLayer("Background", 3));
  st.layers.set("Fail", { ...newLayer("Fail", 2), visibleWhenPassing: false });
  st.layers.set("Pass", { ...newLayer("Pass", 1), visibleWhenFailing: false });
  st.layers.set("Foreground", newLayer("Foreground", 0));
  st.layers.set("Overlay", newLayer("Overlay", -2147483648));
  parseStream(st, osuText, true);
  if (osbText != null)
    parseStream(st, osbText, false);
  const layers = [...st.layers.values()].sort((a, b) => b.depth - a.depth);
  let earliest = null;
  let latest = null;
  let hasDrawable = false;
  for (const layer of layers) {
    for (const el of layer.elements) {
      if (el.kind === "sprite" || el.kind === "animation")
        finalizeSprite(el);
      else if (el.kind === "video") {
        sortGroup(el.commands);
        for (const l of el.loops)
          sortGroup(l);
        for (const t of el.triggers)
          sortGroup(t);
      }
      if (isDrawable(el))
        hasDrawable = true;
      if (el.kind === "video")
        continue;
      const start = el.kind === "sample" ? el.timeMs : el.startTime;
      const end = el.kind === "sample" ? el.timeMs : el.endTime;
      earliest = earliest == null ? start : Math.min(earliest, start);
      latest = latest == null ? end : Math.max(latest, end);
    }
  }
  const bg = st.backgroundFile.toLowerCase();
  const replacesBackground = bg !== "" && st.layers.get("Background").elements.some((e) => e.path.toLowerCase() === bg);
  return {
    widescreen: st.widescreen,
    useSkinSprites: st.useSkinSprites,
    epilepsyWarning: st.epilepsyWarning,
    backgroundFile: st.backgroundFile,
    layers,
    earliestEventTime: earliest,
    latestEventTime: latest,
    replacesBackground,
    hasDrawable
  };
}
function isDrawable(el) {
  return el.kind === "video" || el.kind === "sample" || el.isDrawable;
}
function readFormatVersion(text) {
  const m = /^\uFEFF?\s*osu file format v(\d+)/.exec(text);
  return m ? Number(m[1]) : LATEST_FORMAT_VERSION;
}
function parseStream(st, text, isPrimary) {
  if (text.charCodeAt(0) === 65279)
    text = text.slice(1);
  let section = "General";
  st.sprite = null;
  st.group = null;
  for (let line of text.split(/\r?\n/)) {
    if (line.trim() === "" || line.trimStart().startsWith("//"))
      continue;
    if (section !== "Metadata") {
      const i = line.indexOf("//");
      if (i > 0)
        line = line.slice(0, i);
    }
    line = line.trimEnd();
    if (line.startsWith("[") && line.endsWith("]")) {
      const name = line.slice(1, -1);
      section = SECTIONS.has(name) ? name : "General";
      continue;
    }
    try {
      switch (section) {
        case "General":
          handleGeneral(st, line, isPrimary);
          break;
        case "Events":
          handleEvents(st, line, isPrimary);
          break;
        case "Variables":
          handleVariables(st, line);
          break;
      }
    } catch {
    }
  }
}
function splitKeyVal(line, sep, trim) {
  const i = line.indexOf(sep);
  let key = i < 0 ? line : line.slice(0, i);
  let value = i < 0 ? "" : line.slice(i + 1);
  if (trim) {
    key = key.trim();
    value = value.trim();
  }
  return [key, value];
}
function handleGeneral(st, line, isPrimary) {
  const [key, value] = splitKeyVal(line, ":", true);
  switch (key) {
    case "UseSkinSprites":
      st.useSkinSprites = value === "1";
      break;
    case "WidescreenStoryboard":
      st.widescreen = parseInt32(value) === 1;
      break;
    case "EpilepsyWarning":
      if (isPrimary)
        st.epilepsyWarning = parseInt32(value) === 1;
      break;
  }
}
function handleVariables(st, line) {
  const [key, value] = splitKeyVal(line, "=", false);
  st.variables.set(key, value);
}
function decodeVariables(st, line) {
  if (!line.includes("$"))
    return line;
  for (const [key, value] of st.variables) {
    if (key === "")
      throw new Error("empty variable name");
    line = line.split(key).join(value);
  }
  return line;
}
function handleEvents(st, rawLine, isPrimary) {
  const line = decodeVariables(st, rawLine);
  let depth = 0;
  while (depth < line.length && (line[depth] === " " || line[depth] === "_"))
    depth++;
  const split = line.slice(depth).split(",");
  if (depth === 0) {
    st.sprite = null;
    st.group = null;
    const type = parseEnum(Object.keys(EVENT_TYPES), split[0]);
    if (type == null)
      throw new Error(`Unknown event type: ${split[0]}`);
    const source = isPrimary ? "beatmap" : "shared";
    switch (type) {
      case 0: {
        if (isPrimary)
          st.backgroundFile = cleanFilename(field(split, 2));
        break;
      }
      case 1: {
        const offset = parseInt32(field(split, 1));
        const path = cleanFilename(field(split, 2));
        if (!VIDEO_EXTENSIONS.has(extensionOf(path))) {
          if (isPrimary)
            st.backgroundFile = path;
          break;
        }
        const video = {
          kind: "video",
          path,
          offsetMs: offset,
          commands: newGroup(),
          loops: [],
          triggers: []
        };
        st.layers.get("Video").elements.push(video);
        st.sprite = video;
        st.group = video.commands;
        st.groupOffset = 0;
        break;
      }
      case 4:
      case 6: {
        const layer = parseLayer(st, field(split, 1));
        const origin = parseOrigin(field(split, 2));
        const path = cleanFilename(field(split, 3));
        const x = parseFloat32(field(split, 4), MAX_COORDINATE_VALUE);
        const y = parseFloat32(field(split, 5), MAX_COORDINATE_VALUE);
        const base = {
          source,
          path,
          origin,
          initialX: x,
          initialY: y,
          commands: newGroup(),
          loops: [],
          triggers: [],
          startTime: Infinity,
          earliestTransformTime: Infinity,
          endTime: -Infinity,
          endTimeForDisplay: -Infinity,
          isDrawable: false
        };
        let sprite;
        if (type === 4) {
          sprite = { kind: "sprite", ...base };
        } else {
          const frameCount = parseInt32(field(split, 6));
          let frameDelay = parseDouble(field(split, 7));
          if (st.formatVersion < 6)
            frameDelay = Math.round(0.015 * frameDelay) * 1.186 * Math.fround(1e3 / 60);
          const loopType = split.length > 8 ? parseAnimationLoopType(split[8]) : "LoopForever";
          sprite = { kind: "animation", ...base, frameCount, frameDelay, loopType };
        }
        if (isPrimary && st.backgroundFile === "")
          st.backgroundFile = path;
        layer.elements.push(sprite);
        st.sprite = sprite;
        st.group = sprite.commands;
        st.groupOffset = 0;
        break;
      }
      case 5: {
        const time = parseDouble(field(split, 1));
        const layer = parseLayer(st, field(split, 2));
        const path = cleanFilename(field(split, 3));
        const volume = split.length > 4 ? parseFloat32(split[4]) : 100;
        const sample = { kind: "sample", path, timeMs: time, volume: Math.trunc(volume), layer: layer.name };
        layer.elements.push(sample);
        break;
      }
    }
    return;
  }
  if (depth < 2) {
    st.group = st.sprite?.commands ?? null;
    st.groupOffset = 0;
  }
  const commandType = split[0];
  switch (commandType) {
    case "T": {
      const triggerName = field(split, 1);
      const startTime = split.length > 2 ? parseDouble(split[2]) : -Infinity;
      const endTime = split.length > 3 ? parseDouble(split[3]) : Infinity;
      const groupNumber = split.length > 4 ? -parseInt32(split[4]) : 0;
      if (st.sprite) {
        const g = { ...newGroup(), triggerName, triggerStartTime: startTime, triggerEndTime: endTime, groupNumber };
        st.sprite.triggers.push(g);
        st.group = g;
        st.groupOffset = 0;
      } else {
        st.group = null;
      }
      break;
    }
    case "L": {
      const startTime = parseDouble(field(split, 1));
      const repeatCount = parseInt32(field(split, 2));
      if (st.sprite) {
        const g = { ...newGroup(), loopStartTime: startTime, totalIterations: Math.max(0, repeatCount - 1) + 1 };
        st.sprite.loops.push(g);
        st.group = g;
        st.groupOffset = startTime;
      } else {
        st.group = null;
      }
      break;
    }
    default: {
      if (split.length < 4)
        throw new Error("too few fields");
      if (split[3] === "")
        split[3] = split[2];
      const easing = parseInt32(split[1]);
      const startTime = parseDouble(split[2]);
      const endTime = parseDouble(split[3]);
      const g = st.group;
      switch (commandType) {
        case "F": {
          const s = parseFloat32(field(split, 4));
          const e = split.length > 5 ? parseFloat32(split[5]) : s;
          if (g)
            add(st, g, g.alpha, easing, startTime, endTime, s, e);
          break;
        }
        case "S": {
          const s = parseFloat32(field(split, 4));
          const e = split.length > 5 ? parseFloat32(split[5]) : s;
          if (g)
            add(st, g, g.scale, easing, startTime, endTime, s, e);
          break;
        }
        case "V": {
          const sx = parseFloat32(field(split, 4));
          const sy = parseFloat32(field(split, 5));
          const ex = split.length > 6 ? parseFloat32(split[6]) : sx;
          const ey = split.length > 7 ? parseFloat32(split[7]) : sy;
          if (g)
            add(st, g, g.vectorScale, easing, startTime, endTime, [sx, sy], [ex, ey]);
          break;
        }
        case "R": {
          const s = parseFloat32(field(split, 4));
          const e = split.length > 5 ? parseFloat32(split[5]) : s;
          if (g)
            add(st, g, g.rotation, easing, startTime, endTime, s, e);
          break;
        }
        case "M": {
          const sx = parseFloat32(field(split, 4));
          const sy = parseFloat32(field(split, 5));
          const ex = split.length > 6 ? parseFloat32(split[6]) : sx;
          const ey = split.length > 7 ? parseFloat32(split[7]) : sy;
          if (g) {
            add(st, g, g.x, easing, startTime, endTime, sx, ex);
            add(st, g, g.y, easing, startTime, endTime, sy, ey);
          }
          break;
        }
        case "MX": {
          const s = parseFloat32(field(split, 4));
          const e = split.length > 5 ? parseFloat32(split[5]) : s;
          if (g)
            add(st, g, g.x, easing, startTime, endTime, s, e);
          break;
        }
        case "MY": {
          const s = parseFloat32(field(split, 4));
          const e = split.length > 5 ? parseFloat32(split[5]) : s;
          if (g)
            add(st, g, g.y, easing, startTime, endTime, s, e);
          break;
        }
        case "C": {
          const sr = parseFloat32(field(split, 4));
          const sg = parseFloat32(field(split, 5));
          const sb = parseFloat32(field(split, 6));
          const er = split.length > 7 ? parseFloat32(split[7]) : sr;
          const eg = split.length > 8 ? parseFloat32(split[8]) : sg;
          const eb = split.length > 9 ? parseFloat32(split[9]) : sb;
          if (g)
            add(st, g, g.colour, easing, startTime, endTime, [sr / 255, sg / 255, sb / 255], [er / 255, eg / 255, eb / 255]);
          break;
        }
        case "P": {
          const type = field(split, 4);
          if (!g)
            break;
          const instant = startTime === endTime;
          switch (type) {
            case "A":
              add(st, g, g.blending, easing, startTime, endTime, "additive", instant ? "additive" : "inherit");
              break;
            case "H":
              add(st, g, g.flipH, easing, startTime, endTime, true, instant);
              break;
            case "V":
              add(st, g, g.flipV, easing, startTime, endTime, true, instant);
              break;
          }
          break;
        }
        default:
          throw new Error(`Unknown command type: ${commandType}`);
      }
    }
  }
}
function field(split, i) {
  const v = split[i];
  if (v === void 0)
    throw new Error(`missing field ${i}`);
  return v;
}
function add(st, g, list, easing, startTime, endTime, startValue, endValue) {
  startTime += st.groupOffset;
  endTime += st.groupOffset;
  if (endTime < startTime)
    endTime = startTime;
  list.push({ easing, startTime, endTime, startValue, endValue, seq: st.seq++ });
  g.hasCommands = true;
  if (startTime < g.startTime)
    g.startTime = startTime;
  if (endTime > g.endTime)
    g.endTime = endTime;
}
function parseLayer(st, value) {
  const v = parseEnum(LAYER_NAMES, value);
  if (v == null)
    throw new Error(`Unknown layer: ${value}`);
  const name = LAYER_NAMES[v] ?? String(v);
  let layer = st.layers.get(name);
  if (!layer) {
    layer = newLayer(name, --st.minimumLayerDepth);
    st.layers.set(name, layer);
  }
  return layer;
}
function parseOrigin(value) {
  const v = parseEnum(ORIGIN_NAMES, value);
  if (v == null)
    throw new Error(`Unknown origin: ${value}`);
  const name = ORIGIN_NAMES[v];
  return name === void 0 || name === "Custom" ? "TopLeft" : name;
}
function parseAnimationLoopType(value) {
  const v = parseEnum(["LoopForever", "LoopOnce"], value);
  if (v == null)
    throw new Error(`Unknown loop type: ${value}`);
  return v === 1 ? "LoopOnce" : "LoopForever";
}
function sortGroup(g) {
  const byTime = (a, b) => a.startTime - b.startTime || a.endTime - b.endTime || a.seq - b.seq;
  g.x.sort(byTime);
  g.y.sort(byTime);
  g.scale.sort(byTime);
  g.vectorScale.sort(byTime);
  g.rotation.sort(byTime);
  g.colour.sort(byTime);
  g.alpha.sort(byTime);
  g.blending.sort(byTime);
  g.flipH.sort(byTime);
  g.flipV.sort(byTime);
}
function finalizeSprite(s) {
  sortGroup(s.commands);
  for (const l of s.loops)
    sortGroup(l);
  for (const t of s.triggers)
    sortGroup(t);
  let earliest = s.commands.startTime;
  let end = s.commands.endTime;
  let endForDisplay = s.commands.endTime;
  for (const l of s.loops) {
    earliest = Math.min(earliest, l.startTime);
    end = Math.max(end, l.endTime);
    if (l.hasCommands)
      endForDisplay = Math.max(endForDisplay, l.startTime + (l.endTime - l.startTime) * l.totalIterations);
  }
  s.earliestTransformTime = earliest;
  s.endTime = end;
  s.endTimeForDisplay = endForDisplay;
  s.isDrawable = s.commands.hasCommands || s.loops.some((l) => l.hasCommands);
  const visible = (c) => c.startValue > 0 || c.endValue > 0;
  const alphas = [];
  const scan = (list) => {
    for (const c of list) {
      alphas.push(c);
      if (visible(c))
        break;
    }
  };
  scan(s.commands.alpha);
  for (const l of s.loops)
    scan(l.alpha);
  s.startTime = earliest;
  if (alphas.length > 0) {
    let first = alphas[0];
    let firstReal = null;
    for (const c of alphas) {
      if (c.startTime < first.startTime)
        first = c;
      if (visible(c) && (firstReal == null || c.startTime < firstReal.startTime))
        firstReal = c;
    }
    if (first.startValue === 0 && firstReal != null)
      s.startTime = firstReal.startTime;
  }
}

// src/utils/modIcons.ts
var MOD_TYPE_COLOUR = {
  DifficultyReduction: "#b2ff66",
  DifficultyIncrease: "#ff6666",
  Automation: "#66ccff",
  Conversion: "#8c66ff",
  Fun: "#ff66ab",
  System: "#ffcc22"
};
var MOD_ICON_SPECS = [
  { acronym: "NF", bit: 1 << 0, stem: "nofail", type: "DifficultyReduction" },
  { acronym: "EZ", bit: 1 << 1, stem: "easy", type: "DifficultyReduction" },
  { acronym: "HD", bit: 1 << 3, stem: "hidden", type: "DifficultyIncrease" },
  { acronym: "HR", bit: 1 << 4, stem: "hardrock", type: "DifficultyIncrease" },
  { acronym: "SD", bit: 1 << 5, stem: "suddendeath", type: "DifficultyIncrease" },
  { acronym: "PF", bit: 1 << 14, stem: "perfect", glyph: "mod-perfect", type: "DifficultyIncrease" },
  { acronym: "DT", bit: 1 << 6, stem: "doubletime", glyph: "mod-double-time", type: "DifficultyIncrease" },
  { acronym: "NC", bit: 1 << 9, stem: "nightcore", glyph: "mod-nightcore", type: "DifficultyIncrease" },
  { acronym: "HT", bit: 1 << 8, stem: "halftime", glyph: "mod-half-time", type: "DifficultyReduction" },
  { acronym: "DC", glyph: "mod-daycore", type: "DifficultyReduction" },
  { acronym: "RX", bit: 1 << 7, stem: "relax", type: "Automation" },
  { acronym: "FL", bit: 1 << 10, stem: "flashlight", type: "DifficultyIncrease" },
  { acronym: "SO", bit: 1 << 12, stem: "spunout", type: "Automation" },
  { acronym: "CL", glyph: "mod-classic", type: "Conversion" },
  { acronym: "DA", glyph: "mod-difficulty-adjust", type: "Conversion" },
  { acronym: "AC", glyph: "mod-accuracy-challenge", type: "DifficultyIncrease" },
  // Mania: FadeIn = 1<<20, Mirror = 1<<30 in the stable Mods enum; Cover is lazer-only.
  { acronym: "FI", bit: 1 << 20, stem: "fadein", glyph: "mod-fade-in", type: "DifficultyIncrease" },
  { acronym: "MR", bit: 1 << 30, stem: "mirror", glyph: "mod-mirror", type: "Conversion" },
  { acronym: "CO", glyph: "mod-cover", type: "DifficultyIncrease" }
];
var DEFAULT_RATE = { DT: 1.5, NC: 1.5, HT: 0.75, DC: 0.75 };
var DA_SETTINGS = [
  ["circle_size", "CS"],
  ["approach_rate", "AR"],
  ["overall_difficulty", "OD"],
  ["drain_rate", "HP"]
];
function extendedModIconInfo(mod) {
  const s = mod.settings;
  if (s === void 0)
    return "";
  const defaultRate = DEFAULT_RATE[mod.acronym];
  if (defaultRate !== void 0) {
    const rate = s["speed_change"];
    return typeof rate === "number" && rate !== defaultRate ? `${rate.toFixed(2)}x` : "";
  }
  if (mod.acronym === "DA") {
    const changed = DA_SETTINGS.filter(([key2]) => typeof s[key2] === "number");
    if (changed.length !== 1)
      return "";
    const [key, label] = changed[0];
    const value = s[key];
    return `${label}${(Math.round(value * 10) / 10).toString()}`;
  }
  return "";
}
function scaleColour(hex, k) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
}
function tinted(src, colour) {
  const osc = new OffscreenCanvas(src.width, src.height);
  const oc = osc.getContext("2d");
  oc.drawImage(src, 0, 0);
  oc.globalCompositeOperation = "source-in";
  oc.fillStyle = colour;
  oc.fillRect(0, 0, src.width, src.height);
  return osc;
}
var UNIT = 135 / 80;
var EXT_X = (80 - 22) * UNIT;
var EXT_W = 116 * UNIT;
var EXT_TEXT_DX = 6 * UNIT;
var EXT_FONT_PX = 46;
function composeModIcon(textures, spec, extended = "") {
  const glyph = textures.glyphs.get(spec.acronym);
  if (glyph === void 0)
    return void 0;
  const colour = MOD_TYPE_COLOUR[spec.type];
  const { badge, extender } = textures;
  const withExt = extended !== "" && extender !== null;
  const width = withExt ? Math.round(EXT_X + EXT_W) : badge.width;
  const osc = new OffscreenCanvas(width, badge.height);
  const oc = osc.getContext("2d");
  if (withExt) {
    const extH = extender.height * (EXT_W / extender.width);
    oc.drawImage(tinted(extender, scaleColour(colour, 1 / 3.8)), EXT_X, (badge.height - extH) / 2, EXT_W, extH);
    oc.font = `bold ${EXT_FONT_PX}px sans-serif`;
    oc.textAlign = "center";
    oc.textBaseline = "middle";
    oc.fillStyle = colour;
    oc.fillText(extended, EXT_X + EXT_W / 2 + EXT_TEXT_DX, badge.height / 2, EXT_W - 22 * UNIT - 8);
  }
  oc.drawImage(tinted(badge, colour), 0, 0);
  const gh = glyph.height * (badge.width / glyph.width);
  oc.drawImage(tinted(glyph, scaleColour(colour, 0.1)), 0, (badge.height - gh) / 2, badge.width, gh);
  return osc.transferToImageBitmap();
}
function activeModAcronyms(mods, lazerMods) {
  const active = /* @__PURE__ */ new Set();
  if (lazerMods !== void 0 && lazerMods.length > 0) {
    for (const mod of lazerMods)
      active.add(mod.acronym);
  } else {
    for (const spec of MOD_ICON_SPECS) {
      if (spec.bit !== void 0 && (mods & spec.bit) !== 0)
        active.add(spec.acronym);
    }
  }
  if (active.has("NC"))
    active.delete("DT");
  if (active.has("PF"))
    active.delete("SD");
  const out = [];
  for (const spec of MOD_ICON_SPECS)
    if (active.has(spec.acronym))
      out.push(spec.acronym);
  return out;
}

// src/parsers/SkinLoader.ts
function rgbaFromCsv(val) {
  const parts = val.split(",").map((p) => parseInt(p.trim(), 10));
  if (parts.length < 3)
    return void 0;
  const [r, g, b] = parts;
  const a = parts.length >= 4 ? parts[3] : 255;
  if ([r, g, b, a].some((v) => Number.isNaN(v)))
    return void 0;
  const hex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`;
}
function rgbFromCsv(val) {
  const parts = val.split(",").map((p) => parseInt(p.trim(), 10));
  if (parts.length < 3)
    return void 0;
  const [r, g, b] = parts;
  if ([r, g, b].some((v) => Number.isNaN(v)))
    return void 0;
  const hex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}
function parseNumberList(val) {
  return val.split(",").map((p) => {
    const n = parseFloat(p.trim());
    return Number.isFinite(n) ? n : 0;
  });
}
function freshManiaSection() {
  return {
    keys: 0,
    imageLookups: {},
    colours: [],
    coloursLight: []
  };
}
function applyManiaKey(s, key, val) {
  if (/^(NoteImage|KeyImage)\d+/i.test(key) || /^Stage(Hint|Light)$/i.test(key) || /^Lighting[NL]$/i.test(key)) {
    s.imageLookups[key.toLowerCase()] = val.replace(/\\/g, "/").toLowerCase();
    return;
  }
  const colourM = /^Colour(\d+)$/i.exec(key);
  const colourLightM = /^ColourLight(\d+)$/i.exec(key);
  if (colourM) {
    const idx = parseInt(colourM[1], 10) - 1;
    if (idx >= 0) {
      const c = rgbaFromCsv(val);
      if (c !== void 0)
        s.colours[idx] = c;
    }
    return;
  }
  if (colourLightM) {
    const idx = parseInt(colourLightM[1], 10) - 1;
    if (idx >= 0) {
      const c = rgbaFromCsv(val);
      if (c !== void 0)
        s.coloursLight[idx] = c;
    }
    return;
  }
  if (/^ColourColumnLine$/i.test(key)) {
    const c = rgbaFromCsv(val);
    if (c)
      s.colourColumnLine = c;
    return;
  }
  if (/^JudgementLineColour$/i.test(key)) {
    const c = rgbaFromCsv(val);
    if (c)
      s.judgementLineColour = c;
    return;
  }
  if (/^HitPosition$/i.test(key)) {
    const n = parseFloat(val);
    if (Number.isFinite(n))
      s.hitPosition = n;
    return;
  }
  if (/^ColumnWidth$/i.test(key)) {
    s.columnWidth = parseNumberList(val);
    return;
  }
  if (/^ColumnSpacing$/i.test(key)) {
    s.columnSpacing = parseNumberList(val);
    return;
  }
  if (/^ColumnLineWidth$/i.test(key)) {
    s.columnLineWidth = parseNumberList(val);
    return;
  }
  if (/^BarlineHeight$/i.test(key)) {
    const n = parseFloat(val);
    if (Number.isFinite(n))
      s.barlineHeight = n;
    return;
  }
  if (/^JudgementLine$/i.test(key)) {
    s.judgementLine = /^(1|true|yes)$/i.test(val.trim());
    return;
  }
  if (/^KeysUnderNotes$/i.test(key)) {
    s.keysUnderNotes = /^(1|true|yes)$/i.test(val.trim());
    return;
  }
  if (/^UpsideDown$/i.test(key)) {
    s.upsideDown = /^(1|true|yes)$/i.test(val.trim());
    return;
  }
  if (/^LightPosition$/i.test(key)) {
    const n = parseFloat(val);
    if (Number.isFinite(n))
      s.lightPosition = n;
    return;
  }
  if (/^ScorePosition$/i.test(key)) {
    const n = parseFloat(val);
    if (Number.isFinite(n))
      s.scorePosition = n;
    return;
  }
  if (/^ComboPosition$/i.test(key)) {
    const n = parseFloat(val);
    if (Number.isFinite(n))
      s.comboPosition = n;
    return;
  }
  if (/^NoteBodyStyle$/i.test(key)) {
    const n = parseInt(val, 10);
    if (n === 0 || n === 2 || n === 3 || n === 4)
      s.noteBodyStyle = n;
    return;
  }
  if (/^WidthForNoteHeightScale$/i.test(key)) {
    const n = parseFloat(val);
    if (Number.isFinite(n))
      s.widthForNoteHeightScale = n;
    return;
  }
  if (/^LightFramePerSecond$/i.test(key)) {
    const n = parseFloat(val);
    if (Number.isFinite(n))
      s.lightFramePerSecond = n;
    return;
  }
}
function parseSkinIni(text) {
  const sparse = [];
  let hitCircleOverlap = -2;
  let hitCirclePrefix = "default";
  let scorePrefix = "score";
  let comboPrefix = "score";
  let sliderBorder = "#ffffff";
  let sliderTrackOverride = null;
  let allowSliderBallTint = false;
  let name = "";
  let version = "";
  let section = "";
  const parseBool = (val) => {
    const v = val.trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes";
  };
  const normalizePrefix = (val) => val.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
  const maniaSections = [];
  let currentMania = null;
  const commitMania = () => {
    if (currentMania !== null && currentMania.keys > 0) {
      maniaSections.push(currentMania);
    }
    currentMania = null;
  };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("//"))
      continue;
    if (line.startsWith("[")) {
      commitMania();
      section = line.toLowerCase();
      if (section === "[mania]")
        currentMania = freshManiaSection();
      continue;
    }
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1)
      continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (section === "[general]") {
      if (/^Name$/i.test(key))
        name = val;
      else if (/^Version$/i.test(key))
        version = val;
      else if (/^AllowSliderBallTint$/i.test(key))
        allowSliderBallTint = parseBool(val);
    } else if (section === "[colours]") {
      const comboMatch = /^Combo(\d+)$/i.exec(key);
      if (comboMatch) {
        const idx = parseInt(comboMatch[1], 10) - 1;
        const c = rgbFromCsv(val);
        if (c !== void 0)
          sparse[idx] = c;
      } else if (/^SliderBorder$/i.test(key)) {
        const c = rgbFromCsv(val);
        if (c !== void 0)
          sliderBorder = c;
      } else if (/^SliderTrackOverride$/i.test(key)) {
        const c = rgbFromCsv(val);
        if (c !== void 0)
          sliderTrackOverride = c;
      }
    } else if (section === "[fonts]") {
      if (/^HitCircleOverlap$/i.test(key)) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed))
          hitCircleOverlap = parsed;
      } else if (/^HitCirclePrefix$/i.test(key) && val !== "") {
        hitCirclePrefix = normalizePrefix(val);
      } else if (/^ScorePrefix$/i.test(key) && val !== "") {
        scorePrefix = normalizePrefix(val);
      } else if (/^ComboPrefix$/i.test(key) && val !== "") {
        comboPrefix = normalizePrefix(val);
      }
    } else if (section === "[mania]" && currentMania !== null) {
      if (/^Keys$/i.test(key)) {
        const n = parseInt(val, 10);
        if (Number.isFinite(n) && n > 0)
          currentMania.keys = n;
      } else {
        applyManiaKey(currentMania, key, val);
      }
    }
  }
  commitMania();
  const comboColors = sparse.filter((c) => c !== void 0);
  return {
    comboColors,
    hitCircleOverlap,
    hitCirclePrefix,
    scorePrefix,
    comboPrefix,
    sliderBorder,
    sliderTrackOverride,
    allowSliderBallTint,
    name,
    version,
    maniaSections
  };
}
var DECODE_CONCURRENCY = 12;
async function runPooled(tasks) {
  let next = 0;
  const runner = async () => {
    while (next < tasks.length) {
      const task = tasks[next++];
      await task();
    }
  };
  const width = Math.min(DECODE_CONCURRENCY, tasks.length);
  await Promise.all(Array.from({ length: width }, runner));
}
async function decodeSkinEntries(entries, audioCtx) {
  const images = /* @__PURE__ */ new Map();
  const sounds = /* @__PURE__ */ new Map();
  let config = {
    comboColors: [],
    hitCircleOverlap: -2,
    hitCirclePrefix: "default",
    scorePrefix: "score",
    comboPrefix: "score",
    sliderBorder: "#ffffff",
    sliderTrackOverride: null,
    allowSliderBallTint: false,
    name: "",
    version: "",
    maniaSections: []
  };
  const normalized = Object.entries(entries).map(
    ([name, bytes]) => [name.replace(/\\/g, "/").toLowerCase(), bytes]
  );
  const skinIniEntry = normalized.find(([name]) => name === "skin.ini");
  if (skinIniEntry) {
    const iniText = new TextDecoder("utf-8").decode(skinIniEntry[1]);
    config = parseSkinIni(iniText);
  }
  const imageEntries = normalized.filter(
    ([name]) => name.endsWith(".png") || name.endsWith(".jpg")
  );
  const audioEntries = audioCtx !== void 0 ? normalized.filter(([name]) => {
    return name.endsWith(".wav") || name.endsWith(".mp3") || name.endsWith(".ogg");
  }) : [];
  const decodeTasks = [
    ...imageEntries.map(([name, bytes]) => async () => {
      const ext = name.endsWith(".png") ? "image/png" : "image/jpeg";
      const blob = new Blob([bytes], { type: ext });
      try {
        images.set(name, await createImageBitmap(blob));
      } catch (err2) {
        console.warn(`SkinLoader: could not decode image '${name}':`, err2);
      }
    }),
    ...audioEntries.map(([name, bytes]) => async () => {
      if (audioCtx === void 0)
        return;
      try {
        const copy = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        );
        const audioBuf = await audioCtx.decodeAudioData(copy);
        const basename = name.split("/").pop() ?? name;
        sounds.set(basename, audioBuf);
      } catch {
      }
    })
  ];
  await runPooled(decodeTasks);
  return { images, sounds, config, spinnerImages: /* @__PURE__ */ new Map() };
}
async function loadSkin(buffer, audioCtx) {
  const files = await unzipAsync(new Uint8Array(buffer));
  return decodeSkinEntries(files, audioCtx);
}
var audioStemOf = (key) => key.replace(/\.(wav|mp3|ogg)$/i, "");
function mergeSounds(base, overlay) {
  const overlayStems = /* @__PURE__ */ new Set();
  for (const key of overlay.keys())
    overlayStems.add(audioStemOf(key));
  const merged = /* @__PURE__ */ new Map();
  for (const [key, val] of base) {
    if (overlayStems.has(audioStemOf(key)))
      continue;
    merged.set(key, val);
  }
  for (const [key, val] of overlay)
    merged.set(key, val);
  return merged;
}
function mergeSkinAssets(base, overlay) {
  const overlayStems = /* @__PURE__ */ new Set();
  const overlayFamilyRoots = /* @__PURE__ */ new Set();
  const stemOf = (key) => key.replace(/@2x\.png$|\.png$/i, "").toLowerCase();
  const familyOf = (stem) => stem.replace(/-\d+$/, "");
  for (const key of overlay.images.keys()) {
    const stem = stemOf(key);
    overlayStems.add(stem);
    overlayFamilyRoots.add(familyOf(stem));
  }
  if (overlayStems.has("cursor"))
    overlayStems.add("cursormiddle");
  const mergedImages = /* @__PURE__ */ new Map();
  for (const [key, val] of base.images) {
    const stem = stemOf(key);
    if (overlayStems.has(stem))
      continue;
    if (overlayFamilyRoots.has(familyOf(stem)))
      continue;
    mergedImages.set(key, val);
  }
  for (const [key, val] of overlay.images) {
    mergedImages.set(key, val);
  }
  return {
    images: mergedImages,
    sounds: mergeSounds(base.sounds, overlay.sounds),
    config: overlay.config,
    spinnerImages: /* @__PURE__ */ new Map()
  };
}
var _lazerDefaultSounds = null;
var _lazerDefaultLoadInFlight = null;
var LAZER_DEFAULT_STEMS = [
  "normal-hitnormal",
  "normal-hitwhistle",
  "normal-hitfinish",
  "normal-hitclap",
  "soft-hitnormal",
  "soft-hitwhistle",
  "soft-hitfinish",
  "soft-hitclap",
  "drum-hitnormal",
  "drum-hitwhistle",
  "drum-hitfinish",
  "drum-hitclap"
];
async function loadLazerDefaultSounds(audioCtx, baseUrl = "skins/lazer-defaults") {
  if (_lazerDefaultSounds !== null)
    return _lazerDefaultSounds;
  if (_lazerDefaultLoadInFlight !== null)
    return _lazerDefaultLoadInFlight;
  _lazerDefaultLoadInFlight = (async () => {
    const out = /* @__PURE__ */ new Map();
    await Promise.all(LAZER_DEFAULT_STEMS.map(async (stem) => {
      try {
        const resp = await fetch(`${baseUrl}/${stem}.wav`);
        if (!resp.ok)
          return;
        const buf = await resp.arrayBuffer();
        out.set(`${stem}.wav`, await audioCtx.decodeAudioData(buf));
      } catch {
      }
    }));
    _lazerDefaultSounds = out;
    return out;
  })();
  return _lazerDefaultLoadInFlight;
}
var _lazerDefaultModIcons = null;
var _lazerDefaultModIconLoadInFlight = null;
async function loadLazerDefaultModIcons(baseUrl = "skins/lazer-defaults") {
  if (_lazerDefaultModIcons !== null)
    return _lazerDefaultModIcons;
  if (_lazerDefaultModIconLoadInFlight !== null)
    return _lazerDefaultModIconLoadInFlight;
  _lazerDefaultModIconLoadInFlight = (async () => {
    const fetchBitmap = async (name) => {
      try {
        const resp = await fetch(`${baseUrl}/mods/${name}.png`);
        if (!resp.ok)
          return null;
        return await createImageBitmap(await resp.blob());
      } catch {
        return null;
      }
    };
    const [badge, extender] = await Promise.all([fetchBitmap("mod-icon"), fetchBitmap("mod-icon-extender")]);
    if (badge === null)
      return null;
    const glyphs = /* @__PURE__ */ new Map();
    await Promise.all(MOD_ICON_SPECS.map(async (spec) => {
      if (spec.glyph === void 0)
        return;
      const glyph = await fetchBitmap(spec.glyph);
      if (glyph !== null)
        glyphs.set(spec.acronym, glyph);
    }));
    _lazerDefaultModIcons = { badge, extender, glyphs };
    return _lazerDefaultModIcons;
  })();
  return _lazerDefaultModIconLoadInFlight;
}
async function loadSkinFromDir(baseUrl, audioCtx) {
  const indexResp = await fetch(`${baseUrl}/index.json`);
  if (!indexResp.ok) {
    throw new Error(`Failed to load skin index at ${baseUrl}/index.json (${indexResp.status})`);
  }
  const { files: fileList } = await indexResp.json();
  const entries = {};
  await Promise.all(fileList.map(async (name) => {
    const url = `${baseUrl}/${name.split("/").map(encodeURIComponent).join("/")}`;
    const resp = await fetch(url);
    if (!resp.ok)
      return;
    entries[name] = new Uint8Array(await resp.arrayBuffer());
  }));
  return decodeSkinEntries(entries, audioCtx);
}

// src/storyboard/StoryboardAssets.ts
var IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
var AUDIO_EXTENSIONS = [".mp3", ".ogg", ".wav"];
var STORYBOARD_BITMAP_BUDGET_BYTES = 256 * 1024 * 1024;
var SB_SCALE = 720 / 480;
var DEFAULT_DECODE_QUALITY = 1;
var MIN_BUDGET_FACTOR = 0.5;
function storyboardFilename(meta) {
  const audioStem = meta.audioFilename.replace(/^.*[\\/]/, "").replace(/\.[^.]*$/, "");
  const base = (meta.artist.length > 0 ? `${meta.artist} - ${meta.title}` : audioStem) + (meta.creator.length > 0 ? ` (${meta.creator})` : "") + ".osb";
  return base.replace(/[\x00-\x1f"<>|:*?\\/]/g, "");
}
function normaliseStoryboardPath(path) {
  let p = path.replace(/\\/g, "/").toLowerCase();
  while (p.startsWith("./"))
    p = p.slice(2);
  return p;
}
function hasExtension(path) {
  const dot = path.lastIndexOf(".");
  return dot >= 0 && dot < path.length - 1 && path.indexOf("/", dot) < 0;
}
function resolveStoryboardPath(index, path, kind) {
  const key = normaliseStoryboardPath(path);
  if (key === "")
    return null;
  if (index.has(key))
    return key;
  if (hasExtension(key) || kind === "video")
    return null;
  const exts = kind === "image" ? IMAGE_EXTENSIONS : AUDIO_EXTENSIONS;
  for (const ext of exts) {
    if (index.has(key + ext))
      return key + ext;
  }
  return null;
}
function animationFramePath(path, index) {
  const dot = path.lastIndexOf(".");
  if (dot < 0 || path.indexOf("/", dot) >= 0)
    return `${path}${index}`;
  return `${path.slice(0, dot)}${index}${path.slice(dot)}`;
}
function maxScaleOf(groups) {
  let max2 = 0;
  for (const g of groups) {
    for (const c of g.scale)
      max2 = Math.max(max2, Math.abs(c.startValue), Math.abs(c.endValue));
    for (const c of g.vectorScale) {
      max2 = Math.max(max2, Math.abs(c.startValue[0]), Math.abs(c.startValue[1]), Math.abs(c.endValue[0]), Math.abs(c.endValue[1]));
    }
  }
  return max2 > 0 ? max2 : 1;
}
function collectStoryboardPaths(data) {
  const images = /* @__PURE__ */ new Map();
  const samples = /* @__PURE__ */ new Set();
  const videos = /* @__PURE__ */ new Set();
  const addImage = (path, scale) => {
    const key = normaliseStoryboardPath(path);
    if (key === "")
      return;
    images.set(key, Math.max(images.get(key) ?? 0, scale));
  };
  for (const layer of data.layers) {
    for (const e of layer.elements) {
      if (e.kind === "sample") {
        samples.add(normaliseStoryboardPath(e.path));
        continue;
      }
      if (e.kind === "video") {
        videos.add(normaliseStoryboardPath(e.path));
        continue;
      }
      const sprite = e;
      const scale = maxScaleOf([sprite.commands, ...sprite.loops, ...sprite.triggers]);
      if (sprite.kind === "animation") {
        for (let i = 0; i < sprite.frameCount; i++)
          addImage(animationFramePath(sprite.path, i), scale);
      } else {
        addImage(sprite.path, scale);
      }
    }
  }
  return {
    images: [...images].map(([path, maxScale]) => ({ path, maxScale })),
    samples: [...samples].filter((s) => s !== ""),
    videos: [...videos].filter((v) => v !== "")
  };
}
function readImageSize(bytes) {
  if (bytes.length >= 24 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
  }
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 255) {
        i++;
        continue;
      }
      const marker = bytes[i + 1];
      if (marker === 255) {
        i++;
        continue;
      }
      if (marker === 216 || marker >= 208 && marker <= 215 || marker === 1) {
        i += 2;
        continue;
      }
      const len = dv.getUint16(i + 2);
      const isSOF = marker >= 192 && marker <= 207 && marker !== 196 && marker !== 200 && marker !== 204;
      if (isSOF)
        return { height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
      if (marker === 218)
        break;
      i += 2 + len;
    }
  }
  return null;
}
function planStoryboardDecode(sizes, opts = {}) {
  const budgetBytes = opts.budgetBytes ?? STORYBOARD_BITMAP_BUDGET_BYTES;
  const quality = opts.quality ?? DEFAULT_DECODE_QUALITY;
  const plans = sizes.map((s) => {
    const maxOnScreen = s.width * SB_SCALE * quality * s.maxScale;
    const f = s.width > 0 && s.width > maxOnScreen ? maxOnScreen / s.width : 1;
    return {
      path: s.path,
      width: s.width,
      height: s.height,
      targetWidth: Math.max(1, Math.round(s.width * f)),
      targetHeight: Math.max(1, Math.round(s.height * f))
    };
  });
  const total = plans.reduce((sum, p) => sum + p.targetWidth * p.targetHeight * 4, 0);
  if (total > budgetBytes && budgetBytes > 0) {
    const f = Math.max(MIN_BUDGET_FACTOR, Math.sqrt(budgetBytes / total));
    for (const p of plans) {
      p.targetWidth = Math.max(1, Math.floor(p.targetWidth * f));
      p.targetHeight = Math.max(1, Math.floor(p.targetHeight * f));
    }
    console.warn(
      `StoryboardAssets: decoded images would take ${(total / 1048576).toFixed(0)} MiB (budget ${(budgetBytes / 1048576).toFixed(0)} MiB); scaling all by ${f.toFixed(2)}.`
    );
  }
  return plans;
}
function mimeFor(path) {
  return path.endsWith(".jpg") || path.endsWith(".jpeg") ? "image/jpeg" : "image/png";
}
async function decodeStoryboardImages(entries, opts = {}) {
  const images = /* @__PURE__ */ new Map();
  const byPath = new Map(entries.map((e) => [e.path, e]));
  const sized = [];
  const unsized = [];
  for (const e of entries) {
    const size = readImageSize(e.bytes);
    if (size !== null && size.width > 0 && size.height > 0)
      sized.push({ path: e.path, ...size, maxScale: e.maxScale });
    else
      unsized.push(e);
  }
  const plans = planStoryboardDecode(sized, opts);
  const decode = async (entry, plan) => {
    try {
      const blob = new Blob([entry.bytes], { type: mimeFor(entry.path) });
      const resize = plan !== null && (plan.targetWidth !== plan.width || plan.targetHeight !== plan.height);
      const bitmap = resize ? await createImageBitmap(blob, { resizeWidth: plan.targetWidth, resizeHeight: plan.targetHeight, resizeQuality: "high" }) : await createImageBitmap(blob);
      images.set(entry.path, {
        bitmap,
        width: plan?.width ?? bitmap.width,
        height: plan?.height ?? bitmap.height
      });
    } catch (err2) {
      console.warn(`StoryboardAssets: could not decode "${entry.path}":`, err2);
    }
  };
  const tasks = [
    ...plans.map((p) => () => decode(byPath.get(p.path), p)),
    ...unsized.map((e) => () => decode(e, null))
  ];
  await runPooled(tasks);
  return images;
}

// src/parsers/BeatmapSetLoader.ts
function unzipAsync(data) {
  return new Promise((resolve, reject) => {
    unzip(data, (err2, files) => {
      if (err2)
        reject(err2);
      else
        resolve(files);
    });
  });
}
function extractKey(osuText, key) {
  const re = new RegExp(`^${key}\\s*:\\s*(.*)$`, "i");
  for (const rawLine of osuText.split(/\r?\n/)) {
    const m = re.exec(rawLine.trim());
    if (m)
      return m[1].trim();
  }
  return "";
}
function extractAudioFilename(osuText) {
  return extractKey(osuText, "AudioFilename");
}
function findStoryboardOsb(osuText, byName) {
  const name = storyboardFilename({
    artist: extractKey(osuText, "Artist"),
    title: extractKey(osuText, "Title"),
    creator: extractKey(osuText, "Creator"),
    audioFilename: extractAudioFilename(osuText)
  });
  return byName.get(name.toLowerCase()) ?? null;
}
function extractBackgroundFilename(osuText) {
  let inEvents = false;
  for (const rawLine of osuText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "[Events]") {
      inEvents = true;
      continue;
    }
    if (line.startsWith("[")) {
      inEvents = false;
      continue;
    }
    if (!inEvents)
      continue;
    const m = /^0\s*,\s*0\s*,\s*"?([^",]+)"?/.exec(line);
    if (m)
      return m[1];
  }
  return "";
}
async function loadBeatmapSet(buffer, targetHash, audioCtx, fetchOsuOverride, opts = {}) {
  const files = await unzipAsync(new Uint8Array(buffer));
  const byName = /* @__PURE__ */ new Map();
  const byPath = /* @__PURE__ */ new Map();
  for (const [path, bytes] of Object.entries(files)) {
    const basename = (path.split("/").pop() ?? path).toLowerCase();
    byName.set(basename, bytes);
    byPath.set(path.replace(/\\/g, "/").toLowerCase(), bytes);
  }
  const osuEntries = Object.entries(files).filter(([p]) => p.toLowerCase().endsWith(".osu"));
  if (osuEntries.length === 0) {
    throw new Error("No .osu file found inside the .osz archive.");
  }
  let matchedBytes = null;
  if (targetHash === "") {
    matchedBytes = osuEntries[0][1];
    console.warn("BeatmapSetLoader: replay has no beatmap hash; using first .osu found.");
  } else {
    for (const [, bytes] of osuEntries) {
      if (md5(bytes) === targetHash) {
        matchedBytes = bytes;
        break;
      }
    }
    if (matchedBytes === null && fetchOsuOverride !== void 0) {
      try {
        const override = await fetchOsuOverride();
        if (md5(override) === targetHash) {
          matchedBytes = override;
          console.warn(
            `BeatmapSetLoader: no .osu in archive matched ${targetHash}; using canonical .osu fetched from osu! (mirror .osz is stale).`
          );
        } else {
          console.warn("BeatmapSetLoader: override .osu did not match target hash either.");
        }
      } catch (err2) {
        console.warn("BeatmapSetLoader: failed to fetch override .osu:", err2);
      }
    }
    if (matchedBytes === null) {
      throw new Error(
        `No .osu in this archive matches the replay's beatmap hash (${targetHash}).
Make sure you are loading the correct beatmap set.`
      );
    }
  }
  const osuBytes = matchedBytes;
  const osuText = new TextDecoder("utf-8").decode(osuBytes);
  const audioFilename = extractAudioFilename(osuText).toLowerCase();
  const bgFilename = extractBackgroundFilename(osuText).toLowerCase();
  let audioBuffer = null;
  if (audioFilename !== "") {
    const audioBytes = byName.get(audioFilename);
    if (audioBytes !== void 0) {
      try {
        const copy = audioBytes.buffer.slice(
          audioBytes.byteOffset,
          audioBytes.byteOffset + audioBytes.byteLength
        );
        audioBuffer = await audioCtx.decodeAudioData(copy);
      } catch (err2) {
        console.warn("BeatmapSetLoader: could not decode audio file:", err2);
      }
    } else {
      console.warn(`BeatmapSetLoader: audio file "${audioFilename}" not found in archive.`);
    }
  }
  let background = null;
  if (bgFilename !== "") {
    const bgBytes = byName.get(bgFilename);
    if (bgBytes !== void 0) {
      try {
        const isJpg = bgFilename.endsWith(".jpg") || bgFilename.endsWith(".jpeg");
        const blob = new Blob([bgBytes], { type: isJpg ? "image/jpeg" : "image/png" });
        background = await createImageBitmap(blob);
      } catch (err2) {
        console.warn("BeatmapSetLoader: could not decode background image:", err2);
      }
    }
  }
  const beatmapSounds = /* @__PURE__ */ new Map();
  const soundEntries = Object.entries(files).filter(([p]) => {
    const lower = p.toLowerCase();
    const basename = lower.split("/").pop() ?? lower;
    if (basename === audioFilename)
      return false;
    return lower.endsWith(".wav") || lower.endsWith(".mp3") || lower.endsWith(".ogg");
  });
  await Promise.all(soundEntries.map(async ([path, bytes]) => {
    try {
      const copy = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      );
      const audioBuf = await audioCtx.decodeAudioData(copy);
      const lower = path.replace(/\\/g, "/").toLowerCase();
      const basename = lower.split("/").pop() ?? lower;
      beatmapSounds.set(basename, audioBuf);
      beatmapSounds.set(lower, audioBuf);
    } catch {
    }
  }));
  let storyboard = null;
  let storyboardImages = /* @__PURE__ */ new Map();
  let video = null;
  if (opts.storyboard === true || opts.video === true) {
    const osbBytes = findStoryboardOsb(osuText, byName);
    const parsed = parseStoryboard(osuText, osbBytes === null ? null : new TextDecoder("utf-8").decode(osbBytes));
    const paths = collectStoryboardPaths(parsed);
    if (opts.storyboard === true) {
      storyboard = parsed;
      const entries = /* @__PURE__ */ new Map();
      let missing = 0;
      for (const ref of paths.images) {
        const key = resolveStoryboardPath(byPath, ref.path, "image");
        if (key === null) {
          missing++;
          continue;
        }
        const prev = entries.get(key);
        if (prev === void 0)
          entries.set(key, { path: key, bytes: byPath.get(key), maxScale: ref.maxScale });
        else
          prev.maxScale = Math.max(prev.maxScale, ref.maxScale);
      }
      if (missing > 0)
        console.warn(`BeatmapSetLoader: ${missing} storyboard image path(s) not found in archive.`);
      storyboardImages = await decodeStoryboardImages([...entries.values()], {
        budgetBytes: opts.storyboardBitmapBudgetBytes,
        quality: opts.storyboardDecodeQuality
      });
    }
    if (opts.video === true) {
      for (const path of paths.videos) {
        const key = resolveStoryboardPath(byPath, path, "video");
        if (key !== null) {
          video = { path: key, bytes: byPath.get(key) };
          break;
        }
      }
    }
  }
  return { osuBytes, audioBuffer, background, beatmapSounds, storyboard, storyboardImages, video };
}
async function extractBeatmapBackground(buffer, targetHash) {
  const files = await unzipAsync(new Uint8Array(buffer));
  const byName = /* @__PURE__ */ new Map();
  for (const [path, bytes] of Object.entries(files)) {
    const basename = (path.split("/").pop() ?? path).toLowerCase();
    byName.set(basename, bytes);
  }
  const osuEntries = Object.entries(files).filter(([p]) => p.toLowerCase().endsWith(".osu"));
  if (osuEntries.length === 0)
    return null;
  let matchedBytes = null;
  if (targetHash !== "") {
    for (const [, bytes] of osuEntries) {
      if (md5(bytes) === targetHash) {
        matchedBytes = bytes;
        break;
      }
    }
  }
  if (matchedBytes === null)
    matchedBytes = osuEntries[0][1];
  const osuText = new TextDecoder("utf-8").decode(matchedBytes);
  const bgFilename = extractBackgroundFilename(osuText).toLowerCase();
  if (bgFilename === "")
    return null;
  const bgBytes = byName.get(bgFilename);
  if (bgBytes === void 0)
    return null;
  try {
    const isJpg = bgFilename.endsWith(".jpg") || bgFilename.endsWith(".jpeg");
    const blob = new Blob([bgBytes], { type: isJpg ? "image/jpeg" : "image/png" });
    return await createImageBitmap(blob);
  } catch (err2) {
    console.warn("extractBeatmapBackground: could not decode background image:", err2);
    return null;
  }
}

// src/storyboard/easing.ts
var PI = Math.PI;
var elastic_const = 2 * PI / 0.3;
var elastic_const2 = 0.3 / 4;
var back_const = 1.70158;
var back_const2 = back_const * 1.525;
var bounce_const = 1 / 2.75;
var expo_offset = 2 ** -10;
var elastic_offset_full = 2 ** -11;
var elastic_offset_half = 2 ** -10 * Math.sin((0.5 - elastic_const2) * elastic_const);
var elastic_offset_quarter = 2 ** -10 * Math.sin((0.25 - elastic_const2) * elastic_const);
var in_out_elastic_offset = 2 ** -10 * Math.sin((1 - elastic_const2 * 1.5) * elastic_const / 1.5);
function outBounce(t) {
  if (t < bounce_const)
    return 7.5625 * t * t;
  if (t < 2 * bounce_const) {
    t -= 1.5 * bounce_const;
    return 7.5625 * t * t + 0.75;
  }
  if (t < 2.5 * bounce_const) {
    t -= 2.25 * bounce_const;
    return 7.5625 * t * t + 0.9375;
  }
  t -= 2.625 * bounce_const;
  return 7.5625 * t * t + 0.984375;
}
function applyEasing(easing, t) {
  switch (easing) {
    default:
      return t;
    case 1:
    case 4:
      return t * (2 - t);
    case 2:
    case 3:
      return t * t;
    case 5:
      return t < 0.5 ? t * t * 2 : (t - 1) * (t - 1) * -2 + 1;
    case 6:
      return t * t * t;
    case 7:
      t -= 1;
      return t * t * t + 1;
    case 8:
      if (t < 0.5)
        return t * t * t * 4;
      t -= 1;
      return t * t * t * 4 + 1;
    case 9:
      return t * t * t * t;
    case 10:
      t -= 1;
      return 1 - t * t * t * t;
    case 11:
      if (t < 0.5)
        return t * t * t * t * 8;
      t -= 1;
      return t * t * t * t * -8 + 1;
    case 12:
      return t * t * t * t * t;
    case 13:
      t -= 1;
      return t * t * t * t * t + 1;
    case 14:
      if (t < 0.5)
        return t * t * t * t * t * 16;
      t -= 1;
      return t * t * t * t * t * 16 + 1;
    case 15:
      return 1 - Math.cos(t * PI * 0.5);
    case 16:
      return Math.sin(t * PI * 0.5);
    case 17:
      return 0.5 - 0.5 * Math.cos(PI * t);
    case 18:
      return 2 ** (10 * (t - 1)) + expo_offset * (t - 1);
    case 19:
      return -(2 ** (-10 * t)) + 1 + expo_offset * t;
    case 20:
      return t < 0.5 ? 0.5 * (2 ** (20 * t - 10) + expo_offset * (2 * t - 1)) : 1 - 0.5 * (2 ** (-20 * t + 10) + expo_offset * (-2 * t + 1));
    case 21:
      return 1 - Math.sqrt(1 - t * t);
    case 22:
      t -= 1;
      return Math.sqrt(1 - t * t);
    case 23:
      t *= 2;
      if (t < 1)
        return 0.5 - 0.5 * Math.sqrt(1 - t * t);
      t -= 2;
      return 0.5 * Math.sqrt(1 - t * t) + 0.5;
    case 24:
      return -(2 ** (-10 + 10 * t)) * Math.sin((1 - elastic_const2 - t) * elastic_const) + elastic_offset_full * (1 - t);
    case 25:
      return 2 ** (-10 * t) * Math.sin((t - elastic_const2) * elastic_const) + 1 - elastic_offset_full * t;
    case 26:
      return 2 ** (-10 * t) * Math.sin((0.5 * t - elastic_const2) * elastic_const) + 1 - elastic_offset_half * t;
    case 27:
      return 2 ** (-10 * t) * Math.sin((0.25 * t - elastic_const2) * elastic_const) + 1 - elastic_offset_quarter * t;
    case 28:
      t *= 2;
      if (t < 1)
        return -0.5 * (2 ** (-10 + 10 * t) * Math.sin((1 - elastic_const2 * 1.5 - t) * elastic_const / 1.5) - in_out_elastic_offset * (1 - t));
      t -= 1;
      return 0.5 * (2 ** (-10 * t) * Math.sin((t - elastic_const2 * 1.5) * elastic_const / 1.5) - in_out_elastic_offset * t) + 1;
    case 29:
      return t * t * ((back_const + 1) * t - back_const);
    case 30:
      t -= 1;
      return t * t * ((back_const + 1) * t + back_const) + 1;
    case 31:
      t *= 2;
      if (t < 1)
        return 0.5 * t * t * ((back_const2 + 1) * t - back_const2);
      t -= 2;
      return 0.5 * (t * t * ((back_const2 + 1) * t + back_const2) + 2);
    case 32:
      return 1 - outBounce(1 - t);
    case 33:
      return outBounce(t);
    case 34:
      return t < 0.5 ? 0.5 - 0.5 * outBounce(1 - t * 2) : outBounce((t - 0.5) * 2) * 0.5 + 0.5;
    case 35:
      t -= 1;
      return t * Math.pow(t, 10) + 1;
  }
}

// src/storyboard/triggers.ts
var NO_TRIGGER_EVENTS = { hitSamples: [], passing: [] };
var HITSOUND_RE = /^HitSound(All|Normal|Soft|Drum)?(All|Normal|Soft|Drum)?(Whistle|Clap|Finish)?(\d+)?$/i;
var BANK_OF = { normal: 1, soft: 2, drum: 3 };
function parseHitSoundTrigger(name) {
  const m = HITSOUND_RE.exec(name);
  if (m === null)
    return null;
  const bank1 = m[1] ?? null, bank2 = m[2] ?? null, addition = m[3] ?? null, suffix = m[4] ?? null;
  const bank1IsAddition = bank1 !== null && bank2 === null && addition !== null;
  const bankOf = (b) => b === null ? null : BANK_OF[b.toLowerCase()] ?? null;
  return {
    normalBank: bankOf(bank1IsAddition ? bank2 : bank1),
    additionBank: bankOf(bank1IsAddition ? bank1 : bank2),
    additionName: addition === null ? null : addition.toLowerCase(),
    suffix
  };
}
function sampleSuffix(index) {
  return index >= 2 ? String(index) : null;
}
function hitSoundTriggerMatches(def, samples) {
  let foundAddition = def.additionName === null;
  let additionBankOk = def.additionBank === null;
  for (const s of samples) {
    if (s.name === "normal") {
      if (def.normalBank !== null && s.bank !== def.normalBank)
        return false;
    } else {
      if (def.additionName !== null && s.name === def.additionName)
        foundAddition = true;
      if (def.additionBank !== null && s.bank === def.additionBank)
        additionBankOk = true;
    }
    if (def.suffix !== null && def.suffix !== sampleSuffix(s.index))
      return false;
  }
  return foundAddition && additionBankOk;
}
function triggerFirings(group, events) {
  const out = [];
  const active = (t) => group.triggerStartTime <= t && t <= group.triggerEndTime;
  const name = group.triggerName;
  if (name === "Passing" || name === "Failing") {
    const target = name === "Passing";
    for (const p of events.passing)
      if (p.passing === target && active(p.timeMs))
        out.push(p.timeMs);
  } else if (/^HitSound/i.test(name)) {
    const def = parseHitSoundTrigger(name);
    if (def === null)
      return out;
    for (const e of events.hitSamples)
      if (active(e.timeMs) && hitSoundTriggerMatches(def, e.samples))
        out.push(e.timeMs);
  }
  out.sort((a, b) => a - b);
  return out;
}
function hitSampleEventsFromSchedule(sounds) {
  const out = [];
  let cur = null;
  for (const s of sounds) {
    if (s.type === "combobreak" || s.type === "spinnerbonus" || s.type === "storyboard")
      continue;
    if (cur === null || cur.timeMs !== s.beatmapMs) {
      cur = { timeMs: s.beatmapMs, samples: [] };
      out.push(cur);
    }
    if (s.type === "normal" && s.customFile !== "")
      continue;
    cur.samples.push({ name: s.type, bank: s.sampleSet, index: s.sampleIndex });
  }
  return out;
}

// src/storyboard/StoryboardCompiler.ts
function expandLoop(cmds, loop) {
  const period = loop.endTime - loop.startTime;
  const iterations = period > 0 ? loop.totalIterations : 1;
  const out = [];
  for (let k = 0; k < iterations; k++) {
    const shift = k * period;
    for (const c of cmds)
      out.push({ ...c, startTime: c.startTime + shift, endTime: c.endTime + shift });
  }
  return out;
}
function buildTrack(lists, loops, fired) {
  const entries = [];
  lists.forEach((list, group) => list.forEach((cmd, index) => entries.push({ cmd, loop: group === 0 ? null : loops[group - 1], group, index })));
  entries.sort((a, b) => a.cmd.startTime - b.cmd.startTime || a.group - b.group || a.index - b.index);
  const expanded = [];
  entries.forEach((e, id) => {
    const cmds2 = e.loop === null ? [e.cmd] : expandLoop([e.cmd], e.loop);
    for (const cmd of cmds2)
      expanded.push({ cmd, id });
  });
  const firingsById = [];
  fired.forEach((f, group) => {
    for (const at of f.firings)
      f.cmds.forEach((c, index) => firingsById.push({ at, group, index, cmd: { ...c, startTime: c.startTime + at, endTime: c.endTime + at } }));
  });
  firingsById.sort((a, b) => a.at - b.at || a.group - b.group || a.index - b.index);
  firingsById.forEach((f, i) => expanded.push({ cmd: f.cmd, id: entries.length + i }));
  expanded.sort((a, b) => a.cmd.startTime - b.cmd.startTime || a.id - b.id);
  const cmds = expanded.map((e) => e.cmd);
  const starts = new Float64Array(cmds.length);
  for (let i = 0; i < cmds.length; i++)
    starts[i] = cmds[i].startTime;
  return { starts, cmds, last: -1 };
}
function resolveTriggers(triggers, events) {
  const out = [];
  for (const group of triggers) {
    if (!group.hasCommands)
      continue;
    const firings = triggerFirings(group, events);
    if (firings.length > 0)
      out.push({ group, firings });
  }
  return out;
}
function compileSprite(s, order, events) {
  const fired = resolveTriggers(s.triggers, events);
  if (!s.isDrawable && fired.length === 0)
    return null;
  let startTime = s.startTime, endTimeForDisplay = s.endTimeForDisplay, earliestTransformTime = s.earliestTransformTime;
  for (const { group, firings } of fired) {
    const first = firings[0], last = firings[firings.length - 1];
    startTime = Math.min(startTime, first + group.startTime);
    earliestTransformTime = Math.min(earliestTransformTime, first + group.startTime);
    endTimeForDisplay = Math.max(endTimeForDisplay, last + group.endTime);
  }
  const groups = [s.commands, ...s.loops];
  const track = (pick) => buildTrack(groups.map(pick), s.loops, fired.map((f) => ({ cmds: pick(f.group), firings: f.firings })));
  const base = {
    kind: s.kind,
    path: s.path,
    origin: s.origin,
    initialX: s.initialX,
    initialY: s.initialY,
    startTime,
    endTimeForDisplay,
    earliestTransformTime,
    order,
    x: track((g) => g.x),
    y: track((g) => g.y),
    scale: track((g) => g.scale),
    vectorScale: track((g) => g.vectorScale),
    rotation: track((g) => g.rotation),
    colour: track((g) => g.colour),
    alpha: track((g) => g.alpha),
    blending: track((g) => g.blending),
    flipH: track((g) => g.flipH),
    flipV: track((g) => g.flipV)
  };
  if (s.kind === "animation") {
    return { ...base, kind: "animation", frameCount: s.frameCount, frameDelay: s.frameDelay, loopType: s.loopType };
  }
  return base;
}
function compileVideo(v) {
  const groups = [v.commands, ...v.loops];
  const has = (g) => g.x.length + g.y.length + g.scale.length + g.vectorScale.length + g.rotation.length + g.colour.length + g.blending.length + g.flipH.length + g.flipV.length > 0;
  return {
    path: v.path,
    offsetMs: v.offsetMs,
    alpha: buildTrack(groups.map((g) => g.alpha), v.loops, []),
    hasUnsupportedCommands: groups.some(has) || v.triggers.some((t) => t.hasCommands)
  };
}
function compileLayer(name, depth, visibleWhenPassing, visibleWhenFailing, sprites) {
  const byStart = sprites.map((_, i) => i).sort((a, b) => sprites[a].startTime - sprites[b].startTime || a - b);
  const starts = new Float64Array(byStart.length);
  const maxEndPrefix = new Float64Array(byStart.length);
  let maxEnd = -Infinity;
  byStart.forEach((si, i) => {
    starts[i] = sprites[si].startTime;
    maxEnd = Math.max(maxEnd, sprites[si].endTimeForDisplay);
    maxEndPrefix[i] = maxEnd;
  });
  const out = [];
  return {
    name,
    depth,
    visibleWhenPassing,
    visibleWhenFailing,
    sprites,
    activeAt(t) {
      let lo = 0, hi = starts.length - 1, last = -1;
      while (lo <= hi) {
        const mid = lo + hi >> 1;
        if (starts[mid] <= t) {
          last = mid;
          lo = mid + 1;
        } else
          hi = mid - 1;
      }
      out.length = 0;
      for (let i = last; i >= 0 && maxEndPrefix[i] > t; i--) {
        const s = sprites[byStart[i]];
        if (s.endTimeForDisplay > t)
          out.push(s);
      }
      out.sort((a, b) => a.order - b.order);
      return out;
    }
  };
}
function hasTriggerCommands(data) {
  for (const layer of data.layers) {
    for (const el of layer.elements) {
      if ((el.kind === "sprite" || el.kind === "animation") && el.triggers.some((t) => t.hasCommands))
        return true;
    }
  }
  return false;
}
function playableStoryboardSamples(data) {
  const out = [];
  for (const layer of data.layers) {
    if (!layer.visibleWhenPassing)
      continue;
    for (const el of layer.elements)
      if (el.kind === "sample")
        out.push(el);
  }
  return out.sort((a, b) => a.timeMs - b.timeMs);
}
function compileStoryboard(data, triggerEvents = NO_TRIGGER_EVENTS) {
  const layers = [];
  const videos = [];
  let mustAlwaysBePresent = false;
  for (const layer of data.layers) {
    if (layer.name === "Video") {
      for (const el of layer.elements)
        if (el.kind === "video")
          videos.push(compileVideo(el));
      continue;
    }
    const sprites = [];
    layer.elements.forEach((el, order) => {
      if (el.kind === "sample") {
        mustAlwaysBePresent = true;
        return;
      }
      if (el.kind !== "sprite" && el.kind !== "animation")
        return;
      const compiled = compileSprite(el, order, triggerEvents);
      if (compiled !== null)
        sprites.push(compiled);
    });
    if (layer.name === "Overlay" && layer.elements.length > 0)
      mustAlwaysBePresent = true;
    layers.push(compileLayer(layer.name, layer.depth, layer.visibleWhenPassing, layer.visibleWhenFailing, sprites));
  }
  layers.sort((a, b) => b.depth - a.depth);
  return {
    widescreen: data.widescreen,
    replacesBackground: data.replacesBackground,
    layers,
    videos,
    hasSprites: layers.some((l) => l.sprites.length > 0),
    mustAlwaysBePresent,
    passingAt: () => true
  };
}

// src/storyboard/videoElementSource.ts
var UNPLAYABLE_EXTENSIONS = /* @__PURE__ */ new Set([".avi", ".flv", ".wmv", ".mpg"]);
function extensionOf2(path) {
  const dot = path.lastIndexOf(".");
  return dot < 0 ? "" : path.slice(dot).toLowerCase();
}
function probeVideoSupport(data, video) {
  const event = data?.layers.flatMap((l) => l.elements).find((e) => e.kind === "video");
  if (event === void 0)
    return { kind: "none" };
  const ext = extensionOf2(video?.path ?? event.path);
  if (UNPLAYABLE_EXTENSIONS.has(ext))
    return { kind: "unsupported", ext };
  if (video === null)
    return { kind: "not-loaded" };
  return { kind: "playable" };
}
var RESYNC_MS = 100;
var PAUSED_SEEK_MS = 16;
var VideoElementSource = class {
  constructor(bytes, mime) {
    this.durationMs = null;
    this.frameWidth = 0;
    this.frameHeight = 0;
    this.failed = false;
    this.seeking = false;
    this.pendingSeekMs = null;
    this.rate = 1;
    this.disposed = false;
    const el = document.createElement("video");
    el.muted = true;
    el.playsInline = true;
    el.preload = "auto";
    this.url = URL.createObjectURL(new Blob([bytes.slice()], { type: mime }));
    el.addEventListener("loadedmetadata", () => {
      this.durationMs = el.duration * 1e3;
      this.frameWidth = el.videoWidth;
      this.frameHeight = el.videoHeight;
    });
    el.addEventListener("error", () => {
      this.failed = true;
    });
    el.addEventListener("seeked", () => {
      this.seeking = false;
      if (this.pendingSeekMs !== null) {
        const t = this.pendingSeekMs;
        this.pendingSeekMs = null;
        this.seekTo(t);
      }
    });
    el.src = this.url;
    this.el = el;
  }
  frameAt(videoMs) {
    const dur = this.durationMs;
    if (this.failed || dur === null || videoMs < 0 || videoMs > dur)
      return null;
    return this.el.readyState >= 2 ? this.el : null;
  }
  sync({ videoMs, playing, rate }) {
    const el = this.el, dur = this.durationMs;
    if (this.disposed || this.failed || dur === null)
      return;
    const inRange = videoMs >= 0 && videoMs <= dur;
    const target = Math.max(0, Math.min(dur, videoMs));
    const drift = el.currentTime * 1e3 - target;
    if (playing && inRange) {
      if (rate !== this.rate) {
        this.rate = rate;
        try {
          el.playbackRate = rate;
        } catch {
        }
      }
      if (Math.abs(drift) > RESYNC_MS)
        this.seekTo(target);
      if (el.paused)
        el.play().catch(() => {
        });
    } else {
      if (!el.paused)
        el.pause();
      if (Math.abs(drift) > PAUSED_SEEK_MS)
        this.seekTo(target);
    }
  }
  dispose() {
    if (this.disposed)
      return;
    this.disposed = true;
    this.el.pause();
    this.el.removeAttribute("src");
    this.el.load();
    URL.revokeObjectURL(this.url);
  }
  /** One seek in flight at a time; a newer target replaces the queued one. */
  seekTo(ms) {
    if (this.seeking) {
      this.pendingSeekMs = ms;
      return;
    }
    this.seeking = true;
    this.el.currentTime = ms / 1e3;
  }
};
function mimeFor2(path) {
  switch (extensionOf2(path)) {
    case ".mov":
      return "video/quicktime";
    default:
      return "video/mp4";
  }
}
function createVideoElementSource(video) {
  if (typeof document === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function")
    return null;
  return new VideoElementSource(video.bytes, mimeFor2(video.path));
}

// src/utils/modDifficulty.ts
var Mod = {
  NoFail: 1 << 0,
  // 1
  Easy: 1 << 1,
  // 2
  TouchDevice: 1 << 2,
  // 4
  Hidden: 1 << 3,
  // 8
  HardRock: 1 << 4,
  // 16
  SuddenDeath: 1 << 5,
  // 32
  DoubleTime: 1 << 6,
  // 64
  Relax: 1 << 7,
  // 128
  HalfTime: 1 << 8,
  // 256
  Nightcore: 1 << 9 | 1 << 6,
  // 576 — NC always implies DT
  Flashlight: 1 << 10,
  // 1024
  SpunOut: 1 << 12,
  // 4096
  Perfect: 1 << 14
  // 16384 — PF always implies SD
};
function hasMod(mods, flag) {
  return (mods & flag) !== 0;
}
function difficultyRate(diff, min, mid, max2) {
  diff = Math.fround(diff);
  if (diff > 5)
    return mid + (max2 - mid) * (diff - 5) / 5;
  if (diff < 5)
    return mid - (mid - min) * (5 - diff) / 5;
  return mid;
}
function boolSetting(settings, key, defaultValue) {
  if (!settings)
    return defaultValue;
  const v = settings[key];
  return typeof v === "boolean" ? v : defaultValue;
}
function numSetting(settings, key) {
  if (!settings)
    return void 0;
  const v = settings[key];
  return typeof v === "number" ? v : void 0;
}
function lazerVersionAtLeast(clientVersion, year, mdd) {
  if (!clientVersion)
    return false;
  const m = clientVersion.match(/^(\d{4})\.(\d{1,4})/);
  if (!m)
    return false;
  const y = parseInt(m[1], 10);
  const md = parseInt(m[2], 10);
  if (y !== year)
    return y > year;
  return md >= mdd;
}
function computeModDifficulty(beatmap, replay) {
  const scoreInfo = replay.scoreInfo;
  const isLazer = scoreInfo !== void 0 || replay.gameVersion >= 3e7;
  let ar = beatmap.approachRate;
  let cs = beatmap.circleSize;
  let od = beatmap.overallDifficulty;
  let hp = beatmap.hpDrainRate;
  let speed = 1;
  let maniaBaseOd = beatmap.overallDifficulty;
  let isHR = false, isEZ = false, isDT = false, isHT = false, isNC = false, isHD = false, isFL = false;
  let isNF = false, isSD = false, isPF = false, isAC = false;
  let isMirror = false, isFadeIn = false, isCover = false;
  let mirrorReflection = 0;
  let coverCoverage = 0.5, coverAlong = true;
  let maniaDifficultyMultiplier = 1;
  let isCL = false;
  let lzNoSliderAcc = false;
  let lzLegacyNotelock = false;
  let lzLegacySound = false;
  let lzLegacyHP = false;
  if (scoreInfo && scoreInfo.mods.length > 0) {
    for (const mod of scoreInfo.mods) {
      if (mod.acronym === "DA") {
        const daAr = numSetting(mod.settings, "approach_rate");
        const daCs = numSetting(mod.settings, "circle_size");
        const daOd = numSetting(mod.settings, "overall_difficulty");
        const daHp = numSetting(mod.settings, "drain_rate");
        if (daAr !== void 0)
          ar = daAr;
        if (daCs !== void 0)
          cs = daCs;
        if (daOd !== void 0)
          od = daOd;
        if (daHp !== void 0)
          hp = daHp;
      }
    }
    maniaBaseOd = od;
    for (const mod of scoreInfo.mods) {
      switch (mod.acronym) {
        case "HR":
          isHR = true;
          ar = Math.min(ar * 1.4, 10);
          cs = Math.min(cs * 1.3, 10);
          od = Math.min(od * 1.4, 10);
          hp = Math.min(hp * 1.4, 10);
          maniaDifficultyMultiplier = 1.4;
          break;
        case "EZ":
          isEZ = true;
          ar /= 2;
          cs /= 2;
          od /= 2;
          hp /= 2;
          maniaDifficultyMultiplier = 1 / 1.4;
          break;
        case "DT": {
          isDT = true;
          const sc = numSetting(mod.settings, "speed_change");
          speed = sc ?? 1.5;
          break;
        }
        case "NC": {
          isDT = true;
          isNC = true;
          const sc = numSetting(mod.settings, "speed_change");
          speed = sc ?? 1.5;
          break;
        }
        case "HT": {
          isHT = true;
          const sc = numSetting(mod.settings, "speed_change");
          speed = sc ?? 0.75;
          break;
        }
        case "DC": {
          isHT = true;
          const sc = numSetting(mod.settings, "speed_change");
          speed = sc ?? 0.75;
          break;
        }
        case "HD":
          isHD = true;
          break;
        case "FL":
          isFL = true;
          break;
        case "MR": {
          isMirror = true;
          const refl = mod.settings?.["reflection"];
          if (typeof refl === "number")
            mirrorReflection = refl;
          else if (typeof refl === "string")
            mirrorReflection = /both/i.test(refl) ? 2 : /vertical/i.test(refl) ? 1 : 0;
          break;
        }
        case "FI":
          isFadeIn = true;
          break;
        case "CO": {
          isCover = true;
          const cov = numSetting(mod.settings, "coverage");
          if (cov !== void 0)
            coverCoverage = cov;
          const dir = mod.settings?.["direction"];
          if (typeof dir === "number")
            coverAlong = dir === 0;
          else if (typeof dir === "string")
            coverAlong = !/against/i.test(dir);
          break;
        }
        case "NF":
          isNF = true;
          break;
        case "SD":
          isSD = true;
          break;
        case "PF":
          isSD = true;
          isPF = true;
          break;
        case "AC":
          isAC = true;
          break;
        case "CL":
          isCL = true;
          lzNoSliderAcc = boolSetting(mod.settings, "no_slider_head_accuracy", true);
          lzLegacyNotelock = boolSetting(mod.settings, "classic_note_lock", true);
          lzLegacySound = boolSetting(mod.settings, "always_play_tail_sample", true);
          lzLegacyHP = boolSetting(mod.settings, "classic_health", true);
          break;
      }
    }
  } else {
    const mods = replay.mods;
    if (hasMod(mods, Mod.HardRock)) {
      isHR = true;
      ar = Math.min(ar * 1.4, 10);
      cs = Math.min(cs * 1.3, 10);
      od = Math.min(od * 1.4, 10);
      hp = Math.min(hp * 1.4, 10);
      maniaDifficultyMultiplier = 1.4;
    }
    if (hasMod(mods, Mod.Easy)) {
      isEZ = true;
      ar /= 2;
      cs /= 2;
      od /= 2;
      hp /= 2;
      maniaDifficultyMultiplier = 1 / 1.4;
    }
    if (hasMod(mods, Mod.DoubleTime)) {
      isDT = true;
      speed = 1.5;
    } else if (hasMod(mods, Mod.HalfTime)) {
      isHT = true;
      speed = 0.75;
    }
    if (hasMod(mods, 1 << 9))
      isNC = true;
    if (hasMod(mods, Mod.Hidden))
      isHD = true;
    if (hasMod(mods, Mod.Flashlight))
      isFL = true;
    if (hasMod(mods, Mod.NoFail))
      isNF = true;
    if (hasMod(mods, Mod.SuddenDeath))
      isSD = true;
    if (hasMod(mods, Mod.Perfect)) {
      isSD = true;
      isPF = true;
    }
    if (hasMod(mods, 1 << 20))
      isFadeIn = true;
    if (hasMod(mods, 1 << 30))
      isMirror = true;
  }
  const flipX = isMirror && (mirrorReflection === 0 || mirrorReflection === 2);
  const flipY = isHR || isMirror && (mirrorReflection === 1 || mirrorReflection === 2);
  const preempt = difficultyRate(ar, 1800, 1200, 450);
  const fadeIn = 400 * Math.min(1, preempt / 450);
  const circleRadius = isLazer ? 54.4 - 4.48 * cs : (54.4 - 4.48 * cs) * 1.00041;
  const hitWindow300U = 80 - 6 * od;
  const hitWindow100U = 140 - 8 * od;
  const hitWindow50U = 200 - 10 * od;
  const hitWindow300 = Math.floor(hitWindow300U);
  const hitWindow100 = Math.floor(hitWindow100U);
  const hitWindow50 = Math.floor(hitWindow50U);
  const taikoHitWindowGreatU = difficultyRate(od, 50, 35, 20);
  const taikoHitWindowOkU = difficultyRate(od, 120, 80, 50);
  const taikoHitWindowMissU = difficultyRate(od, 135, 95, 70);
  const taikoHitWindowGreat = Math.floor(taikoHitWindowGreatU) - 0.5;
  const taikoHitWindowOk = Math.floor(taikoHitWindowOkU) - 0.5;
  const taikoHitWindowMiss = Math.floor(taikoHitWindowMissU) - 0.5;
  const appliesManiaDiffMult = !isLazer || lazerVersionAtLeast(scoreInfo?.client_version, 2025, 509);
  const maniaTotalMult = speed / (appliesManiaDiffMult ? maniaDifficultyMultiplier : 1);
  const usesStableManiaWindows = !isLazer || isCL;
  const maniaHitWindowPerfect = usesStableManiaWindows ? Math.floor(16 * maniaTotalMult) + 0.5 : Math.floor(difficultyRate(maniaBaseOd, 22.4, 19.4, 13.9) * maniaTotalMult) + 0.5;
  const maniaHitWindowGreat = Math.floor(difficultyRate(maniaBaseOd, 64, 49, 34) * maniaTotalMult) + 0.5;
  const maniaHitWindowGood = Math.floor(difficultyRate(maniaBaseOd, 97, 82, 67) * maniaTotalMult) + 0.5;
  const maniaHitWindowOk = Math.floor(difficultyRate(maniaBaseOd, 127, 112, 97) * maniaTotalMult) + 0.5;
  const maniaHitWindowMeh = Math.floor(difficultyRate(maniaBaseOd, 151, 136, 121) * maniaTotalMult) + 0.5;
  const maniaHitWindowMiss = Math.floor(difficultyRate(maniaBaseOd, 188, 173, 158) * maniaTotalMult) + 0.5;
  let modsBitmask;
  if (scoreInfo) {
    modsBitmask = 0;
    if (isHR)
      modsBitmask |= Mod.HardRock;
    if (isEZ)
      modsBitmask |= Mod.Easy;
    if (isDT)
      modsBitmask |= Mod.DoubleTime;
    if (isHT)
      modsBitmask |= Mod.HalfTime;
    if (isNC)
      modsBitmask |= 1 << 9;
    if (isHD)
      modsBitmask |= Mod.Hidden;
    if (isFL)
      modsBitmask |= Mod.Flashlight;
    if (isNF)
      modsBitmask |= Mod.NoFail;
    if (isSD)
      modsBitmask |= Mod.SuddenDeath;
    if (isPF)
      modsBitmask |= Mod.Perfect;
    if (isFadeIn)
      modsBitmask |= 1 << 20;
    if (isMirror)
      modsBitmask |= 1 << 30;
  } else {
    modsBitmask = replay.mods;
  }
  return {
    ar,
    cs,
    od,
    hp,
    preemptMs: preempt,
    fadeInMs: fadeIn,
    circleRadiusPx: circleRadius,
    hitWindow300,
    hitWindow100,
    hitWindow50,
    hitWindow300U,
    hitWindow100U,
    hitWindow50U,
    taikoHitWindowGreat,
    taikoHitWindowOk,
    taikoHitWindowMiss,
    taikoHitWindowGreatU,
    taikoHitWindowOkU,
    taikoHitWindowMissU,
    maniaHitWindowPerfect,
    maniaHitWindowGreat,
    maniaHitWindowGood,
    maniaHitWindowOk,
    maniaHitWindowMeh,
    maniaHitWindowMiss,
    speed,
    mods: modsBitmask,
    isHR,
    isEZ,
    isDT,
    isHT,
    isNC,
    isHD,
    isFL,
    isNF,
    isSD,
    isPF,
    isAC,
    isMirror,
    isFadeIn,
    isCover,
    coverCoverage,
    coverAlong,
    flipX,
    flipY,
    isLazer,
    isCL,
    lzNoSliderAcc,
    lzLegacyNotelock,
    lzLegacySound,
    lzLegacyHP
  };
}

// src/utils/sliderDuration.ts
var _durationCache = /* @__PURE__ */ new WeakMap();
function slideDurationMs(beatmap, slider) {
  const cached = _durationCache.get(slider);
  if (cached !== void 0)
    return cached;
  let baseBeatLength = 500;
  let svMultiplier = 1;
  for (const tp of beatmap.timingPoints) {
    if (tp.time > slider.time)
      break;
    if (!tp.inherited) {
      baseBeatLength = tp.beatLength;
      svMultiplier = 1;
    } else {
      svMultiplier = Math.max(0.1, Math.min(10, -100 / tp.beatLength));
    }
  }
  const velocity = 100 * beatmap.sliderMultiplier * svMultiplier / baseBeatLength;
  const duration = velocity > 0 ? slider.length / velocity : 1e3;
  _durationCache.set(slider, duration);
  return duration;
}

// src/renderer/SliderGeometry.ts
var _sliderPathCache = /* @__PURE__ */ new WeakMap();
function sampleSlider(slider) {
  let cached = _sliderPathCache.get(slider);
  if (cached === void 0) {
    cached = computeSliderPath(slider);
    _sliderPathCache.set(slider, cached);
  }
  return cached;
}
function computeSliderPath(slider) {
  const { curveType, curvePoints, length } = slider;
  switch (curveType) {
    case "L":
      return sampleLinear(curvePoints, length);
    case "P":
      return samplePerfectCircle(curvePoints, length);
    case "C":
    case "B":
    default:
      return sampleBezier(curvePoints, length);
  }
}
function warmSliderPaths(beatmap) {
  for (const obj of beatmap.hitObjects) {
    if (obj.type === "slider")
      sampleSlider(obj);
  }
}
function sampleLinear(points, length) {
  if (points.length === 0)
    return [];
  if (points.length === 1 || length <= 0)
    return [{ ...points[0] }];
  const count = Math.max(2, Math.ceil(length) + 1);
  const dists = buildCumulativeDists(points);
  const clampedLen = Math.min(length, dists[dists.length - 1]);
  const result = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1) * clampedLen;
    result.push(lerpPolyline(points, dists, t));
  }
  return result;
}
function sampleBezier(points, length) {
  if (points.length === 0)
    return [];
  if (points.length === 1 || length <= 0)
    return [{ ...points[0] }];
  const segments = splitBezierSegments(points);
  const densePoly = [];
  for (const seg of segments) {
    const polyLen = controlPolygonLength(seg);
    const nDense = Math.max(2, Math.ceil(polyLen) + 1);
    const first = densePoly.length === 0;
    for (let i = first ? 0 : 1; i < nDense; i++) {
      densePoly.push(evalBezier(seg, i / (nDense - 1)));
    }
  }
  return samplePolyline(densePoly, length, Math.max(2, Math.ceil(length) + 1));
}
function samplePerfectCircle(points, length) {
  if (points.length !== 3)
    return sampleBezier(points, length);
  if (length <= 0)
    return [{ ...points[0] }];
  const [a, b, c] = [points[0], points[1], points[2]];
  const count = Math.max(2, Math.ceil(length) + 1);
  const D = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(D) < 1e-6) {
    return sampleLinear(points, length);
  }
  const a2 = a.x * a.x + a.y * a.y;
  const b22 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;
  const ox = (a2 * (b.y - c.y) + b22 * (c.y - a.y) + c2 * (a.y - b.y)) / D;
  const oy = (a2 * (c.x - b.x) + b22 * (a.x - c.x) + c2 * (b.x - a.x)) / D;
  const radius = Math.hypot(a.x - ox, a.y - oy);
  const startAngle = Math.atan2(a.y - oy, a.x - ox);
  const midAngle = Math.atan2(b.y - oy, b.x - ox);
  const endAngle = Math.atan2(c.y - oy, c.x - ox);
  const midNorm = normalizeAngle(midAngle - startAngle);
  const endNorm = normalizeAngle(endAngle - startAngle);
  const sweepAngle = midNorm < endNorm ? endNorm : endNorm - 2 * Math.PI;
  const arcLength = Math.abs(sweepAngle) * radius;
  const clampedSweep = arcLength > 0 ? sweepAngle * Math.min(1, length / arcLength) : 0;
  const result = [];
  for (let i = 0; i < count; i++) {
    const angle = startAngle + clampedSweep * (i / (count - 1));
    result.push({ x: ox + radius * Math.cos(angle), y: oy + radius * Math.sin(angle) });
  }
  return result;
}
function splitBezierSegments(points) {
  const segments = [];
  let current = [points[0]];
  let i = 1;
  while (i < points.length) {
    current.push(points[i]);
    if (i + 1 < points.length && points[i].x === points[i + 1].x && points[i].y === points[i + 1].y) {
      segments.push(current);
      current = [points[i + 1]];
      i += 2;
    } else {
      i++;
    }
  }
  if (current.length > 1)
    segments.push(current);
  return segments.length > 0 ? segments : [points];
}
function evalBezier(points, t) {
  let pts = points.map((p) => ({ x: p.x, y: p.y }));
  for (let r = 1; r < pts.length; r++) {
    for (let j = 0; j < pts.length - r; j++) {
      pts[j] = {
        x: pts[j].x + (pts[j + 1].x - pts[j].x) * t,
        y: pts[j].y + (pts[j + 1].y - pts[j].y) * t
      };
    }
  }
  return pts[0];
}
function controlPolygonLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}
function buildCumulativeDists(points) {
  const dists = [0];
  for (let i = 1; i < points.length; i++) {
    dists.push(
      dists[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    );
  }
  return dists;
}
function samplePolyline(pts, length, count) {
  const dists = buildCumulativeDists(pts);
  const clampedLen = Math.min(length, dists[dists.length - 1]);
  const result = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1) * clampedLen;
    result.push(lerpPolyline(pts, dists, t));
  }
  return result;
}
function lerpPolyline(points, dists, t) {
  if (t <= 0)
    return { ...points[0] };
  if (t >= dists[dists.length - 1])
    return { ...points[points.length - 1] };
  let lo = 0;
  let hi = dists.length - 2;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (dists[mid + 1] < t)
      lo = mid + 1;
    else
      hi = mid;
  }
  const segStart = dists[lo];
  const segEnd = dists[lo + 1];
  const segLen = segEnd - segStart;
  const frac = segLen < 1e-10 ? 0 : (t - segStart) / segLen;
  const p0 = points[lo];
  const p1 = points[lo + 1];
  return {
    x: p0.x + (p1.x - p0.x) * frac,
    y: p0.y + (p1.y - p0.y) * frac
  };
}
function normalizeAngle(a) {
  const TWO_PI = 2 * Math.PI;
  return (a % TWO_PI + TWO_PI) % TWO_PI;
}

// src/utils/stacking.ts
var STACK_DISTANCE = 3;
function objectEndTime(beatmap, obj) {
  if (obj.type === "slider") {
    const dur = slideDurationMs(beatmap, obj);
    return obj.time + dur * obj.slides;
  }
  if (obj.type === "spinner")
    return obj.endTime;
  return obj.time;
}
var sliderEndCache = /* @__PURE__ */ new WeakMap();
function sliderEndPos(slider) {
  if (slider.slides % 2 === 0)
    return { x: slider.x, y: slider.y };
  const cached = sliderEndCache.get(slider);
  if (cached)
    return cached;
  const path = sampleSlider(slider);
  const end = path.length > 0 ? { x: path[path.length - 1].x, y: path[path.length - 1].y } : { x: slider.x, y: slider.y };
  sliderEndCache.set(slider, end);
  return end;
}
function applyStacking(beatmap, modDiff) {
  const objs = beatmap.hitObjects;
  if (objs.length === 0)
    return;
  for (const obj of objs) {
    if (obj.type !== "spinner")
      obj.stackHeight = 0;
  }
  if (beatmap.formatVersion >= 6)
    applyNewStacking(beatmap, modDiff);
  else
    applyOldStacking(beatmap, modDiff);
}
function applyNewStacking(beatmap, modDiff) {
  const objs = beatmap.hitObjects;
  const n = objs.length;
  const stackThreshold = modDiff.preemptMs * beatmap.stackLeniency;
  for (let i = n - 1; i > 0; i--) {
    const objI = objs[i];
    if (objI.type === "spinner")
      continue;
    if (objI.stackHeight !== 0)
      continue;
    if (objI.type === "circle") {
      let curI = i;
      for (let j = curI - 1; j >= 0; j--) {
        const objJ = objs[j];
        if (objJ.type === "spinner")
          continue;
        const endTimeJ = objectEndTime(beatmap, objJ);
        if (objs[curI].time - endTimeJ > stackThreshold)
          break;
        if (objJ.type === "slider") {
          const tail = sliderEndPos(objJ);
          const cur2 = objs[curI];
          const dx2 = tail.x - cur2.x;
          const dy2 = tail.y - cur2.y;
          if (dx2 * dx2 + dy2 * dy2 < STACK_DISTANCE * STACK_DISTANCE) {
            const offset = cur2.stackHeight - objJ.stackHeight + 1;
            for (let k = j + 1; k <= i; k++) {
              const objK = objs[k];
              if (objK.type === "spinner")
                continue;
              const tdx = tail.x - objK.x;
              const tdy = tail.y - objK.y;
              if (tdx * tdx + tdy * tdy < STACK_DISTANCE * STACK_DISTANCE) {
                objK.stackHeight -= offset;
              }
            }
            break;
          }
        }
        const cur = objs[curI];
        const dx = objJ.x - cur.x;
        const dy = objJ.y - cur.y;
        if (dx * dx + dy * dy < STACK_DISTANCE * STACK_DISTANCE) {
          objJ.stackHeight = cur.stackHeight + 1;
          curI = j;
        }
      }
    } else {
      let curI = i;
      for (let j = curI - 1; j >= 0; j--) {
        const objJ = objs[j];
        if (objJ.type === "spinner")
          continue;
        if (objs[curI].time - objJ.time > stackThreshold)
          break;
        const endPosJ = objJ.type === "slider" ? sliderEndPos(objJ) : { x: objJ.x, y: objJ.y };
        const cur = objs[curI];
        const dx = endPosJ.x - cur.x;
        const dy = endPosJ.y - cur.y;
        if (dx * dx + dy * dy < STACK_DISTANCE * STACK_DISTANCE) {
          objJ.stackHeight = cur.stackHeight + 1;
          curI = j;
        }
      }
    }
  }
}
function applyOldStacking(beatmap, modDiff) {
  const objs = beatmap.hitObjects;
  const n = objs.length;
  const stackThreshold = modDiff.preemptMs * beatmap.stackLeniency;
  for (let i = 0; i < n; i++) {
    const objI = objs[i];
    if (objI.type === "spinner")
      continue;
    if (objI.stackHeight !== 0 && objI.type !== "slider")
      continue;
    let startTime = objectEndTime(beatmap, objI);
    let sliderStack = 0;
    const iEndPos = objI.type === "slider" ? sliderEndPos(objI) : { x: objI.x, y: objI.y };
    for (let j = i + 1; j < n; j++) {
      const objJ = objs[j];
      if (objJ.type === "spinner")
        continue;
      if (objJ.time - startTime > stackThreshold)
        break;
      const dxStart = objJ.x - objI.x;
      const dyStart = objJ.y - objI.y;
      if (dxStart * dxStart + dyStart * dyStart < STACK_DISTANCE * STACK_DISTANCE) {
        objI.stackHeight++;
        startTime = objectEndTime(beatmap, objJ);
        continue;
      }
      if (objI.type === "slider") {
        const dxEnd = objJ.x - iEndPos.x;
        const dyEnd = objJ.y - iEndPos.y;
        if (dxEnd * dxEnd + dyEnd * dyEnd < STACK_DISTANCE * STACK_DISTANCE) {
          sliderStack++;
          objJ.stackHeight -= sliderStack;
          startTime = objectEndTime(beatmap, objJ);
        }
      }
    }
  }
}

// src/renderer/SliderGeometryLazer.ts
function sampleSliderLazer(slider) {
  return sampleSlider(slider);
}
function sliderTickTimesLazer(beatmap, slider, slideDur) {
  let baseBeatLength = 500;
  for (const tp of beatmap.timingPoints) {
    if (tp.time > slider.time)
      break;
    if (!tp.inherited)
      baseBeatLength = tp.beatLength;
  }
  const tickInterval = baseBeatLength / beatmap.sliderTickRate;
  if (!isFinite(tickInterval) || tickInterval <= 0)
    return [];
  const ticks = [];
  for (let slide = 0; slide < slider.slides; slide++) {
    const slideStart = slider.time + slide * slideDur;
    for (let k = 1; k * tickInterval <= slideDur - 1; k++) {
      ticks.push(slideStart + k * tickInterval);
    }
  }
  return ticks;
}
function sliderBallPosLazer(path, timeMs, sliderStartTime, slideDur, slides) {
  const elapsed = timeMs - sliderStartTime;
  const slideF = Math.max(0, Math.min(slides, elapsed / slideDur));
  const slideIdx = Math.min(Math.floor(slideF), slides - 1);
  let frac = slideF - slideIdx;
  if (slideIdx % 2 === 1)
    frac = 1 - frac;
  return pointAtFraction(path, frac);
}
function pointAtFraction(path, t) {
  if (path.length === 0)
    return { x: 0, y: 0 };
  if (t <= 0 || path.length === 1)
    return { ...path[0] };
  if (t >= 1)
    return { ...path[path.length - 1] };
  const idx = t * (path.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, path.length - 1);
  const frac = idx - lo;
  return {
    x: path[lo].x + (path[hi].x - path[lo].x) * frac,
    y: path[lo].y + (path[hi].y - path[lo].y) * frac
  };
}

// src/utils/hitJudge.ts
var SPINNER_CENTER_X = 256;
var SPINNER_CENTER_Y = 192;
var HITTABLE_RANGE = 400;
var NOTELOCK_TOLERANCE = 3;
function getSpinnerStateAt(data, timeMs) {
  if (data.times.length === 0)
    return { cumAngle: 0, absAngle: 0 };
  if (timeMs <= data.times[0])
    return { cumAngle: 0, absAngle: 0 };
  let lo = 0, hi = data.times.length - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (data.times[mid] <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return { cumAngle: data.cumAngles[lo], absAngle: data.absAngles[lo] };
}
function difficultyRate2(od, minV, midV, maxV) {
  const d = Math.fround(od);
  if (d > 5)
    return midV + (maxV - midV) * (d - 5) / 5;
  if (d < 5)
    return midV - (midV - minV) * (5 - d) / 5;
  return midV;
}
function stableSpinnerRequirementHalfSpins(od, durationMs) {
  return Math.floor(durationMs / 1e3 * difficultyRate2(od, 3, 5, 7.5));
}
function lazerSpinnerRequirementFullSpins(od, durationMs) {
  return Math.floor(durationMs / 1e3 * difficultyRate2(od, 1.5, 2.5, 3.75) + 1e-4);
}
function lazerSpinnerMaxBonusSpins(od, durationMs) {
  const maxRps = difficultyRate2(od, 250, 380, 430) / 60;
  const maxTotal = Math.floor(durationMs / 1e3 * maxRps + 1e-4);
  return Math.max(0, maxTotal - lazerSpinnerRequirementFullSpins(od, durationMs) - 2);
}
function spinnerBonusTickTimes(times, absAngles, od, durationMs, isLazer) {
  const out = [];
  if (isLazer) {
    const req = lazerSpinnerRequirementFullSpins(od, durationMs);
    const last = req + 2 + lazerSpinnerMaxBonusSpins(od, durationMs);
    let k = req + 3;
    for (let i = 0; i < absAngles.length && k <= last; i++) {
      const spins = Math.floor(absAngles[i] / (2 * Math.PI));
      while (k <= spins && k <= last) {
        out.push(times[i]);
        k++;
      }
    }
  } else {
    const req = stableSpinnerRequirementHalfSpins(od, durationMs);
    let c = 1;
    for (let i = 0; i < absAngles.length; i++) {
      const half = Math.floor(absAngles[i] / Math.PI);
      while (c <= half) {
        if (c > req + 3 && (c - (req + 3)) % 2 === 0)
          out.push(times[i]);
        c++;
      }
    }
  }
  return out;
}
function spinnerProgress(od, durationMs, totalRad, isLazer) {
  if (isLazer) {
    const req2 = lazerSpinnerRequirementFullSpins(od, durationMs);
    if (req2 === 0)
      return 1;
    return Math.min(1, totalRad / (2 * Math.PI) / req2);
  }
  const req = stableSpinnerRequirementHalfSpins(od, durationMs);
  if (req === 0)
    return 1;
  return Math.min(1, totalRad / Math.PI / req);
}
function judgeSpinner(od, durationMs, totalRad, isLazer) {
  if (isLazer) {
    const req2 = lazerSpinnerRequirementFullSpins(od, durationMs);
    if (req2 === 0)
      return 300;
    const completion = totalRad / (2 * Math.PI) / req2;
    if (completion >= 1)
      return 300;
    if (completion >= 0.9)
      return 100;
    if (completion >= 0.75)
      return 50;
    return 0;
  }
  const req = stableSpinnerRequirementHalfSpins(od, durationMs);
  if (req === 0)
    return 300;
  const halfSpins = totalRad / Math.PI;
  if (halfSpins >= req + 1)
    return 300;
  if (halfSpins >= req - 1)
    return 100;
  if (halfSpins >= Math.floor(req / 4))
    return 50;
  return 0;
}
var TAU = 2 * Math.PI;
function makeSpinHistory() {
  let totalAccum = 0;
  let accumAtLastCompletion = 0;
  let currentMax = 0;
  let completedSpins = 0;
  return {
    report(delta) {
      totalAccum += delta;
      let currentSpin = totalAccum - accumAtLastCompletion;
      currentMax = Math.max(currentMax, Math.abs(currentSpin));
      while (currentMax >= TAU) {
        const dir = Math.sign(currentSpin) || 1;
        completedSpins++;
        accumAtLastCompletion += dir * TAU;
        currentSpin = totalAccum - accumAtLastCompletion;
        currentMax = Math.abs(currentSpin);
      }
    },
    total() {
      return TAU * completedSpins + currentMax;
    }
  };
}
function buildSpinnerAngles(spinner, frames, cumTimes, od, isLazer, speed) {
  const times = [];
  const cumAngles = [];
  const absAngles = [];
  const hist = makeSpinHistory();
  let prevAngle = null;
  let prevDelta = 0;
  let cumAngle = 0;
  const sample = (t, x, y) => {
    const dx = x - SPINNER_CENTER_X;
    const dy = y - SPINNER_CENTER_Y;
    if (dx * dx + dy * dy >= 25) {
      const angle = Math.atan2(dy, dx);
      if (prevAngle !== null) {
        let d = angle - prevAngle;
        while (d - prevDelta > Math.PI)
          d -= TAU;
        while (d - prevDelta < -Math.PI)
          d += TAU;
        prevDelta = d;
        const scaled = d * speed;
        cumAngle += scaled;
        hist.report(scaled);
      }
      prevAngle = angle;
    }
    times.push(t);
    cumAngles.push(cumAngle);
    absAngles.push(hist.total());
  };
  const start = cursorAt(frames, cumTimes, spinner.time);
  sample(spinner.time, start.x, start.y);
  for (let j = 0; j < frames.length; j++) {
    const t = cumTimes[j];
    if (t <= spinner.time)
      continue;
    if (t >= spinner.endTime)
      break;
    const f = frames[j];
    sample(t, f.x, f.y);
  }
  const end = cursorAt(frames, cumTimes, spinner.endTime);
  sample(spinner.endTime, end.x, end.y);
  const bonusTimes = spinnerBonusTickTimes(
    times,
    absAngles,
    od,
    spinner.endTime - spinner.time,
    isLazer
  );
  return { times, cumAngles, absAngles, bonusTimes };
}
function buildCumTimes(frames) {
  const cumTimes = new Array(frames.length);
  let acc = 0;
  for (let i = 0; i < frames.length; i++) {
    acc += frames[i].timeDelta;
    cumTimes[i] = acc;
  }
  return cumTimes;
}
var LEFT_BTN = 5;
var RIGHT_BTN = 10;
function buildKeyPresses(frames, cumTimes) {
  const presses = [];
  let prevKeys = 0;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const curKeys = f.keys & 15;
    const leftRise = (prevKeys & LEFT_BTN) === 0 && (curKeys & LEFT_BTN) !== 0;
    const rightRise = (prevKeys & RIGHT_BTN) === 0 && (curKeys & RIGHT_BTN) !== 0;
    if (leftRise)
      presses.push({ timeMs: cumTimes[i], x: f.x, y: f.y });
    if (rightRise)
      presses.push({ timeMs: cumTimes[i], x: f.x, y: f.y });
    prevKeys = curKeys;
  }
  return presses;
}
function cursorAt(frames, cumTimes, timeMs) {
  if (frames.length === 0)
    return { x: 0, y: 0 };
  const last = frames.length - 1;
  if (timeMs <= cumTimes[0])
    return { x: frames[0].x, y: frames[0].y };
  if (timeMs >= cumTimes[last])
    return { x: frames[last].x, y: frames[last].y };
  let lo = 0, hi = last - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (cumTimes[mid] <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  const t0 = cumTimes[lo], t1 = cumTimes[lo + 1];
  const frac = t1 > t0 ? (timeMs - t0) / (t1 - t0) : 0;
  const f0 = frames[lo], f1 = frames[lo + 1];
  return { x: f0.x + (f1.x - f0.x) * frac, y: f0.y + (f1.y - f0.y) * frac };
}
function anyKeyHeld(frames, cumTimes, timeMs) {
  if (frames.length === 0)
    return false;
  const last = frames.length - 1;
  if (timeMs <= cumTimes[0])
    return (frames[0].keys & 15) !== 0;
  if (timeMs >= cumTimes[last])
    return (frames[last].keys & 15) !== 0;
  let lo = 0, hi = last;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (cumTimes[mid] <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return (frames[lo].keys & 15) !== 0;
}
function pointAtFraction2(path, t) {
  if (path.length === 0)
    return { x: 0, y: 0 };
  if (t <= 0 || path.length === 1)
    return { ...path[0] };
  if (t >= 1)
    return { ...path[path.length - 1] };
  const idx = t * (path.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, path.length - 1);
  const frac = idx - lo;
  return {
    x: path[lo].x + (path[hi].x - path[lo].x) * frac,
    y: path[lo].y + (path[hi].y - path[lo].y) * frac
  };
}
function sliderBallPos(path, timeMs, sliderStartTime, slideDur, slides) {
  const elapsed = timeMs - sliderStartTime;
  const slideF = Math.max(0, Math.min(slides, elapsed / slideDur));
  const slideIdx = Math.min(Math.floor(slideF), slides - 1);
  let frac = slideF - slideIdx;
  if (slideIdx % 2 === 1)
    frac = 1 - frac;
  return pointAtFraction2(path, frac);
}
function sliderTickTimes(beatmap, slider, slideDur) {
  let baseBeatLength = 500;
  for (const tp of beatmap.timingPoints) {
    if (tp.time > slider.time)
      break;
    if (!tp.inherited)
      baseBeatLength = tp.beatLength;
  }
  const tickInterval = baseBeatLength / beatmap.sliderTickRate;
  if (!isFinite(tickInterval) || tickInterval <= 0)
    return [];
  const ticks = [];
  for (let slide = 0; slide < slider.slides; slide++) {
    const slideStart = slider.time + slide * slideDur;
    const slideEnd = slideStart + slideDur;
    for (let t = slideStart + tickInterval; t < slideEnd - 1; t += tickInterval) {
      ticks.push(t);
    }
  }
  return ticks;
}
function computeHitResults(beatmap, replay, modDiff) {
  const od = modDiff.od;
  const useLazerRules = modDiff.isLazer && !modDiff.lzLegacyNotelock;
  const useLazerSliderScoring = modDiff.isLazer && !modDiff.lzNoSliderAcc;
  const w300 = useLazerRules ? modDiff.hitWindow300U : modDiff.hitWindow300;
  const w100 = useLazerRules ? modDiff.hitWindow100U : modDiff.hitWindow100;
  const w50 = useLazerRules ? modDiff.hitWindow50U : modDiff.hitWindow50;
  const hitRadius = modDiff.circleRadiusPx;
  const hitRadiusSq = hitRadius * hitRadius;
  const fx = modDiff.flipX ? (x) => 512 - x : (x) => x;
  const fy = modDiff.flipY ? (y) => 384 - y : (y) => y;
  const cumTimes = buildCumTimes(replay.frames);
  const keyPresses = buildKeyPresses(replay.frames, cumTimes);
  const spinnerAngles = /* @__PURE__ */ new Map();
  const states = new Array(beatmap.hitObjects.length);
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    if (obj.type === "spinner") {
      spinnerAngles.set(i, buildSpinnerAngles(obj, replay.frames, cumTimes, modDiff.od, modDiff.isLazer, modDiff.speed));
      states[i] = {
        type: "spinner",
        startTime: obj.time,
        endTime: obj.endTime,
        x: SPINNER_CENTER_X,
        y: SPINNER_CENTER_Y,
        headResolved: true,
        headHit: true,
        headPressTime: obj.endTime,
        headJudgement: 0
      };
    } else if (obj.type === "circle") {
      const stackShift = obj.stackHeight * hitRadius / 10;
      states[i] = {
        type: "circle",
        startTime: obj.time,
        endTime: obj.time,
        x: fx(obj.x) - stackShift,
        y: fy(obj.y) - stackShift,
        headResolved: false,
        headHit: false,
        headPressTime: 0,
        headJudgement: 0
      };
    } else {
      const stackShift = obj.stackHeight * hitRadius / 10;
      const slideDur = slideDurationMs(beatmap, obj);
      states[i] = {
        type: "slider",
        startTime: obj.time,
        endTime: obj.time + slideDur * obj.slides,
        x: fx(obj.x) - stackShift,
        y: fy(obj.y) - stackShift,
        headResolved: false,
        headHit: false,
        headPressTime: 0,
        headJudgement: 0
      };
    }
  }
  let walkStart = 0;
  for (let pi = 0; pi < keyPresses.length; pi++) {
    const p = keyPresses[pi];
    while (walkStart < states.length) {
      const s = states[walkStart];
      if (s.type === "spinner" || s.headResolved) {
        walkStart++;
        continue;
      }
      const expireAt = s.type === "slider" && !modDiff.isLazer ? Math.min(s.startTime + w50, s.endTime) : s.startTime + w50;
      if (expireAt < p.timeMs) {
        s.headResolved = true;
        s.headHit = false;
        s.headJudgement = 0;
        s.headPressTime = expireAt;
        walkStart++;
        continue;
      }
      break;
    }
    let candIdx = -1;
    for (let j = walkStart; j < states.length; j++) {
      const s = states[j];
      if (s.startTime > p.timeMs + HITTABLE_RANGE)
        break;
      if (s.type === "spinner" || s.headResolved)
        continue;
      const dx = p.x - s.x, dy = p.y - s.y;
      if (dx * dx + dy * dy > hitRadiusSq)
        continue;
      candIdx = j;
      break;
    }
    if (candIdx < 0)
      continue;
    const X = states[candIdx];
    let blocked = false;
    if (useLazerRules) {
      let lastObj = null;
      for (let j = candIdx - 1; j >= 0; j--) {
        const Y = states[j];
        if (Y.type !== "spinner") {
          lastObj = Y;
          break;
        }
      }
      if (lastObj !== null && !lastObj.headHit && p.timeMs < lastObj.startTime) {
        blocked = true;
      }
    } else {
      for (let j = 0; j < candIdx; j++) {
        const Y = states[j];
        const yUnresolved = Y.type === "circle" ? !Y.headResolved : p.timeMs < Y.endTime;
        if (!yUnresolved)
          continue;
        if (Y.endTime + NOTELOCK_TOLERANCE < X.startTime) {
          blocked = true;
          break;
        }
      }
    }
    if (!blocked && Math.abs(p.timeMs - X.startTime) >= HITTABLE_RANGE) {
      blocked = true;
    }
    if (blocked) {
      continue;
    }
    const offset = Math.abs(p.timeMs - X.startTime);
    let judgement;
    if (useLazerRules) {
      if (offset <= w300)
        judgement = 300;
      else if (offset <= w100)
        judgement = 100;
      else if (offset <= w50)
        judgement = 50;
      else
        judgement = 0;
    } else {
      if (offset < w300)
        judgement = 300;
      else if (offset < w100)
        judgement = 100;
      else if (offset < w50)
        judgement = 50;
      else
        judgement = 0;
    }
    X.headResolved = true;
    X.headHit = judgement !== 0;
    X.headJudgement = judgement;
    X.headPressTime = p.timeMs;
    if (useLazerRules && judgement !== 0) {
      for (let j = walkStart; j < candIdx; j++) {
        const Y = states[j];
        if (Y.type === "spinner" || Y.headResolved)
          continue;
        Y.headResolved = true;
        Y.headHit = false;
        Y.headJudgement = 0;
        Y.headPressTime = p.timeMs;
      }
    }
  }
  for (const s of states) {
    if (s.type === "spinner" || s.headResolved)
      continue;
    s.headResolved = true;
    s.headHit = false;
    s.headJudgement = 0;
    s.headPressTime = s.startTime + w50;
  }
  const results = [];
  const trackingIntervals = [];
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    const s = states[i];
    if (obj.type === "spinner") {
      const duration = obj.endTime - obj.time;
      const angleData = spinnerAngles.get(i);
      const totalRad = angleData.absAngles.length > 0 ? angleData.absAngles[angleData.absAngles.length - 1] : 0;
      const judgement = judgeSpinner(od, duration, totalRad, modDiff.isLazer);
      results.push({
        objectIndex: i,
        judgement,
        time: obj.endTime,
        x: SPINNER_CENTER_X,
        y: SPINNER_CENTER_Y,
        hitSound: obj.hitSound,
        comboBreak: judgement === 0,
        spinnerTotalRad: totalRad,
        spinnerBonusTimes: angleData.bonusTimes
      });
      continue;
    }
    if (obj.type === "circle") {
      results.push({
        objectIndex: i,
        judgement: s.headJudgement,
        time: s.headPressTime,
        x: s.x,
        y: s.y,
        hitSound: obj.hitSound ?? 0,
        comboBreak: s.headJudgement === 0
      });
      continue;
    }
    const slider = obj;
    const slideDur = slideDurationMs(beatmap, slider);
    const path = modDiff.isLazer ? sampleSliderLazer(slider) : sampleSlider(slider);
    const followBase2 = hitRadius * hitRadius;
    const followExp2 = (2.4 * hitRadius) ** 2;
    const tailTime = slider.time + slideDur * slider.slides;
    const totalDur = slideDur * slider.slides;
    const tailLeniency = Math.min(36, totalDur / 2);
    const stackShift = slider.stackHeight * hitRadius / 10;
    const tickTimes = modDiff.isLazer ? sliderTickTimesLazer(beatmap, slider, slideDur) : sliderTickTimes(beatmap, slider, slideDur);
    const nonTail = [];
    for (const t of tickTimes)
      nonTail.push({ t, kind: "tick" });
    for (let edge = 1; edge < slider.slides; edge++) {
      nonTail.push({ t: slider.time + slideDur * edge, kind: "repeat" });
    }
    nonTail.sort((a, b) => a.t - b.t);
    const headHit = s.headHit;
    const totalNested = 1 + tickTimes.length + slider.slides;
    let hitNested = headHit ? 1 : 0;
    let tracking = false;
    let trackingStart = null;
    const ballStackedAt = (t) => {
      const raw = modDiff.isLazer ? sliderBallPosLazer(path, t, slider.time, slideDur, slider.slides) : sliderBallPos(path, t, slider.time, slideDur, slider.slides);
      return { x: fx(raw.x) - stackShift, y: fy(raw.y) - stackShift };
    };
    const stepTracking = (t, cx, cy, keysHeld) => {
      const wasTracking = tracking;
      if (!keysHeld) {
        tracking = false;
      } else {
        const b = ballStackedAt(t);
        const dx = cx - b.x, dy = cy - b.y;
        const d2 = dx * dx + dy * dy;
        tracking = tracking ? d2 <= followExp2 : d2 <= followBase2;
      }
      if (!wasTracking && tracking) {
        trackingStart = t;
      } else if (wasTracking && !tracking && trackingStart !== null) {
        trackingIntervals.push({ start: trackingStart, end: t });
        trackingStart = null;
      }
    };
    let frameIdx = 0;
    while (frameIdx < replay.frames.length && cumTimes[frameIdx] < slider.time)
      frameIdx++;
    for (const ev of nonTail) {
      while (frameIdx < replay.frames.length && cumTimes[frameIdx] < ev.t) {
        const f = replay.frames[frameIdx];
        stepTracking(cumTimes[frameIdx], f.x, f.y, (f.keys & 15) !== 0);
        frameIdx++;
      }
      const cur = cursorAt(replay.frames, cumTimes, ev.t);
      const kh = anyKeyHeld(replay.frames, cumTimes, ev.t);
      stepTracking(ev.t, cur.x, cur.y, kh);
      const hit = tracking;
      if (hit)
        hitNested++;
      const b = ballStackedAt(ev.t);
      results.push({
        objectIndex: i,
        judgement: hit ? 300 : 0,
        time: ev.t,
        x: b.x,
        y: b.y,
        hitSound: 0,
        comboBreak: !hit && headHit,
        isSliderSub: true
      });
    }
    const tailStart = nonTail.length > 0 ? Math.max(tailTime - tailLeniency, nonTail[nonTail.length - 1].t) : tailTime - tailLeniency;
    while (frameIdx < replay.frames.length && cumTimes[frameIdx] < tailStart) {
      const f = replay.frames[frameIdx];
      stepTracking(cumTimes[frameIdx], f.x, f.y, (f.keys & 15) !== 0);
      frameIdx++;
    }
    {
      const cur = cursorAt(replay.frames, cumTimes, tailStart);
      const kh = anyKeyHeld(replay.frames, cumTimes, tailStart);
      stepTracking(tailStart, cur.x, cur.y, kh);
    }
    const tailHit = tracking;
    if (tailHit)
      hitNested++;
    if (trackingStart !== null) {
      trackingIntervals.push({ start: trackingStart, end: tailTime });
      trackingStart = null;
    }
    const tb = ballStackedAt(tailStart);
    results.push({
      objectIndex: i,
      judgement: tailHit ? 300 : 0,
      time: tailTime,
      x: tb.x,
      y: tb.y,
      hitSound: 0,
      comboBreak: false,
      isSliderSub: true,
      // Default lazer: the tail is a SliderTail (acc-affecting, max 150).
      // CL / stable: tail has no acc contribution — accMax stays undefined and
      // isSliderSub alone keeps it out of the accuracy denominator.
      ...useLazerSliderScoring ? { accMax: 150 } : {}
    });
    let sliderJudgement;
    if (useLazerSliderScoring) {
      sliderJudgement = s.headJudgement;
    } else if (hitNested === totalNested)
      sliderJudgement = 300;
    else if (hitNested === 0)
      sliderJudgement = 0;
    else if (hitNested / totalNested >= 0.5)
      sliderJudgement = 100;
    else
      sliderJudgement = 50;
    const finalBall = ballStackedAt(tailTime);
    results.push({
      objectIndex: i,
      judgement: sliderJudgement,
      time: s.headPressTime,
      displayTime: tailTime,
      x: finalBall.x,
      y: finalBall.y,
      hitSound: slider.hitSound ?? 0,
      comboBreak: !headHit
    });
  }
  return { results, spinnerAngles, trackingIntervals };
}

// src/utils/scoreProcessor.ts
function roundToEven(x) {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff < 0.5)
    return floor;
  if (diff > 0.5)
    return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}
function computeDifficultyMultiplier(beatmap) {
  const hos = beatmap.hitObjects;
  if (hos.length === 0)
    return 2;
  const first = hos[0].time;
  let lastEnd = first;
  for (const o of hos) {
    let end = o.time;
    if (o.type === "spinner")
      end = o.endTime;
    else if (o.type === "slider")
      end = o.time + slideDurationMs(beatmap, o) * o.slides;
    if (end > lastEnd)
      lastEnd = end;
  }
  const drainSec = Math.max(1, Math.trunc((lastEnd - first) / 1e3));
  const density = Math.min(16, Math.max(0, hos.length / drainSec * 8));
  const fr = Math.fround;
  const sum = fr(beatmap.hpDrainRate) + fr(beatmap.overallDifficulty) + fr(beatmap.circleSize) + fr(density);
  return Math.max(2, Math.min(7, roundToEven(sum / 38 * 5)));
}
var MOD_MULTIPLIERS = [
  [1 << 0, 0.5],
  // NoFail
  [1 << 1, 0.5],
  // Easy
  [1 << 8, 0.3],
  // HalfTime
  [1 << 3, 1.06],
  // Hidden
  [1 << 4, 1.06],
  // HardRock
  [1 << 6, 1.12],
  // DoubleTime (NC shares DT's bit)
  [1 << 10, 1.12],
  // Flashlight
  [1 << 12, 0.9],
  // SpunOut
  [1 << 7, 0],
  // Relax
  [1 << 13, 0]
  // Autopilot
];
function computeModMultiplier(mods) {
  let m = 1;
  for (const [bit, val] of MOD_MULTIPLIERS) {
    if ((mods & bit) !== 0)
      m *= val;
  }
  return m;
}
function rateAdjustScoreMultiplier(speed) {
  const truncated = Math.trunc(speed * 10) / 10;
  const offset = truncated - 1;
  return speed >= 1 ? 1 + offset / 5 : 0.6 + offset;
}
function hasDefaultConfig(mod) {
  return mod.settings === void 0 || Object.keys(mod.settings).length === 0;
}
function computeTaikoModMultiplierV2(lazerMods) {
  let m = 1;
  for (const mod of lazerMods) {
    switch (mod.acronym) {
      case "NF":
        m *= 0.5;
        break;
      case "EZ":
        m *= 0.5;
        break;
      case "HD":
        m *= hasDefaultConfig(mod) ? 1.06 : 1;
        break;
      case "HR":
        m *= hasDefaultConfig(mod) ? 1.06 : 1;
        break;
      case "FL":
        m *= hasDefaultConfig(mod) ? 1.12 : 1;
        break;
      case "DT":
      case "NC": {
        const sc = mod.settings?.["speed_change"];
        const speed = typeof sc === "number" ? sc : 1.5;
        m *= rateAdjustScoreMultiplier(speed);
        break;
      }
      case "HT":
      case "DC": {
        const sc = mod.settings?.["speed_change"];
        const speed = typeof sc === "number" ? sc : 0.75;
        m *= rateAdjustScoreMultiplier(speed);
        break;
      }
    }
  }
  return m;
}
function computeGrade(c300, c100, c50, miss, mods) {
  const total = c300 + c100 + c50 + miss;
  if (total === 0)
    return "D";
  const r300 = c300 / total;
  const r50 = c50 / total;
  let g;
  if (c300 === total)
    g = "SS";
  else if (r300 > 0.9 && r50 < 0.01 && miss === 0)
    g = "S";
  else if (r300 > 0.8 && miss === 0 || r300 > 0.9)
    g = "A";
  else if (r300 > 0.7 && miss === 0 || r300 > 0.8)
    g = "B";
  else if (r300 > 0.6)
    g = "C";
  else
    g = "D";
  const silver = (mods & (1 << 3 | 1 << 10)) !== 0;
  if (silver) {
    if (g === "S")
      return "SH";
    if (g === "SS")
      return "SSH";
  }
  return g;
}
function buildSliderSubKinds(beatmap, isLazer) {
  const m = /* @__PURE__ */ new Map();
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    if (obj.type !== "slider")
      continue;
    const slideDur = slideDurationMs(beatmap, obj);
    const ticks = isLazer ? sliderTickTimesLazer(beatmap, obj, slideDur) : sliderTickTimes(beatmap, obj, slideDur);
    const events = [];
    for (const t of ticks)
      events.push({ t, kind: "tick" });
    for (let edge = 1; edge < obj.slides; edge++) {
      events.push({ t: obj.time + slideDur * edge, kind: "repeat" });
    }
    events.sort((a, b) => a.t - b.t);
    const kinds = events.map((e) => e.kind);
    kinds.push("tail");
    m.set(i, kinds);
  }
  return m;
}
function stableSpinnerSpinScore(od, durationMs, totalRad) {
  const req = stableSpinnerRequirementHalfSpins(od, durationMs);
  const halfSpins = Math.floor(totalRad / Math.PI);
  let score = 0;
  for (let c = 2; c <= halfSpins; c++) {
    if (c > req + 3 && (c - (req + 3)) % 2 === 0)
      score += 1100;
    else if (c % 2 === 0)
      score += 100;
  }
  return score;
}
function lazerSpinnerBonusPortion(od, durationMs, totalRad) {
  const req = lazerSpinnerRequirementFullSpins(od, durationMs);
  const maxBonus = lazerSpinnerMaxBonusSpins(od, durationMs);
  const spins = Math.floor(totalRad / (2 * Math.PI));
  const small = Math.min(spins, req + 2);
  const large = Math.max(0, Math.min(spins - req - 2, maxBonus));
  return small * 10 + large * 50;
}
function computeScoreTimeline(results, beatmap, modDiff) {
  if (modDiff.isLazer)
    return computeScoreV3Timeline(results, beatmap, modDiff);
  return computeScoreV1Timeline(results, beatmap, modDiff);
}
function computeScoreV1Timeline(results, beatmap, modDiff) {
  const diffMult = computeDifficultyMultiplier(beatmap);
  const modMult = computeModMultiplier(modDiff.mods);
  const subKinds = buildSliderSubKinds(beatmap, false);
  const events = [];
  const subCursor = /* @__PURE__ */ new Map();
  for (const r of results) {
    const objIdx = r.objectIndex;
    const obj = beatmap.hitObjects[objIdx];
    if (r.isSliderSub === true) {
      const idx = subCursor.get(objIdx) ?? 0;
      subCursor.set(objIdx, idx + 1);
      const kind = subKinds.get(objIdx)?.[idx] ?? "tick";
      const hit2 = r.judgement !== 0;
      if (hit2) {
        events.push({
          time: r.time,
          kind: "raw",
          value: kind === "tick" ? 10 : 30,
          combo: "increment",
          counts: null
        });
      } else {
        events.push({
          time: r.time,
          kind: "raw",
          value: 0,
          combo: kind === "tail" ? "hold" : "reset",
          counts: null
        });
      }
      continue;
    }
    if (obj.type === "slider") {
      const headHit = !r.comboBreak;
      const tailTime = r.displayTime ?? r.time;
      events.push({
        time: r.time,
        kind: "raw",
        value: headHit ? 30 : 0,
        combo: headHit ? "increment" : "reset",
        counts: null
      });
      if (r.judgement === 0) {
        events.push({ time: tailTime, kind: "scaled", value: 0, combo: "hold", counts: 0 });
      } else {
        const stdJ = r.judgement;
        events.push({
          time: tailTime,
          kind: "scaled",
          value: stdJ,
          combo: "hold",
          counts: stdJ
        });
      }
      continue;
    }
    const hit = r.judgement !== 0;
    if (hit) {
      const stdJ = r.judgement;
      events.push({
        time: r.time,
        kind: "scaled",
        value: stdJ,
        combo: "increment",
        counts: stdJ
      });
    } else {
      events.push({
        time: r.time,
        kind: "scaled",
        value: 0,
        combo: "reset",
        counts: 0
      });
    }
    if (obj.type === "spinner" && r.spinnerTotalRad !== void 0) {
      const spin = stableSpinnerSpinScore(modDiff.od, obj.endTime - obj.time, r.spinnerTotalRad);
      if (spin > 0) {
        events.push({ time: r.time, kind: "raw", value: spin, combo: "hold", counts: null });
      }
    }
  }
  events.sort((a, b) => {
    if (a.time !== b.time)
      return a.time - b.time;
    const pa = a.kind === "raw" ? 0 : 1;
    const pb = b.kind === "raw" ? 0 : 1;
    return pa - pb;
  });
  const frames = [];
  let score = 0, combo = 0, maxCombo = 0;
  let c300 = 0, c100 = 0, c50 = 0, miss = 0;
  for (const e of events) {
    if (e.combo === "reset")
      combo = 0;
    else if (e.combo === "increment")
      combo += 1;
    if (combo > maxCombo)
      maxCombo = combo;
    const comboBefore = Math.max(combo - 1, 0);
    if (e.kind === "raw") {
      score += e.value;
    } else if (e.value > 0) {
      const v = e.value;
      score += v + Math.trunc(v * comboBefore * diffMult * modMult / 25);
    }
    if (e.counts === 300)
      c300++;
    else if (e.counts === 100)
      c100++;
    else if (e.counts === 50)
      c50++;
    else if (e.counts === 0)
      miss++;
    const grade = computeGrade(c300, c100, c50, miss, modDiff.mods);
    frames.push({ time: e.time, score, combo, maxCombo, grade });
  }
  return frames;
}
var SV_BASE = 300;
var SV_SLIDER_END = 150;
var SV_SLIDER_START = 30;
var SV_LEGACY_END = 10;
function lzMaxValue(k) {
  switch (k) {
    case "base":
      return SV_BASE;
    case "sliderStart":
      return SV_SLIDER_START;
    case "sliderPoint":
      return SV_SLIDER_START;
    case "sliderRepeat":
      return SV_SLIDER_START;
    case "sliderEnd":
      return SV_SLIDER_END;
    case "legacyEnd":
      return SV_LEGACY_END;
  }
}
function lzAffectsAcc(k) {
  return k === "base" || k === "sliderEnd";
}
function computeLazerGrade(accuracy, miss, mods) {
  let g;
  if (accuracy >= 1)
    g = "SS";
  else if (accuracy >= 0.95 && miss === 0)
    g = "S";
  else if (accuracy >= 0.9)
    g = "A";
  else if (accuracy >= 0.8)
    g = "B";
  else if (accuracy >= 0.7)
    g = "C";
  else
    g = "D";
  const silver = (mods & (1 << 3 | 1 << 10)) !== 0;
  if (silver) {
    if (g === "S")
      return "SH";
    if (g === "SS")
      return "SSH";
  }
  return g;
}
function computeScoreV3Timeline(results, beatmap, modDiff) {
  const modMult = computeModMultiplier(modDiff.mods);
  const useLazerSliderAcc = !modDiff.lzNoSliderAcc;
  const subKinds = buildSliderSubKinds(beatmap, true);
  let comboPartMax = 0;
  let accPartMax = 0;
  let maxHits = 0;
  let cMax = 0;
  const pushMax = (k) => {
    const v = lzMaxValue(k);
    cMax += 1;
    comboPartMax += v * Math.sqrt(cMax);
    if (lzAffectsAcc(k)) {
      accPartMax += v;
      maxHits += 1;
    }
  };
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    if (obj.type === "circle" || obj.type === "spinner") {
      pushMax("base");
      continue;
    }
    pushMax(useLazerSliderAcc ? "base" : "sliderStart");
    const subs = subKinds.get(i) ?? [];
    for (const s of subs) {
      if (s === "tail")
        continue;
      pushMax(s === "tick" ? "sliderPoint" : "sliderRepeat");
    }
    pushMax(useLazerSliderAcc ? "sliderEnd" : "legacyEnd");
  }
  const events = [];
  const subCursor = /* @__PURE__ */ new Map();
  for (const r of results) {
    const objIdx = r.objectIndex;
    const obj = beatmap.hitObjects[objIdx];
    if (r.isSliderSub === true) {
      const idx = subCursor.get(objIdx) ?? 0;
      subCursor.set(objIdx, idx + 1);
      const subKind = subKinds.get(objIdx)?.[idx] ?? "tick";
      const hit2 = r.judgement !== 0;
      let kind;
      if (subKind === "tail")
        kind = useLazerSliderAcc ? "sliderEnd" : "legacyEnd";
      else if (subKind === "repeat")
        kind = "sliderRepeat";
      else
        kind = "sliderPoint";
      events.push({
        time: r.time,
        kind,
        hit: hit2,
        judgement: hit2 ? 300 : 0,
        isMain: false,
        counts: null
      });
      continue;
    }
    if (obj.type === "slider") {
      const headHit = !r.comboBreak;
      if (useLazerSliderAcc) {
        const stdJ2 = r.judgement;
        events.push({
          time: r.time,
          kind: "base",
          hit: headHit,
          judgement: stdJ2,
          isMain: true,
          counts: stdJ2
        });
      } else {
        events.push({
          time: r.time,
          kind: "sliderStart",
          hit: headHit,
          judgement: headHit ? 300 : 0,
          isMain: true,
          counts: null
        });
      }
      continue;
    }
    const hit = r.judgement !== 0;
    const stdJ = r.judgement;
    const bonus2 = obj.type === "spinner" && r.spinnerTotalRad !== void 0 ? lazerSpinnerBonusPortion(modDiff.od, obj.endTime - obj.time, r.spinnerTotalRad) : 0;
    events.push({
      time: r.time,
      kind: "base",
      hit,
      judgement: stdJ,
      isMain: true,
      counts: stdJ,
      bonus: bonus2
    });
  }
  events.sort((a, b) => {
    if (a.time !== b.time)
      return a.time - b.time;
    return (a.isMain ? 1 : 0) - (b.isMain ? 1 : 0);
  });
  const frames = [];
  let combo = 0, maxCombo = 0;
  let comboPart = 0;
  let accPart = 0;
  let bonus = 0;
  let hits = 0;
  let c300 = 0, c100 = 0, c50 = 0, miss = 0;
  for (const e of events) {
    bonus += e.bonus ?? 0;
    if (e.hit) {
      combo += 1;
    } else if (e.kind === "sliderEnd" || e.kind === "legacyEnd") {
    } else {
      combo = 0;
    }
    if (combo > maxCombo)
      maxCombo = combo;
    const missedSliderEnd = !e.hit && e.kind === "sliderEnd";
    if (!missedSliderEnd) {
      const value = e.hit ? e.kind === "base" ? e.judgement : lzMaxValue(e.kind) : 0;
      comboPart += value * Math.sqrt(combo);
    }
    if (lzAffectsAcc(e.kind)) {
      const value = e.hit ? e.kind === "base" ? e.judgement : lzMaxValue(e.kind) : 0;
      accPart += value;
      hits += 1;
    }
    if (e.counts === 300)
      c300++;
    else if (e.counts === 100)
      c100++;
    else if (e.counts === 50)
      c50++;
    else if (e.counts === 0)
      miss++;
    const acc = accPartMax > 0 ? accPart / accPartMax : 0;
    const comboProgress = comboPartMax > 0 ? comboPart / comboPartMax : 0;
    const accProgress = maxHits > 0 ? hits / maxHits : 0;
    const inner = 5e5 * acc * comboProgress + 5e5 * Math.pow(acc, 5) * accProgress + bonus;
    const score = Math.round(Math.round(inner) * modMult);
    const grade = computeLazerGrade(acc, miss, modDiff.mods);
    frames.push({ time: e.time, score, combo, maxCombo, grade });
  }
  return frames;
}

// src/renderer/HUDRenderer.ts
var CANVAS_W = 1280;
var SCORE_RIGHT_X = CANVAS_W - 4;
var SCORE_Y = 4;
var SCORE_DIGIT_H = 30;
var SCORE_DIGITS = 8;
var ACC_DIGIT_H = 22;
var ACC_RIGHT_X = CANVAS_W - 4;
var ACC_Y = SCORE_Y + SCORE_DIGIT_H + 2;
var COMBO_LEFT_X = 14;
var CANVAS_H = 720;
var COMBO_DIGIT_H = 32;
var COMBO_Y = CANVAS_H - COMBO_DIGIT_H - 4;
var COMBO_ANIM_MS = 250;
function computeAccTimeline(results) {
  const sorted = [...results].sort((a, b) => a.time - b.time);
  const frames = [];
  let judgeSum = 0;
  let objCount = 0;
  for (const r of sorted) {
    if (r.isSliderSub)
      continue;
    if (r.comboIgnore)
      continue;
    judgeSum += r.judgement;
    objCount++;
    frames.push({ time: r.time, acc: judgeSum / (300 * objCount) });
  }
  return frames;
}
function computeTaikoAccTimeline(results) {
  const sorted = [...results].sort((a, b) => a.time - b.time);
  const frames = [];
  let weightedSum = 0;
  let objCount = 0;
  for (const r of sorted) {
    if (r.comboIgnore)
      continue;
    if (r.judgement === 300)
      weightedSum += 300;
    else if (r.judgement === 100)
      weightedSum += 150;
    objCount++;
    frames.push({ time: r.time, acc: weightedSum / (300 * objCount) });
  }
  return frames;
}
function computeComboTimeline(results) {
  const sorted = [...results].sort((a, b) => a.time - b.time);
  const frames = [];
  let combo = 0;
  for (const r of sorted) {
    if (r.comboIgnore)
      continue;
    if (r.comboBreak)
      combo = 0;
    if (r.judgement > 0 && !r.comboBreak)
      combo++;
    frames.push({ time: r.time, combo });
  }
  return frames;
}
function findBefore(frames, timeMs) {
  if (frames.length === 0 || timeMs < frames[0].time)
    return -1;
  if (timeMs >= frames[frames.length - 1].time)
    return frames.length - 1;
  let lo = 0, hi = frames.length - 2;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (frames[mid].time <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return lo;
}
var SCORE_GLYPH_SUFFIX = {
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  ".": "dot",
  "%": "percent",
  "x": "x"
};
function glyphImage(images, prefix, ch3, targetPx) {
  const suffix = SCORE_GLYPH_SUFFIX[ch3];
  if (suffix === void 0)
    return void 0;
  const hi = images.get(`${prefix}-${suffix}@2x.png`);
  const lo = images.get(`${prefix}-${suffix}.png`);
  if (hi === void 0)
    return lo;
  if (lo === void 0 || targetPx === void 0)
    return hi;
  return targetPx > lo.height ? hi : lo;
}
var _glyphAspectCache = /* @__PURE__ */ new WeakMap();
function glyphAspect(skin, prefix, ch3) {
  if (skin === void 0)
    return 0.65;
  let byPrefix = _glyphAspectCache.get(skin);
  if (byPrefix === void 0) {
    byPrefix = /* @__PURE__ */ new Map();
    _glyphAspectCache.set(skin, byPrefix);
  }
  let byChar = byPrefix.get(prefix);
  if (byChar === void 0) {
    byChar = /* @__PURE__ */ new Map();
    byPrefix.set(prefix, byChar);
  }
  let aspect = byChar.get(ch3);
  if (aspect === void 0) {
    const bmp = glyphImage(skin.images, prefix, ch3);
    aspect = bmp !== void 0 ? bmp.width / bmp.height : 0.65;
    byChar.set(ch3, aspect);
  }
  return aspect;
}
function drawScoreText(ctx, text, rightX, y, digitH, prefix, skin) {
  let totalW = 0;
  for (let i = 0; i < text.length; i++) {
    totalW += glyphAspect(skin, prefix, text.charAt(i)) * digitH;
  }
  const scale = (typeof ctx.getTransform === "function" ? ctx.getTransform().a : 1) || 1;
  const targetPx = digitH * scale;
  let x = rightX - totalW;
  for (let i = 0; i < text.length; i++) {
    const ch3 = text.charAt(i);
    const w = glyphAspect(skin, prefix, ch3) * digitH;
    const bmp = skin ? glyphImage(skin.images, prefix, ch3, targetPx) : void 0;
    if (bmp) {
      ctx.drawImage(bmp, x, y, w, digitH);
    } else {
      ctx.save();
      ctx.font = `bold ${Math.round(digitH * 0.85)}px monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.strokeStyle = "rgba(0,0,0,0.75)";
      ctx.lineWidth = 2;
      ctx.strokeText(ch3, x, y);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(ch3, x, y);
      ctx.restore();
    }
    x += w;
  }
}
var MOD_ICON_SPEC_BY_ACRONYM = new Map(MOD_ICON_SPECS.map((spec) => [spec.acronym, spec]));
var MOD_ICON_H = 30;
var MOD_ICON_GAP = 2;
var MOD_Y = ACC_Y + ACC_DIGIT_H + 6;
function buildModIconRow(acronyms, lazerMods, skin, textures) {
  return acronyms.map((acronym) => {
    const spec = MOD_ICON_SPEC_BY_ACRONYM.get(acronym);
    const lazerMod = lazerMods?.find((m) => m.acronym === acronym);
    const extended = lazerMod !== void 0 ? extendedModIconInfo(lazerMod) : "";
    let bitmap;
    if (spec !== void 0 && textures !== null && extended !== "") {
      bitmap = composeModIcon(textures, spec, extended);
    }
    if (bitmap === void 0 && spec?.stem !== void 0) {
      bitmap = skin?.images.get(`selection-mod-${spec.stem}@2x.png`) ?? skin?.images.get(`selection-mod-${spec.stem}.png`);
    }
    if (bitmap === void 0 && spec !== void 0 && textures !== null) {
      bitmap = composeModIcon(textures, spec);
    }
    return { acronym, bitmap };
  });
}
function drawModIcons(ctx, row) {
  if (row.length === 0)
    return;
  const widths = row.map(({ bitmap }) => bitmap ? bitmap.width / bitmap.height * MOD_ICON_H : MOD_ICON_H * 1.6);
  const totalW = widths.reduce((s, w) => s + w, 0) + MOD_ICON_GAP * (row.length - 1);
  let x = ACC_RIGHT_X - totalW;
  for (let i = 0; i < row.length; i++) {
    const { acronym, bitmap } = row[i];
    const w = widths[i];
    if (bitmap) {
      ctx.drawImage(bitmap, x, MOD_Y, w, MOD_ICON_H);
    } else {
      ctx.save();
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(x + r, MOD_Y);
      ctx.arcTo(x + w, MOD_Y, x + w, MOD_Y + MOD_ICON_H, r);
      ctx.arcTo(x + w, MOD_Y + MOD_ICON_H, x, MOD_Y + MOD_ICON_H, r);
      ctx.arcTo(x, MOD_Y + MOD_ICON_H, x, MOD_Y, r);
      ctx.arcTo(x, MOD_Y, x + w, MOD_Y, r);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fill();
      ctx.font = `bold ${Math.round(MOD_ICON_H * 0.55)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(acronym, x + w / 2, MOD_Y + MOD_ICON_H / 2);
      ctx.restore();
    }
    x += w + MOD_ICON_GAP;
  }
}
function drawScore(ctx, scoreFrames, timeMs, skin) {
  const i = findBefore(scoreFrames, timeMs);
  const score = i >= 0 ? scoreFrames[i].score : 0;
  const text = String(Math.max(0, Math.trunc(score))).padStart(SCORE_DIGITS, "0");
  drawScoreText(ctx, text, SCORE_RIGHT_X, SCORE_Y, SCORE_DIGIT_H, skin?.config.scorePrefix ?? "score", skin);
}
function drawHUD(ctx, accFrames, timeMs, skin) {
  const i = findBefore(accFrames, timeMs);
  const acc = i >= 0 ? accFrames[i].acc : 1;
  const text = (acc * 100).toFixed(2) + "%";
  drawScoreText(ctx, text, ACC_RIGHT_X, ACC_Y, ACC_DIGIT_H, skin?.config.scorePrefix ?? "score", skin);
}
var MANIA_COMBO_DIGIT_H = 28;
function drawPopCombo(ctx, comboFrames, timeMs, suffix, digitH, skin, anchor) {
  const i = findBefore(comboFrames, timeMs);
  const combo = i >= 0 ? comboFrames[i].combo : 0;
  if (combo === 0)
    return;
  const text = String(combo) + suffix;
  const elapsed = i >= 0 ? timeMs - comboFrames[i].time : COMBO_ANIM_MS;
  const comboPrefix = skin?.config.comboPrefix ?? "score";
  let totalW = 0;
  for (let k = 0; k < text.length; k++) {
    totalW += glyphAspect(skin, comboPrefix, text.charAt(k)) * digitH;
  }
  const popScale = elapsed < COMBO_ANIM_MS ? 1 + 0.4 * (1 - elapsed / COMBO_ANIM_MS) : 1;
  const { rightX, topY, cx, cy } = anchor(totalW);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(popScale, popScale);
  ctx.translate(-cx, -cy);
  drawScoreText(ctx, text, rightX, topY, digitH, comboPrefix, skin);
  ctx.restore();
}
function drawCombo(ctx, comboFrames, timeMs, skin) {
  drawPopCombo(ctx, comboFrames, timeMs, "x", COMBO_DIGIT_H, skin, (totalW) => ({
    rightX: COMBO_LEFT_X + 4 + totalW,
    topY: COMBO_Y,
    cx: COMBO_LEFT_X + 4 + totalW / 2,
    cy: COMBO_Y + COMBO_DIGIT_H / 2
  }));
}
function drawManiaCombo(ctx, comboFrames, timeMs, centerX, centerY, skin) {
  drawPopCombo(ctx, comboFrames, timeMs, "", MANIA_COMBO_DIGIT_H, skin, (totalW) => ({
    rightX: centerX + totalW / 2,
    topY: centerY - MANIA_COMBO_DIGIT_H / 2,
    cx: centerX,
    cy: centerY
  }));
}

// src/renderer/URBarRenderer.ts
var CANVAS_W2 = 1280;
var CANVAS_H2 = 720;
var ERROR_BASE = 4.8;
var BASE_SCALE = 0.8;
var SCALE = 1;
var POINT_FADE_OUT_MS = 1e4;
var TICK_BASE_ALPHA = 0.4;
var TRIANGLE_EASE_MS = 800;
var WIDGET_HOLD_MS = 4e3;
var WIDGET_FADE_MS = 1e3;
var COLOR_300 = "rgb(51, 204, 255)";
var COLOR_100 = "rgb(112, 250, 46)";
var COLOR_50 = "rgb(217, 173, 69)";
var COLOR_MANIA_PERFECT = "rgb(51, 204, 255)";
var COLOR_MANIA_GREAT = "rgb(0, 230, 150)";
var COLOR_MANIA_GOOD = "rgb(112, 250, 46)";
var COLOR_MANIA_OK = "rgb(217, 173, 69)";
var COLOR_MANIA_MEH = "rgb(229, 110, 90)";
var RELEASE_LENIENCE = 1.5;
var CX = CANVAS_W2 / 2;
var CY = CANVAS_H2 - 14;
function buildHits(raw) {
  raw.sort((a, b) => a.time - b.time);
  const hits = [];
  let emaPx = 0;
  let lastTriX = 0;
  let lastEmaPx = 0;
  let lastTime = 0;
  let n = 0;
  for (const e of raw) {
    const errorPx = e.errorMs * BASE_SCALE;
    let triangleStartPx;
    if (n === 0) {
      triangleStartPx = 0;
    } else {
      const dt = e.time - lastTime;
      if (dt >= TRIANGLE_EASE_MS) {
        triangleStartPx = lastEmaPx;
      } else {
        const t = dt / TRIANGLE_EASE_MS;
        const eased = t * (2 - t);
        triangleStartPx = lastTriX + (lastEmaPx - lastTriX) * eased;
      }
    }
    emaPx = emaPx * 0.8 + errorPx * 0.2;
    hits.push({ time: e.time, errorPx, color: e.color, emaPx, triangleStartPx });
    n++;
    lastTriX = triangleStartPx;
    lastEmaPx = emaPx;
    lastTime = e.time;
  }
  return hits;
}
function computeURTimeline(results, beatmap, modDiff) {
  const w300 = modDiff.hitWindow300;
  const w100 = modDiff.hitWindow100;
  const w50 = modDiff.hitWindow50;
  const raw = [];
  for (const r of results) {
    if (r.isSliderSub)
      continue;
    const obj = beatmap.hitObjects[r.objectIndex];
    if (obj === void 0 || obj.type === "spinner")
      continue;
    const errorMs = r.time - obj.time;
    const absMs = Math.abs(errorMs);
    if (absMs >= w50)
      continue;
    const color = absMs < w300 ? COLOR_300 : absMs < w100 ? COLOR_100 : COLOR_50;
    raw.push({ time: r.time, errorMs, color });
  }
  const zones = [
    { color: COLOR_300, window: w300 },
    { color: COLOR_100, window: w100 },
    { color: COLOR_50, window: w50 }
  ];
  return { hits: buildHits(raw), zones };
}
function computeTaikoURTimeline(objects, results, modDiff) {
  const greatW = modDiff.taikoHitWindowGreat;
  const okW = modDiff.taikoHitWindowOk;
  const missW = modDiff.taikoHitWindowMiss;
  const hitSequence = [];
  for (const o of objects) {
    if (o.kind === "hit")
      hitSequence.push({ sourceIndex: o.sourceIndex, time: o.time });
  }
  const raw = [];
  let hi = 0;
  for (const r of results) {
    if (r.comboIgnore)
      continue;
    const h = hitSequence[hi];
    if (h === void 0)
      break;
    hi++;
    const errorMs = r.time - h.time;
    const absMs = Math.abs(errorMs);
    if (absMs >= missW)
      continue;
    const color = absMs < greatW ? COLOR_300 : absMs < okW ? COLOR_100 : COLOR_50;
    raw.push({ time: r.time, errorMs, color });
  }
  const zones = [
    { color: COLOR_300, window: greatW },
    { color: COLOR_100, window: okW },
    { color: COLOR_50, window: missW }
  ];
  return { hits: buildHits(raw), zones };
}
function computeManiaURTimeline(objects, results, modDiff) {
  const objBySource = /* @__PURE__ */ new Map();
  for (const o of objects)
    objBySource.set(o.sourceIndex, o);
  const colorFor = (j) => j === 305 ? COLOR_MANIA_PERFECT : j === 300 ? COLOR_MANIA_GREAT : j === 200 ? COLOR_MANIA_GOOD : j === 100 ? COLOR_MANIA_OK : COLOR_MANIA_MEH;
  const raw = [];
  for (const r of results) {
    if (r.judgement === 0)
      continue;
    if (r.subResult === "body")
      continue;
    const o = objBySource.get(r.objectIndex);
    if (o === void 0)
      continue;
    let errorMs;
    if (o.kind === "note") {
      errorMs = r.time - o.time;
    } else if (r.subResult === "tail") {
      errorMs = (r.time - o.endTime) / RELEASE_LENIENCE;
    } else {
      errorMs = r.time - o.startTime;
    }
    raw.push({ time: r.time, errorMs, color: colorFor(r.judgement) });
  }
  const zones = [
    { color: COLOR_MANIA_PERFECT, window: modDiff.maniaHitWindowPerfect },
    { color: COLOR_MANIA_GREAT, window: modDiff.maniaHitWindowGreat },
    { color: COLOR_MANIA_GOOD, window: modDiff.maniaHitWindowGood },
    { color: COLOR_MANIA_OK, window: modDiff.maniaHitWindowOk },
    { color: COLOR_MANIA_MEH, window: modDiff.maniaHitWindowMeh }
  ];
  return { hits: buildHits(raw), zones };
}
function findLatestHit(hits, timeMs) {
  if (hits.length === 0 || timeMs < hits[0].time)
    return -1;
  if (timeMs >= hits[hits.length - 1].time)
    return hits.length - 1;
  let lo = 0, hi = hits.length - 2;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (hits[mid].time <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return lo;
}
function drawURBar(ctx, timeline, timeMs) {
  const i = findLatestHit(timeline.hits, timeMs);
  if (i < 0)
    return;
  const last = timeline.hits[i];
  const dt = timeMs - last.time;
  let widgetAlpha;
  if (dt <= WIDGET_HOLD_MS)
    widgetAlpha = 1;
  else if (dt <= WIDGET_HOLD_MS + WIDGET_FADE_MS) {
    const t = (dt - WIDGET_HOLD_MS) / WIDGET_FADE_MS;
    widgetAlpha = 1 - t * t;
  } else
    widgetAlpha = 0;
  if (widgetAlpha <= 1e-3)
    return;
  const stripH = ERROR_BASE * SCALE;
  const bgH = ERROR_BASE * 4 * SCALE;
  const stripTop = CY - stripH / 2;
  const bgTop = CY - bgH / 2;
  ctx.save();
  ctx.globalAlpha = widgetAlpha;
  let prevPx = 0;
  for (const z of timeline.zones) {
    const endPx = z.window * BASE_SCALE;
    const w = (endPx - prevPx) * SCALE;
    ctx.fillStyle = z.color;
    ctx.fillRect(CX + prevPx * SCALE, stripTop, w, stripH);
    ctx.fillRect(CX - endPx * SCALE, stripTop, w, stripH);
    prevPx = endPx;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(CX - 1, bgTop, 2, bgH);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let j = i; j >= 0; j--) {
    const h = timeline.hits[j];
    const age = timeMs - h.time;
    if (age >= POINT_FADE_OUT_MS)
      break;
    const fade = 1 - age / POINT_FADE_OUT_MS;
    ctx.globalAlpha = widgetAlpha * TICK_BASE_ALPHA * fade;
    ctx.fillStyle = h.color;
    ctx.fillRect(CX + h.errorPx * SCALE - 1.5, bgTop, 3, bgH);
  }
  ctx.restore();
  ctx.globalAlpha = widgetAlpha;
  let triPx;
  if (dt >= TRIANGLE_EASE_MS) {
    triPx = last.emaPx;
  } else {
    const t = dt / TRIANGLE_EASE_MS;
    const eased = t * (2 - t);
    triPx = last.triangleStartPx + (last.emaPx - last.triangleStartPx) * eased;
  }
  const triX = CX + triPx * SCALE;
  const triBaseY = CY - ERROR_BASE * 2.5 * SCALE;
  const triH = ERROR_BASE * 1.4 * SCALE;
  const triHalfW = triH * 0.7;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(triX, triBaseY);
  ctx.lineTo(triX - triHalfW, triBaseY - triH);
  ctx.lineTo(triX + triHalfW, triBaseY - triH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// src/rulesets/taiko/converter.ts
var VELOCITY_MULTIPLIER = Math.fround(1.4);
var SWELL_HIT_MULTIPLIER = Math.fround(1.65);
var OSU_BASE_SCORING_DISTANCE = 100;
var HITSOUND_WHISTLE = 2;
var HITSOUND_FINISH = 4;
var HITSOUND_CLAP = 8;
function classifyTaikoHit(hitSound) {
  return {
    isRim: (hitSound & (HITSOUND_WHISTLE | HITSOUND_CLAP)) !== 0,
    isStrong: (hitSound & HITSOUND_FINISH) !== 0
  };
}
function difficultyRange(diff, min, mid, max2) {
  if (diff > 5)
    return mid + (max2 - mid) * (diff - 5) / 5;
  if (diff < 5)
    return mid - (mid - min) * (5 - diff) / 5;
  return mid;
}
function getTimingAt(beatmap, time) {
  let baseBeatLength = 500;
  let svMultiplier = 1;
  for (const tp of beatmap.timingPoints) {
    if (tp.time > time)
      break;
    if (!tp.inherited) {
      baseBeatLength = tp.beatLength;
      svMultiplier = 1;
    } else {
      svMultiplier = Math.max(0.1, Math.min(10, -100 / tp.beatLength));
    }
  }
  return { baseBeatLength, svMultiplier };
}
function convertCircle(circle, sourceIndex) {
  const { isRim, isStrong } = classifyTaikoHit(circle.hitSound);
  return {
    kind: "hit",
    time: circle.time,
    isRim,
    isStrong,
    hitSound: circle.hitSound,
    sourceIndex,
    noteId: 0
    // assigned post-sort in convertBeatmapToTaiko
  };
}
function convertSpinner(spinner, sourceIndex, effOd) {
  const duration = spinner.endTime - spinner.time;
  const hitsPerSecond = difficultyRange(effOd, 3, 5, 7.5) * SWELL_HIT_MULTIPLIER;
  const requiredHits = Math.max(1, Math.trunc(duration / 1e3 * hitsPerSecond));
  return {
    kind: "swell",
    time: spinner.time,
    endTime: spinner.endTime,
    requiredHits,
    hitSound: spinner.hitSound,
    sourceIndex
  };
}
function convertSlider(beatmap, slider, sourceIndex, effSM) {
  const spans = slider.slides;
  let distance = slider.length;
  distance *= VELOCITY_MULTIPLIER;
  distance *= spans;
  const { baseBeatLength, svMultiplier } = getTimingAt(beatmap, slider.time);
  let beatLength = baseBeatLength / svMultiplier;
  const sliderScoringPointDistance = OSU_BASE_SCORING_DISTANCE * (effSM * VELOCITY_MULTIPLIER) / beatmap.sliderTickRate;
  const taikoVelocity = sliderScoringPointDistance * beatmap.sliderTickRate;
  const taikoDuration = Math.trunc(distance / taikoVelocity * beatLength);
  const isForCurrentRuleset = beatmap.mode === 1;
  if (isForCurrentRuleset) {
    return [makeDrumRoll(beatmap, slider, sourceIndex, taikoDuration)];
  }
  const osuVelocity = taikoVelocity * (1e3 / beatLength);
  if (beatmap.formatVersion >= 8) {
    beatLength = baseBeatLength;
  }
  const tickSpacing = Math.min(beatLength / beatmap.sliderTickRate, taikoDuration / spans);
  const shouldSplit = tickSpacing > 0 && distance / osuVelocity * 1e3 < 2 * beatLength;
  if (shouldSplit) {
    const hits = [];
    const endLimit = slider.time + taikoDuration + tickSpacing / 8;
    let i = 0;
    const edgeSounds = slider.edgeSounds.length > 0 ? slider.edgeSounds : [slider.hitSound];
    for (let t = slider.time; t <= endLimit; t += tickSpacing) {
      const hs = edgeSounds[i % edgeSounds.length] ?? slider.hitSound;
      const { isRim, isStrong } = classifyTaikoHit(hs);
      hits.push({
        kind: "hit",
        time: t,
        isRim,
        isStrong,
        hitSound: hs,
        sourceIndex,
        noteId: 0
        // assigned post-sort in convertBeatmapToTaiko
      });
      i++;
    }
    return hits;
  }
  return [makeDrumRoll(beatmap, slider, sourceIndex, taikoDuration)];
}
function makeDrumRoll(beatmap, slider, sourceIndex, durationMs) {
  const tickRate = beatmap.sliderTickRate === 3 ? 3 : 4;
  const { baseBeatLength } = getTimingAt(beatmap, slider.time);
  const tickInterval = baseBeatLength / tickRate;
  const startTime = slider.time;
  const endTime = startTime + durationMs;
  const tickTimes = [];
  if (tickInterval > 0) {
    for (let t = startTime; t < endTime + tickInterval / 2; t += tickInterval) {
      tickTimes.push(t);
    }
  }
  const { isStrong } = classifyTaikoHit(slider.hitSound);
  return {
    kind: "drumroll",
    time: startTime,
    endTime,
    isStrong,
    hitSound: slider.hitSound,
    tickTimes,
    tickInterval,
    sourceIndex
  };
}
function convertBeatmapToTaiko(beatmap) {
  const effSM = beatmap.sliderMultiplier;
  const effOd = beatmap.overallDifficulty;
  const out = [];
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    if (!obj)
      continue;
    if (obj.type === "circle") {
      out.push(convertCircle(obj, i));
    } else if (obj.type === "slider") {
      for (const h of convertSlider(beatmap, obj, i, effSM))
        out.push(h);
    } else if (obj.type === "spinner") {
      out.push(convertSpinner(obj, i, effOd));
    }
  }
  out.sort((a, b) => a.time - b.time);
  for (let i = 0; i < out.length; i++) {
    const o = out[i];
    if (o.kind === "hit")
      o.noteId = i;
  }
  return out;
}

// src/rulesets/taiko/input.ts
var BIT_TO_ACTION = [
  { bit: 1, action: "LeftCentre" },
  { bit: 2, action: "LeftRim" },
  { bit: 4, action: "RightCentre" },
  { bit: 8, action: "RightRim" }
];
function taikoFrames(replay) {
  const events = [];
  let cumTime = 0;
  let prevKeys = 0;
  for (const frame of replay.frames) {
    cumTime += frame.timeDelta;
    const curKeys = frame.keys & 15;
    const newPresses = curKeys & ~prevKeys;
    if (newPresses !== 0) {
      for (const { bit, action } of BIT_TO_ACTION) {
        if (newPresses & bit)
          events.push({ time: cumTime, action });
      }
    }
    prevKeys = curKeys;
  }
  return events;
}

// src/renderer/FlashlightReveal.ts
var DISC_SIZE = 1024;
var GRADIENT_STEPS = 8;
var _discCache = /* @__PURE__ */ new Map();
function getRevealDisc(innerRatio) {
  const cached = _discCache.get(innerRatio);
  if (cached !== void 0)
    return cached;
  const osc = new OffscreenCanvas(DISC_SIZE, DISC_SIZE);
  const c = osc.getContext("2d");
  const half = DISC_SIZE / 2;
  const grad = c.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(innerRatio, "rgba(0,0,0,0)");
  for (let i = 1; i < GRADIENT_STEPS; i++) {
    const u = i / GRADIENT_STEPS;
    const s = u * u * (3 - 2 * u);
    const r = innerRatio + u * (1 - innerRatio);
    grad.addColorStop(Math.min(1, r), `rgba(0,0,0,${s.toFixed(4)})`);
  }
  grad.addColorStop(1, "rgba(0,0,0,1)");
  c.fillStyle = grad;
  c.fillRect(0, 0, DISC_SIZE, DISC_SIZE);
  _discCache.set(innerRatio, osc);
  return osc;
}
function drawFlashlightReveal(ctx, cx, cy, outerR, innerRatio, x, y, w, h) {
  const disc = getRevealDisc(innerRatio);
  const dx = cx - outerR;
  const dy = cy - outerR;
  const d = outerR * 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000";
  ctx.fillRect(x, y, Math.max(0, dx - x), h);
  ctx.fillRect(dx + d, y, Math.max(0, x + w - (dx + d)), h);
  ctx.fillRect(dx, y, d, Math.max(0, dy - y));
  ctx.fillRect(dx, dy + d, d, Math.max(0, y + h - (dy + d)));
  ctx.drawImage(disc, dx, dy, d, d);
  ctx.restore();
}

// src/rulesets/taiko/Flashlight.ts
var DEFAULT_FL_SIZE = 200;
var SIZE_MULTIPLIER = 1;
var FL_SMOOTHNESS = 1.4;
var FL_FADE_MS = 800;
var BREAK_SCALE = 2.5;
var COMBO_TIER1_MIN = 100;
var COMBO_TIER2_MIN = 200;
var COMBO_TIER1_MULT = 0.8125;
var COMBO_TIER2_MULT = 0.625;
var BREAK_MIN_DURATION = FL_FADE_MS * 2;
var PLAYFIELD_LEFT_X = 0;
var PLAYFIELD_RIGHT_X = 1280;
var PLAYFIELD_TOP_Y = 260;
var PLAYFIELD_H_PX = 200;
var HIT_TARGET_X = 256;
var LANE_CENTRE_Y = 360;
var PLAYFIELD_SCALE = 1;
function comboTierMult(combo) {
  if (combo >= COMBO_TIER2_MIN)
    return COMBO_TIER2_MULT;
  if (combo >= COMBO_TIER1_MIN)
    return COMBO_TIER1_MULT;
  return 1;
}
function evalSegments(segments, t, initial) {
  if (segments.length === 0)
    return initial;
  let lo = 0, hi = segments.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (segments[mid].tStart <= t) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (idx < 0)
    return segments[0].vStart;
  const seg = segments[idx];
  if (t >= seg.tEnd)
    return seg.vEnd;
  const u = (t - seg.tStart) / (seg.tEnd - seg.tStart);
  return seg.vStart + (seg.vEnd - seg.vStart) * u;
}
function addEvent(segments, initial, t, target) {
  const startVal = evalSegments(segments, t, initial);
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    if (last.tEnd > t) {
      last.tEnd = t;
      last.vEnd = startVal;
    }
  }
  segments.push({ tStart: t, tEnd: t + FL_FADE_MS, vStart: startVal, vEnd: target });
}
function buildSizeTimeline(beatmap, comboFrames) {
  const segments = [];
  const baseSize = DEFAULT_FL_SIZE * SIZE_MULTIPLIER;
  const events = [];
  let lastTier = 1;
  for (const cf of comboFrames) {
    const tier = comboTierMult(cf.combo);
    if (tier !== lastTier) {
      events.push({ kind: "combo", t: cf.time, combo: cf.combo });
      lastTier = tier;
    }
  }
  for (const b of beatmap.breaks) {
    if (b.endTime - b.startTime > BREAK_MIN_DURATION) {
      events.push({ kind: "breakStart", t: b.startTime });
      events.push({ kind: "breakEndPrep", t: b.endTime - FL_FADE_MS });
    }
  }
  events.sort((a, b) => {
    if (a.t !== b.t)
      return a.t - b.t;
    const rank = (k) => k === "combo" ? 0 : k === "breakStart" ? 1 : 2;
    return rank(a.kind) - rank(b.kind);
  });
  let comboTarget = baseSize;
  for (const e of events) {
    if (e.kind === "combo") {
      const newTarget = baseSize * comboTierMult(e.combo);
      if (newTarget !== comboTarget) {
        comboTarget = newTarget;
        addEvent(segments, baseSize, e.t, newTarget);
      }
    } else if (e.kind === "breakStart") {
      addEvent(segments, baseSize, e.t, baseSize * BREAK_SCALE);
    } else {
      addEvent(segments, baseSize, e.t, comboTarget);
    }
  }
  return segments;
}
var TaikoFlashlight = class {
  constructor(beatmap, comboFrames) {
    this.initialSize = DEFAULT_FL_SIZE * SIZE_MULTIPLIER;
    this.sizeSegments = buildSizeTimeline(beatmap, comboFrames);
  }
  draw(ctx, timeMs) {
    const size = evalSegments(this.sizeSegments, timeMs, this.initialSize) * PLAYFIELD_SCALE;
    if (size <= 0)
      return;
    const outerR = size * FL_SMOOTHNESS;
    drawFlashlightReveal(
      ctx,
      HIT_TARGET_X,
      LANE_CENTRE_Y,
      outerR,
      1 / FL_SMOOTHNESS,
      PLAYFIELD_LEFT_X,
      PLAYFIELD_TOP_Y,
      PLAYFIELD_RIGHT_X - PLAYFIELD_LEFT_X,
      PLAYFIELD_H_PX
    );
  }
};

// src/rulesets/taiko/Playfield.ts
var LOGICAL_W = 1280;
var LOGICAL_H = 720;
var BASE_HEIGHT = 200;
var INPUT_DRUM_WIDTH = 180;
var HIT_TARGET_OFFSET = -24;
var HIT_TARGET_WIDTH = BASE_HEIGHT;
var HIT_TARGET_CENTRE_PF = INPUT_DRUM_WIDTH + HIT_TARGET_WIDTH / 2 + HIT_TARGET_OFFSET;
var DEFAULT_SIZE = 0.45;
var STRONG_SCALE = 1 / 0.65;
var VELOCITY_MULTIPLIER2 = 1.4;
var PLAYFIELD_SCALE2 = 1;
var PLAYFIELD_H_PX2 = BASE_HEIGHT * PLAYFIELD_SCALE2;
var PLAYFIELD_TOP_Y2 = (LOGICAL_H - PLAYFIELD_H_PX2) / 2;
var LANE_CENTRE_Y2 = PLAYFIELD_TOP_Y2 + PLAYFIELD_H_PX2 / 2;
var INPUT_DRUM_W_PX = INPUT_DRUM_WIDTH * PLAYFIELD_SCALE2;
var HIT_TARGET_X2 = HIT_TARGET_CENTRE_PF * PLAYFIELD_SCALE2;
var LANE_LEFT_X = INPUT_DRUM_W_PX;
var LANE_RIGHT_X = LOGICAL_W;
var NOTE_RADIUS_PX = DEFAULT_SIZE * BASE_HEIGHT * PLAYFIELD_SCALE2 / 2;
var STRONG_NOTE_RADIUS_PX = NOTE_RADIUS_PX * STRONG_SCALE;
var HIT_TARGET_CANVAS_X = HIT_TARGET_X2;
var HIT_TARGET_CANVAS_Y = LANE_CENTRE_Y2;
var DRUM_FLASH_MS = 60;
var DON_COLOUR = "rgb(235, 69, 44)";
var KAT_COLOUR = "rgb(68, 141, 171)";
var DRUMROLL_IDLE_RGB = { r: 238, g: 170, b: 0 };
var DRUMROLL_ENGAGED_RGB = { r: 204, g: 102, b: 0 };
var DRUMROLL_TICKS_TO_ENGAGE = 5;
var DRUMROLL_FADE_MS = 100;
function skinImg(images, stem) {
  return images.get(`${stem}@2x.png`) ?? images.get(`${stem}.png`);
}
function skinVersionAsNumber(version) {
  const v = version.trim().toLowerCase();
  if (v === "")
    return 1;
  if (v === "latest")
    return Infinity;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 1;
}
var _tintCache = /* @__PURE__ */ new WeakMap();
function tintBitmap(bitmap, color) {
  let colorMap = _tintCache.get(bitmap);
  if (colorMap === void 0) {
    colorMap = /* @__PURE__ */ new Map();
    _tintCache.set(bitmap, colorMap);
  }
  const cached = colorMap.get(color);
  if (cached !== void 0)
    return cached;
  const { width: w, height: h } = bitmap;
  const osc = new OffscreenCanvas(w, h);
  const oc = osc.getContext("2d");
  oc.drawImage(bitmap, 0, 0);
  oc.globalCompositeOperation = "multiply";
  oc.fillStyle = color;
  oc.fillRect(0, 0, w, h);
  oc.globalCompositeOperation = "destination-in";
  oc.drawImage(bitmap, 0, 0);
  colorMap.set(color, osc);
  return osc;
}
function drawCentredBitmap(ctx, bitmap, cx, cy, d) {
  const aspect = bitmap.width / bitmap.height;
  const drawW = aspect >= 1 ? d : d * aspect;
  const drawH = aspect >= 1 ? d / aspect : d;
  ctx.drawImage(bitmap, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
}
function baseLogicalExtent(images, stem, bitmap) {
  const pixelScale = images.has(`${stem}@2x.png`) ? 0.5 : 1;
  return Math.max(bitmap.width, bitmap.height) * pixelScale;
}
function drawOverlayNative(ctx, bitmap, pixelScale, cx, cy, baseLogicalMax, d) {
  const s = d / baseLogicalMax;
  const w = bitmap.width * pixelScale * s;
  const h = bitmap.height * pixelScale * s;
  ctx.drawImage(bitmap, cx - w / 2, cy - h / 2, w, h);
}
function getTimingAt2(tps, time) {
  let baseBeatLength = 500;
  let svMultiplier = 1;
  let meter = 4;
  let kiai = false;
  for (const tp of tps) {
    if (tp.time > time)
      break;
    if (!tp.inherited) {
      baseBeatLength = tp.beatLength;
      svMultiplier = 1;
      meter = tp.meter;
    } else {
      svMultiplier = Math.max(0.1, Math.min(10, -100 / tp.beatLength));
    }
    kiai = tp.kiai;
  }
  return { baseBeatLength, svMultiplier, meter, kiai };
}
var DEFAULT_BEAT_LENGTH = 1e3;
var TAIKO_MIN_ASPECT = 5 / 4;
var TAIKO_MAX_ASPECT = 16 / 9;
var STABLE_GAMEFIELD_HEIGHT = 480;
var STABLE_HIT_LOCATION = 160;
function computeTaikoTimeRange() {
  const aspect = Math.max(TAIKO_MIN_ASPECT, Math.min(TAIKO_MAX_ASPECT, LOGICAL_W / LOGICAL_H));
  const inLength = aspect * STABLE_GAMEFIELD_HEIGHT - STABLE_HIT_LOCATION;
  return inLength / 100 * 1e3 / VELOCITY_MULTIPLIER2;
}
var TAIKO_TIME_RANGE_MS = computeTaikoTimeRange();
function scrollVelocityAt(beatmap, time, isConstantSpeed, smFactor = 1) {
  const { baseBeatLength, svMultiplier } = getTimingAt2(beatmap.timingPoints, time);
  const scrollSpeed = isConstantSpeed ? 1 : svMultiplier;
  if (baseBeatLength <= 0)
    return 0;
  const multiplier = beatmap.sliderMultiplier * smFactor * scrollSpeed * DEFAULT_BEAT_LENGTH / baseBeatLength;
  return multiplier * LANE_WIDTH_PX / TAIKO_TIME_RANGE_MS;
}
function taikoScrollMultiplier(modDiff) {
  if (modDiff.isHR)
    return 1.4 * 4 / 3;
  if (modDiff.isEZ)
    return 0.8;
  return 1;
}
var LANE_WIDTH_PX = LANE_RIGHT_X - HIT_TARGET_X2;
var TAIKO_HD_FADE_START = 1;
var TAIKO_HD_FADE_DURATION = 0.375;
function taikoHiddenAlpha(hitTime, timeMs, scrollVel) {
  if (scrollVel <= 0)
    return 1;
  const preempt = LANE_WIDTH_PX / scrollVel;
  const age = hitTime - timeMs;
  if (age >= preempt * TAIKO_HD_FADE_START)
    return 1;
  const fadeEndAge = preempt * (TAIKO_HD_FADE_START - TAIKO_HD_FADE_DURATION);
  if (age <= fadeEndAge)
    return 0;
  return (age - fadeEndAge) / (preempt * TAIKO_HD_FADE_DURATION);
}
function computeBarLineTimes(beatmap) {
  const uninherited = [];
  for (const tp of beatmap.timingPoints)
    if (!tp.inherited)
      uninherited.push(tp);
  if (uninherited.length === 0)
    return [];
  let endTime = 0;
  for (const obj of beatmap.hitObjects) {
    const t = obj.type === "spinner" ? obj.endTime : obj.time;
    if (t > endTime)
      endTime = t;
  }
  endTime += 5e3;
  const lines = [];
  const MAX_LINES = 2e5;
  for (let i = 0; i < uninherited.length; i++) {
    const tp = uninherited[i];
    const nextStart = i + 1 < uninherited.length ? uninherited[i + 1].time : endTime;
    const step = Math.max(1, tp.meter * tp.beatLength);
    for (let t = tp.time; t < nextStart; t += step) {
      const rounded = Math.round(t);
      if (Math.abs(t - rounded) < 1e-3)
        t = rounded;
      lines.push(t);
      if (lines.length >= MAX_LINES)
        return lines;
    }
  }
  return lines;
}
function endTimeOf(o) {
  return o.kind === "hit" ? o.time : o.endTime;
}
function findObjectVisibleRange(objects, timeMs, scrollMs, lookbackMs) {
  const n = objects.length;
  if (n === 0)
    return { firstIdx: 0, lastIdx: -1 };
  const minTime = timeMs - lookbackMs;
  const maxTime = timeMs + scrollMs;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (endTimeOf(objects[mid]) < minTime)
      lo = mid + 1;
    else
      hi = mid;
  }
  const firstIdx = lo;
  if (firstIdx >= n || objects[firstIdx].time > maxTime) {
    return { firstIdx, lastIdx: firstIdx - 1 };
  }
  lo = firstIdx;
  hi = n - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >>> 1;
    if (objects[mid].time <= maxTime)
      lo = mid;
    else
      hi = mid - 1;
  }
  return { firstIdx, lastIdx: lo };
}
function findTimeRange(times, minTime, maxTime) {
  const n = times.length;
  if (n === 0)
    return { firstIdx: 0, lastIdx: -1 };
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (times[mid] < minTime)
      lo = mid + 1;
    else
      hi = mid;
  }
  const firstIdx = lo;
  if (firstIdx >= n || times[firstIdx] > maxTime) {
    return { firstIdx, lastIdx: firstIdx - 1 };
  }
  lo = firstIdx;
  hi = n - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >>> 1;
    if (times[mid] <= maxTime)
      lo = mid;
    else
      hi = mid - 1;
  }
  return { firstIdx, lastIdx: lo };
}
function objectX(objectTime, timeMs, scrollVel) {
  return HIT_TARGET_X2 + (objectTime - timeMs) * scrollVel;
}
var BAR_GLOW_FADE_PER_MS = 1 / 200;
function drawPlayfieldBackground(ctx, skin, timingPoints, timeMs) {
  const barRight = skin ? skinImg(skin.images, "taiko-bar-right") : void 0;
  const barRightGlow = skin ? skinImg(skin.images, "taiko-bar-right-glow") : void 0;
  const barLeft = skin ? skinImg(skin.images, "taiko-bar-left") : void 0;
  if (barRight !== void 0) {
    ctx.drawImage(barRight, 0, PLAYFIELD_TOP_Y2, LANE_RIGHT_X, PLAYFIELD_H_PX2);
    if (barRightGlow !== void 0) {
      const { transitionTime, kiaiOn } = lastKiaiTransitionAt(timingPoints, timeMs);
      let alpha = 0;
      if (isFinite(transitionTime)) {
        const elapsed = timeMs - transitionTime;
        alpha = kiaiOn ? Math.min(1, elapsed * BAR_GLOW_FADE_PER_MS) : Math.max(0, 1 - elapsed * BAR_GLOW_FADE_PER_MS);
      }
      if (alpha > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(barRightGlow, 0, PLAYFIELD_TOP_Y2, LANE_RIGHT_X, PLAYFIELD_H_PX2);
        ctx.restore();
      }
    }
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(LANE_LEFT_X, PLAYFIELD_TOP_Y2, LANE_RIGHT_X - LANE_LEFT_X, PLAYFIELD_H_PX2);
  }
  if (barLeft !== void 0) {
    ctx.drawImage(barLeft, 0, PLAYFIELD_TOP_Y2, INPUT_DRUM_W_PX, PLAYFIELD_H_PX2);
  } else {
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0, PLAYFIELD_TOP_Y2, INPUT_DRUM_W_PX, PLAYFIELD_H_PX2);
  }
  if (barRight === void 0) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, PLAYFIELD_TOP_Y2);
    ctx.lineTo(LOGICAL_W, PLAYFIELD_TOP_Y2);
    ctx.moveTo(0, PLAYFIELD_TOP_Y2 + PLAYFIELD_H_PX2);
    ctx.lineTo(LOGICAL_W, PLAYFIELD_TOP_Y2 + PLAYFIELD_H_PX2);
    ctx.stroke();
  }
}
var HIT_TARGET_BIG_SCALE = 0.8;
var HIT_TARGET_APPROACH_SCALE = 0.83;
var HIT_TARGET_BIG_ALPHA = 0.22;
var HIT_TARGET_APPROACH_ALPHA = 0.47;
function drawHitTarget(ctx, skin) {
  if (skin === void 0)
    return;
  const big = skinSpriteNatural(skin.images, "taikobigcircle");
  if (big === void 0)
    return;
  const approach = skinSpriteNatural(skin.images, "approachcircle");
  ctx.save();
  if (approach !== void 0) {
    ctx.globalAlpha = HIT_TARGET_APPROACH_ALPHA;
    drawSpriteNatural(ctx, approach, HIT_TARGET_X2, LANE_CENTRE_Y2, HIT_TARGET_APPROACH_SCALE);
  }
  ctx.globalAlpha = HIT_TARGET_BIG_ALPHA;
  drawSpriteNatural(ctx, big, HIT_TARGET_X2, LANE_CENTRE_Y2, HIT_TARGET_BIG_SCALE);
  ctx.restore();
}
function drawBarLines(ctx, times, vels, timeMs, maxScrollMs, lookbackMs, skin) {
  const { firstIdx, lastIdx } = findTimeRange(times, timeMs - lookbackMs, timeMs + maxScrollMs);
  if (lastIdx < firstIdx)
    return;
  const barlineSprite = skin ? skinImg(skin.images, "taiko-barline") : void 0;
  if (barlineSprite !== void 0) {
    const aspect = barlineSprite.width / barlineSprite.height;
    const drawH = PLAYFIELD_H_PX2;
    const drawW = drawH * aspect;
    const yTop = PLAYFIELD_TOP_Y2;
    for (let i = firstIdx; i <= lastIdx; i++) {
      const x = HIT_TARGET_X2 + (times[i] - timeMs) * vels[i];
      if (x < LANE_LEFT_X || x > LANE_RIGHT_X)
        continue;
      ctx.drawImage(barlineSprite, x - drawW / 2, yTop, drawW, drawH);
    }
    return;
  }
  ctx.strokeStyle = "rgba(255, 255, 255, 0.13)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = firstIdx; i <= lastIdx; i++) {
    const x = HIT_TARGET_X2 + (times[i] - timeMs) * vels[i];
    if (x < LANE_LEFT_X || x > LANE_RIGHT_X)
      continue;
    ctx.moveTo(x, PLAYFIELD_TOP_Y2);
    ctx.lineTo(x, PLAYFIELD_TOP_Y2 + PLAYFIELD_H_PX2);
  }
  ctx.stroke();
}
function bpmPacedOverlayFrame(combo, timeMs, timingPointTime, beatLength, frameCount) {
  if (frameCount <= 1)
    return 0;
  let multiplier;
  if (combo >= 150)
    multiplier = 2;
  else if (combo >= 50)
    multiplier = 1;
  else
    return 0;
  if (beatLength <= 0)
    return 0;
  const period = beatLength * 2 / multiplier;
  const half = beatLength / multiplier;
  const phase = Math.abs(timeMs - timingPointTime) % period;
  return phase >= half ? 0 : 1;
}
function getUninheritedAt(tps, time) {
  let out = { time: 0, beatLength: 500 };
  for (const tp of tps) {
    if (tp.time > time)
      break;
    if (!tp.inherited)
      out = { time: tp.time, beatLength: tp.beatLength };
  }
  return out;
}
function comboAt(comboFrames, timeMs) {
  const n = comboFrames.length;
  if (n === 0)
    return 0;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (comboFrames[mid].time <= timeMs)
      lo = mid + 1;
    else
      hi = mid;
  }
  return lo > 0 ? comboFrames[lo - 1].combo : 0;
}
function resolveSkinFrames(images, stem) {
  const frames = [];
  for (let i = 0; ; i++) {
    const f = skinSpriteNatural(images, `${stem}-${i}`);
    if (f === void 0)
      break;
    frames.push(f);
  }
  if (frames.length > 0)
    return frames;
  const single = skinSpriteNatural(images, stem);
  return single !== void 0 ? [single] : [];
}
var FLY_OFF_GRAVITY_TIME_MS = 300;
var FLY_OFF_GRAVITY_HEIGHT = 200;
var FLY_OFF_TOTAL_MS = FLY_OFF_GRAVITY_TIME_MS * 3;
var FLY_OFF_FADE_MS = 800;
var FLY_OFF_SCALE_MS = FLY_OFF_GRAVITY_TIME_MS * 2;
var FLY_OFF_SCALE_TARGET = 0.8;
var FLY_OFF_DOWN_DISTANCE = FLY_OFF_GRAVITY_HEIGHT * 2;
var MISS_FADE_MS = 100;
function flyingHitTransform(age) {
  let dy;
  if (age < FLY_OFF_GRAVITY_TIME_MS) {
    const u = age / FLY_OFF_GRAVITY_TIME_MS;
    const eased = 1 - (1 - u) * (1 - u);
    dy = -FLY_OFF_GRAVITY_HEIGHT * eased;
  } else {
    const u = (age - FLY_OFF_GRAVITY_TIME_MS) / (FLY_OFF_GRAVITY_TIME_MS * 2);
    const eased = u * u;
    dy = -FLY_OFF_GRAVITY_HEIGHT + (FLY_OFF_GRAVITY_HEIGHT + FLY_OFF_DOWN_DISTANCE) * eased;
  }
  const su = Math.min(1, age / FLY_OFF_SCALE_MS);
  const sEased = 1 - (1 - su) * (1 - su);
  const scale = 1 - (1 - FLY_OFF_SCALE_TARGET) * sEased;
  const alpha = Math.max(0, 1 - age / FLY_OFF_FADE_MS);
  return { dy, scale, alpha };
}
function drawHitCircle(ctx, hit, x, y, scaleFactor, alpha, timeMs, skin, beatmap, comboNow) {
  const baseR = hit.isStrong ? STRONG_NOTE_RADIUS_PX : NOTE_RADIUS_PX;
  const r = baseR * scaleFactor;
  const colour = hit.isRim ? KAT_COLOUR : DON_COLOUR;
  const baseStem = hit.isStrong ? "taikobigcircle" : "taikohitcircle";
  const overlayStem = hit.isStrong ? "taikobigcircleoverlay" : "taikohitcircleoverlay";
  const base = skin ? skinImg(skin.images, baseStem) : void 0;
  const prevAlpha = ctx.globalAlpha;
  if (alpha < 1)
    ctx.globalAlpha = prevAlpha * alpha;
  if (base !== void 0) {
    const d = r * 2;
    drawCentredBitmap(ctx, tintBitmap(base, colour), x, y, d);
    if (skin !== void 0) {
      const frames = resolveSkinFrames(skin.images, overlayStem);
      const overlayFrames = frames.length > 0 ? frames : hit.isStrong ? resolveSkinFrames(skin.images, "taikohitcircleoverlay") : [];
      if (overlayFrames.length > 0) {
        let frameIdx = 0;
        if (overlayFrames.length > 1) {
          const tp = getUninheritedAt(beatmap.timingPoints, hit.time);
          frameIdx = bpmPacedOverlayFrame(comboNow, timeMs, tp.time, tp.beatLength, overlayFrames.length);
        }
        const baseLogicalMax = baseLogicalExtent(skin.images, baseStem, base);
        const f = overlayFrames[frameIdx];
        drawOverlayNative(ctx, f.bitmap, f.pixelScale, x, y, baseLogicalMax, d);
      }
    }
  } else {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = hit.isStrong ? 3 : 2;
    ctx.stroke();
  }
  if (alpha < 1)
    ctx.globalAlpha = prevAlpha;
}
function drawHit(ctx, hit, timeMs, scrollVel, skin, judgmentByNote, beatmap, comboNow, isHD) {
  const r = hit.isStrong ? STRONG_NOTE_RADIUS_PX : NOTE_RADIUS_PX;
  const judged = judgmentByNote.get(hit.noteId);
  if (judged !== void 0 && timeMs >= judged.time) {
    if (isHD)
      return;
    if (judged.judgement === 0) {
      const age = timeMs - judged.time;
      if (age >= MISS_FADE_MS)
        return;
      const x2 = objectX(hit.time, timeMs, scrollVel);
      if (x2 < LANE_LEFT_X - r - 4 || x2 > LANE_RIGHT_X + r + 4)
        return;
      const alpha2 = 1 - age / MISS_FADE_MS;
      drawHitCircle(ctx, hit, x2, LANE_CENTRE_Y2, 1, alpha2, timeMs, skin, beatmap, comboNow);
    }
    return;
  }
  const x = objectX(hit.time, timeMs, scrollVel);
  if (x < LANE_LEFT_X - r - 4 || x > LANE_RIGHT_X + r + 4)
    return;
  const alpha = isHD ? taikoHiddenAlpha(hit.time, timeMs, scrollVel) : 1;
  if (alpha <= 0)
    return;
  drawHitCircle(ctx, hit, x, LANE_CENTRE_Y2, 1, alpha, timeMs, skin, beatmap, comboNow);
}
function drawFlyingHits(ctx, objects, objectVel, firstIdx, lastIdx, timeMs, skin, judgmentByNote, beatmap, comboNow) {
  for (let i = firstIdx; i <= lastIdx; i++) {
    const o = objects[i];
    if (o.kind !== "hit")
      continue;
    const judged = judgmentByNote.get(o.noteId);
    if (judged === void 0 || judged.judgement === 0)
      continue;
    const age = timeMs - judged.time;
    if (age < 0 || age >= FLY_OFF_TOTAL_MS)
      continue;
    const x = objectX(o.time, timeMs, objectVel[i]);
    if (x < -200 || x > LOGICAL_W + 200)
      continue;
    const { dy, scale, alpha } = flyingHitTransform(age);
    if (alpha <= 0)
      continue;
    drawHitCircle(ctx, o, x, LANE_CENTRE_Y2 + dy, scale, alpha, timeMs, skin, beatmap, comboNow);
  }
}
function drawDrumRollFlyingHits(ctx, objects, objectVel, firstIdx, lastIdx, timeMs, skin, hitResults, beatmap, comboNow) {
  for (let i = firstIdx; i <= lastIdx; i++) {
    const o = objects[i];
    if (o.kind !== "drumroll")
      continue;
    const vel = objectVel[i];
    for (const th of drumrollTickHits(hitResults, o.sourceIndex)) {
      const age = timeMs - th.time;
      if (age < 0 || age >= FLY_OFF_TOTAL_MS)
        continue;
      const x = objectX(th.time, timeMs, vel);
      if (x < -200 || x > LOGICAL_W + 200)
        continue;
      const { dy, scale, alpha } = flyingHitTransform(age);
      if (alpha <= 0)
        continue;
      const note = {
        kind: "hit",
        time: th.time,
        isRim: th.isRim,
        isStrong: o.isStrong,
        hitSound: 0,
        sourceIndex: o.sourceIndex,
        noteId: -1
        // synthetic; never looked up in judgmentByNote
      };
      drawHitCircle(ctx, note, x, LANE_CENTRE_Y2 + dy, scale, alpha, timeMs, skin, beatmap, comboNow);
    }
  }
}
var _drumrollHitsByResults = /* @__PURE__ */ new WeakMap();
var _EMPTY_DRUMROLL_HITS = Object.freeze([]);
function drumrollTickHits(results, sourceIndex) {
  let map = _drumrollHitsByResults.get(results);
  if (map === void 0) {
    map = /* @__PURE__ */ new Map();
    for (const r of results) {
      if (!r.comboIgnore)
        continue;
      if (r.strong === true)
        continue;
      let arr = map.get(r.objectIndex);
      if (arr === void 0) {
        arr = [];
        map.set(r.objectIndex, arr);
      }
      arr.push({ time: r.time, isRim: (r.hitSound & 8) !== 0 });
    }
    _drumrollHitsByResults.set(results, map);
  }
  return map.get(sourceIndex) ?? _EMPTY_DRUMROLL_HITS;
}
function computeDrumrollTint(roll, results, timeMs) {
  const halfWin = roll.tickInterval / 2;
  const tickHits = drumrollTickHits(results, roll.sourceIndex);
  let rolling = 0;
  let prev = 0;
  let lastChange = -Infinity;
  let hi = 0;
  for (const tt of roll.tickTimes) {
    const deadline = tt + halfWin;
    while (hi < tickHits.length && tickHits[hi].time < tt - halfWin)
      hi++;
    let wasHit = false;
    let eventTime;
    if (hi < tickHits.length && tickHits[hi].time <= deadline) {
      wasHit = true;
      eventTime = tickHits[hi].time;
      hi++;
    } else {
      eventTime = deadline;
    }
    if (eventTime > timeMs)
      break;
    const before = rolling;
    rolling = wasHit ? Math.min(DRUMROLL_TICKS_TO_ENGAGE, rolling + 1) : Math.max(0, rolling - 1);
    if (rolling !== before) {
      prev = before;
      lastChange = eventTime;
    }
  }
  const fadeT = isFinite(lastChange) ? Math.max(0, Math.min(1, (timeMs - lastChange) / DRUMROLL_FADE_MS)) : 1;
  const display = prev + (rolling - prev) * fadeT;
  const f = display / DRUMROLL_TICKS_TO_ENGAGE;
  const r = Math.round(DRUMROLL_IDLE_RGB.r + (DRUMROLL_ENGAGED_RGB.r - DRUMROLL_IDLE_RGB.r) * f);
  const g = Math.round(DRUMROLL_IDLE_RGB.g + (DRUMROLL_ENGAGED_RGB.g - DRUMROLL_IDLE_RGB.g) * f);
  const b = Math.round(DRUMROLL_IDLE_RGB.b + (DRUMROLL_ENGAGED_RGB.b - DRUMROLL_IDLE_RGB.b) * f);
  return `rgb(${r}, ${g}, ${b})`;
}
function drawDrumRoll(ctx, roll, timeMs, scrollVel, skin, hitResults) {
  const tint = computeDrumrollTint(roll, hitResults, timeMs);
  const xHead = objectX(roll.time, timeMs, scrollVel);
  const xEnd = objectX(roll.endTime, timeMs, scrollVel);
  const r = roll.isStrong ? STRONG_NOTE_RADIUS_PX : NOTE_RADIUS_PX;
  const rollMiddle = skin ? skinImg(skin.images, "taiko-roll-middle") : void 0;
  const rollEnd = skin ? skinImg(skin.images, "taiko-roll-end") : void 0;
  const headStem = roll.isStrong ? "taikobigcircle" : "taikohitcircle";
  const overlayStem = roll.isStrong ? "taikobigcircleoverlay" : "taikohitcircleoverlay";
  const headBase = skin ? skinImg(skin.images, headStem) : void 0;
  const headOverlay = skin ? skinImg(skin.images, overlayStem) : void 0;
  const tickSprite = skin ? skinImg(skin.images, "sliderscorepoint") : void 0;
  const bodyVisible = xEnd > LANE_LEFT_X - 4 && xHead < LANE_RIGHT_X + r + 4;
  if (bodyVisible && rollMiddle !== void 0 && rollEnd !== void 0) {
    const d = r * 2;
    const endAspect = rollEnd.width / rollEnd.height;
    const endDrawW = d * endAspect;
    const midX1 = xHead;
    const midX2 = xEnd;
    if (midX2 > midX1) {
      const tintedMid = tintBitmap(rollMiddle, tint);
      ctx.drawImage(tintedMid, midX1, LANE_CENTRE_Y2 - d / 2, midX2 - midX1, d);
    }
    const tintedEnd = tintBitmap(rollEnd, tint);
    ctx.drawImage(tintedEnd, xEnd, LANE_CENTRE_Y2 - d / 2, endDrawW, d);
  } else if (bodyVisible) {
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.moveTo(xHead, LANE_CENTRE_Y2 - r);
    ctx.lineTo(xEnd, LANE_CENTRE_Y2 - r);
    ctx.arc(xEnd, LANE_CENTRE_Y2, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(xHead, LANE_CENTRE_Y2 + r);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (const tt of roll.tickTimes) {
    const xt = objectX(tt, timeMs, scrollVel);
    if (xt < LANE_LEFT_X - 4 || xt > LANE_RIGHT_X + 4)
      continue;
    if (tickSprite !== void 0) {
      drawCentredBitmap(ctx, tickSprite, xt, LANE_CENTRE_Y2, 10);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(xt, LANE_CENTRE_Y2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (xHead >= LANE_LEFT_X - r - 4 && xHead <= LANE_RIGHT_X + r + 4) {
    if (headBase !== void 0) {
      const d = r * 2;
      drawCentredBitmap(ctx, tintBitmap(headBase, tint), xHead, LANE_CENTRE_Y2, d);
      if (headOverlay !== void 0) {
        const baseLogicalMax = baseLogicalExtent(skin.images, headStem, headBase);
        const ovScale = skin.images.has(`${overlayStem}@2x.png`) ? 0.5 : 1;
        drawOverlayNative(ctx, headOverlay, ovScale, xHead, LANE_CENTRE_Y2, baseLogicalMax, d);
      }
    } else {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.arc(xHead, LANE_CENTRE_Y2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = roll.isStrong ? 3 : 2;
      ctx.stroke();
    }
  }
}
var SWELL_DISPLAY_OFFSET_X = 250;
var SWELL_DISPLAY_OFFSET_Y = 100;
var SWELL_BODY_BASE_SCALE = 0.8;
var SWELL_APPROACH_START_SCALE = 1.86 * SWELL_BODY_BASE_SCALE;
var SWELL_APPROACH_END_SCALE = 0.1 * SWELL_BODY_BASE_SCALE;
var SWELL_APPROACH_ALPHA = 0.8;
var SWELL_FADE_IN_MS = 200;
var SWELL_FADE_OUT_MS = 300;
var SWELL_BODY_BUMP_PER_HIT = 0.02;
var SWELL_BODY_BUMP_MAX = 0.94 - SWELL_BODY_BASE_SCALE;
var SWELL_BODY_BUMP_DECAY_MS = 240;
var RADIANS_PER_HIT = Math.PI;
var SWELL_CLEAR_Y_START = -40;
var SWELL_CLEAR_Y_DELTA = -90 * (768 / 480);
var SWELL_CLEAR_MOVE_MS = 240;
var SWELL_CLEAR_FADE_IN_MS = 120;
var SWELL_COUNTER_Y_OFFSET = 130;
function skinSpriteNatural(images, stem) {
  const at2x = images.get(`${stem}@2x.png`);
  if (at2x !== void 0 && at2x.width > 1)
    return { bitmap: at2x, pixelScale: 0.5 };
  const at1x = images.get(`${stem}.png`);
  if (at1x !== void 0 && at1x.width > 1)
    return { bitmap: at1x, pixelScale: 1 };
  return void 0;
}
function drawSpriteNatural(ctx, sprite, cx, cy, scale) {
  const px = sprite.bitmap.width * sprite.pixelScale * scale * PLAYFIELD_SCALE2;
  const py = sprite.bitmap.height * sprite.pixelScale * scale * PLAYFIELD_SCALE2;
  ctx.drawImage(sprite.bitmap, cx - px / 2, cy - py / 2, px, py);
}
function scoreDigitNatural(images, digit) {
  return skinSpriteNatural(images, `score-${digit}`);
}
function drawScoreDigits(ctx, images, text, cx, cy, textScale) {
  const sprites = [];
  let totalW = 0;
  let maxH = 0;
  for (const ch3 of text) {
    const sp = scoreDigitNatural(images, ch3);
    if (sp === void 0)
      return;
    sprites.push(sp);
    totalW += sp.bitmap.width * sp.pixelScale * textScale * PLAYFIELD_SCALE2;
    const h = sp.bitmap.height * sp.pixelScale * textScale * PLAYFIELD_SCALE2;
    if (h > maxH)
      maxH = h;
  }
  let x = cx - totalW / 2;
  for (const sp of sprites) {
    const w = sp.bitmap.width * sp.pixelScale * textScale * PLAYFIELD_SCALE2;
    const h = sp.bitmap.height * sp.pixelScale * textScale * PLAYFIELD_SCALE2;
    ctx.drawImage(sp.bitmap, x, cy - h / 2, w, h);
    x += w;
  }
}
function drawSwell(ctx, swell, timeMs, scrollVel, progress2, skin) {
  if (skin === void 0)
    return;
  const sprWarning = skinSpriteNatural(skin.images, "spinner-warning");
  const sprCircle = skinSpriteNatural(skin.images, "spinner-circle");
  const sprApproach = skinSpriteNatural(skin.images, "spinner-approachcircle");
  const sprOsu = skinSpriteNatural(skin.images, "spinner-osu");
  if (sprWarning === void 0 && sprCircle === void 0 && sprApproach === void 0 && sprOsu === void 0)
    return;
  let numHits = 0;
  if (progress2 !== void 0) {
    for (const t of progress2.tickTimes) {
      if (t <= timeMs)
        numHits++;
      else
        break;
    }
  }
  const remaining = Math.max(0, swell.requiredHits - numHits);
  const terminalTime = progress2?.completionTime ?? swell.endTime;
  const completed = progress2?.completionTime !== void 0;
  const visibleTo = terminalTime + SWELL_FADE_OUT_MS;
  const visibleFrom = swell.time - 4e3;
  if (timeMs < visibleFrom || timeMs > visibleTo)
    return;
  const scrollX = objectX(swell.time, timeMs, scrollVel);
  const cx = timeMs >= swell.time ? Math.max(HIT_TARGET_X2, scrollX) : scrollX;
  const cy = LANE_CENTRE_Y2;
  const offX = SWELL_DISPLAY_OFFSET_X * PLAYFIELD_SCALE2;
  const offY = SWELL_DISPLAY_OFFSET_Y * PLAYFIELD_SCALE2;
  const clusterCx = cx + offX;
  const clusterCy = cy + offY;
  const cull = 800;
  if (cx > LANE_RIGHT_X + cull || cx < LANE_LEFT_X - cull)
    return;
  let containerAlpha = 1;
  if (timeMs > terminalTime) {
    const t = (timeMs - terminalTime) / SWELL_FADE_OUT_MS;
    const u = 1 - Math.min(1, t);
    containerAlpha = u * u;
    if (containerAlpha <= 0)
      return;
  }
  ctx.save();
  ctx.globalAlpha = containerAlpha;
  if (sprWarning !== void 0 && timeMs < swell.time + SWELL_FADE_IN_MS) {
    const activeT = timeMs - swell.time;
    let wx = cx, wy = cy, wScale = 1, wAlpha = 1;
    if (activeT >= 0) {
      const tProg = activeT / SWELL_FADE_IN_MS;
      wx = cx + offX * tProg;
      wy = cy + offY * tProg;
      wScale = 1 + 2 * tProg;
      wAlpha = 1 - tProg;
    }
    if (wAlpha > 0) {
      ctx.save();
      ctx.globalAlpha *= wAlpha;
      drawSpriteNatural(ctx, sprWarning, wx, wy, wScale);
      ctx.restore();
    }
  }
  if (timeMs >= swell.time) {
    const activeT = timeMs - swell.time;
    const duration = Math.max(1, swell.endTime - swell.time);
    const fadeIn = Math.min(1, activeT / SWELL_FADE_IN_MS);
    if (sprApproach !== void 0) {
      const tProg = Math.min(1, activeT / duration);
      let approachScale = SWELL_APPROACH_START_SCALE + (SWELL_APPROACH_END_SCALE - SWELL_APPROACH_START_SCALE) * tProg;
      if (completed && timeMs >= terminalTime)
        approachScale = SWELL_APPROACH_END_SCALE;
      ctx.save();
      ctx.globalAlpha *= SWELL_APPROACH_ALPHA * fadeIn;
      drawSpriteNatural(ctx, sprApproach, clusterCx, clusterCy, approachScale);
      ctx.restore();
    }
    if (sprCircle !== void 0) {
      let bumpAccum = 0;
      if (progress2 !== void 0) {
        for (let i = progress2.tickTimes.length - 1; i >= 0; i--) {
          const t = progress2.tickTimes[i];
          if (t > timeMs)
            continue;
          const age = timeMs - t;
          if (age >= SWELL_BODY_BUMP_DECAY_MS)
            break;
          bumpAccum += SWELL_BODY_BUMP_PER_HIT * (1 - age / SWELL_BODY_BUMP_DECAY_MS);
          if (bumpAccum >= SWELL_BODY_BUMP_MAX) {
            bumpAccum = SWELL_BODY_BUMP_MAX;
            break;
          }
        }
      }
      let bodyScale = SWELL_BODY_BASE_SCALE + bumpAccum;
      if (completed && timeMs >= terminalTime) {
        const cAge = timeMs - terminalTime;
        const cT = Math.min(1, cAge / SWELL_FADE_OUT_MS);
        const outQuad2 = 1 - (1 - cT) * (1 - cT);
        bodyScale += 0.05 * outQuad2;
      }
      const rotation = numHits * RADIANS_PER_HIT;
      ctx.save();
      ctx.globalAlpha *= fadeIn;
      ctx.translate(clusterCx, clusterCy);
      ctx.rotate(rotation);
      drawSpriteNatural(ctx, sprCircle, 0, 0, bodyScale);
      ctx.restore();
    }
    const textScale = swell.requiredHits > 0 ? 1.6 - 0.6 * (remaining / swell.requiredHits) : 1.6;
    const textCy = clusterCy + SWELL_COUNTER_Y_OFFSET * PLAYFIELD_SCALE2;
    ctx.save();
    ctx.globalAlpha *= fadeIn;
    drawScoreDigits(ctx, skin.images, String(remaining), clusterCx, textCy, textScale);
    ctx.restore();
  }
  if (completed && sprOsu !== void 0) {
    const cAge = timeMs - progress2.completionTime;
    if (cAge >= 0) {
      const moveProg = Math.min(1, cAge / SWELL_CLEAR_MOVE_MS);
      const fadeIn = Math.min(1, cAge / SWELL_CLEAR_FADE_IN_MS);
      const yOffset = (SWELL_CLEAR_Y_START + SWELL_CLEAR_Y_DELTA * moveProg) * PLAYFIELD_SCALE2;
      ctx.save();
      ctx.globalAlpha *= fadeIn;
      drawSpriteNatural(ctx, sprOsu, clusterCx, clusterCy + yOffset, 1);
      ctx.restore();
    }
  }
  ctx.restore();
}
function drawObject(ctx, o, timeMs, scrollVel, skin, judgmentByNote, beatmap, comboNow, hitResults, isHD) {
  if (o.kind === "hit")
    drawHit(ctx, o, timeMs, scrollVel, skin, judgmentByNote, beatmap, comboNow, isHD);
  else if (o.kind === "drumroll")
    drawDrumRoll(ctx, o, timeMs, scrollVel, skin, hitResults);
}
var GLOW_BASE_SCALE = 0.8;
var GLOW_TINT = "rgb(255, 228, 0)";
var GLOW_FADE_IN_PER_MS = 1 / 100;
var GLOW_FADE_OUT_PER_MS = 1 / 600;
var GLOW_PULSE_BUMP = 0.15;
var GLOW_PULSE_MS = 80;
function outQuadEase(t) {
  const x = t <= 0 ? 0 : t >= 1 ? 1 : t;
  return 1 - (1 - x) * (1 - x);
}
function lastKiaiTransitionAt(tps, timeMs) {
  let prev = false;
  let transitionTime = -Infinity;
  let kiaiOn = false;
  for (const tp of tps) {
    if (tp.time > timeMs)
      break;
    if (tp.kiai !== prev) {
      transitionTime = tp.time;
      kiaiOn = tp.kiai;
      prev = tp.kiai;
    }
  }
  return { transitionTime, kiaiOn };
}
function drawTaikoGlow(ctx, beatmap, results, timeMs, skin) {
  if (skin === void 0)
    return;
  const glowSprite = skinSpriteNatural(skin.images, "taiko-glow");
  if (glowSprite === void 0)
    return;
  const { transitionTime, kiaiOn } = lastKiaiTransitionAt(beatmap.timingPoints, timeMs);
  if (!isFinite(transitionTime))
    return;
  const elapsed = timeMs - transitionTime;
  const alpha = kiaiOn ? Math.min(1, elapsed * GLOW_FADE_IN_PER_MS) : Math.max(0, 1 - elapsed * GLOW_FADE_OUT_PER_MS);
  if (alpha <= 0)
    return;
  let pulse = 0;
  if (kiaiOn) {
    const n = results.length;
    let lo = 0, hi = n;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (results[mid].time <= timeMs)
        lo = mid + 1;
      else
        hi = mid;
    }
    for (let i = lo - 1; i >= 0; i--) {
      const r = results[i];
      const age = timeMs - r.time;
      if (age > GLOW_PULSE_MS)
        break;
      if (r.comboIgnore)
        continue;
      if (r.judgement === 0)
        continue;
      pulse = GLOW_PULSE_BUMP * (1 - outQuadEase(age / GLOW_PULSE_MS));
      break;
    }
  }
  const scale = GLOW_BASE_SCALE + pulse;
  ctx.save();
  ctx.globalAlpha = alpha;
  const tinted2 = tintBitmap(glowSprite.bitmap, GLOW_TINT);
  const naturalMin = Math.min(glowSprite.bitmap.width, glowSprite.bitmap.height) * glowSprite.pixelScale;
  const d = naturalMin * scale * PLAYFIELD_SCALE2;
  drawCentredBitmap(ctx, tinted2, HIT_TARGET_X2, LANE_CENTRE_Y2, d);
  ctx.restore();
}
var EXPLOSION_FADE_IN_MS = 120;
var EXPLOSION_FADE_OUT_MS = 180;
var EXPLOSION_LIFETIME_MS = EXPLOSION_FADE_IN_MS + EXPLOSION_FADE_OUT_MS;
var STRONG_CROSSFADE_MS = 50;
function explosionStemFor(judgement, strong) {
  if (judgement === 300)
    return strong ? "taiko-hit300k" : "taiko-hit300";
  if (judgement === 100)
    return strong ? "taiko-hit100k" : "taiko-hit100";
  if (judgement === 0)
    return "taiko-hit0";
  return void 0;
}
function explosionScalePunch(age) {
  if (age < 96)
    return 0.6 + (1.1 - 0.6) * (age / 96);
  if (age < 144)
    return 1.1 + (0.9 - 1.1) * ((age - 96) / 48);
  if (age < 168)
    return 0.9 + (1 - 0.9) * ((age - 144) / 24);
  return 1;
}
function outQuintLocal(t) {
  const x = t <= 0 ? 0 : t >= 1 ? 1 : t;
  const u = 1 - x;
  return 1 - u * u * u * u * u;
}
function multiFrameIndexAt(age, frameCount) {
  const frameLen = 1e3 / frameCount;
  const idx = Math.floor(age / frameLen);
  return idx >= frameCount ? frameCount - 1 : Math.max(0, idx);
}
function hasTaikoExplosion(skin) {
  if (skin === void 0)
    return false;
  const i = skin.images;
  return i.has("taiko-hit300.png") || i.has("taiko-hit300@2x.png") || i.has("taiko-hit300-0.png") || i.has("taiko-hit300-0@2x.png");
}
function drawHitExplosions(ctx, results, timeMs, skin) {
  if (skin === void 0)
    return;
  if (!hasTaikoExplosion(skin))
    return;
  const lookbackMs = EXPLOSION_LIFETIME_MS + 64;
  const n = results.length;
  if (n === 0)
    return;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (results[mid].time <= timeMs)
      lo = mid + 1;
    else
      hi = mid;
  }
  const lastIdx = lo - 1;
  for (let i = lastIdx; i >= 0; i--) {
    const r = results[i];
    if (timeMs - r.time > lookbackMs)
      break;
    if (r.comboIgnore)
      continue;
    const age = timeMs - r.time;
    if (age < 0 || age >= EXPLOSION_LIFETIME_MS)
      continue;
    const baseStem = explosionStemFor(r.judgement, false);
    if (baseStem === void 0)
      continue;
    const baseFrames = resolveSkinFrames(skin.images, baseStem);
    if (baseFrames.length === 0)
      continue;
    const alpha = age < EXPLOSION_FADE_IN_MS ? age / EXPLOSION_FADE_IN_MS : 1 - (age - EXPLOSION_FADE_IN_MS) / EXPLOSION_FADE_OUT_MS;
    if (alpha <= 0)
      continue;
    let normalAlpha = alpha;
    let strongAlpha = 0;
    let strongFrames = [];
    if (r.strong && r.judgement !== 0 && r.strongSecondHitTime !== void 0) {
      const strongStem = explosionStemFor(r.judgement, true);
      if (strongStem !== void 0) {
        strongFrames = resolveSkinFrames(skin.images, strongStem);
        if (strongFrames.length > 0) {
          const xfAge = timeMs - r.strongSecondHitTime;
          if (xfAge >= 0) {
            const t = outQuintLocal(xfAge / STRONG_CROSSFADE_MS);
            strongAlpha = t * alpha;
            normalAlpha = (1 - t) * alpha;
          }
        }
      }
    }
    const isMultiFrameBase = baseFrames.length > 1;
    const isMultiFrameStrong = strongFrames.length > 1;
    const punch = isMultiFrameBase || isMultiFrameStrong ? 1 : explosionScalePunch(age);
    if (normalAlpha > 0) {
      const idx = isMultiFrameBase ? multiFrameIndexAt(age, baseFrames.length) : 0;
      const sp = baseFrames[idx];
      ctx.save();
      ctx.globalAlpha = normalAlpha;
      drawSpriteNatural(ctx, sp, HIT_TARGET_X2, LANE_CENTRE_Y2, punch);
      ctx.restore();
    }
    if (strongAlpha > 0 && strongFrames.length > 0) {
      const strongAge = timeMs - (r.strongSecondHitTime ?? r.time);
      const idx = isMultiFrameStrong ? multiFrameIndexAt(strongAge, strongFrames.length) : 0;
      const sp = strongFrames[idx];
      ctx.save();
      ctx.globalAlpha = strongAlpha;
      drawSpriteNatural(ctx, sp, HIT_TARGET_X2, LANE_CENTRE_Y2, punch);
      ctx.restore();
    }
  }
}
var MASCOT_SCALE = 0.6;
var MASCOT_FEET_Y = PLAYFIELD_TOP_Y2 + 0.2 * PLAYFIELD_H_PX2;
var MASCOT_ANCHOR_X = 4;
var MASCOT_CLEAR_FRAME_MS = 100;
var MASCOT_CLEAR_ORDER = [0, 1, 2, 3, 4, 5, 6, 5, 6, 5, 4, 3, 2, 1, 0];
var MASCOT_CLEAR_TOTAL_MS = MASCOT_CLEAR_FRAME_MS * MASCOT_CLEAR_ORDER.length;
function resolvePippidonFrames(images, stem) {
  const frames = [];
  for (let i = 0; ; i++) {
    const numbered = skinSpriteNatural(images, `${stem}${i}`);
    if (numbered !== void 0) {
      frames.push(numbered);
      continue;
    }
    if (i === 0) {
      const bare = skinSpriteNatural(images, stem);
      if (bare !== void 0) {
        frames.push(bare);
        continue;
      }
    }
    break;
  }
  return frames;
}
function lastComboAffectingResult(results, timeMs) {
  const n = results.length;
  if (n === 0)
    return void 0;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (results[mid].time <= timeMs)
      lo = mid + 1;
    else
      hi = mid;
  }
  for (let i = lo - 1; i >= 0; i--) {
    const r = results[i];
    if (r.comboIgnore)
      continue;
    return r;
  }
  return void 0;
}
function lastClearTriggerTime(results, comboFrames, timeMs) {
  const cn = comboFrames.length;
  let cLo = 0, cHi = cn;
  while (cLo < cHi) {
    const mid = cLo + cHi >>> 1;
    if (comboFrames[mid].time <= timeMs)
      cLo = mid + 1;
    else
      cHi = mid;
  }
  let trigger = -Infinity;
  for (let i = cLo - 1; i >= 0; i--) {
    const cf = comboFrames[i];
    if (timeMs - cf.time > MASCOT_CLEAR_TOTAL_MS + 16)
      break;
    if (cf.combo > 0 && cf.combo % 50 === 0) {
      trigger = cf.time;
      break;
    }
  }
  const rn = results.length;
  let rLo = 0, rHi = rn;
  while (rLo < rHi) {
    const mid = rLo + rHi >>> 1;
    if (results[mid].time <= timeMs)
      rLo = mid + 1;
    else
      rHi = mid;
  }
  for (let i = rLo - 1; i >= 0; i--) {
    const r = results[i];
    if (timeMs - r.time > MASCOT_CLEAR_TOTAL_MS + 16)
      break;
    if (r.comboIgnore && r.strong === true && r.judgement > 0) {
      if (r.time > trigger)
        trigger = r.time;
      break;
    }
  }
  return isFinite(trigger) ? trigger : void 0;
}
function drawTaikoMascot(ctx, beatmap, results, comboFrames, timeMs, skin) {
  if (skin === void 0)
    return;
  const clearTrigger = lastClearTriggerTime(results, comboFrames, timeMs);
  let state;
  let clearAge = 0;
  if (clearTrigger !== void 0) {
    clearAge = timeMs - clearTrigger;
    if (clearAge < MASCOT_CLEAR_TOTAL_MS) {
      state = "clear";
    } else {
      const lastR = lastComboAffectingResult(results, timeMs);
      const { kiai } = getTimingAt2(beatmap.timingPoints, timeMs);
      if (lastR && lastR.judgement === 0)
        state = "fail";
      else if (kiai)
        state = "kiai";
      else
        state = "idle";
    }
  } else {
    const lastR = lastComboAffectingResult(results, timeMs);
    const { kiai } = getTimingAt2(beatmap.timingPoints, timeMs);
    if (lastR && lastR.judgement === 0)
      state = "fail";
    else if (kiai)
      state = "kiai";
    else
      state = "idle";
  }
  const stateStem = `pippidon${state}`;
  const frames = resolvePippidonFrames(skin.images, stateStem);
  if (frames.length === 0)
    return;
  let frameIdx;
  if (state === "clear") {
    const seqIdx = Math.min(MASCOT_CLEAR_ORDER.length - 1, Math.floor(clearAge / MASCOT_CLEAR_FRAME_MS));
    const target = MASCOT_CLEAR_ORDER[seqIdx];
    frameIdx = Math.min(target, frames.length - 1);
  } else {
    const tp = getUninheritedAt(beatmap.timingPoints, timeMs);
    const beat = tp.beatLength > 0 ? Math.floor((timeMs - tp.time) / tp.beatLength) : 0;
    const wrapped = (beat % frames.length + frames.length) % frames.length;
    frameIdx = wrapped;
  }
  const sp = frames[frameIdx];
  const naturalW = sp.bitmap.width * sp.pixelScale;
  const naturalH = sp.bitmap.height * sp.pixelScale;
  const drawW = naturalW * MASCOT_SCALE;
  const drawH = naturalH * MASCOT_SCALE;
  const dx = MASCOT_ANCHOR_X;
  const dy = MASCOT_FEET_Y - drawH;
  ctx.drawImage(sp.bitmap, dx, dy, drawW, drawH);
}
function activeActionsAt(events, timeMs) {
  const out = {
    LeftRim: -Infinity,
    LeftCentre: -Infinity,
    RightCentre: -Infinity,
    RightRim: -Infinity
  };
  const n = events.length;
  if (n === 0)
    return out;
  const minT = timeMs - DRUM_FLASH_MS;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (events[mid].time < minT)
      lo = mid + 1;
    else
      hi = mid;
  }
  for (let i = lo; i < n; i++) {
    const ev = events[i];
    if (ev.time > timeMs)
      break;
    if (ev.time > out[ev.action])
      out[ev.action] = ev.time;
  }
  return out;
}
function drawInputDrum(ctx, events, timeMs, skin) {
  const cx = INPUT_DRUM_W_PX / 2;
  const cy = LANE_CENTRE_Y2;
  const outerR = PLAYFIELD_H_PX2 * 0.46;
  const innerR = outerR * 0.62;
  const active = activeActionsAt(events, timeMs);
  const intensity = (lastT) => {
    if (!isFinite(lastT))
      return 0;
    const age = timeMs - lastT;
    if (age < 0 || age > DRUM_FLASH_MS)
      return 0;
    return 1 - age / DRUM_FLASH_MS;
  };
  const drumOuter = skin ? skinSpriteNatural(skin.images, "taiko-drum-outer") : void 0;
  const drumInner = skin ? skinSpriteNatural(skin.images, "taiko-drum-inner") : void 0;
  if (drumOuter !== void 0 && drumInner !== void 0) {
    const ratio = 1.6;
    const negAdjust = INPUT_DRUM_W_PX / ratio;
    const v = skinVersionAsNumber(skin?.config.version ?? "");
    let leftCentre, rightCentre;
    let leftRim, rightRim;
    if (v >= 2.1) {
      leftCentre = [0, 0];
      rightCentre = [(negAdjust - 56) * ratio, 0];
      leftRim = [0, 0];
      rightRim = [(negAdjust - 56) * ratio, 0];
    } else {
      leftCentre = [18 * ratio, 31 * ratio];
      rightCentre = [(negAdjust - 54) * ratio, 31 * ratio];
      leftRim = [8 * ratio, 23 * ratio];
      rightRim = [(negAdjust - 53) * ratio, 23 * ratio];
    }
    const drawSprite2 = (sprite, pos, origin, flipX, alpha) => {
      if (alpha <= 0)
        return;
      const w = sprite.bitmap.width * sprite.pixelScale * PLAYFIELD_SCALE2;
      const h = sprite.bitmap.height * sprite.pixelScale * PLAYFIELD_SCALE2;
      const ox = origin === "TR" ? w : 0;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(pos[0], pos[1]);
      ctx.scale(flipX ? -1 : 1, 1);
      ctx.translate(-ox, 0);
      ctx.drawImage(sprite.bitmap, 0, 0, w, h);
      ctx.restore();
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, PLAYFIELD_TOP_Y2, INPUT_DRUM_W_PX, PLAYFIELD_H_PX2);
    ctx.clip();
    ctx.translate(0, PLAYFIELD_TOP_Y2);
    drawSprite2(drumOuter, leftRim, "TR", true, intensity(active.LeftRim));
    drawSprite2(drumInner, leftCentre, "TL", false, intensity(active.LeftCentre));
    ctx.translate(INPUT_DRUM_W_PX, 0);
    ctx.scale(-1, 1);
    drawSprite2(drumOuter, rightRim, "TL", true, intensity(active.RightRim));
    drawSprite2(drumInner, rightCentre, "TR", false, intensity(active.RightCentre));
    ctx.restore();
    return;
  }
  ctx.fillStyle = "#0c1a24";
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fill();
  const lr = intensity(active.LeftRim);
  if (lr > 0) {
    ctx.fillStyle = `rgba(68, 141, 171, ${0.85 * lr})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, Math.PI / 2, -Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
  }
  const rr = intensity(active.RightRim);
  if (rr > 0) {
    ctx.fillStyle = `rgba(68, 141, 171, ${0.85 * rr})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, -Math.PI / 2, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = KAT_COLOUR;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#1a0a0a";
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fill();
  const lc = intensity(active.LeftCentre);
  if (lc > 0) {
    ctx.fillStyle = `rgba(235, 69, 44, ${0.85 * lc})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, innerR, Math.PI / 2, -Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
  }
  const rc = intensity(active.RightCentre);
  if (rc > 0) {
    ctx.fillStyle = `rgba(235, 69, 44, ${0.85 * rc})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, innerR, -Math.PI / 2, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = DON_COLOUR;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  ctx.lineTo(cx, cy + outerR);
  ctx.stroke();
}
function drawTaikoPlayfield(ctx, session, timeMs, options) {
  const objectVel = session.objectVel;
  const barLineVel = session.barLineVel;
  const maxScrollMs = session.maxScrollMs;
  const skin = session.skin;
  const comboNow = comboAt(session.comboFrames, timeMs);
  const isHD = options.modHidden;
  let lookback = 500;
  for (const o of session.objects) {
    if (o.kind !== "hit") {
      const d = o.endTime - o.time;
      if (d > lookback)
        lookback = d;
    }
  }
  lookback += 500;
  drawPlayfieldBackground(ctx, skin, session.beatmap.timingPoints, timeMs);
  drawTaikoGlow(ctx, session.beatmap, session.hitResults, timeMs, skin);
  drawHitTarget(ctx, skin);
  drawHitExplosions(ctx, session.hitResults, timeMs, skin);
  ctx.save();
  ctx.beginPath();
  ctx.rect(LANE_LEFT_X, 0, LANE_RIGHT_X - LANE_LEFT_X, LOGICAL_H);
  ctx.clip();
  drawBarLines(ctx, session.barLines, barLineVel, timeMs, maxScrollMs, lookback, skin);
  const { firstIdx, lastIdx } = findObjectVisibleRange(session.objects, timeMs, maxScrollMs, lookback);
  for (let i = lastIdx; i >= firstIdx; i--) {
    drawObject(
      ctx,
      session.objects[i],
      timeMs,
      objectVel[i],
      skin,
      session.hitJudgmentByNote,
      session.beatmap,
      comboNow,
      session.hitResults,
      isHD
    );
  }
  ctx.restore();
  if (options.taikoFlyingHits) {
    drawFlyingHits(
      ctx,
      session.objects,
      objectVel,
      firstIdx,
      lastIdx,
      timeMs,
      skin,
      session.hitJudgmentByNote,
      session.beatmap,
      comboNow
    );
    drawDrumRollFlyingHits(
      ctx,
      session.objects,
      objectVel,
      firstIdx,
      lastIdx,
      timeMs,
      skin,
      session.hitResults,
      session.beatmap,
      comboNow
    );
  }
  drawInputDrum(ctx, session.inputEvents, timeMs, skin);
  for (let i = lastIdx; i >= firstIdx; i--) {
    const o = session.objects[i];
    if (o.kind !== "swell")
      continue;
    drawSwell(ctx, o, timeMs, objectVel[i], session.swellProgress.get(o.sourceIndex), skin);
  }
  drawTaikoMascot(ctx, session.beatmap, session.hitResults, session.comboFrames, timeMs, skin);
  if (options.modFlashlight)
    taikoFlashlight(session).draw(ctx, timeMs);
}
var _flCache = /* @__PURE__ */ new WeakMap();
function taikoFlashlight(session) {
  if (session.flashlight !== null)
    return session.flashlight;
  let fl2 = _flCache.get(session);
  if (fl2 === void 0) {
    fl2 = new TaikoFlashlight(session.beatmap, session.comboFrames);
    _flCache.set(session, fl2);
  }
  return fl2;
}

// src/rulesets/taiko/hitJudge.ts
var STRONG_WINDOW_MS = 30;
function isCentreAction(a) {
  return a === "LeftCentre" || a === "RightCentre";
}
function isLeftAction(a) {
  return a === "LeftCentre" || a === "LeftRim";
}
function computeTaikoHitResults(session, modDiff) {
  const { objects, inputEvents } = session;
  const greatW = modDiff.taikoHitWindowGreat;
  const okW = modDiff.taikoHitWindowOk;
  const missW = modDiff.taikoHitWindowMiss;
  const hits = [];
  const drumrolls = [];
  const swells = [];
  for (const o of objects) {
    if (o.kind === "hit")
      hits.push(o);
    else if (o.kind === "drumroll")
      drumrolls.push(o);
    else
      swells.push(o);
  }
  const tickConsumed = drumrolls.map((d) => new Array(d.tickTimes.length).fill(false));
  const swellStates = swells.map((s) => ({
    lastWasRim: null,
    remaining: s.requiredHits,
    completed: false
  }));
  const eventConsumed = new Array(inputEvents.length).fill(false);
  const results = [];
  const ghostTaps = [];
  function emitAutoMiss(h) {
    results.push({
      objectIndex: h.sourceIndex,
      noteId: h.noteId,
      judgement: 0,
      // An unpressed note auto-misses at the lowest *successful* window (Ok), not Miss
      // — lazer's `HitWindows.CanBeHit(timeOffset)` is `timeOffset <= WindowFor(Ok)`,
      // so the note expires once the clock passes time + okW. See the okW drain below.
      time: h.time + okW,
      x: HIT_TARGET_CANVAS_X,
      y: HIT_TARGET_CANVAS_Y,
      hitSound: h.hitSound,
      comboBreak: true
    });
  }
  let hitIdx = 0;
  let lastHitTime = Number.NaN;
  for (let i = 0; i < inputEvents.length; i++) {
    if (eventConsumed[i])
      continue;
    const ev = inputEvents[i];
    if (ev.time === lastHitTime)
      continue;
    while (hitIdx < hits.length && hits[hitIdx].time + okW < ev.time) {
      emitAutoMiss(hits[hitIdx]);
      hitIdx++;
    }
    if (hitIdx < hits.length) {
      const h = hits[hitIdx];
      const delta = ev.time - h.time;
      if (delta >= -missW && delta <= missW) {
        const evCentre = isCentreAction(ev.action);
        const correctColour = evCentre === !h.isRim;
        const absDelta = Math.abs(delta);
        let judgement;
        if (!correctColour)
          judgement = 0;
        else if (absDelta < greatW)
          judgement = 300;
        else if (absDelta < okW)
          judgement = 100;
        else
          judgement = 0;
        let strong = false;
        let secondHitTime = 0;
        if (h.isStrong && judgement !== 0) {
          for (let j = i + 1; j < inputEvents.length; j++) {
            if (eventConsumed[j])
              continue;
            const e2 = inputEvents[j];
            if (e2.time - ev.time >= STRONG_WINDOW_MS)
              break;
            const e2Centre = isCentreAction(e2.action);
            const samePair = e2Centre === evCentre;
            const oppositeSide = isLeftAction(e2.action) !== isLeftAction(ev.action);
            if (samePair && oppositeSide) {
              strong = true;
              secondHitTime = e2.time;
              eventConsumed[j] = true;
              break;
            }
          }
        }
        const result = {
          objectIndex: h.sourceIndex,
          noteId: h.noteId,
          judgement,
          time: ev.time,
          x: HIT_TARGET_CANVAS_X,
          y: HIT_TARGET_CANVAS_Y,
          hitSound: h.hitSound,
          comboBreak: judgement === 0
        };
        if (strong) {
          result.strong = true;
          result.strongSecondHitTime = secondHitTime;
        }
        results.push(result);
        if (judgement !== 0)
          lastHitTime = ev.time;
        hitIdx++;
        continue;
      }
    }
    let drMatched = false;
    for (let d = 0; d < drumrolls.length; d++) {
      const dr = drumrolls[d];
      if (ev.time < dr.time)
        break;
      if (ev.time > dr.endTime)
        continue;
      const consumed = tickConsumed[d];
      const halfWin = dr.tickInterval / 2;
      let nearestIdx = -1;
      let nearestDist = Infinity;
      for (let t = 0; t < dr.tickTimes.length; t++) {
        if (consumed[t])
          continue;
        const dist = Math.abs(ev.time - dr.tickTimes[t]);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = t;
        }
      }
      if (nearestIdx >= 0 && nearestDist <= halfWin) {
        consumed[nearestIdx] = true;
        results.push({
          objectIndex: dr.sourceIndex,
          judgement: 300,
          time: ev.time,
          x: HIT_TARGET_CANVAS_X,
          y: HIT_TARGET_CANVAS_Y,
          // A tick plays don/kat by the pressed key, never the drumroll's own
          // additions (a finish-tagged roll must not play finish on every tick).
          // centre → normal(0), rim → clap(8). AudioSync reads this hitSound.
          hitSound: isCentreAction(ev.action) ? 0 : 8,
          comboBreak: false,
          comboIgnore: true
        });
      }
      drMatched = true;
      break;
    }
    if (drMatched)
      continue;
    let swMatched = false;
    for (let s = 0; s < swells.length; s++) {
      const sw = swells[s];
      if (ev.time < sw.time)
        break;
      if (ev.time > sw.endTime)
        continue;
      swMatched = true;
      const st = swellStates[s];
      if (!st.completed) {
        const evRim = !isCentreAction(ev.action);
        if (st.lastWasRim === null || st.lastWasRim !== evRim) {
          st.lastWasRim = evRim;
          st.remaining--;
          results.push({
            objectIndex: sw.sourceIndex,
            judgement: 300,
            time: ev.time,
            x: HIT_TARGET_CANVAS_X,
            y: HIT_TARGET_CANVAS_Y,
            // Same as drumroll ticks: ignore the spinner's additions (incl. finish)
            // and play don/kat by the pressed key. rim → clap(8), centre → normal(0).
            hitSound: evRim ? 8 : 0,
            comboBreak: false,
            comboIgnore: true
          });
          if (st.remaining <= 0) {
            st.completed = true;
            results.push({
              objectIndex: sw.sourceIndex,
              judgement: 300,
              time: ev.time,
              x: HIT_TARGET_CANVAS_X,
              y: HIT_TARGET_CANVAS_Y,
              hitSound: sw.hitSound,
              comboBreak: false,
              comboIgnore: true,
              strong: true
            });
          }
        }
      }
      break;
    }
    if (swMatched)
      continue;
    ghostTaps.push(ev);
  }
  while (hitIdx < hits.length) {
    emitAutoMiss(hits[hitIdx]);
    hitIdx++;
  }
  results.sort((a, b) => a.time - b.time);
  return { results, ghostTaps };
}

// src/rulesets/taiko/scoreProcessor.ts
var KIAI_F32 = Math.fround(1.2);
function applyKiai(x) {
  return Math.trunc(Math.fround(x * KIAI_F32));
}
function roundToEven2(x) {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff < 0.5)
    return floor;
  if (diff > 0.5)
    return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}
function activeKiaiAt(beatmap, time) {
  let kiai = false;
  for (const tp of beatmap.timingPoints) {
    if (tp.time > time)
      break;
    kiai = tp.kiai;
  }
  return kiai;
}
function computeTaikoGrade(c300, c100, miss, mods) {
  const total = c300 + c100 + miss;
  if (total === 0)
    return "D";
  const r300 = c300 / total;
  const r100 = c100 / total;
  let g;
  if (c300 === total)
    g = "SS";
  else if (r300 > 0.9 && r100 < 0.01 && miss === 0)
    g = "S";
  else if (r300 > 0.8 && miss === 0 || r300 > 0.9)
    g = "A";
  else if (r300 > 0.7 && miss === 0 || r300 > 0.8)
    g = "B";
  else if (r300 > 0.6)
    g = "C";
  else
    g = "D";
  const silver = (mods & (1 << 3 | 1 << 10)) !== 0;
  if (silver) {
    if (g === "S")
      return "SH";
    if (g === "SS")
      return "SSH";
  }
  return g;
}
function taikoPeppyStarsBreakdown(beatmap) {
  const hos = beatmap.hitObjects;
  const hp = beatmap.hpDrainRate;
  const od = beatmap.overallDifficulty;
  const cs = beatmap.circleSize;
  let drainSec = 1;
  if (hos.length > 0) {
    const first = hos[0].time;
    let lastEnd = first;
    for (const o of hos) {
      let end = o.time;
      if (o.type === "spinner")
        end = o.endTime;
      else if (o.type === "slider")
        end = o.time + slideDurationMs(beatmap, o) * o.slides;
      if (end > lastEnd)
        lastEnd = end;
    }
    drainSec = Math.max(1, Math.round((lastEnd - first) / 1e3));
  }
  const objectCount = hos.length;
  const fr = Math.fround;
  const density = Math.min(16, Math.max(0, fr(fr(objectCount / drainSec) * 8)));
  const sum = fr(hp) + fr(od) + fr(cs) + density;
  const raw = fr(fr(sum / 38) * 5);
  const peppyStars = roundToEven2(raw);
  const peppyStarsPlusOne = Math.max(2, Math.min(7, peppyStars + 1));
  return { hp, od, cs, objectCount, drainSec, density, sum, raw, peppyStars, peppyStarsPlusOne };
}
function computeTaikoScoreV1Timeline(session, modDiff) {
  const { beatmap, objects, hitResults } = session;
  const modMult = computeModMultiplier(modDiff.mods);
  const peppyStarsPlusOne = taikoPeppyStarsBreakdown(beatmap).peppyStarsPlusOne;
  const objBySrc = /* @__PURE__ */ new Map();
  for (const o of objects) {
    if (o.kind === "drumroll" || o.kind === "swell") {
      objBySrc.set(o.sourceIndex, o);
    }
  }
  const sorted = [...hitResults].sort((a, b) => a.time - b.time);
  let accuracyScore = 0;
  let comboScore = 0;
  let bonusScore = 0;
  const frames = [];
  let combo = 0, maxCombo = 0;
  let c300 = 0, c100 = 0, miss = 0;
  for (const r of sorted) {
    if (r.comboIgnore) {
      const obj = objBySrc.get(r.objectIndex);
      if (r.strong === true) {
        const swellEnd = obj?.kind === "swell" ? obj.endTime : r.time;
        const kiai = activeKiaiAt(beatmap, swellEnd);
        const base = 300;
        const comboTerm = Math.min(Math.floor(Math.min(100, combo) / 10), 10);
        const comboBonusRaw = Math.trunc(base / 35) * 2 * peppyStarsPlusOne * comboTerm;
        let scoreIncrease = base + comboBonusRaw;
        if (kiai)
          scoreIncrease = applyKiai(scoreIncrease);
        let comboScoreIncrease = scoreIncrease - base;
        scoreIncrease *= 2;
        comboScoreIncrease *= 2;
        bonusScore += scoreIncrease - comboScoreIncrease;
        comboScore += comboScoreIncrease;
      } else if (obj?.kind === "drumroll") {
        const kiai = activeKiaiAt(beatmap, obj.time);
        let inc = 300;
        if (kiai)
          inc = applyKiai(inc);
        if (obj.isStrong)
          inc += Math.trunc(inc / 5);
        bonusScore += inc;
      } else {
        const kiai = activeKiaiAt(beatmap, r.time);
        let inc = 300;
        if (kiai)
          inc = applyKiai(inc);
        bonusScore += inc;
      }
      const score2 = accuracyScore + bonusScore + Math.round(comboScore * modMult);
      const grade2 = computeTaikoGrade(c300, c100, miss, modDiff.mods);
      frames.push({ time: r.time, score: score2, combo, maxCombo, grade: grade2 });
      continue;
    }
    if (r.judgement === 0) {
      combo = 0;
      miss++;
    } else {
      combo += 1;
      if (combo > maxCombo)
        maxCombo = combo;
      if (r.judgement === 300)
        c300++;
      else
        c100++;
    }
    if (r.judgement > 0) {
      const base = r.judgement;
      const comboBefore = Math.max(combo - 1, 0);
      const comboTerm = Math.min(Math.floor(comboBefore / 10), 10);
      const comboBonusRaw = Math.trunc(base / 35) * 2 * peppyStarsPlusOne * comboTerm;
      const kiai = activeKiaiAt(beatmap, r.time);
      let scoreIncrease = base + comboBonusRaw;
      if (kiai)
        scoreIncrease = applyKiai(scoreIncrease);
      let comboScoreIncrease = scoreIncrease - base;
      if (r.strong === true) {
        scoreIncrease *= 2;
        comboScoreIncrease *= 2;
      }
      accuracyScore += scoreIncrease - comboScoreIncrease;
      comboScore += comboScoreIncrease;
    }
    const score = accuracyScore + bonusScore + Math.round(comboScore * modMult);
    const grade = computeTaikoGrade(c300, c100, miss, modDiff.mods);
    frames.push({ time: r.time, score, combo, maxCombo, grade });
  }
  return frames;
}
var LOG4 = Math.log(4);
var LOG4_400 = Math.log(400) / LOG4;
var LOG4_MIN = 0.5;
function taikoComboFactor(combo) {
  if (combo <= 0)
    return LOG4_MIN;
  const l = Math.log(combo) / LOG4;
  return Math.min(LOG4_400, Math.max(LOG4_MIN, l));
}
function computeTaikoLazerGrade(accuracy, miss, mods) {
  let g;
  if (accuracy >= 1 && miss === 0)
    g = "SS";
  else if (accuracy >= 0.95 && miss === 0)
    g = "S";
  else if (accuracy >= 0.9)
    g = "A";
  else if (accuracy >= 0.8)
    g = "B";
  else if (accuracy >= 0.7)
    g = "C";
  else
    g = "D";
  const silver = (mods & (1 << 3 | 1 << 10)) !== 0;
  if (silver) {
    if (g === "S")
      return "SH";
    if (g === "SS")
      return "SSH";
  }
  return g;
}
function computeTaikoScoreV2Timeline(session, modDiff) {
  const { objects, hitResults, replay } = session;
  const lazerMods = replay.scoreInfo?.mods ?? [];
  const modMult = computeTaikoModMultiplierV2(lazerMods);
  const objBySrc = /* @__PURE__ */ new Map();
  for (const o of objects) {
    if (o.kind === "drumroll" || o.kind === "swell") {
      objBySrc.set(o.sourceIndex, o);
    }
  }
  let maxComboPortion = 0;
  let maxAccBase = 0;
  let maxAccCount = 0;
  let simCombo = 0;
  for (const o of objects) {
    if (o.kind === "hit") {
      simCombo += 1;
      maxComboPortion += 300 * taikoComboFactor(simCombo);
      maxAccBase += 300;
      maxAccCount += 1;
    }
  }
  const sorted = [...hitResults].sort((a, b) => a.time - b.time);
  let comboPortion = 0;
  let accBase = 0;
  let accCount = 0;
  let bonusPortion = 0;
  let combo = 0, maxCombo = 0;
  let c300 = 0, c100 = 0, miss = 0;
  const frames = [];
  for (const r of sorted) {
    if (r.comboIgnore) {
      const parent = objBySrc.get(r.objectIndex);
      if (r.strong === true) {
        bonusPortion += 50;
      } else if (parent?.kind === "drumroll") {
        bonusPortion += 10;
        if (parent.isStrong)
          bonusPortion += 150;
      }
    } else {
      if (r.judgement === 0) {
        combo = 0;
        miss++;
        accBase += 0;
        accCount += 1;
      } else {
        combo += 1;
        if (combo > maxCombo)
          maxCombo = combo;
        const base = r.judgement === 300 ? 300 : 150;
        accBase += base;
        accCount += 1;
        comboPortion += base * taikoComboFactor(combo);
        if (r.judgement === 300)
          c300++;
        else
          c100++;
        if (r.strong === true)
          bonusPortion += 350;
      }
    }
    const accuracy = accBase > 0 || accCount > 0 ? accCount > 0 ? accBase / (accCount * 300) : 0 : 0;
    const comboProgress = maxComboPortion > 0 ? comboPortion / maxComboPortion : 0;
    const accProgress = maxAccCount > 0 ? accCount / maxAccCount : 0;
    const inner = 25e4 * comboProgress + 75e4 * Math.pow(accuracy, 3.6) * accProgress + bonusPortion;
    const score = Math.round(Math.round(inner) * modMult);
    const grade = computeTaikoLazerGrade(accuracy, miss, modDiff.mods);
    frames.push({ time: r.time, score, combo, maxCombo, grade });
  }
  return frames;
}

// src/rulesets/mania/converter.ts
function maniaColumnCount(beatmap) {
  return Math.max(1, Math.round(beatmap.circleSize));
}
function columnForX(x, totalColumns) {
  const col = Math.floor(x * totalColumns / 512);
  if (col < 0)
    return 0;
  if (col >= totalColumns)
    return totalColumns - 1;
  return col;
}
function convertBeatmapToMania(beatmap, modDiff) {
  const totalColumns = maniaColumnCount(beatmap);
  const stages = [{ columns: totalColumns, firstColumnIndex: 0 }];
  const objects = [];
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    if (obj === void 0 || obj.type !== "circle")
      continue;
    const note = {
      kind: "note",
      time: obj.time,
      column: columnForX(obj.x, totalColumns),
      hitSound: obj.hitSound,
      hitSample: obj.hitSample,
      sourceIndex: i
    };
    objects.push(note);
  }
  const holdSourceOffset = beatmap.hitObjects.length;
  for (let j = 0; j < beatmap.maniaHolds.length; j++) {
    const hold = beatmap.maniaHolds[j];
    const ln = {
      kind: "hold",
      startTime: hold.time,
      endTime: hold.endTime,
      column: columnForX(hold.x, totalColumns),
      hitSound: hold.hitSound,
      hitSample: hold.hitSample,
      sourceIndex: holdSourceOffset + j
    };
    objects.push(ln);
  }
  if (modDiff?.isMirror) {
    for (const o of objects)
      o.column = totalColumns - 1 - o.column;
  }
  objects.sort((a, b) => {
    const ta = a.kind === "note" ? a.time : a.startTime;
    const tb = b.kind === "note" ? b.time : b.startTime;
    if (ta !== tb)
      return ta - tb;
    return a.column - b.column;
  });
  return { stages, totalColumns, objects };
}
function computeManiaBarLines(beatmap) {
  const uninherited = [];
  for (const tp of beatmap.timingPoints)
    if (!tp.inherited)
      uninherited.push(tp);
  if (uninherited.length === 0)
    return [];
  let endTime = 0;
  for (const obj of beatmap.hitObjects) {
    const t = obj.type === "spinner" ? obj.endTime : obj.time;
    if (t > endTime)
      endTime = t;
  }
  for (const h of beatmap.maniaHolds) {
    if (h.endTime > endTime)
      endTime = h.endTime;
  }
  endTime += 2e3;
  const lines = [];
  const MAX_BAR_LINES = 2e5;
  for (let i = 0; i < uninherited.length; i++) {
    const tp = uninherited[i];
    const next = i + 1 < uninherited.length ? uninherited[i + 1].time : endTime;
    const step = tp.beatLength;
    const meter = Math.max(1, tp.meter);
    if (step <= 0)
      continue;
    let beatIndex = 0;
    for (let t = tp.time; t < next; t += step) {
      lines.push({ time: t, major: beatIndex % meter === 0 });
      beatIndex++;
      if (lines.length >= MAX_BAR_LINES)
        return lines;
    }
  }
  return lines;
}

// src/rulesets/mania/input.ts
function maniaFrames(replay, totalColumns) {
  const events = [];
  if (totalColumns <= 0)
    return events;
  const columnMask = totalColumns >= 32 ? -1 >>> 0 : (1 << totalColumns) - 1;
  let cumTime = 0;
  let prevMask = 0;
  for (const frame of replay.frames) {
    cumTime += frame.timeDelta;
    const curMask = (frame.x | 0) & columnMask;
    const presses = curMask & ~prevMask;
    const releases = ~curMask & prevMask;
    if (presses !== 0 || releases !== 0) {
      for (let col = 0; col < totalColumns; col++) {
        const bit = 1 << col;
        if (presses & bit)
          events.push({ time: cumTime, column: col, kind: "press" });
        if (releases & bit)
          events.push({ time: cumTime, column: col, kind: "release" });
      }
    }
    prevMask = curMask;
  }
  return events;
}

// src/rulesets/mania/hitJudge.ts
var RELEASE_LENIENCE2 = 1.5;
function judgementFor(absDelta, m) {
  if (absDelta <= m.maniaHitWindowPerfect)
    return 305;
  if (absDelta <= m.maniaHitWindowGreat)
    return 300;
  if (absDelta <= m.maniaHitWindowGood)
    return 200;
  if (absDelta <= m.maniaHitWindowOk)
    return 100;
  if (absDelta <= m.maniaHitWindowMeh)
    return 50;
  return 0;
}
function computeManiaHitResults(session, modDiff) {
  const { objects, inputEvents, totalColumns } = session;
  const missW = modDiff.maniaHitWindowMiss;
  const mehW = modDiff.maniaHitWindowMeh;
  const tailMissW = mehW * RELEASE_LENIENCE2;
  const objsByCol = Array.from({ length: totalColumns }, () => []);
  for (const o of objects) {
    const col = objsByCol[o.column];
    if (col !== void 0)
      col.push(o);
  }
  const eventsByCol = Array.from({ length: totalColumns }, () => []);
  for (const e of inputEvents) {
    const col = eventsByCol[e.column];
    if (col !== void 0)
      col.push(e);
  }
  const results = [];
  const holdStates = /* @__PURE__ */ new Map();
  for (let c = 0; c < totalColumns; c++) {
    const objs = objsByCol[c];
    const evs = eventsByCol[c];
    let oi = 0;
    let pending = null;
    let pendingDropped = false;
    const startTimeOf2 = (o) => o.kind === "note" ? o.time : o.startTime;
    const missObject = (o, time) => {
      if (o.kind === "note") {
        results.push({
          objectIndex: o.sourceIndex,
          judgement: 0,
          time,
          x: 0,
          y: 0,
          hitSound: o.hitSound,
          comboBreak: true
        });
        return;
      }
      results.push({
        objectIndex: o.sourceIndex,
        judgement: 0,
        subResult: "head",
        time,
        x: 0,
        y: 0,
        hitSound: o.hitSound,
        comboBreak: true
      });
      results.push({
        objectIndex: o.sourceIndex,
        judgement: 0,
        subResult: "body",
        time: o.endTime,
        x: 0,
        y: 0,
        hitSound: 0,
        comboBreak: true
      });
      results.push({
        objectIndex: o.sourceIndex,
        judgement: 0,
        subResult: "tail",
        time: o.endTime + tailMissW,
        x: 0,
        y: 0,
        hitSound: o.hitSound,
        comboBreak: true
      });
      holdStates.set(o.sourceIndex, { headJudgement: 0, pressedAt: null, releasedAt: null });
    };
    const drainExpiredHeads = (cursor) => {
      while (oi < objs.length) {
        const o = objs[oi];
        const headTime = startTimeOf2(o);
        if (headTime + mehW >= cursor)
          break;
        missObject(o, headTime + mehW);
        oi++;
      }
    };
    const missPendingTail = (time) => {
      if (pending === null)
        return;
      results.push({
        objectIndex: pending.sourceIndex,
        judgement: 0,
        subResult: "tail",
        time,
        x: 0,
        y: 0,
        hitSound: pending.hitSound,
        comboBreak: true
      });
      results.push({
        objectIndex: pending.sourceIndex,
        judgement: 0,
        subResult: "body",
        time: pending.endTime,
        x: 0,
        y: 0,
        hitSound: 0,
        comboBreak: true
      });
      pending = null;
    };
    const drainExpiredTail = (cursor) => {
      if (pending === null)
        return;
      const tailMissAt = pending.endTime + tailMissW;
      if (tailMissAt >= cursor)
        return;
      missPendingTail(tailMissAt);
    };
    for (const ev of evs) {
      drainExpiredHeads(ev.time);
      drainExpiredTail(ev.time);
      if (ev.kind === "press") {
        while (oi < objs.length) {
          const next = objs[oi + 1];
          if (next === void 0 || ev.time < startTimeOf2(next))
            break;
          missObject(objs[oi], ev.time);
          oi++;
        }
        if (oi >= objs.length)
          continue;
        const o = objs[oi];
        const headTime = startTimeOf2(o);
        const delta = ev.time - headTime;
        if (delta < -missW)
          continue;
        const j = judgementFor(Math.abs(delta), modDiff);
        if (j > 0 && pending !== null && pending.endTime <= headTime)
          missPendingTail(ev.time);
        if (o.kind === "note") {
          results.push({
            objectIndex: o.sourceIndex,
            judgement: j,
            time: ev.time,
            x: 0,
            y: 0,
            hitSound: o.hitSound,
            comboBreak: j === 0
          });
          oi++;
        } else {
          results.push({
            objectIndex: o.sourceIndex,
            judgement: j,
            subResult: "head",
            time: ev.time,
            x: 0,
            y: 0,
            hitSound: o.hitSound,
            comboBreak: j === 0
          });
          holdStates.set(o.sourceIndex, {
            headJudgement: j,
            pressedAt: ev.time,
            releasedAt: null
          });
          pending = o;
          pendingDropped = false;
          oi++;
        }
      } else {
        if (pending === null)
          continue;
        const rawTailDelta = ev.time - pending.endTime;
        const effOffset = rawTailDelta / RELEASE_LENIENCE2;
        const absEff = Math.abs(effOffset);
        if (effOffset < -missW) {
          pendingDropped = true;
          continue;
        }
        let tailJ = judgementFor(absEff, modDiff);
        const st = holdStates.get(pending.sourceIndex);
        const bodyBroken = pendingDropped || rawTailDelta < 0 && absEff > mehW;
        const headMissed = (st?.headJudgement ?? 0) === 0;
        const hasComboBreak = headMissed || bodyBroken;
        if (hasComboBreak && tailJ > 50)
          tailJ = 50;
        const bodyJ = bodyBroken ? 0 : 300;
        results.push({
          objectIndex: pending.sourceIndex,
          judgement: tailJ,
          subResult: "tail",
          time: ev.time,
          x: 0,
          y: 0,
          hitSound: pending.hitSound,
          comboBreak: tailJ === 0
        });
        results.push({
          objectIndex: pending.sourceIndex,
          judgement: bodyJ,
          subResult: "body",
          time: ev.time,
          x: 0,
          y: 0,
          hitSound: 0,
          comboBreak: bodyJ === 0,
          ...bodyJ === 300 ? { comboIgnore: true } : {}
        });
        if (st !== void 0) {
          st.releasedAt = ev.time;
        }
        pending = null;
      }
    }
    drainExpiredHeads(Number.POSITIVE_INFINITY);
    drainExpiredTail(Number.POSITIVE_INFINITY);
  }
  results.sort((a, b) => a.time - b.time);
  return { results, holdStates };
}

// src/rulesets/mania/scoreProcessor.ts
var HIT_VALUE = {
  305: 320,
  300: 300,
  200: 200,
  100: 100,
  50: 50,
  0: 0
};
var HIT_BONUS_VALUE = {
  305: 32,
  300: 32,
  200: 16,
  100: 8,
  50: 4,
  0: 0
};
var HIT_BONUS_ADD = {
  305: 2,
  300: 1,
  200: 0,
  100: 0,
  50: 0,
  0: 0
};
var HIT_PUNISHMENT = {
  305: 0,
  300: 0,
  200: 8,
  100: 24,
  50: 44,
  0: Number.POSITIVE_INFINITY
};
var MOD_FADE_IN = 1 << 20;
function maniaV1ModMultiplier(mods) {
  let m = 1;
  if (hasMod(mods, Mod.NoFail))
    m *= 0.5;
  if (hasMod(mods, Mod.Easy))
    m *= 0.5;
  if (hasMod(mods, Mod.HalfTime))
    m *= 0.5;
  return m;
}
function maniaV1ModDivider(mods) {
  let d = 1;
  if (hasMod(mods, Mod.Hidden))
    d *= 1.06;
  if (hasMod(mods, Mod.Flashlight))
    d *= 1.06;
  if (hasMod(mods, MOD_FADE_IN))
    d *= 1.06;
  if (hasMod(mods, Mod.HardRock))
    d *= 1.08;
  if (hasMod(mods, Mod.DoubleTime))
    d *= 1.1;
  return d;
}
function maniaV2ModMultiplier(_mods) {
  return 1;
}
function manGrade(acc, hasNonGreat, mods) {
  let g;
  if (!hasNonGreat)
    g = "SS";
  else if (acc >= 0.95)
    g = "S";
  else if (acc >= 0.9)
    g = "A";
  else if (acc >= 0.8)
    g = "B";
  else if (acc >= 0.7)
    g = "C";
  else
    g = "D";
  const silver = (mods & (Mod.Hidden | Mod.Flashlight | MOD_FADE_IN)) !== 0;
  if (silver) {
    if (g === "S")
      return "SH";
    if (g === "SS")
      return "SSH";
  }
  return g;
}
function combineLN(sub, hold, m) {
  if (sub.head === void 0 || sub.head === 0)
    return 0;
  if (sub.tail === void 0 || sub.tail === 0)
    return 0;
  if (sub.bodyBroken)
    return 0;
  const headErr = Math.abs((sub.headTime ?? hold.startTime) - hold.startTime);
  const tailErr = Math.abs((sub.tailTime ?? hold.endTime) - hold.endTime);
  const combined = headErr + tailErr;
  const Wp = m.maniaHitWindowPerfect, Wg = m.maniaHitWindowGreat;
  const Wgd = m.maniaHitWindowGood, Wok = m.maniaHitWindowOk;
  if (headErr <= Wp * 1.2 && combined <= Wp * 2.4)
    return 305;
  if (headErr <= Wg * 1.1 && combined <= Wg * 2.2)
    return 300;
  if (headErr <= Wgd && combined <= Wgd * 2)
    return 200;
  if (headErr <= Wok && combined <= Wok * 2)
    return 100;
  return 50;
}
function combinedV1Events(results, objects, modDiff) {
  const holdSub = /* @__PURE__ */ new Map();
  const holdByIndex = /* @__PURE__ */ new Map();
  const noteEvents = [];
  for (const o of objects)
    if (o.kind === "hold")
      holdByIndex.set(o.sourceIndex, o);
  for (const r of results) {
    if (r.subResult === void 0) {
      noteEvents.push({ time: r.time, judgement: r.judgement });
      continue;
    }
    let sub = holdSub.get(r.objectIndex);
    if (sub === void 0) {
      sub = { bodyBroken: false, resolveTime: r.time };
      holdSub.set(r.objectIndex, sub);
    }
    if (r.time > sub.resolveTime)
      sub.resolveTime = r.time;
    if (r.subResult === "head") {
      sub.head = r.judgement;
      sub.headTime = r.time;
    } else if (r.subResult === "tail") {
      sub.tail = r.judgement;
      sub.tailTime = r.time;
    } else if (r.subResult === "body" && r.judgement === 0)
      sub.bodyBroken = true;
  }
  const out = [...noteEvents];
  for (const [srcIdx, sub] of holdSub) {
    const hold = holdByIndex.get(srcIdx);
    if (hold === void 0)
      continue;
    const j = combineLN(sub, hold, modDiff);
    out.push({ time: sub.resolveTime, judgement: j });
  }
  out.sort((a, b) => a.time - b.time);
  return out;
}
function computeManiaAccTimeline(results, modDiff) {
  const sorted = [...results].sort((a, b) => a.time - b.time);
  const denomPerHit = modDiff.isLazer ? 305 : 300;
  const frames = [];
  let judgeSum = 0;
  let objCount = 0;
  for (const r of sorted) {
    if (r.subResult === "body")
      continue;
    const value = !modDiff.isLazer && r.judgement === 305 ? 300 : r.judgement;
    judgeSum += value;
    objCount++;
    frames.push({ time: r.time, acc: judgeSum / (denomPerHit * objCount) });
  }
  return frames;
}
function computeManiaComboTimeline(results, objects, modDiff) {
  if (modDiff.isLazer) {
    const sorted = [...results].sort((a, b) => a.time - b.time);
    const frames2 = [];
    let combo2 = 0;
    for (const r of sorted) {
      if (r.comboIgnore)
        continue;
      if (r.comboBreak)
        combo2 = 0;
      else if (r.judgement > 0)
        combo2 += 1;
      frames2.push({ time: r.time, combo: combo2 });
    }
    return frames2;
  }
  const events = combinedV1Events(results, objects, modDiff);
  const frames = [];
  let combo = 0;
  for (const ev of events) {
    if (ev.judgement === 0)
      combo = 0;
    else
      combo += 1;
    frames.push({ time: ev.time, combo });
  }
  return frames;
}
function computeManiaScoreV1Timeline(results, objects, modDiff) {
  const modMult = maniaV1ModMultiplier(modDiff.mods);
  const modDiv = maniaV1ModDivider(modDiff.mods);
  const totalNotes = objects.length;
  if (totalNotes === 0)
    return [];
  const events = combinedV1Events(results, objects, modDiff);
  const perEventScale = 1e6 * modMult * 0.5 / totalNotes;
  const frames = [];
  let score = 0;
  let combo = 0, maxCombo = 0;
  let bonus = 100;
  let cPerfect = 0, cGreat = 0, cGood = 0, cOk = 0, cMeh = 0, cMiss = 0;
  for (const ev of events) {
    const j = ev.judgement;
    if (j === 0) {
      combo = 0;
    } else {
      combo += 1;
    }
    if (combo > maxCombo)
      maxCombo = combo;
    if (j === 0)
      bonus = 0;
    else
      bonus = Math.max(0, Math.min(100, bonus + HIT_BONUS_ADD[j] - HIT_PUNISHMENT[j] / modDiv));
    const base = perEventScale * (HIT_VALUE[j] / 320);
    const bon = perEventScale * (HIT_BONUS_VALUE[j] * Math.sqrt(bonus) / 320);
    score += base + bon;
    if (j === 305)
      cPerfect++;
    else if (j === 300)
      cGreat++;
    else if (j === 200)
      cGood++;
    else if (j === 100)
      cOk++;
    else if (j === 50)
      cMeh++;
    else
      cMiss++;
    const accSum = 300 * cPerfect + 300 * cGreat + 200 * cGood + 100 * cOk + 50 * cMeh;
    const accCount = cPerfect + cGreat + cGood + cOk + cMeh + cMiss;
    const acc = accCount > 0 ? accSum / (300 * accCount) : 1;
    const hasNonGreat = cGood + cOk + cMeh + cMiss > 0;
    const grade = manGrade(acc, hasNonGreat, modDiff.mods);
    frames.push({
      time: ev.time,
      score: Math.round(score),
      combo,
      maxCombo,
      grade
    });
  }
  return frames;
}
function comboBase(j) {
  switch (j) {
    case 305:
      return 300;
    case 300:
      return 300;
    case 200:
      return 200;
    case 100:
      return 100;
    case 50:
      return 50;
    case 0:
      return 0;
  }
}
var COMBO_BASE = 4;
function comboScale(comboAfter) {
  if (comboAfter <= 0)
    return 0.5;
  const log = Math.log(comboAfter) / Math.log(COMBO_BASE);
  const maxLog = Math.log(400) / Math.log(COMBO_BASE);
  return Math.min(Math.max(0.5, log), maxLog);
}
function computeManiaScoreV2Timeline(results, objects, modDiff) {
  const modMult = maniaV2ModMultiplier(modDiff.mods);
  let maxComboPortion = 0;
  let maxAccPortion = 0;
  let maxAccCount = 0;
  let cMaxScratch = 0;
  const pushMax = () => {
    cMaxScratch += 1;
    maxComboPortion += 300 * comboScale(cMaxScratch);
    maxAccPortion += 305;
    maxAccCount += 1;
  };
  for (const o of objects) {
    if (o.kind === "note")
      pushMax();
    else {
      pushMax();
      pushMax();
    }
  }
  const frames = [];
  let combo = 0, maxCombo = 0;
  let comboPortion = 0;
  let accSum = 0;
  let accCount = 0;
  let cPerfect = 0, cGreat = 0, cGood = 0, cOk = 0, cMeh = 0, cMiss = 0;
  for (const r of results) {
    if (r.subResult === "body") {
      if (r.judgement === 0)
        combo = 0;
      else
        continue;
    } else {
      const j = r.judgement;
      if (r.comboBreak || j === 0) {
        combo = 0;
      } else {
        combo += 1;
        comboPortion += comboBase(j) * comboScale(combo);
      }
      accSum += j;
      accCount += 1;
      if (j === 305)
        cPerfect++;
      else if (j === 300)
        cGreat++;
      else if (j === 200)
        cGood++;
      else if (j === 100)
        cOk++;
      else if (j === 50)
        cMeh++;
      else
        cMiss++;
    }
    if (combo > maxCombo)
      maxCombo = combo;
    const comboProgress = maxComboPortion > 0 ? comboPortion / maxComboPortion : 1;
    const accProgress = maxAccCount > 0 ? accCount / maxAccCount : 1;
    const displayAcc = accCount > 0 ? accSum / (305 * accCount) : 1;
    const inner = 15e4 * comboProgress + 85e4 * Math.pow(displayAcc, 2 + 2 * displayAcc) * accProgress;
    const score = Math.round(Math.round(inner) * modMult);
    const hasNonGreat = cGood + cOk + cMeh + cMiss > 0;
    const grade = manGrade(displayAcc, hasNonGreat, modDiff.mods);
    frames.push({ time: r.time, score, combo, maxCombo, grade });
  }
  return frames;
}
function computeManiaScoreTimeline(results, objects, modDiff) {
  return modDiff.isLazer ? computeManiaScoreV2Timeline(results, objects, modDiff) : computeManiaScoreV1Timeline(results, objects, modDiff);
}

// src/rulesets/catch/converter.ts
var BASE_SCORING_DISTANCE = 100;
var CATCH_WIDTH = 512;
var TAIL_LENIENCY = -36;
var MAX_LENGTH = 1e5;
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function calculateScaleFromCircleSize(cs) {
  return Math.fround((1 - 0.7 * (cs - 5) / 5) / 2);
}
var CATCHER_BASE_SIZE = 106.75;
var ALLOWED_CATCH_RANGE = 0.8;
function calculateCatchWidth(cs) {
  const scaleX = Math.abs(calculateScaleFromCircleSize(cs) * 2);
  return Math.fround(CATCHER_BASE_SIZE * scaleX * ALLOWED_CATCH_RANGE);
}
function getTimingAt3(beatmap, time) {
  const firstUninherited = beatmap.timingPoints.find((tp) => !tp.inherited);
  let baseBeatLength = firstUninherited ? firstUninherited.beatLength : 500;
  let svMultiplier = 1;
  for (const tp of beatmap.timingPoints) {
    if (tp.time > time)
      break;
    if (!tp.inherited) {
      baseBeatLength = tp.beatLength;
      svMultiplier = 1;
    } else {
      svMultiplier = Math.max(0.1, Math.min(10, -100 / tp.beatLength));
    }
  }
  return { baseBeatLength, svMultiplier };
}
function precisionAdjustedBeatLength(baseBeatLength, svMultiplier) {
  const sliderVelocityAsBeatLength = -100 / svMultiplier;
  const bpmMultiplier = sliderVelocityAsBeatLength < 0 ? clamp(Math.fround(-sliderVelocityAsBeatLength), 10, 1e3) / 100 : 1;
  return baseBeatLength * bpmMultiplier;
}
function pathRelativeXAt(slider, progress2) {
  const pts = sampleSlider(slider);
  if (pts.length === 0)
    return 0;
  const headX = slider.x;
  if (pts.length === 1)
    return pts[0].x - headX;
  const p = clamp(progress2, 0, 1);
  const idx = p * (pts.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, pts.length - 1);
  const frac = idx - lo;
  const x = pts[lo].x + (pts[hi].x - pts[lo].x) * frac;
  return x - headX;
}
function generateSliderEvents(startTime, spanDuration, velocity, tickDistance, totalDistance, spanCount) {
  const events = [];
  const length = Math.min(MAX_LENGTH, totalDistance);
  const td2 = clamp(tickDistance, 0, length);
  const minDistanceFromEnd = velocity * 10;
  events.push({ type: "head", time: startTime, pathProgress: 0 });
  for (let span = 0; span < spanCount; span++) {
    const spanStartTime = startTime + span * spanDuration;
    const reversed = span % 2 === 1;
    const ticks = [];
    if (td2 !== 0) {
      for (let d = td2; d <= length; d += td2) {
        if (d >= length - minDistanceFromEnd)
          break;
        const pathProgress = d / length;
        const timeProgress = reversed ? 1 - pathProgress : pathProgress;
        ticks.push({ type: "tick", time: spanStartTime + timeProgress * spanDuration, pathProgress });
      }
    }
    if (reversed)
      ticks.reverse();
    for (const t of ticks)
      events.push(t);
    if (span < spanCount - 1) {
      events.push({ type: "repeat", time: spanStartTime + spanDuration, pathProgress: (span + 1) % 2 });
    }
  }
  const totalDuration = spanCount * spanDuration;
  const finalSpanStartTime = startTime + (spanCount - 1) * spanDuration;
  const legacyLastTickTime = Math.max(startTime + totalDuration / 2, finalSpanStartTime + spanDuration + TAIL_LENIENCY);
  let legacyLastTickProgress = (legacyLastTickTime - finalSpanStartTime) / spanDuration;
  if (spanCount % 2 === 0)
    legacyLastTickProgress = 1 - legacyLastTickProgress;
  events.push({ type: "legacyLastTick", time: legacyLastTickTime, pathProgress: legacyLastTickProgress });
  events.push({ type: "tail", time: startTime + totalDuration, pathProgress: spanCount % 2 });
  return events;
}
function makeNested(type, startTime, originalX, scale, sourceIndex, indexInBeatmap, hitSound) {
  const ox = Math.fround(originalX);
  return {
    type,
    startTime,
    originalX: ox,
    xOffset: 0,
    effectiveX: Math.fround(clamp(ox, 0, CATCH_WIDTH)),
    scale,
    sourceIndex,
    indexInBeatmap,
    hitSound,
    hyperDash: false,
    distanceToHyperDash: 0
  };
}
function convertCircle2(circle, sourceIndex, indexInBeatmap, scale) {
  return makeNested("fruit", circle.time, circle.x, scale, sourceIndex, indexInBeatmap, circle.hitSound);
}
function convertSlider2(beatmap, slider, sourceIndex, indexInBeatmap, scale) {
  const { baseBeatLength, svMultiplier } = getTimingAt3(beatmap, slider.time);
  const adjustedBeatLength = precisionAdjustedBeatLength(baseBeatLength, svMultiplier);
  const velocity = BASE_SCORING_DISTANCE * beatmap.sliderMultiplier / adjustedBeatLength;
  const scoringDistance = velocity * baseBeatLength;
  const tickDistanceMultiplier = beatmap.formatVersion < 8 ? 1 / svMultiplier : 1;
  const tickDistance = scoringDistance / beatmap.sliderTickRate * tickDistanceMultiplier;
  const spanCount = slider.slides;
  const pathDistance = slider.length;
  const spanDuration = pathDistance / velocity;
  const events = generateSliderEvents(slider.time, spanDuration, velocity, tickDistance, pathDistance, spanCount);
  const jsEffectiveX = Math.fround(clamp(slider.x, 0, CATCH_WIDTH));
  const out = [];
  let lastEvent = null;
  for (const e of events) {
    if (lastEvent !== null) {
      const sinceLastTick = Math.trunc(e.time) - Math.trunc(lastEvent.time);
      if (sinceLastTick > 80) {
        let timeBetweenTiny = sinceLastTick;
        while (timeBetweenTiny > 100)
          timeBetweenTiny /= 2;
        for (let t = timeBetweenTiny; t < sinceLastTick; t += timeBetweenTiny) {
          const progress2 = lastEvent.pathProgress + t / sinceLastTick * (e.pathProgress - lastEvent.pathProgress);
          out.push(makeNested("tinyDroplet", t + lastEvent.time, jsEffectiveX + pathRelativeXAt(slider, progress2), scale, sourceIndex, indexInBeatmap, slider.hitSound));
        }
      }
    }
    lastEvent = e;
    if (e.type === "tick") {
      out.push(makeNested("droplet", e.time, jsEffectiveX + pathRelativeXAt(slider, e.pathProgress), scale, sourceIndex, indexInBeatmap, slider.hitSound));
    } else if (e.type === "head" || e.type === "tail" || e.type === "repeat") {
      out.push(makeNested("fruit", e.time, jsEffectiveX + pathRelativeXAt(slider, e.pathProgress), scale, sourceIndex, indexInBeatmap, slider.hitSound));
    }
  }
  return out;
}
function convertSpinner2(spinner, sourceIndex, indexInBeatmap, scale) {
  const startTimeI = Math.trunc(spinner.time);
  const endTimeI = Math.trunc(spinner.endTime);
  let spacing = Math.fround(spinner.endTime - spinner.time);
  while (spacing > 100)
    spacing = Math.fround(spacing / 2);
  if (spacing <= 0)
    return [];
  const out = [];
  let count = 0;
  for (let time = startTimeI; time <= endTimeI; time = Math.fround(time + spacing)) {
    out.push({
      type: "banana",
      startTime: time,
      originalX: 0,
      xOffset: 0,
      effectiveX: 0,
      scale,
      sourceIndex,
      indexInBeatmap,
      hitSound: spinner.hitSound,
      bananaIndex: count,
      hyperDash: false,
      distanceToHyperDash: 0
    });
    count++;
  }
  return out;
}
function convertBeatmapToCatch(beatmap, modDiff) {
  const scale = calculateScaleFromCircleSize(modDiff.cs);
  const out = [];
  let indexInBeatmap = 0;
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    if (!obj)
      continue;
    if (obj.type === "circle") {
      out.push(convertCircle2(obj, i, indexInBeatmap, scale));
      indexInBeatmap++;
    } else if (obj.type === "slider") {
      for (const o of convertSlider2(beatmap, obj, i, indexInBeatmap, scale))
        out.push(o);
      indexInBeatmap++;
    } else if (obj.type === "spinner") {
      for (const o of convertSpinner2(obj, i, indexInBeatmap, scale))
        out.push(o);
      indexInBeatmap++;
    }
  }
  return out;
}

// src/rulesets/catch/random.ts
var _LegacyRandom = class _LegacyRandom {
  constructor(seed = 1337) {
    // uint32
    this.y = 842502087 >>> 0;
    this.z = 3579807591 >>> 0;
    this.w = 273326509 >>> 0;
    this.bitBuffer = 0;
    // uint32
    this.bitIndex = 32;
    this.x = seed >>> 0;
  }
  /** Core xorshift128 step: NextUInt(), range [0, 2^32). */
  nextUInt() {
    const t = (this.x ^ this.x << 11) >>> 0;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ this.w >>> 19 ^ (t ^ t >>> 8)) >>> 0;
    return this.w;
  }
  /** Next() => (int)(int_mask & NextUInt()), range [0, 2^31). */
  next() {
    return (_LegacyRandom.INT_MASK & this.nextUInt()) >>> 0;
  }
  /** NextDouble() => int_to_real * Next(), range [0, 1). */
  nextDouble() {
    return _LegacyRandom.INT_TO_REAL * this.next();
  }
  /** Next(int lo, int hi) => (int)(lo + NextDouble() * (hi - lo)). */
  nextIntRange(lo, hi) {
    return Math.trunc(lo + this.nextDouble() * (hi - lo));
  }
  /** Next(double lo, double hi) — identical formula; distinct overload at the C# call sites. */
  nextDoubleRange(lo, hi) {
    return Math.trunc(lo + this.nextDouble() * (hi - lo));
  }
  /** NextBool(): one bit per call from a 32-bit buffer refilled via nextUInt(). */
  nextBool() {
    if (this.bitIndex === 32) {
      this.bitBuffer = this.nextUInt();
      this.bitIndex = 1;
      return (this.bitBuffer & 1) === 1;
    }
    this.bitIndex++;
    this.bitBuffer = this.bitBuffer >>> 1;
    return (this.bitBuffer & 1) === 1;
  }
};
_LegacyRandom.INT_TO_REAL = 1 / 2147483648;
// 1 / (int.MaxValue + 1)
_LegacyRandom.INT_MASK = 2147483647;
var LegacyRandom = _LegacyRandom;

// src/rulesets/catch/positions.ts
var WIDTH = 512;
var RNG_SEED = 1337;
var ALLOWED_CATCH_RANGE2 = 0.8;
var BASE_DASH_SPEED = 1;
function clamp2(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function applyPositionOffsets(objects, beatmap, modDiff) {
  const rng = new LegacyRandom(RNG_SEED);
  const hardRock = modDiff.isHR;
  let lastPosition = null;
  let lastStartTime = 0;
  let i = 0;
  while (i < objects.length) {
    const src = objects[i].sourceIndex;
    let j = i;
    while (j < objects.length && objects[j].sourceIndex === src)
      j++;
    const top = beatmap.hitObjects[src];
    if (top?.type === "circle") {
      const fruit = objects[i];
      fruit.xOffset = 0;
      if (hardRock) {
        const r = applyHardRockOffset(fruit, lastPosition, lastStartTime, rng);
        lastPosition = r.lastPosition;
        lastStartTime = r.lastStartTime;
      }
    } else if (top?.type === "spinner") {
      for (let k = i; k < j; k++) {
        const banana = objects[k];
        banana.xOffset = Math.fround(rng.nextDouble() * WIDTH);
        rng.next();
        rng.next();
        rng.next();
      }
    } else if (top?.type === "slider") {
      const cps = top.curvePoints;
      lastPosition = Math.fround(cps[cps.length - 1].x);
      lastStartTime = top.time;
      for (let k = i; k < j; k++) {
        const nested = objects[k];
        nested.xOffset = 0;
        if (nested.type === "tinyDroplet") {
          nested.xOffset = Math.fround(
            clamp2(rng.nextIntRange(-20, 20), -nested.originalX, WIDTH - nested.originalX)
          );
        } else if (nested.type === "droplet") {
          rng.next();
        }
      }
    }
    i = j;
  }
  for (const obj of objects) {
    obj.effectiveX = Math.fround(clamp2(obj.originalX + obj.xOffset, 0, WIDTH));
  }
  initialiseHyperDash(objects, modDiff.cs);
  if (modDiff.isMirror) {
    for (const obj of objects) {
      obj.effectiveX = Math.fround(WIDTH - obj.effectiveX);
      if (obj.hyperDashTargetX !== void 0) {
        obj.hyperDashTargetX = Math.fround(WIDTH - obj.hyperDashTargetX);
      }
    }
  }
}
function applyHardRockOffset(obj, lastPosition, lastStartTime, rng) {
  let offsetPosition = obj.originalX;
  const startTime = obj.startTime;
  if (lastPosition === null || lastPosition === 0) {
    return { lastPosition: offsetPosition, lastStartTime: startTime };
  }
  const positionDiff = Math.fround(offsetPosition - lastPosition);
  const timeDiff = Math.trunc(startTime - lastStartTime);
  if (timeDiff > 1e3) {
    return { lastPosition: offsetPosition, lastStartTime: startTime };
  }
  if (positionDiff === 0) {
    offsetPosition = applyRandomOffset(offsetPosition, timeDiff / 4, rng);
    obj.xOffset = Math.fround(offsetPosition - obj.originalX);
    return { lastPosition, lastStartTime };
  }
  if (Math.abs(positionDiff) < Math.trunc(timeDiff / 3)) {
    offsetPosition = applyOffset(offsetPosition, positionDiff);
  }
  obj.xOffset = Math.fround(offsetPosition - obj.originalX);
  return { lastPosition: offsetPosition, lastStartTime: startTime };
}
function applyRandomOffset(position, maxOffset, rng) {
  const right = rng.nextBool();
  const rand = Math.min(20, Math.fround(rng.nextDoubleRange(0, Math.max(0, maxOffset))));
  if (right) {
    if (position + rand <= WIDTH)
      position += rand;
    else
      position -= rand;
  } else {
    if (position - rand >= 0)
      position -= rand;
    else
      position += rand;
  }
  return Math.fround(position);
}
function applyOffset(position, amount) {
  if (amount > 0) {
    if (position + amount < WIDTH)
      position += amount;
  } else {
    if (position + amount > 0)
      position += amount;
  }
  return Math.fround(position);
}
function initialiseHyperDash(objects, cs) {
  const palpable = objects.filter((o) => o.type === "fruit" || o.type === "droplet").sort((a, b) => a.startTime - b.startTime);
  let halfCatcherWidth = calculateCatchWidth(cs) / 2;
  halfCatcherWidth /= ALLOWED_CATCH_RANGE2;
  let lastDirection = 0;
  let lastExcess = halfCatcherWidth;
  for (let i = 0; i < palpable.length - 1; i++) {
    const cur = palpable[i];
    const nxt = palpable[i + 1];
    cur.hyperDash = false;
    cur.hyperDashTargetX = void 0;
    cur.distanceToHyperDash = 0;
    const thisDirection = nxt.effectiveX > cur.effectiveX ? 1 : -1;
    const timeToNext = Math.trunc(nxt.startTime) - Math.trunc(cur.startTime) - 1e3 / 60 / 4;
    const distanceToNext = Math.abs(nxt.effectiveX - cur.effectiveX) - (lastDirection === thisDirection ? lastExcess : halfCatcherWidth);
    const distanceToHyper = Math.fround(timeToNext * BASE_DASH_SPEED - distanceToNext);
    if (distanceToHyper < 0) {
      cur.hyperDash = true;
      cur.hyperDashTargetX = nxt.effectiveX;
      lastExcess = halfCatcherWidth;
    } else {
      cur.distanceToHyperDash = distanceToHyper;
      lastExcess = clamp2(distanceToHyper, 0, halfCatcherWidth);
    }
    lastDirection = thisDirection;
  }
}

// src/rulesets/catch/input.ts
var WIDTH2 = 512;
var CENTER_X = 256;
var DASH_STATE = 1;
function catchFrames(replay) {
  const path = [];
  let cumTime = 0;
  for (let i = 0; i < replay.frames.length; i++) {
    const f = replay.frames[i];
    cumTime += f.timeDelta;
    if (i < 2 && f.x === CENTER_X && f.y === -500)
      continue;
    path.push({ time: cumTime, x: f.x, dash: f.keys === DASH_STATE });
  }
  return path;
}
function clampX(x) {
  return x < 0 ? 0 : x > WIDTH2 ? WIDTH2 : x;
}
function sampleCatcherX(path, time) {
  const n = path.length;
  if (n === 0)
    return CENTER_X;
  if (time <= path[0].time)
    return clampX(path[0].x);
  const last = path[n - 1];
  if (time >= last.time)
    return clampX(last.x);
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = lo + hi >> 1;
    if (path[mid].time <= time)
      lo = mid;
    else
      hi = mid;
  }
  const a = path[lo];
  const b = path[lo + 1];
  const dt = b.time - a.time;
  const frac = dt <= 0 ? 0 : (time - a.time) / dt;
  return clampX(a.x + (b.x - a.x) * frac);
}

// src/rulesets/catch/hitJudge.ts
function caughtAtTime(path, time, effX, half) {
  const cx = Math.fround(sampleCatcherX(path, time));
  return effX >= Math.fround(cx - half) && effX <= Math.fround(cx + half);
}
function computeCatchHitResults(objects, catcherPath, cs) {
  const half = Math.fround(calculateCatchWidth(cs) * 0.5);
  const ordered = [...objects].sort((a, b) => a.startTime - b.startTime);
  const results = [];
  for (const obj of ordered) {
    const caught = caughtAtTime(catcherPath, obj.startTime, obj.effectiveX, half);
    const base = {
      objectIndex: obj.sourceIndex,
      time: obj.startTime,
      x: obj.effectiveX,
      y: 0,
      hitSound: obj.hitSound,
      catchType: obj.type
    };
    switch (obj.type) {
      case "fruit":
        results.push({ ...base, judgement: caught ? 300 : 0, comboBreak: !caught });
        break;
      case "droplet":
        results.push({ ...base, judgement: caught ? 100 : 0, comboBreak: !caught });
        break;
      case "tinyDroplet":
        results.push({ ...base, judgement: caught ? 50 : 0, comboBreak: false, comboIgnore: true });
        break;
      case "banana":
        results.push({ ...base, judgement: caught ? 300 : 0, comboBreak: false, comboIgnore: true });
        break;
    }
  }
  return results;
}
function logCatchMissReport(objects, catcherPath, cs) {
  const half = Math.fround(calculateCatchWidth(cs) * 0.5);
  const W = 150;
  const r1 = (x) => Math.round(x * 10) / 10;
  const rows = [];
  const trajectories = [];
  for (const obj of objects) {
    if (obj.type !== "fruit" && obj.type !== "droplet")
      continue;
    const catcherX0 = Math.fround(sampleCatcherX(catcherPath, obj.startTime));
    const lo = Math.fround(catcherX0 - half);
    const hi = Math.fround(catcherX0 + half);
    if (obj.effectiveX >= lo && obj.effectiveX <= hi)
      continue;
    let minDist = Infinity, bestDt = 0;
    let enterMs = null, exitMs = null;
    for (let dt = -W; dt <= W; dt++) {
      const d = Math.abs(obj.effectiveX - sampleCatcherX(catcherPath, obj.startTime + dt));
      if (d < minDist) {
        minDist = d;
        bestDt = dt;
      }
      const inside = d <= half;
      if (inside && enterMs === null)
        enterMs = dt;
      if (inside)
        exitMs = dt;
    }
    rows.push({
      time: Math.round(obj.startTime),
      type: obj.type,
      effX: r1(obj.effectiveX),
      catcherX0: r1(catcherX0),
      overBy: r1(Math.abs(obj.effectiveX - catcherX0) - half),
      bestAtMs: bestDt,
      minOver: r1(minDist - half),
      enterMs,
      exitMs,
      hyper: obj.hyperDash
    });
    const cols = { effX: r1(obj.effectiveX) };
    for (const dt of [-120, -90, -60, -30, -15, 0, 15, 30])
      cols[`${dt}ms`] = r1(sampleCatcherX(catcherPath, obj.startTime + dt));
    trajectories.push({ time: Math.round(obj.startTime), cols });
  }
  if (rows.length === 0)
    return;
  rows.sort((a, b) => a.overBy - b.overBy);
  console.groupCollapsed(`[catch misses] ${rows.length} fruit/droplet missed \u2014 enter/exitMs = window (ms vs StartTime) the catcher was INSIDE the plate`);
  console.table(rows.slice(0, 50));
  console.log("catcher X trajectory around each miss (cols = ms offset from StartTime):");
  for (const t of trajectories.slice(0, 20))
    console.log(`  t=${t.time}`, t.cols);
  console.groupEnd();
}

// src/rulesets/catch/scoreProcessor.ts
function computeCatchAccTimeline(results) {
  const sorted = [...results].sort((a, b) => a.time - b.time);
  const frames = [];
  let caught = 0;
  let judged = 0;
  for (const r of sorted) {
    if (r.catchType === "banana")
      continue;
    judged++;
    if (r.judgement > 0)
      caught++;
    frames.push({ time: r.time, acc: judged > 0 ? caught / judged : 1 });
  }
  return frames;
}
function catchGrade(accuracy, mods) {
  let g;
  if (accuracy >= 1)
    g = "SS";
  else if (accuracy >= 0.98)
    g = "S";
  else if (accuracy >= 0.94)
    g = "A";
  else if (accuracy >= 0.9)
    g = "B";
  else if (accuracy >= 0.85)
    g = "C";
  else
    g = "D";
  const silver = (mods & (1 << 3 | 1 << 10)) !== 0;
  if (silver) {
    if (g === "S")
      return "SH";
    if (g === "SS")
      return "SSH";
  }
  return g;
}
function catchV1ModMultiplier(mods) {
  let m = 1;
  if (mods & 1 << 0)
    m *= 0.5;
  if (mods & 1 << 1)
    m *= 0.5;
  if (mods & 1 << 8)
    m *= 0.3;
  if (mods & 1 << 3)
    m *= 1.06;
  if (mods & 1 << 4)
    m *= 1.12;
  if (mods & 1 << 6)
    m *= 1.06;
  if (mods & 1 << 10)
    m *= 1.12;
  if (mods & 1 << 7)
    m *= 0;
  return m;
}
function computeCatchScoreV1Timeline(beatmap, results, modDiff) {
  const modMult = catchV1ModMultiplier(modDiff.mods);
  const diffMult = computeDifficultyMultiplier(beatmap);
  const sorted = [...results].sort((a, b) => a.time - b.time);
  let accuracyScore = 0;
  let comboScore = 0;
  let bonusScore = 0;
  let combo = 0, maxCombo = 0;
  let caught = 0, judged = 0;
  const frames = [];
  for (const r of sorted) {
    const hit = r.judgement > 0;
    if (r.catchType === "banana") {
      if (hit)
        bonusScore += 1100;
    } else {
      judged++;
      if (hit)
        caught++;
      if (r.catchType === "tinyDroplet") {
        if (hit)
          accuracyScore += 10;
      } else if (hit) {
        combo++;
        if (combo > maxCombo)
          maxCombo = combo;
        if (r.catchType === "fruit") {
          accuracyScore += 300;
          comboScore += Math.trunc(Math.max(0, combo - 1) * 12 * diffMult);
        } else {
          accuracyScore += 100;
        }
      } else {
        combo = 0;
      }
    }
    const acc = judged > 0 ? caught / judged : 1;
    const score = accuracyScore + bonusScore + Math.round(comboScore * modMult);
    frames.push({ time: r.time, score, combo, maxCombo, grade: catchGrade(acc, modDiff.mods) });
  }
  return frames;
}
var COMBO_BASE2 = 4;
var LOG4_200 = Math.log(200) / Math.log(COMBO_BASE2);
function comboFactor(combo) {
  if (combo <= 0)
    return 0.5;
  const l = Math.log(combo) / Math.log(COMBO_BASE2);
  return Math.min(LOG4_200, Math.max(0.5, l));
}
function hasDefaultConfig2(mod) {
  return mod.settings === void 0 || Object.keys(mod.settings).length === 0;
}
function rateAdjustMultiplier(speed) {
  const truncated = Math.trunc(speed * 10) / 10;
  const offset = truncated - 1;
  return speed >= 1 ? 1 + offset / 5 : 0.6 + offset;
}
function catchV2ModMultiplier(lazerMods) {
  let m = 1;
  for (const mod of lazerMods) {
    switch (mod.acronym) {
      case "NF":
        m *= 0.5;
        break;
      case "EZ":
        m *= 0.5;
        break;
      case "HR":
        m *= hasDefaultConfig2(mod) ? 1.12 : 1;
        break;
      case "HD":
        m *= hasDefaultConfig2(mod) ? 1.06 : 1;
        break;
      case "FL":
        m *= hasDefaultConfig2(mod) ? 1.12 : 1;
        break;
      case "CL":
        m *= 0.96;
        break;
      case "RX":
        m *= 0.1;
        break;
      case "DT":
      case "NC": {
        const sc = mod.settings?.["speed_change"];
        m *= rateAdjustMultiplier(typeof sc === "number" ? sc : 1.5);
        break;
      }
      case "HT":
      case "DC": {
        const sc = mod.settings?.["speed_change"];
        m *= rateAdjustMultiplier(typeof sc === "number" ? sc : 0.75);
        break;
      }
    }
  }
  return m;
}
function computeCatchScoreV2Timeline(objects, results, replay, modDiff) {
  const modMult = catchV2ModMultiplier(replay.scoreInfo?.mods ?? []);
  let nFruit = 0, nTiny = 0;
  for (const o of objects) {
    if (o.type === "fruit")
      nFruit++;
    else if (o.type === "tinyDroplet")
      nTiny++;
  }
  const fruitTinyScale = nTiny + nFruit > 0 ? nTiny / (nTiny + nFruit) : 0;
  const comboPortionWeight = 1e6 - 4e5 * fruitTinyScale;
  const dropletsPortionWeight = 4e5 * fruitTinyScale;
  let maxComboPortion = 0;
  let simCombo = 0;
  for (const o of [...objects].sort((a, b) => a.startTime - b.startTime)) {
    if (o.type === "fruit") {
      simCombo++;
      maxComboPortion += 300 * comboFactor(simCombo);
    } else if (o.type === "droplet") {
      simCombo++;
      maxComboPortion += 100 * comboFactor(simCombo);
    }
  }
  const sorted = [...results].sort((a, b) => a.time - b.time);
  let comboPortion = 0;
  let combo = 0, maxCombo = 0;
  let nTinyCaught = 0, nBananaCaught = 0;
  let caught = 0, judged = 0;
  const frames = [];
  for (const r of sorted) {
    const hit = r.judgement > 0;
    if (r.catchType === "banana") {
      if (hit)
        nBananaCaught++;
    } else {
      judged++;
      if (hit)
        caught++;
      if (r.catchType === "tinyDroplet") {
        if (hit)
          nTinyCaught++;
      } else if (hit) {
        combo++;
        if (combo > maxCombo)
          maxCombo = combo;
        comboPortion += (r.catchType === "fruit" ? 300 : 100) * comboFactor(combo);
      } else {
        combo = 0;
      }
    }
    const comboProgress = maxComboPortion > 0 ? comboPortion / maxComboPortion : 0;
    const dropletsHit = nTiny > 0 ? nTinyCaught / nTiny : 0;
    const bonusPortion = 200 * nBananaCaught;
    const inner = comboPortionWeight * comboProgress + dropletsPortionWeight * dropletsHit + bonusPortion;
    const score = Math.round(Math.round(inner) * modMult);
    const acc = judged > 0 ? caught / judged : 1;
    frames.push({ time: r.time, score, combo, maxCombo, grade: catchGrade(acc, modDiff.mods) });
  }
  return frames;
}
function computeCatchScoreTimeline(objects, results, beatmap, replay, modDiff) {
  return modDiff.isLazer ? computeCatchScoreV2Timeline(objects, results, replay, modDiff) : computeCatchScoreV1Timeline(beatmap, results, modDiff);
}
function logCatchScoreCheck(results, scoreFrames, accFrames, replay, modDiff) {
  const tally = {
    fruit: { caught: 0, total: 0 },
    droplet: { caught: 0, total: 0 },
    tinyDroplet: { caught: 0, total: 0 },
    banana: { caught: 0, total: 0 }
  };
  for (const r of results) {
    if (r.catchType === void 0)
      continue;
    tally[r.catchType].total++;
    if (r.judgement > 0)
      tally[r.catchType].caught++;
  }
  const lastScore = scoreFrames[scoreFrames.length - 1];
  const lastAcc = accFrames[accFrames.length - 1];
  const ourScore = lastScore?.score ?? 0;
  const ourMaxCombo = lastScore?.maxCombo ?? 0;
  const ourGrade = lastScore?.grade ?? "D";
  const ourAcc = lastAcc?.acc ?? 1;
  const hdrScore = replay.score;
  const hdrMaxCombo = replay.maxCombo;
  const scorePct = hdrScore > 0 ? (ourScore - hdrScore) / hdrScore * 100 : 0;
  const hdrCaught = replay.count300 + replay.count100 + replay.count50;
  const hdrTotal = hdrCaught + replay.countMiss + replay.countKatu + replay.countGeki;
  const hdrAcc = hdrTotal > 0 ? hdrCaught / hdrTotal : 1;
  console.groupCollapsed(
    `[catch score] ours ${ourScore.toLocaleString()} vs .osr ${hdrScore.toLocaleString()} (${scorePct >= 0 ? "+" : ""}${scorePct.toFixed(2)}%)  ${modDiff.isLazer ? "V2/lazer" : "V1/stable"}`
  );
  console.table({
    score: { ours: ourScore, osr: hdrScore, delta: ourScore - hdrScore },
    maxCombo: { ours: ourMaxCombo, osr: hdrMaxCombo, delta: ourMaxCombo - hdrMaxCombo },
    "accuracy %": { ours: +(ourAcc * 100).toFixed(2), osr: +(hdrAcc * 100).toFixed(2), delta: +((ourAcc - hdrAcc) * 100).toFixed(2) }
  });
  console.table(tally);
  console.log(
    `grade ours=${ourGrade}   .osr counts: 300=${replay.count300} 100=${replay.count100} 50=${replay.count50} katu=${replay.countKatu} geki=${replay.countGeki} miss=${replay.countMiss}`
  );
  console.groupEnd();
}

// src/analyze.ts
function analyzeReplay(beatmap, replay) {
  const mode = replay.mode;
  if (mode !== 0 && mode !== 1 && mode !== 2 && mode !== 3) {
    throw new Error(`Unsupported replay mode ${mode}.`);
  }
  const compatible = mode === 0 ? beatmap.mode === 0 : mode === 3 ? beatmap.mode === 3 : beatmap.mode === mode || beatmap.mode === 0;
  if (!compatible) {
    const modeName = ["osu!std", "taiko", "catch", "mania"];
    throw new Error(`Cannot analyze a ${modeName[mode]} replay against a mode-${beatmap.mode} beatmap.`);
  }
  const modDiff = computeModDifficulty(beatmap, replay);
  if (mode === 0) {
    applyStacking(beatmap, modDiff);
    const { results: results2 } = computeHitResults(beatmap, replay, modDiff);
    return {
      mode,
      modDiff,
      hitResults: results2,
      scoreFrames: computeScoreTimeline(results2, beatmap, modDiff),
      accFrames: computeAccTimeline(results2),
      comboFrames: computeComboTimeline(results2),
      urTimeline: computeURTimeline(results2, beatmap, modDiff)
    };
  }
  if (mode === 1) {
    const objects2 = convertBeatmapToTaiko(beatmap);
    const inputEvents2 = taikoFrames(replay);
    const session2 = { beatmap, replay, objects: objects2, inputEvents: inputEvents2 };
    const { results: results2 } = computeTaikoHitResults(session2, modDiff);
    const scored = { ...session2, hitResults: results2 };
    return {
      mode,
      modDiff,
      hitResults: results2,
      scoreFrames: modDiff.isLazer ? computeTaikoScoreV2Timeline(scored, modDiff) : computeTaikoScoreV1Timeline(scored, modDiff),
      accFrames: computeTaikoAccTimeline(results2),
      comboFrames: computeComboTimeline(results2),
      urTimeline: computeTaikoURTimeline(objects2, results2, modDiff)
    };
  }
  if (mode === 2) {
    const objects2 = convertBeatmapToCatch(beatmap, modDiff);
    applyPositionOffsets(objects2, beatmap, modDiff);
    const catcherPath = catchFrames(replay);
    const results2 = computeCatchHitResults(objects2, catcherPath, modDiff.cs);
    return {
      mode,
      modDiff,
      hitResults: results2,
      scoreFrames: computeCatchScoreTimeline(objects2, results2, beatmap, replay, modDiff),
      accFrames: computeCatchAccTimeline(results2),
      comboFrames: computeComboTimeline(results2),
      urTimeline: { hits: [], zones: [] }
    };
  }
  const { totalColumns, objects } = convertBeatmapToMania(beatmap, modDiff);
  const inputEvents = maniaFrames(replay, totalColumns);
  const session = { beatmap, replay, objects, inputEvents, totalColumns };
  const { results } = computeManiaHitResults(session, modDiff);
  return {
    mode,
    modDiff,
    hitResults: results,
    scoreFrames: computeManiaScoreTimeline(results, objects, modDiff),
    accFrames: computeManiaAccTimeline(results, modDiff),
    comboFrames: computeManiaComboTimeline(results, objects, modDiff),
    urTimeline: computeManiaURTimeline(objects, results, modDiff)
  };
}

// src/utils/autoReplay.ts
function synthesizeAutoReplay(beatmap, beatmapHash, autoFrames, mods = 0) {
  const sorted = [...autoFrames].sort((a, b) => a.time - b.time);
  const frames = new Array(sorted.length);
  let prevTime = 0;
  for (let i = 0; i < sorted.length; i++) {
    const f = sorted[i];
    frames[i] = { timeDelta: f.time - prevTime, x: f.x, y: f.y, keys: f.keys };
    prevTime = f.time;
  }
  return {
    mode: beatmap.mode,
    gameVersion: 20240101,
    // stable-era (< 30000000) → stable judge/scoring path
    beatmapHash,
    username: "osu!",
    replayHash: "",
    count300: 0,
    count100: 0,
    count50: 0,
    countGeki: 0,
    countKatu: 0,
    countMiss: 0,
    score: 0,
    maxCombo: 0,
    perfect: false,
    mods,
    lifebarGraph: "",
    timestamp: 0n,
    frames,
    replayId: 0n
  };
}

// src/rulesets/std/autoGenerator.ts
var FRAME_STEP = 1e3 / 60;
var REACTION_TIME = 100;
var KEY_UP_DELAY = 50;
var MIN_FRAME_SEP_ALTERNATING = 266;
var SPIN_RADIUS = 50;
var SPIN_RATE = 0.05;
var SPINNER_CENTER_X2 = 256;
var SPINNER_CENTER_Y2 = 192;
var LEFT = 5;
var RIGHT = 10;
function easeOut(t) {
  return t * (2 - t);
}
function easeIn(t) {
  return t * t;
}
function lastFrame(frames) {
  return frames[frames.length - 1];
}
function sliderBallPos2(path, timeMs, startTime, slideDur, slides) {
  const slideF = Math.max(0, Math.min(slides, (timeMs - startTime) / slideDur));
  const slideIdx = Math.min(Math.floor(slideF), slides - 1);
  let frac = slideF - slideIdx;
  if (slideIdx % 2 === 1)
    frac = 1 - frac;
  const idx = frac * (path.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, path.length - 1);
  const f = idx - lo;
  return {
    x: path[lo].x + (path[hi].x - path[lo].x) * f,
    y: path[lo].y + (path[hi].y - path[lo].y) * f
  };
}
function moveToObject(frames, targetX, targetY, startTime, preemptMs, useIn, releaseTime) {
  const lf = lastFrame(frames);
  const { x: startX, y: startY } = lf;
  let holdKeys = lf.keys;
  const waitTime = startTime - Math.max(0, preemptMs - REACTION_TIME);
  let fromTime = lf.time;
  if (waitTime > lf.time) {
    if (holdKeys !== 0 && releaseTime <= waitTime) {
      frames.push({ time: releaseTime, x: startX, y: startY, keys: 0 });
      holdKeys = 0;
    }
    frames.push({ time: waitTime, x: startX, y: startY, keys: holdKeys });
    fromTime = waitTime;
  }
  const dur = startTime - fromTime;
  if (dur <= 0)
    return;
  const ease = useIn ? easeIn : easeOut;
  for (let t = fromTime + FRAME_STEP; t < startTime; t += FRAME_STEP) {
    if (holdKeys !== 0 && t >= releaseTime)
      holdKeys = 0;
    const e = ease((t - fromTime) / dur);
    frames.push({
      time: Math.trunc(t),
      x: startX + (targetX - startX) * e,
      y: startY + (targetY - startY) * e,
      keys: holdKeys
    });
  }
}
function followSlider(frames, beatmap, slider, bits2, radius, fx, fy) {
  const path = sampleSlider(slider);
  const slideDur = slideDurationMs(beatmap, slider);
  const endTime = slider.time + slideDur * slider.slides;
  const shift = slider.stackHeight * radius / 10;
  for (let t = slider.time + FRAME_STEP; t < endTime; t += FRAME_STEP) {
    const p = sliderBallPos2(path, t, slider.time, slideDur, slider.slides);
    frames.push({ time: Math.trunc(t), x: fx(p.x) - shift, y: fy(p.y) - shift, keys: bits2 });
  }
  const pEnd = sliderBallPos2(path, endTime, slider.time, slideDur, slider.slides);
  frames.push({ time: endTime, x: fx(pEnd.x) - shift, y: fy(pEnd.y) - shift, keys: bits2 });
  return endTime + KEY_UP_DELAY;
}
function spinSpinner(frames, spinner, bits2, startAngle) {
  let angle = startAngle;
  let prevT = spinner.time;
  const at = (a) => ({
    x: SPINNER_CENTER_X2 + Math.cos(a) * SPIN_RADIUS,
    y: SPINNER_CENTER_Y2 + Math.sin(a) * SPIN_RADIUS
  });
  for (let t = spinner.time + FRAME_STEP; t < spinner.endTime; t += FRAME_STEP) {
    angle += (t - prevT) * SPIN_RATE;
    prevT = t;
    const p = at(angle);
    frames.push({ time: Math.trunc(t), x: p.x, y: p.y, keys: bits2 });
  }
  angle += (spinner.endTime - prevT) * SPIN_RATE;
  const pEnd = at(angle);
  frames.push({ time: spinner.endTime, x: pEnd.x, y: pEnd.y, keys: bits2 });
  return spinner.endTime + KEY_UP_DELAY + 1;
}
function generateStdAutoReplay(beatmap, modDiff) {
  const objs = beatmap.hitObjects;
  if (objs.length === 0)
    return [];
  const radius = modDiff.circleRadiusPx;
  const fx = modDiff.flipX ? (x) => 512 - x : (x) => x;
  const fy = modDiff.flipY ? (y) => 384 - y : (y) => y;
  const frames = [];
  frames.push({ time: objs[0].time - 1500, x: 256, y: 500, keys: 0 });
  let buttonIndex = 0;
  let prevStartTime = -Infinity;
  let releaseTime = -Infinity;
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i];
    const startTime = obj.time;
    if (i > 0 && startTime - prevStartTime < MIN_FRAME_SEP_ALTERNATING)
      buttonIndex++;
    else
      buttonIndex = 0;
    prevStartTime = startTime;
    let targetX;
    let targetY;
    let spinnerStartAngle = 0;
    const isSpinner = obj.type === "spinner";
    if (isSpinner) {
      const lf2 = lastFrame(frames);
      const dx = lf2.x - SPINNER_CENTER_X2;
      const dy = lf2.y - SPINNER_CENTER_Y2;
      spinnerStartAngle = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx);
      targetX = SPINNER_CENTER_X2 + Math.cos(spinnerStartAngle) * SPIN_RADIUS;
      targetY = SPINNER_CENTER_Y2 + Math.sin(spinnerStartAngle) * SPIN_RADIUS;
    } else {
      const o = obj;
      const shift = o.stackHeight * radius / 10;
      targetX = fx(o.x) - shift;
      targetY = fy(o.y) - shift;
    }
    moveToObject(frames, targetX, targetY, startTime, modDiff.preemptMs, isSpinner, releaseTime);
    let bits2 = buttonIndex % 2 === 0 ? LEFT : RIGHT;
    if ((lastFrame(frames).keys & bits2) !== 0)
      bits2 = bits2 === LEFT ? RIGHT : LEFT;
    frames.push({ time: startTime, x: targetX, y: targetY, keys: bits2 });
    if (obj.type === "circle") {
      releaseTime = startTime + KEY_UP_DELAY;
    } else if (obj.type === "slider") {
      releaseTime = followSlider(frames, beatmap, obj, bits2, radius, fx, fy);
    } else {
      releaseTime = spinSpinner(frames, obj, bits2, spinnerStartAngle);
    }
  }
  const lf = lastFrame(frames);
  frames.push({ time: releaseTime, x: lf.x, y: lf.y, keys: 0 });
  return frames;
}

// src/rulesets/taiko/autoGenerator.ts
var LEFT_CENTRE = 1;
var LEFT_RIM = 2;
var RIGHT_CENTRE = 4;
var RIGHT_RIM = 8;
var KEY_UP_DELAY2 = 50;
var SWELL_HIT_SPEED = 50;
var SWELL_CYCLE = [LEFT_CENTRE, LEFT_RIM, RIGHT_CENTRE, RIGHT_RIM];
function hitBits(hit, hitButton) {
  if (!hit.isRim) {
    return hit.isStrong ? LEFT_CENTRE | RIGHT_CENTRE : hitButton ? LEFT_CENTRE : RIGHT_CENTRE;
  }
  return hit.isStrong ? LEFT_RIM | RIGHT_RIM : hitButton ? LEFT_RIM : RIGHT_RIM;
}
function generateTaikoAutoReplay(beatmap, _modDiff) {
  const objects = convertBeatmapToTaiko(beatmap);
  if (objects.length === 0)
    return [];
  const frames = [];
  const press = (time, keys) => {
    frames.push({ time, x: 0, y: 0, keys });
  };
  let hitButton = true;
  press(objects[0].time - 1e3, 0);
  for (let i = 0; i < objects.length; i++) {
    const h = objects[i];
    const endTime = h.kind === "hit" ? h.time : h.endTime;
    if (h.kind === "hit") {
      press(h.time, hitBits(h, hitButton));
    } else if (h.kind === "drumroll") {
      for (const tickTime of h.tickTimes) {
        if (tickTime > h.endTime)
          continue;
        press(tickTime, hitButton ? LEFT_CENTRE : RIGHT_CENTRE);
        hitButton = !hitButton;
      }
    } else {
      const req = h.requiredHits;
      const hitRate = Math.min(SWELL_HIT_SPEED, (h.endTime - h.time) / req);
      for (let count = 0; count < req; count++) {
        press(h.time + count * hitRate, SWELL_CYCLE[count % 4]);
      }
    }
    const next = objects[i + 1];
    const canDelay = next === void 0 || next.time > endTime + KEY_UP_DELAY2;
    const delay = canDelay ? KEY_UP_DELAY2 : (next.time - endTime) * 0.9;
    press(endTime + delay, 0);
    hitButton = !hitButton;
  }
  return frames;
}

// src/rulesets/mania/autoGenerator.ts
var RELEASE_DELAY = 20;
var endTimeOf2 = (o) => o.kind === "note" ? o.time : o.endTime;
var startTimeOf = (o) => o.kind === "note" ? o.time : o.startTime;
function generateManiaAutoReplay(beatmap, modDiff) {
  const { objects, totalColumns } = convertBeatmapToMania(beatmap, modDiff);
  if (objects.length === 0)
    return [];
  const byColumn = Array.from({ length: totalColumns }, () => []);
  for (const o of objects)
    byColumn[o.column]?.push(o);
  const points = [];
  for (const col of byColumn) {
    for (let i2 = 0; i2 < col.length; i2++) {
      const obj = col[i2];
      const next = col[i2 + 1];
      const endTime = endTimeOf2(obj);
      const canDelayKeyUp = next === void 0 || startTimeOf(next) > endTime + RELEASE_DELAY;
      const delay = canDelayKeyUp ? RELEASE_DELAY : (startTimeOf(next) - endTime) * 0.9;
      points.push({ time: startTimeOf(obj), column: obj.column, press: true });
      points.push({ time: endTime + delay, column: obj.column, press: false });
    }
  }
  points.sort((a, b) => a.time - b.time);
  const frames = [];
  let mask = 0;
  let i = 0;
  while (i < points.length) {
    const t = points[i].time;
    while (i < points.length && points[i].time === t) {
      const p = points[i];
      if (p.press)
        mask |= 1 << p.column;
      else
        mask &= ~(1 << p.column);
      i++;
    }
    frames.push({ time: t, x: mask, y: 0, keys: 0 });
  }
  return frames;
}

// src/rulesets/catch/autoGenerator.ts
var CENTER_X2 = 256;
var BASE_DASH_SPEED2 = 1;
var BASE_WALK_SPEED = 0.5;
function generateCatchAutoReplay(objects, modDiff) {
  if (objects.length === 0)
    return [];
  const frames = [];
  const addFrame = (time, x, dashing = false) => {
    frames.push({ time, x, y: 0, keys: dashing ? 1 : 0 });
  };
  const halfCatcherWidth = Math.fround(calculateCatchWidth(modDiff.cs) * 0.5);
  let lastPosition = CENTER_X2;
  let lastTime = 0;
  for (const h of objects) {
    const effX = h.effectiveX;
    const positionChange = Math.abs(lastPosition - effX);
    const timeAvailable = h.startTime - lastTime;
    if (timeAvailable < 0)
      continue;
    const speedRequired = positionChange === 0 ? 0 : positionChange / timeAvailable;
    const dashRequired = speedRequired > BASE_WALK_SPEED;
    const impossibleJump = speedRequired > BASE_DASH_SPEED2;
    if (lastPosition - halfCatcherWidth < effX && lastPosition + halfCatcherWidth > effX) {
      lastTime = h.startTime;
      addFrame(h.startTime, lastPosition);
      continue;
    }
    if (impossibleJump) {
      addFrame(h.startTime, effX);
    } else if (h.hyperDash) {
      addFrame(h.startTime - timeAvailable, lastPosition);
      addFrame(h.startTime, effX);
    } else if (dashRequired) {
      const timeAtNormalSpeed = positionChange / BASE_WALK_SPEED;
      const timeWeNeedToSave = timeAtNormalSpeed - timeAvailable;
      const timeAtDashSpeed = timeWeNeedToSave / 2;
      const amount = Math.fround(Math.fround(timeAtDashSpeed) / timeAvailable);
      const midPosition = Math.fround(lastPosition + (effX - lastPosition) * amount);
      addFrame(h.startTime - timeAvailable + 1, lastPosition, true);
      addFrame(h.startTime - timeAvailable + timeAtDashSpeed, midPosition);
      addFrame(h.startTime, effX);
    } else {
      const timeBefore = positionChange / BASE_WALK_SPEED;
      addFrame(h.startTime - timeBefore, lastPosition);
      addFrame(h.startTime, effX);
    }
    lastTime = h.startTime;
    lastPosition = effX;
  }
  return frames;
}

// src/player/Player.ts
var Player = class {
  constructor(durationMs) {
    this._currentTimeMs = 0;
    this._playing = false;
    this._lastClockMs = 0;
    this._clockFn = () => performance.now();
    this.durationMs = durationMs;
  }
  /** Replace the time source. `fn` must return monotonically increasing ms; pass null to restore `performance.now()`. */
  setClockFn(fn) {
    this._clockFn = fn ?? (() => performance.now());
  }
  /** Current presentation time in ms, clamped to `[0, durationMs]`. */
  get currentTimeMs() {
    if (!this._playing)
      return this._currentTimeMs;
    const elapsed = this._clockFn() - this._lastClockMs;
    return Math.min(this._currentTimeMs + elapsed, this.durationMs);
  }
  get isPlaying() {
    return this._playing;
  }
  /** Start advancing the clock; restarts from 0 if playback had reached the end. */
  play() {
    if (this._playing)
      return;
    if (this._currentTimeMs >= this.durationMs) {
      this._currentTimeMs = 0;
    }
    this._lastClockMs = this._clockFn();
    this._playing = true;
  }
  pause() {
    if (!this._playing)
      return;
    this._currentTimeMs = this.currentTimeMs;
    this._playing = false;
  }
  /** Jump to `ms` (clamped to `[0, durationMs]`) without changing the play/pause state. */
  seek(ms) {
    const clamped = Math.max(0, Math.min(ms, this.durationMs));
    this._currentTimeMs = clamped;
    if (this._playing) {
      this._lastClockMs = this._clockFn();
    }
  }
};

// src/player/hitsoundSchedule.ts
var AUDIO_EXTS = [".wav", ".mp3", ".ogg"];
var COMBO_BREAK_MIN = 20;
function scheduleComboBreaks(sounds, comboFrames, oldOffsetMs, fromBeatmapMs) {
  let prev = 0;
  for (const f of comboFrames) {
    if (f.combo === 0 && prev > COMBO_BREAK_MIN && f.time >= fromBeatmapMs - 10) {
      sounds.push({ beatmapMs: f.time + oldOffsetMs, type: "combobreak", sampleSet: 0, sampleIndex: 0, customFile: "" });
    }
    prev = f.combo;
  }
}
var SET_NAMES = { 1: "normal", 2: "soft", 3: "drum" };
var STORYBOARD_LATE_START_MS = 100;
var MINIMUM_SAMPLE_VOLUME = 5;
function computeHitsoundSchedule(input) {
  const sounds = [];
  const { mode, beatmap, hitResults, maniaSamples, taikoGhostTaps, oldOffsetMs, fromBeatmapMs, comboFrames } = input;
  if (mode === 1) {
    scheduleTaiko(sounds, beatmap, hitResults, taikoGhostTaps, oldOffsetMs, fromBeatmapMs);
  } else if (mode === 3) {
    scheduleMania(sounds, beatmap, hitResults, maniaSamples, oldOffsetMs, fromBeatmapMs);
  } else if (mode === 2) {
    scheduleCatch(sounds, beatmap, hitResults, oldOffsetMs, fromBeatmapMs);
  } else {
    scheduleStd(sounds, beatmap, hitResults, oldOffsetMs, fromBeatmapMs);
  }
  scheduleComboBreaks(sounds, comboFrames, oldOffsetMs, fromBeatmapMs);
  if (input.storyboardSamples != null)
    scheduleStoryboardSamples(sounds, input.storyboardSamples, fromBeatmapMs);
  sounds.sort((a, b) => a.beatmapMs - b.beatmapMs);
  return sounds;
}
function scheduleStoryboardSamples(sounds, samples, fromBeatmapMs) {
  for (const s of samples) {
    if (s.timeMs < fromBeatmapMs - STORYBOARD_LATE_START_MS)
      continue;
    const volume = Math.max(0, Math.min(100, s.volume)) / 100;
    if (volume === 0)
      continue;
    sounds.push({ beatmapMs: s.timeMs, type: "storyboard", sampleSet: 0, sampleIndex: 0, customFile: s.path, volume });
  }
}
function scheduleStd(sounds, beatmap, hitResults, oldOffsetMs, fromBeatmapMs) {
  for (const result of hitResults) {
    if (result.isSliderSub)
      continue;
    if (result.comboBreak)
      continue;
    if (result.time < fromBeatmapMs - 10)
      continue;
    const beatmapMs = result.time + oldOffsetMs;
    const obj = beatmap.hitObjects[result.objectIndex];
    const tp = activeTimingPoint(beatmap, result.time);
    const bitmask = obj?.type === "slider" ? obj.edgeSounds[0] ?? obj.hitSound : obj?.hitSound ?? result.hitSound;
    const hs = obj?.hitSample ?? { normalSet: 0, additionSet: 0, index: 0, volume: 0, filename: "" };
    const normalSet = hs.normalSet || tp.sampleSet || 1;
    const additionSet = hs.additionSet || normalSet;
    const sampleIndex = hs.index || tp.sampleIndex || 0;
    const customFile = hs.filename;
    const volume = sampleGain(hs.volume, tp.volume);
    sounds.push({ beatmapMs, type: "normal", sampleSet: normalSet, sampleIndex, customFile, volume });
    pushAdditions(sounds, beatmapMs, bitmask, additionSet, sampleIndex, volume);
  }
  for (const obj of beatmap.hitObjects) {
    if (obj.type !== "slider")
      continue;
    const slideDur = slideDurationMs(beatmap, obj);
    for (let n = 1; n <= obj.slides; n++) {
      const edgeBeatmapMs = obj.time + slideDur * n;
      if (edgeBeatmapMs < fromBeatmapMs - 10)
        continue;
      const beatmapMs = edgeBeatmapMs + oldOffsetMs;
      const tp = activeTimingPoint(beatmap, edgeBeatmapMs);
      const bitmask = obj.edgeSounds[n] ?? obj.hitSound;
      const edgeSet = obj.edgeSets[n] ?? { normalSet: 0, additionSet: 0 };
      const normalSet = edgeSet.normalSet || obj.hitSample.normalSet || tp.sampleSet || 1;
      const additionSet = edgeSet.additionSet || obj.hitSample.additionSet || normalSet;
      const sampleIndex = obj.hitSample.index || tp.sampleIndex || 0;
      const customFile = obj.hitSample.filename;
      const volume = sampleGain(obj.hitSample.volume, tp.volume);
      sounds.push({ beatmapMs, type: "normal", sampleSet: normalSet, sampleIndex, customFile, volume });
      pushAdditions(sounds, beatmapMs, bitmask, additionSet, sampleIndex, volume);
    }
  }
  for (const result of hitResults) {
    const bonusTimes = result.spinnerBonusTimes;
    if (bonusTimes === void 0)
      continue;
    for (const t of bonusTimes) {
      if (t < fromBeatmapMs - 10)
        continue;
      const tp = activeTimingPoint(beatmap, t);
      sounds.push({
        beatmapMs: t + oldOffsetMs,
        type: "spinnerbonus",
        sampleSet: 0,
        sampleIndex: 0,
        customFile: "",
        volume: sampleGain(0, tp.volume)
      });
    }
  }
}
function scheduleMania(sounds, beatmap, hitResults, maniaSamples, oldOffsetMs, fromBeatmapMs) {
  for (const result of hitResults) {
    if (result.time < fromBeatmapMs - 10)
      continue;
    if (result.subResult === "body")
      continue;
    if (result.subResult === "tail")
      continue;
    if (result.judgement === 0)
      continue;
    const beatmapMs = result.time + oldOffsetMs;
    const sample = maniaSamples?.get(result.objectIndex);
    const tp = activeTimingPoint(beatmap, result.time);
    const hs = sample ?? { normalSet: 0, additionSet: 0, index: 0, volume: 0, filename: "" };
    const normalSet = hs.normalSet || tp.sampleSet || 1;
    const additionSet = hs.additionSet || normalSet;
    const sampleIndex = hs.index || tp.sampleIndex || 0;
    const customFile = hs.filename;
    const bitmask = result.hitSound;
    const volume = sampleGain(hs.volume, tp.volume);
    const hasAddition = (bitmask & (2 | 4 | 8)) !== 0;
    if (!hasAddition || customFile !== "") {
      sounds.push({ beatmapMs, type: "normal", sampleSet: normalSet, sampleIndex, customFile, volume });
    }
    pushAdditions(sounds, beatmapMs, bitmask, additionSet, sampleIndex, volume);
  }
}
function scheduleCatch(sounds, beatmap, hitResults, oldOffsetMs, fromBeatmapMs) {
  for (const result of hitResults) {
    if (result.time < fromBeatmapMs - 10)
      continue;
    if (result.judgement === 0)
      continue;
    if (result.catchType === "tinyDroplet")
      continue;
    const beatmapMs = result.time + oldOffsetMs;
    const tp = activeTimingPoint(beatmap, result.time);
    if (result.catchType === "banana") {
      const volume2 = sampleGain(0, tp.volume);
      sounds.push({ beatmapMs, type: "normal", sampleSet: 0, sampleIndex: 0, customFile: "catch-banana", volume: volume2 });
      continue;
    }
    const obj = beatmap.hitObjects[result.objectIndex];
    const hs = obj?.hitSample ?? { normalSet: 0, additionSet: 0, index: 0, volume: 0, filename: "" };
    const bitmask = result.hitSound;
    const normalSet = hs.normalSet || tp.sampleSet || 1;
    const additionSet = hs.additionSet || normalSet;
    const sampleIndex = hs.index || tp.sampleIndex || 0;
    const customFile = hs.filename;
    const volume = sampleGain(hs.volume, tp.volume);
    sounds.push({ beatmapMs, type: "normal", sampleSet: normalSet, sampleIndex, customFile, volume });
    pushAdditions(sounds, beatmapMs, bitmask, additionSet, sampleIndex, volume);
  }
}
function scheduleTaiko(sounds, beatmap, hitResults, taikoGhostTaps, oldOffsetMs, fromBeatmapMs) {
  for (const result of hitResults) {
    const obj = beatmap.hitObjects[result.objectIndex];
    const objTime = obj?.time ?? result.time;
    if (result.judgement === 0 && result.time > objTime + 0.5)
      continue;
    if (result.comboIgnore && result.strong === true)
      continue;
    if (result.time < fromBeatmapMs - 10)
      continue;
    const beatmapMs = result.time + oldOffsetMs;
    const tp = activeTimingPoint(beatmap, result.time);
    const hs = obj?.hitSample ?? { normalSet: 0, additionSet: 0, index: 0, volume: 0, filename: "" };
    const normalSet = hs.normalSet || tp.sampleSet || 1;
    const additionSet = hs.additionSet || normalSet;
    const sampleIndex = hs.index || tp.sampleIndex || 0;
    const customFile = hs.filename;
    const volume = sampleGain(hs.volume, tp.volume);
    const isKat = (result.hitSound & (2 | 8)) !== 0;
    if (isKat) {
      sounds.push({ beatmapMs, type: "clap", sampleSet: additionSet, sampleIndex, customFile, volume });
    } else {
      sounds.push({ beatmapMs, type: "normal", sampleSet: normalSet, sampleIndex, customFile, volume });
    }
    if ((result.hitSound & 4) !== 0) {
      sounds.push({ beatmapMs, type: isKat ? "whistle" : "finish", sampleSet: additionSet, sampleIndex, customFile: "", volume });
    }
  }
  if (taikoGhostTaps !== null) {
    for (const ev of taikoGhostTaps) {
      if (ev.time < fromBeatmapMs - 10)
        continue;
      const isRim = ev.action === "LeftRim" || ev.action === "RightRim";
      const tp = activeTimingPoint(beatmap, ev.time);
      sounds.push({
        beatmapMs: ev.time + oldOffsetMs,
        type: isRim ? "clap" : "normal",
        sampleSet: tp.sampleSet || 1,
        sampleIndex: tp.sampleIndex || 0,
        customFile: "",
        volume: sampleGain(0, tp.volume)
      });
    }
  }
}
function pushAdditions(sounds, beatmapMs, bitmask, additionSet, sampleIndex, volume) {
  if (bitmask & 2)
    sounds.push({ beatmapMs, type: "whistle", sampleSet: additionSet, sampleIndex, customFile: "", volume });
  if (bitmask & 4)
    sounds.push({ beatmapMs, type: "finish", sampleSet: additionSet, sampleIndex, customFile: "", volume });
  if (bitmask & 8)
    sounds.push({ beatmapMs, type: "clap", sampleSet: additionSet, sampleIndex, customFile: "", volume });
}
function activeTimingPoint(beatmap, beatmapMs) {
  const tps = beatmap.timingPoints;
  let lo = 0;
  let hi = tps.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (tps[mid].time <= beatmapMs)
      lo = mid + 1;
    else
      hi = mid;
  }
  if (lo === 0)
    return { sampleSet: 1, sampleIndex: 0, volume: 100 };
  const tp = tps[lo - 1];
  return { sampleSet: tp.sampleSet || 1, sampleIndex: tp.sampleIndex, volume: tp.volume };
}
function sampleGain(hitSampleVolume, tpVolume) {
  const effectiveVol = hitSampleVolume > 0 ? hitSampleVolume : tpVolume;
  return Math.max(effectiveVol, MINIMUM_SAMPLE_VOLUME) / 100;
}
function lookupSkinSound(skinSounds, basename) {
  for (const ext of AUDIO_EXTS) {
    const buf = skinSounds.get(`${basename}${ext}`);
    if (buf !== void 0)
      return buf;
  }
  return null;
}
function lookupEffectSound(skinSounds, beatmapSounds, basename) {
  if (beatmapSounds !== null) {
    const buf = lookupSkinSound(beatmapSounds, basename);
    if (buf !== null)
      return buf;
  }
  return lookupSkinSound(skinSounds, basename);
}
function lookupCustomSound(beatmapSounds, filename) {
  const basename = (filename.split(/[\\/]/).pop() ?? filename).toLowerCase();
  const exact = beatmapSounds.get(basename);
  if (exact !== void 0)
    return exact;
  const stem = basename.replace(/\.(wav|mp3|ogg)$/, "");
  if (stem === "")
    return null;
  return lookupSkinSound(beatmapSounds, stem);
}
function lookupStoryboardSample(beatmapSounds, skinSounds, path) {
  const full = path.replace(/\\/g, "/").toLowerCase();
  const exact = beatmapSounds.get(full);
  if (exact !== void 0)
    return exact;
  const stem = full.replace(/\.(wav|mp3|ogg)$/, "");
  if (stem !== "") {
    const byStem = lookupSkinSound(beatmapSounds, stem);
    if (byStem !== null)
      return byStem;
  }
  return lookupCustomSound(beatmapSounds, full) ?? lookupCustomSound(skinSounds, full);
}
function firstSound(sounds, names) {
  for (const name of names) {
    const buf = lookupSkinSound(sounds, name);
    if (buf !== null)
      return buf;
  }
  return null;
}
function resolveSample(type, sampleSet, sampleIndex, customFile, deps) {
  const { mode, skinSounds, beatmapSounds, lazerDefaultSounds, synthCache, ctx } = deps;
  let set = sampleSet;
  let idx = sampleIndex;
  if (customFile !== "") {
    if (beatmapSounds !== null) {
      const buf2 = lookupCustomSound(beatmapSounds, customFile);
      if (buf2 !== null)
        return buf2;
    }
    set = 1;
    idx = 0;
  }
  const setName = SET_NAMES[set] ?? "normal";
  const suffix = idx >= 2 ? String(idx) : "";
  const prefix = mode === 1 ? "taiko-" : "";
  if (beatmapSounds !== null && idx >= 1) {
    const buf2 = firstSound(beatmapSounds, [`${prefix}${setName}-hit${type}${suffix}`, `${prefix}hit${type}`]);
    if (buf2 !== null)
      return buf2;
  }
  const buf = firstSound(skinSounds, [`${prefix}${setName}-hit${type}`, `${prefix}hit${type}`]);
  if (buf !== null)
    return buf;
  if (mode !== 1) {
    const lz = lazerDefaultSounds?.get(`${setName}-hit${type}.wav`);
    if (lz !== void 0)
      return lz;
  }
  return synthBuffer(type, ctx, synthCache);
}
function synthBuffer(type, ctx, synthCache) {
  const cached = synthCache.get(type);
  if (cached !== void 0)
    return cached;
  const sr = ctx.sampleRate;
  let buf;
  switch (type) {
    case "normal":
      buf = synthDecaySine(ctx, sr, 800, 0.08, 40);
      break;
    case "whistle":
      buf = synthDecaySine(ctx, sr, 1480, 0.14, 20);
      break;
    case "finish":
      buf = synthDecaySine(ctx, sr, 440, 0.22, 12);
      break;
    case "clap":
      buf = synthNoise(ctx, sr, 0.09, 35);
      break;
    default:
      buf = synthDecaySine(ctx, sr, 800, 0.08, 40);
      break;
  }
  synthCache.set(type, buf);
  return buf;
}
function synthDecaySine(ctx, sr, freqHz, durationS, decay) {
  const len = Math.floor(sr * durationS);
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  const twoPiF = 2 * Math.PI * freqHz;
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    data[i] = Math.sin(twoPiF * t) * Math.exp(-decay * t) * 0.25;
  }
  return buf;
}
function synthNoise(ctx, sr, durationS, decay) {
  const len = Math.floor(sr * durationS);
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-decay * t) * 0.15;
  }
  return buf;
}

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
function timeStretch(input, tempo, ctx) {
  if (tempo === 1)
    return input;
  const L = input.getChannelData(0);
  const R = input.numberOfChannels > 1 ? input.getChannelData(1) : L;
  const out = timeStretchChannels(L, R, input.sampleRate, tempo);
  const buf = ctx.createBuffer(2, out.L.length, input.sampleRate);
  buf.getChannelData(0).set(out.L);
  buf.getChannelData(1).set(out.R);
  return buf;
}

// src/player/AudioSync.ts
var FLUSH_HORIZON_S = 2;
var FLUSH_INTERVAL_MS = 500;
var SAMPLE_CONCURRENCY = 2;
var AudioSync = class {
  constructor(options) {
    this.synthCache = /* @__PURE__ */ new Map();
    this.activeSong = null;
    this.activeHitsounds = [];
    this._isPlaying = false;
    this._presTimeAtStart = 0;
    this._ctxTimeAtStart = 0;
    this._pausedPresTime = 0;
    // Pre-creating thousands of AudioBufferSourceNodes starves Chromium's audio thread and
    // glitches song start. Queue records and only flush the next ~2s on a periodic timer.
    this._pendingSounds = [];
    this._pendingSoundIdx = 0;
    this._flushTimer = null;
    // Per-sample voice tracker (key = resolved sample identity → active voices sorted
    // by start). Enforces the BASS concurrency cap; rebuilt each schedule.
    this._sampleVoices = null;
    // Bumped on start/stop. playFrom captures it and bails if it changed across the only await
    // (ctx.resume()), so a pause/seek landing mid-resume can't start a song that should be stopped.
    this._playGen = 0;
    this.ctx = options.ctx;
    this.songBuffer = options.songBuffer;
    this._skinOnlySounds = options.skinSounds;
    this._beatmapSounds = options.beatmapSounds;
    this._beatmapHitsounds = options.beatmapHitsounds ?? true;
    this.hitResults = options.hitResults;
    this.beatmap = options.beatmap;
    this.introOffsetMs = options.introOffsetMs;
    this.speed = options.speed ?? 1;
    this.oldOffsetMs = options.beatmap.formatVersion < 5 ? 24 : 0;
    this.mode = options.mode ?? 0;
    this.maniaSamples = options.maniaSamples ?? null;
    this.taikoGhostTaps = options.taikoGhostTaps ?? null;
    this.comboFrames = options.comboFrames ?? [];
    this.lazerDefaultSounds = options.lazerDefaultSounds ?? null;
    this._storyboardSamples = options.storyboardSamples?.length ? options.storyboardSamples : null;
    this._storyboardOn = options.storyboardOn ?? true;
    this.songGain = options.ctx.createGain();
    this.effectsGain = options.ctx.createGain();
    this.songGain.connect(options.ctx.destination);
    this.effectsGain.connect(options.ctx.destination);
    this._isNC = options.isNC ?? false;
    this._userRate = Math.max(0.1, Math.min(2, options.userRate ?? 1));
    this._playBuffer = this.songBuffer;
    this._playRate = this.speed;
    if (this.speed !== 1 && !this._isNC && this.songBuffer !== null) {
      try {
        this._playBuffer = timeStretch(this.songBuffer, this.speed, this.ctx);
        this._playRate = 1;
      } catch (err2) {
        console.warn("[AudioSync] DT/HT time-stretch failed; falling back to pitched playback", err2);
        this._playBuffer = this.songBuffer;
        this._playRate = this.speed;
      }
    }
  }
  setSongVolume(v) {
    this.songGain.gain.value = Math.max(0, Math.min(1, v));
  }
  setEffectsVolume(v) {
    this.effectsGain.gain.value = Math.max(0, Math.min(1, v));
  }
  /** Beatmap sounds the resolver may consult: the archive's files when ON, null when OFF. */
  get _activeBeatmapSounds() {
    return this._beatmapHitsounds ? this._beatmapSounds : null;
  }
  /**
   * Toggle "Beatmap Hitsounds" live. Flips which sound map backs every resolved sample;
   * the PendingSound schedule is identity-only, so nothing about it changes — only the
   * buffer the resolver picks. If playing, reschedule hitsounds from the current position
   * (song clock untouched) so the change is audible on the next hit instead of after the
   * ~2s look-ahead window rolls over.
   */
  setBeatmapHitsounds(on) {
    if (on === this._beatmapHitsounds)
      return;
    this._beatmapHitsounds = on;
    this._rescheduleIfPlaying();
  }
  /**
   * Toggle storyboard samples live — the audio half of `RenderOptions.showStoryboard`; hosts
   * set both. Off drops them from the schedule (and from `getMixdownInputs`); a running sample
   * stops at once, as lazer stops long storyboard samples when playback is disabled.
   */
  setStoryboardSamples(on) {
    if (on === this._storyboardOn)
      return;
    this._storyboardOn = on;
    this._rescheduleIfPlaying();
  }
  /** Storyboard samples the schedule should carry right now (null when off or none). */
  get _activeStoryboardSamples() {
    return this._storyboardOn ? this._storyboardSamples : null;
  }
  // Hitsound-only reschedule from the current position (song clock untouched), so a toggle is
  // audible on the next hit instead of after the ~2s look-ahead window rolls over.
  _rescheduleIfPlaying() {
    if (!this._isPlaying)
      return;
    for (const src of this.activeHitsounds) {
      try {
        src.stop();
      } catch (_) {
      }
      src.disconnect();
    }
    this.activeHitsounds = [];
    if (this._flushTimer !== null) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
    this._scheduleHitsounds(this.currentTimeMs);
  }
  /**
   * Snapshot the audio inputs for an offline mixdown (the offline twin of this live
   * scheduler). Volumes are read from the live gain nodes, so an offline render reflects
   * the current volume settings. Feed the result to the same pure schedule/resolve
   * functions in hitsoundSchedule.ts that live playback uses.
   */
  getMixdownInputs() {
    return {
      songBuffer: this.songBuffer,
      skinSounds: this._skinOnlySounds,
      beatmapSounds: this._activeBeatmapSounds,
      lazerDefaultSounds: this.lazerDefaultSounds,
      beatmap: this.beatmap,
      hitResults: this.hitResults,
      mode: this.mode,
      maniaSamples: this.maniaSamples,
      taikoGhostTaps: this.taikoGhostTaps,
      comboFrames: this.comboFrames,
      storyboardSamples: this._activeStoryboardSamples,
      storyboardSounds: this._beatmapSounds,
      introOffsetMs: this.introOffsetMs,
      oldOffsetMs: this.oldOffsetMs,
      speed: this.speed,
      isNC: this._isNC,
      musicVol: this.songGain.gain.value,
      effectsVol: this.effectsGain.gain.value
    };
  }
  get isPlaying() {
    return this._isPlaying;
  }
  /**
   * Current presentation time (ms). Plain linear clock for every mode: the song is an
   * AudioBufferSourceNode started at `_ctxTimeAtStart` and its buffer advances at a constant
   * rate, so presentation time is an exact linear function of the AudioContext hardware
   * clock — monotonic and smooth by construction, with no slewing or jitter absorption needed.
   */
  get currentTimeMs() {
    if (!this._isPlaying)
      return this._pausedPresTime;
    return this._presTimeAtStart + (this.ctx.currentTime - this._ctxTimeAtStart) * 1e3 * this._userRate;
  }
  /**
   * Set the user playback rate (clamped to 0.1..2). Deliberately does NOT restart the song
   * (no async, no _playGen races — pattern-matches setSongVolume, not seekTo). If playing,
   * re-anchor first so the clock is continuous across the slope change; the still-playing
   * source briefly runs at the old rate while the clock ticks at the new one — callers
   * should immediately follow with a seek-in-place (seekTo to the current position), which
   * restarts everything through the standard gen-guarded path.
   */
  setUserRate(rate) {
    const r = Math.max(0.1, Math.min(2, rate));
    if (r === this._userRate)
      return;
    if (this._isPlaying) {
      const pres = this.currentTimeMs;
      this._presTimeAtStart = pres;
      this._ctxTimeAtStart = this.ctx.currentTime;
    }
    this._userRate = r;
  }
  /** Clock function suitable for `Player.setClockFn`, so the playback loop follows the audio clock. */
  get clockFn() {
    return () => this.currentTimeMs;
  }
  /** Start (or restart) playback from a presentation time (ms). Resumes the AudioContext if suspended. */
  async playFrom(presMs) {
    if (this._isPlaying)
      this._stopAll();
    const myGen = ++this._playGen;
    await this.ctx.resume();
    if (myGen !== this._playGen)
      return;
    this._presTimeAtStart = presMs;
    this._ctxTimeAtStart = this.ctx.currentTime;
    this._isPlaying = true;
    this._startSong(presMs);
    this._scheduleHitsounds(presMs);
  }
  pause() {
    this._playGen++;
    if (this._isPlaying)
      this._pausedPresTime = this.currentTimeMs;
    this._stopAll();
    this._isPlaying = false;
  }
  async seekTo(presMs) {
    const wasPlaying = this._isPlaying;
    if (wasPlaying) {
      this._stopAll();
      this._isPlaying = false;
    }
    this._pausedPresTime = presMs;
    if (wasPlaying)
      await this.playFrom(presMs);
  }
  /** Stop everything and disconnect the gain nodes. Does NOT close the AudioContext — the caller owns it and may share it across sessions. */
  destroy() {
    this._stopAll();
    this.songGain.disconnect();
    this.effectsGain.disconnect();
  }
  _startSong(presMs) {
    if (this._playBuffer === null)
      return;
    const beatmapMs = presMs * this.speed + this.introOffsetMs;
    const source = this.ctx.createBufferSource();
    source.buffer = this._playBuffer;
    source.playbackRate.value = this._playRate * this._userRate;
    source.connect(this.songGain);
    if (beatmapMs < 0) {
      const delayS = -beatmapMs / (1e3 * this.speed * this._userRate);
      source.start(this._ctxTimeAtStart + delayS, 0);
    } else {
      const offsetS = beatmapMs / 1e3 * (this._playRate / this.speed);
      source.start(this._ctxTimeAtStart, Math.min(offsetS, this._playBuffer.duration - 1e-3));
    }
    this.activeSong = source;
  }
  // Build queue only; _flushPendingSounds creates nodes lazily within the horizon. The
  // sorted queue comes from the shared pure builder (computeHitsoundSchedule); this method
  // owns only the live flush/clock wiring. An offline mixdown calls the same builder and
  // schedules into an OfflineAudioContext instead.
  _scheduleHitsounds(fromPresMs) {
    const fromBeatmapMs = fromPresMs * this.speed + this.introOffsetMs;
    this._pendingSounds = computeHitsoundSchedule({
      mode: this.mode,
      beatmap: this.beatmap,
      hitResults: this.hitResults,
      maniaSamples: this.maniaSamples,
      taikoGhostTaps: this.taikoGhostTaps,
      comboFrames: this.comboFrames,
      oldOffsetMs: this.oldOffsetMs,
      fromBeatmapMs,
      storyboardSamples: this._activeStoryboardSamples
    });
    this._pendingSoundIdx = 0;
    this._sampleVoices = null;
    this._flushPendingSounds();
    if (this._pendingSoundIdx < this._pendingSounds.length) {
      this._flushTimer = setInterval(() => this._flushPendingSounds(), FLUSH_INTERVAL_MS);
    }
  }
  _flushPendingSounds() {
    if (!this._isPlaying)
      return;
    const now = this.ctx.currentTime;
    const horizon = now + FLUSH_HORIZON_S;
    const anchorCtxS = this._ctxTimeAtStart;
    const anchorBeatmapMs = this._presTimeAtStart * this.speed + this.introOffsetMs;
    const toRealSec = 1e3 * this.speed * this._userRate;
    while (this._pendingSoundIdx < this._pendingSounds.length) {
      const ev = this._pendingSounds[this._pendingSoundIdx];
      const when = anchorCtxS + (ev.beatmapMs - anchorBeatmapMs) / toRealSec;
      if (when > horizon)
        return;
      this._pendingSoundIdx++;
      const clampedWhen = when < now ? now : when;
      if (ev.type === "combobreak") {
        this._scheduleCombobreak(clampedWhen);
      } else if (ev.type === "spinnerbonus") {
        this._scheduleSpinnerBonus(clampedWhen, ev.volume ?? 1);
      } else if (ev.type === "storyboard") {
        this._scheduleStoryboardSample(ev.customFile, clampedWhen, ev.volume ?? 1);
      } else {
        this._scheduleResolvedSound(ev.type, ev.sampleSet, ev.sampleIndex, ev.customFile, clampedWhen, ev.volume ?? 1);
      }
    }
    if (this._flushTimer !== null) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
  }
  _scheduleCombobreak(when) {
    const buf = lookupEffectSound(this._skinOnlySounds, this._activeBeatmapSounds, "combobreak");
    if (buf === null)
      return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.effectsGain);
    src.start(when);
    this.activeHitsounds.push(src);
  }
  // Spinner bonus sample (one per bonus spin). Silent if the skin ships no spinnerbonus
  // file — same policy as combobreak (no default exists for it), no synth proxy.
  _scheduleSpinnerBonus(when, volume) {
    const buf = lookupEffectSound(this._skinOnlySounds, this._activeBeatmapSounds, "spinnerbonus");
    if (buf === null)
      return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    if (volume !== 1) {
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(this.effectsGain);
    } else {
      src.connect(this.effectsGain);
    }
    src.start(when);
    this.activeHitsounds.push(src);
  }
  // Storyboard sample: silent if the archive and skin lack the file (no synth proxy); never
  // concurrency-capped (each `Sample` line is its own voice in osu!).
  _scheduleStoryboardSample(path, when, volume) {
    const buf = lookupStoryboardSample(this._beatmapSounds, this._skinOnlySounds, path);
    if (buf === null)
      return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    if (volume !== 1) {
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(this.effectsGain);
    } else {
      src.connect(this.effectsGain);
    }
    src.start(when);
    this.activeHitsounds.push(src);
  }
  _scheduleResolvedSound(type, sampleSet, sampleIndex, customFile, when, volume) {
    const buf = resolveSample(type, sampleSet, sampleIndex, customFile, {
      mode: this.mode,
      skinSounds: this._skinOnlySounds,
      beatmapSounds: this._activeBeatmapSounds,
      lazerDefaultSounds: this.lazerDefaultSounds,
      synthCache: this.synthCache,
      ctx: this.ctx
    });
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    if (volume !== 1) {
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(this.effectsGain);
    } else {
      src.connect(this.effectsGain);
    }
    {
      const key = `${type}|${sampleSet}|${sampleIndex}|${customFile}`;
      const voices = this._sampleVoices ?? (this._sampleVoices = /* @__PURE__ */ new Map());
      let list = voices.get(key);
      if (list === void 0) {
        list = [];
        voices.set(key, list);
      }
      for (let i = list.length - 1; i >= 0; i--)
        if (list[i].endWhen <= when)
          list.splice(i, 1);
      if (list.length >= SAMPLE_CONCURRENCY) {
        let minIdx = 0;
        for (let i = 1; i < list.length; i++)
          if (list[i].when < list[minIdx].when)
            minIdx = i;
        const victim = list[minIdx];
        try {
          victim.src.stop(when);
        } catch (_) {
        }
        list.splice(minIdx, 1);
      }
      list.push({ when, endWhen: when + buf.duration, src });
    }
    src.start(when);
    this.activeHitsounds.push(src);
  }
  _stopAll() {
    if (this.activeSong !== null) {
      try {
        this.activeSong.stop();
      } catch (_) {
      }
      this.activeSong.disconnect();
      this.activeSong = null;
    }
    for (const src of this.activeHitsounds) {
      try {
        src.stop();
      } catch (_) {
      }
      src.disconnect();
    }
    this.activeHitsounds = [];
    if (this._flushTimer !== null) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
    this._pendingSounds = [];
    this._pendingSoundIdx = 0;
    this._sampleVoices = null;
  }
};

// src/player/TimeMapper.ts
var TimeMapper = class {
  constructor(frames, introOffsetMs = 0, outroOffsetMs = 0, speed = 1) {
    let cumTime = 0;
    for (const frame of frames) {
      if (frame.timeDelta >= 0)
        cumTime += frame.timeDelta;
    }
    this.mapDurationMs = cumTime;
    this.speed = speed;
    const maxTrim = Math.max(0, cumTime - 1e3);
    this.introOffsetMs = Math.min(introOffsetMs, maxTrim);
    this.outroOffsetMs = Math.max(0, Math.min(outroOffsetMs, maxTrim - this.introOffsetMs));
    this.presentationDurationMs = Math.max(
      1e3,
      (cumTime - this.introOffsetMs - this.outroOffsetMs) / speed
    );
  }
  /**
   * Convert presentation (real) time → beatmap time.
   * With speed mods, beatmap time advances faster than real time.
   */
  toMapTime(presentationMs) {
    return presentationMs * this.speed + this.introOffsetMs;
  }
};

// src/renderer/playfield.ts
var PLAYFIELD_W = 512;
var PLAYFIELD_H = 384;
var CANVAS_W3 = 1280;
var CANVAS_H3 = 720;
var SCALE2 = CANVAS_H3 * 0.8 / PLAYFIELD_H;
var OFFSET_X = (CANVAS_W3 - PLAYFIELD_W * SCALE2) / 2;
var OFFSET_Y = (CANVAS_H3 - PLAYFIELD_H * SCALE2) / 2 + 8 * SCALE2;

// src/renderer/HitObjectRenderer.ts
var SPINNER_CENTER_X3 = 256;
var SPINNER_CENTER_Y3 = 192;
function toCanvas(x, y) {
  return [OFFSET_X + x * SCALE2, OFFSET_Y + y * SCALE2];
}
var _circleRatioCache = /* @__PURE__ */ new WeakMap();
function hitCircleRatio(bitmap) {
  const cached = _circleRatioCache.get(bitmap);
  if (cached !== void 0)
    return cached;
  const size = 64;
  const osc = new OffscreenCanvas(size, size);
  const oc = osc.getContext("2d");
  oc.drawImage(bitmap, 0, 0, size, size);
  const { data } = oc.getImageData(0, 0, size, size);
  const half = size / 2;
  let maxR = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] > 64) {
        const dx = x + 0.5 - half;
        const dy = y + 0.5 - half;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r > maxR)
          maxR = r;
      }
    }
  }
  const ratio = Math.min(1, Math.max(0.5, maxR / half));
  _circleRatioCache.set(bitmap, ratio);
  return ratio;
}
var _isBlankCache = /* @__PURE__ */ new WeakMap();
function isBlankImage(bitmap) {
  const cached = _isBlankCache.get(bitmap);
  if (cached !== void 0)
    return cached;
  let blank;
  if (bitmap.width <= 1 || bitmap.height <= 1) {
    blank = true;
  } else {
    const size = 32;
    const osc = new OffscreenCanvas(size, size);
    const oc = osc.getContext("2d");
    oc.drawImage(bitmap, 0, 0, size, size);
    const { data } = oc.getImageData(0, 0, size, size);
    blank = true;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 64) {
        blank = false;
        break;
      }
    }
  }
  _isBlankCache.set(bitmap, blank);
  return blank;
}
function warmSkinCaches(skin) {
  const digitPrefix = `${skin.config.hitCirclePrefix.toLowerCase()}-`;
  for (const [key, bitmap] of skin.images) {
    const k = key.toLowerCase();
    if (k.startsWith("hitcircle") || k.startsWith("sliderstartcircle") || k.startsWith("pippidon")) {
      isBlankImage(bitmap);
    } else if (k.startsWith(digitPrefix)) {
      hitCircleRatio(bitmap);
      isBlankImage(bitmap);
    }
  }
}
function skinImg2(images, stem) {
  return images.get(`${stem}@2x.png`) ?? images.get(`${stem}.png`);
}
function skinImgScaled(images, stem) {
  const hd = images.get(`${stem}@2x.png`);
  if (hd !== void 0)
    return { bmp: hd, scale: 2 };
  const sd = images.get(`${stem}.png`);
  if (sd !== void 0)
    return { bmp: sd, scale: 1 };
  return void 0;
}
var OBJECT_DIAMETER_PX = 128;
function canonicalDiameter(img, radius) {
  return img.bmp.width / img.scale / OBJECT_DIAMETER_PX * (2 * radius);
}
var _tintCache2 = /* @__PURE__ */ new WeakMap();
function tintBitmap2(bitmap, color) {
  let colorMap = _tintCache2.get(bitmap);
  if (colorMap === void 0) {
    colorMap = /* @__PURE__ */ new Map();
    _tintCache2.set(bitmap, colorMap);
  }
  const cached = colorMap.get(color);
  if (cached !== void 0)
    return cached;
  const { width: w, height: h } = bitmap;
  const osc = new OffscreenCanvas(w, h);
  const oc = osc.getContext("2d");
  oc.drawImage(bitmap, 0, 0);
  oc.globalCompositeOperation = "multiply";
  oc.fillStyle = color;
  oc.fillRect(0, 0, w, h);
  oc.globalCompositeOperation = "destination-in";
  oc.drawImage(bitmap, 0, 0);
  colorMap.set(color, osc);
  return osc;
}
var _sliderPathsFlipped = /* @__PURE__ */ new WeakMap();
function getSliderPathForMod(slider, flipX, flipY) {
  if (!flipX && !flipY)
    return sampleSlider(slider);
  const cached = _sliderPathsFlipped.get(slider);
  if (cached !== void 0 && cached.flipX === flipX && cached.flipY === flipY)
    return cached.path;
  const path = sampleSlider(slider).map((p) => ({
    x: flipX ? 512 - p.x : p.x,
    y: flipY ? 384 - p.y : p.y
  }));
  _sliderPathsFlipped.set(slider, { flipX, flipY, path });
  return path;
}
var EXPLOSION_SCALE_DUR = 240;
var EXPLOSION_FADE_DUR = 240;
var EXPLOSION_TOTAL_DUR = EXPLOSION_FADE_DUR;
var DEFAULT_COMBO_COLORS = [
  "#e879a0",
  "#68b3f0",
  "#f7e04a",
  "#90e070",
  "#f08040"
];
function buildComboIndices(beatmap) {
  const indices = new Array(beatmap.hitObjects.length);
  let colorIndex = -1;
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    const isNewCombo = obj.type !== "spinner" && (i === 0 || obj.newCombo);
    const skip = obj.type !== "spinner" ? obj.comboSkip : 0;
    if (isNewCombo)
      colorIndex += 1 + skip;
    indices[i] = Math.max(0, colorIndex);
  }
  return indices;
}
function buildComboNumbers(beatmap) {
  const numbers = new Array(beatmap.hitObjects.length);
  let current = 0;
  for (let i = 0; i < beatmap.hitObjects.length; i++) {
    const obj = beatmap.hitObjects[i];
    if (obj.type === "spinner") {
      numbers[i] = 0;
      continue;
    }
    if (i === 0 || obj.newCombo) {
      current = 1;
    } else {
      current++;
    }
    numbers[i] = current;
  }
  return numbers;
}
var _comboCache = /* @__PURE__ */ new WeakMap();
function getComboData(beatmap) {
  let cached = _comboCache.get(beatmap);
  if (cached === void 0) {
    cached = {
      indices: buildComboIndices(beatmap),
      numbers: buildComboNumbers(beatmap)
    };
    _comboCache.set(beatmap, cached);
  }
  return cached;
}
var _maxObjectLifetimeCache = /* @__PURE__ */ new WeakMap();
function getMaxObjectLifetime(beatmap) {
  const cached = _maxObjectLifetimeCache.get(beatmap);
  if (cached !== void 0)
    return cached;
  let max2 = 500;
  for (const obj of beatmap.hitObjects) {
    let life = 500;
    if (obj.type === "slider") {
      life = slideDurationMs(beatmap, obj) * obj.slides + 500;
    } else if (obj.type === "spinner") {
      life = obj.endTime - obj.time + 500;
    }
    if (life > max2)
      max2 = life;
  }
  _maxObjectLifetimeCache.set(beatmap, max2);
  return max2;
}
var _hitCirclesCache = /* @__PURE__ */ new WeakMap();
function getHitCirclesSet(hitResults) {
  let cached = _hitCirclesCache.get(hitResults);
  if (cached === void 0) {
    cached = /* @__PURE__ */ new Set();
    for (const r of hitResults) {
      if (!r.isSliderSub && r.judgement > 0)
        cached.add(r.objectIndex);
    }
    _hitCirclesCache.set(hitResults, cached);
  }
  return cached;
}
function findVisibleRange(beatmap, timeMs, preempt, maxLifetime) {
  const objects = beatmap.hitObjects;
  const n = objects.length;
  if (n === 0)
    return { firstIdx: 0, lastIdx: -1 };
  const minTime = timeMs - maxLifetime;
  const maxTime = timeMs + preempt;
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (objects[mid].time < minTime)
      lo = mid + 1;
    else
      hi = mid;
  }
  const firstIdx = lo;
  if (firstIdx >= n || objects[firstIdx].time > maxTime) {
    return { firstIdx, lastIdx: firstIdx - 1 };
  }
  lo = firstIdx;
  hi = n - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >>> 1;
    if (objects[mid].time <= maxTime)
      lo = mid;
    else
      hi = mid - 1;
  }
  return { firstIdx, lastIdx: lo };
}
function hdCircleAlpha(timeMs, appearTime, preempt) {
  const fadeInEnd = appearTime + preempt * 0.4;
  const fadeOutEnd = appearTime + preempt * 0.7;
  if (timeMs < fadeInEnd)
    return (timeMs - appearTime) / (preempt * 0.4);
  if (timeMs < fadeOutEnd)
    return 1 - (timeMs - fadeInEnd) / (preempt * 0.3);
  return 0;
}
function hdSliderBodyAlpha(timeMs, appearTime, preempt, activeEnd) {
  const fadeInEnd = appearTime + preempt * 0.4;
  if (timeMs < appearTime)
    return 0;
  if (timeMs < fadeInEnd)
    return (timeMs - appearTime) / (preempt * 0.4);
  if (timeMs >= activeEnd)
    return 0;
  const p = Math.min(1, (timeMs - fadeInEnd) / (activeEnd - fadeInEnd));
  return 1 - p * (2 - p);
}
var _visible = [];
var _order = [];
function drawHitObjects(ctx, beatmap, skin, timeMs, hitResults = [], spinnerAngles = /* @__PURE__ */ new Map(), modDiff, qualityTotal = 1) {
  const preempt = modDiff.preemptMs;
  const fadeIn = modDiff.fadeInMs;
  const radius = modDiff.circleRadiusPx * SCALE2;
  const fx = modDiff.flipX ? (x) => 512 - x : (x) => x;
  const fy = modDiff.flipY ? (y) => 384 - y : (y) => y;
  const isHD = modDiff.isHD;
  let firstObjIdx = 0;
  if (isHD) {
    for (let j = 0; j < beatmap.hitObjects.length; j++) {
      if (beatmap.hitObjects[j].type !== "spinner") {
        firstObjIdx = j;
        break;
      }
    }
  }
  const { beatLength: curBeatLen, tpTime: curTpTime } = getActiveTiming(beatmap.timingPoints, timeMs);
  const comboColors = skin.config.comboColors.length > 0 ? skin.config.comboColors : DEFAULT_COMBO_COLORS;
  const { indices: comboIndices, numbers: comboNumbers } = getComboData(beatmap);
  const _instafadeHc = skinImg2(skin.images, "hitcircle");
  const circleInstafade = _instafadeHc !== void 0 && isBlankImage(_instafadeHc);
  const _instafadeSc = skinImg2(skin.images, "sliderstartcircle");
  const sliderHeadInstafade = _instafadeSc !== void 0 ? isBlankImage(_instafadeSc) : circleInstafade;
  const hitCircles = getHitCirclesSet(hitResults);
  const SLIDER_FADE = 240;
  const CIRCLE_FADE = 200;
  const w100 = modDiff.hitWindow100;
  const w50 = modDiff.hitWindow50;
  const visible = _visible;
  visible.length = 0;
  const { firstIdx, lastIdx } = findVisibleRange(
    beatmap,
    timeMs,
    preempt,
    getMaxObjectLifetime(beatmap)
  );
  for (let i = firstIdx; i <= lastIdx; i++) {
    const obj = beatmap.hitObjects[i];
    const color = comboColors[comboIndices[i] % comboColors.length];
    const hitTime = obj.time;
    const appearTime = hitTime - preempt;
    if (timeMs < appearTime)
      continue;
    const slideDur = obj.type === "slider" ? slideDurationMs(beatmap, obj) : 0;
    const wasHit = (obj.type === "circle" || obj.type === "slider") && hitCircles.has(i);
    let disappearTime;
    if (isHD && obj.type === "circle") {
      disappearTime = appearTime + preempt * 0.7;
    } else if (obj.type === "slider") {
      disappearTime = hitTime + slideDur * obj.slides + SLIDER_FADE;
    } else if (obj.type === "spinner") {
      disappearTime = obj.endTime + CIRCLE_FADE;
    } else if (wasHit) {
      disappearTime = hitTime + EXPLOSION_TOTAL_DUR;
    } else {
      disappearTime = hitTime + w50;
    }
    if (timeMs > disappearTime)
      continue;
    let alpha;
    if (isHD && obj.type === "circle") {
      alpha = hdCircleAlpha(timeMs, appearTime, preempt);
    } else if (isHD && obj.type === "slider") {
      if (timeMs <= hitTime + slideDur * obj.slides) {
        alpha = 1;
      } else {
        alpha = 1 - (timeMs - (hitTime + slideDur * obj.slides)) / SLIDER_FADE;
      }
    } else if (timeMs < hitTime) {
      const elapsed = timeMs - appearTime;
      alpha = Math.min(1, elapsed / Math.min(fadeIn, preempt));
    } else if (obj.type === "slider" && timeMs <= hitTime + slideDur * obj.slides) {
      alpha = 1;
    } else if (obj.type === "spinner" && timeMs <= obj.endTime) {
      alpha = 1;
    } else if (wasHit && obj.type === "circle") {
      alpha = 1;
    } else {
      if (obj.type === "circle") {
        if (timeMs < hitTime + w100) {
          alpha = 1;
        } else {
          const fadeSpan = Math.max(1, w50 - w100);
          alpha = 1 - (timeMs - hitTime - w100) / fadeSpan;
        }
      } else {
        const activeEndMs = obj.type === "slider" ? hitTime + slideDur * obj.slides : obj.endTime;
        const fadeDur = obj.type === "slider" ? SLIDER_FADE : CIRCLE_FADE;
        alpha = 1 - (timeMs - activeEndMs) / fadeDur;
      }
    }
    const bodyDepth = obj.type === "slider" ? hitTime + slideDur * obj.slides + 10 : 0;
    const frontDepth = obj.type === "spinner" ? Number.POSITIVE_INFINITY : hitTime;
    visible.push({
      index: i,
      color,
      alpha: Math.max(0, Math.min(1, alpha)),
      slideDur,
      comboNumber: comboNumbers[i],
      wasHit,
      bodyDepth,
      frontDepth
    });
  }
  const order = _order;
  order.length = 0;
  for (let v = 0; v < visible.length; v++) {
    order.push(v << 1);
    if (beatmap.hitObjects[visible[v].index].type === "slider")
      order.push(v << 1 | 1);
  }
  order.sort((a, b) => {
    const da = a & 1 ? visible[a >> 1].bodyDepth : visible[a >> 1].frontDepth;
    const db = b & 1 ? visible[b >> 1].bodyDepth : visible[b >> 1].frontDepth;
    if (da !== db)
      return db - da;
    return (b & 1) - (a & 1);
  });
  for (const e of order) {
    const { index, color, alpha, slideDur, comboNumber, wasHit } = visible[e >> 1];
    const obj = beatmap.hitObjects[index];
    if ((e & 1) === 1) {
      if (obj.type !== "slider")
        continue;
      ctx.save();
      ctx.globalAlpha = alpha;
      const stackH2 = obj.stackHeight ?? 0;
      if (stackH2 !== 0)
        ctx.translate(-stackH2 * radius / 10, -stackH2 * radius / 10);
      if (isHD) {
        ctx.globalAlpha = Math.max(0, hdSliderBodyAlpha(timeMs, obj.time - preempt, preempt, obj.time + slideDur * obj.slides));
      }
      const path = getSliderPathForMod(obj, modDiff.flipX, modDiff.flipY);
      const trackColor = skin.config.sliderTrackOverride ?? color;
      drawSliderBody(ctx, obj, path, radius, skin.config.sliderBorder, trackColor, modDiff.flipX, modDiff.flipY, qualityTotal);
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    const stackH = obj.type !== "spinner" ? obj.stackHeight ?? 0 : 0;
    if (stackH !== 0) {
      ctx.translate(-stackH * radius / 10, -stackH * radius / 10);
    }
    if (obj.type === "circle") {
      const [cx, cy] = toCanvas(fx(obj.x), fy(obj.y));
      if (isHD) {
        if (alpha > 0) {
          drawCircle(ctx, cx, cy, radius, color, skin.images);
          drawComboNumber(ctx, cx, cy, radius, comboNumber, skin, circleInstafade);
        }
      } else if (wasHit && timeMs >= obj.time) {
        const dt = timeMs - obj.time;
        const explosionAlpha2 = Math.max(0, 1 - dt / EXPLOSION_FADE_DUR);
        ctx.globalAlpha = explosionAlpha2;
        drawCircleHitExplosion(ctx, cx, cy, radius, color, skin.images, dt);
      } else {
        drawCircle(ctx, cx, cy, radius, color, skin.images);
        if (timeMs < obj.time) {
          drawComboNumber(ctx, cx, cy, radius, comboNumber, skin, circleInstafade);
        }
      }
    } else if (obj.type === "slider") {
      const path = getSliderPathForMod(obj, modDiff.flipX, modDiff.flipY);
      const [hx, hy] = toCanvas(fx(obj.x), fy(obj.y));
      const activeStart = obj.time;
      const activeEnd = obj.time + slideDur * obj.slides;
      if (obj.slides > 1 && path.length >= 2) {
        ctx.save();
        if (isHD) {
          ctx.globalAlpha = Math.max(0, hdSliderBodyAlpha(timeMs, activeStart - preempt, preempt, activeEnd));
        }
        const lookback = Math.min(4, path.length - 2);
        const tail = path[path.length - 1];
        const tailRef = path[path.length - 1 - lookback];
        const [tx, ty] = toCanvas(tail.x, tail.y);
        if (shouldShowTailArrow(obj.slides, timeMs, activeStart, slideDur)) {
          const angle = Math.atan2(tailRef.y - tail.y, tailRef.x - tail.x);
          drawRepeatArrow(ctx, tx, ty, angle, radius, color, skin.images, timeMs, curTpTime, curBeatLen);
        }
        if (timeMs >= activeStart && shouldShowHeadArrow(obj.slides, timeMs, activeStart, slideDur)) {
          const headRef = path[lookback];
          const head = path[0];
          const [hax, hay] = toCanvas(head.x, head.y);
          const angle = Math.atan2(headRef.y - head.y, headRef.x - head.x);
          drawRepeatArrow(ctx, hax, hay, angle, radius, color, skin.images, timeMs, curTpTime, curBeatLen);
        }
        ctx.restore();
      }
      if (timeMs < obj.time) {
        if (isHD) {
          const headAlpha = hdCircleAlpha(timeMs, obj.time - preempt, preempt);
          if (headAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = headAlpha;
            drawSliderHeadCircle(ctx, hx, hy, radius, color, skin.images);
            drawComboNumber(ctx, hx, hy, radius, comboNumber, skin, sliderHeadInstafade);
            ctx.restore();
          }
        } else {
          drawSliderHeadCircle(ctx, hx, hy, radius, color, skin.images);
          drawComboNumber(ctx, hx, hy, radius, comboNumber, skin, sliderHeadInstafade);
        }
      }
      if (!isHD && wasHit && timeMs >= obj.time && timeMs < obj.time + EXPLOSION_TOTAL_DUR) {
        const dt = timeMs - obj.time;
        const explosionAlpha2 = Math.max(0, 1 - dt / EXPLOSION_FADE_DUR);
        ctx.save();
        ctx.globalAlpha = explosionAlpha2;
        drawCircleHitExplosion(ctx, hx, hy, radius, color, skin.images, dt, true);
        ctx.restore();
      }
      if (timeMs >= activeStart && timeMs < activeEnd) {
        const slideProgress = (timeMs - activeStart) / slideDur;
        const slideIndex = Math.min(obj.slides - 1, Math.floor(slideProgress));
        let t = slideProgress - Math.floor(slideProgress);
        if (slideIndex % 2 === 1)
          t = 1 - t;
        t = Math.max(0, Math.min(1, t));
        const ballPos = pointAtFraction3(path, t);
        const [bx, by] = toCanvas(ballPos.x, ballPos.y);
        drawSliderBall(ctx, bx, by, radius, color, skin.images, skin.config.allowSliderBallTint);
      }
    } else if (obj.type === "spinner") {
      const angleData = spinnerAngles.get(index);
      const { cumAngle, absAngle } = angleData ? getSpinnerStateAt(angleData, timeMs) : { cumAngle: 0, absAngle: 0 };
      const duration = obj.endTime - obj.time;
      const progress2 = spinnerProgress(modDiff.od, duration, absAngle, modDiff.isLazer);
      drawSpinner(ctx, skin.spinnerImages, timeMs, obj, cumAngle, progress2, progress2 >= 1, skin, angleData?.bonusTimes ?? []);
    }
    ctx.restore();
  }
  for (const e of order) {
    if ((e & 1) === 1)
      continue;
    const { index, color, alpha } = visible[e >> 1];
    const obj = beatmap.hitObjects[index];
    if (obj.type === "spinner" || timeMs >= obj.time)
      continue;
    if (isHD && index !== firstObjIdx)
      continue;
    const acAlpha = isHD && obj.type === "slider" ? hdCircleAlpha(timeMs, obj.time - preempt, preempt) : alpha;
    if (acAlpha <= 0)
      continue;
    ctx.save();
    ctx.globalAlpha = acAlpha;
    const stackH = obj.stackHeight ?? 0;
    if (stackH !== 0)
      ctx.translate(-stackH * radius / 10, -stackH * radius / 10);
    const [cx, cy] = toCanvas(fx(obj.x), fy(obj.y));
    const t = (obj.time - timeMs) / preempt;
    drawApproachCircle(ctx, cx, cy, radius * (1 + 2 * t), color, skin.images);
    ctx.restore();
  }
}
function drawCircle(ctx, cx, cy, radius, color, images) {
  const hitcircle = skinImgScaled(images, "hitcircle");
  const overlay = skinImgScaled(images, "hitcircleoverlay");
  if (hitcircle) {
    if (isBlankImage(hitcircle.bmp))
      return;
    const d = canonicalDiameter(hitcircle, radius);
    ctx.drawImage(tintBitmap2(hitcircle.bmp, color), cx - d / 2, cy - d / 2, d, d);
    if (overlay && !isBlankImage(overlay.bmp)) {
      const od = canonicalDiameter(overlay, radius);
      ctx.drawImage(overlay.bmp, cx - od / 2, cy - od / 2, od, od);
    }
    return;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.25);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba("#ffffff", 0.6);
  ctx.fill();
}
function drawSliderHeadCircle(ctx, cx, cy, radius, color, images) {
  const startCircle = skinImgScaled(images, "sliderstartcircle");
  const startOverlay = skinImgScaled(images, "sliderstartcircleoverlay");
  const hitcircle = skinImgScaled(images, "hitcircle");
  const hitOverlay = skinImgScaled(images, "hitcircleoverlay");
  const base = startCircle ?? hitcircle;
  const overlay = startCircle ? startOverlay : hitOverlay;
  if (base) {
    if (isBlankImage(base.bmp))
      return;
    const d = canonicalDiameter(base, radius);
    ctx.drawImage(tintBitmap2(base.bmp, color), cx - d / 2, cy - d / 2, d, d);
    if (overlay && !isBlankImage(overlay.bmp)) {
      const od = canonicalDiameter(overlay, radius);
      ctx.drawImage(overlay.bmp, cx - od / 2, cy - od / 2, od, od);
    }
    return;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.25);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba("#ffffff", 0.6);
  ctx.fill();
}
function drawCircleHitExplosion(ctx, cx, cy, radius, color, images, dt, isSliderHead = false) {
  const st = Math.min(1, dt / EXPLOSION_SCALE_DUR);
  const scale = 1 + 0.4 * st * (2 - st);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  if (isSliderHead) {
    drawSliderHeadCircle(ctx, cx, cy, radius, color, images);
  } else {
    drawCircle(ctx, cx, cy, radius, color, images);
  }
  ctx.restore();
}
function drawApproachCircle(ctx, cx, cy, radius, color, images) {
  const approach = skinImgScaled(images, "approachcircle");
  if (approach) {
    const d = canonicalDiameter(approach, radius);
    ctx.drawImage(tintBitmap2(approach.bmp, color), cx - d / 2, cy - d / 2, d, d);
    return;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
var _sliderBodyCache = /* @__PURE__ */ new WeakMap();
var SLIDER_SHADOW_PORTION = 5 / 64;
var SLIDER_BORDER_PORTION = 0.1875;
function hexToRgb(hex) {
  const h = hex.charCodeAt(0) === 35 ? hex.slice(1) : hex;
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0
  ];
}
function buildSliderBody(path, radius, borderColor, trackColor, quality) {
  if (path.length < 2)
    return null;
  const n = path.length;
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const [cx, cy] = toCanvas(path[i].x, path[i].y);
    xs[i] = cx;
    ys[i] = cy;
    if (cx < minX)
      minX = cx;
    if (cy < minY)
      minY = cy;
    if (cx > maxX)
      maxX = cx;
    if (cy > maxY)
      maxY = cy;
  }
  const pad = radius + 2;
  const ox = Math.floor(minX - pad);
  const oy = Math.floor(minY - pad);
  const w = Math.ceil(maxX + pad) - ox;
  const h = Math.ceil(maxY + pad) - oy;
  if (w <= 0 || h <= 0)
    return null;
  const osc = new OffscreenCanvas(Math.ceil(w * quality), Math.ceil(h * quality));
  const oc = osc.getContext("2d");
  oc.scale(quality, quality);
  const strokePts = () => {
    oc.beginPath();
    oc.moveTo(xs[0] - ox, ys[0] - oy);
    for (let i = 1; i < n; i++)
      oc.lineTo(xs[i] - ox, ys[i] - oy);
    oc.lineCap = "round";
    oc.lineJoin = "round";
  };
  const [tr, tg, tb] = hexToRgb(trackColor);
  const or = tr / 1.1, og = tg / 1.1, ob = tb / 1.1;
  const ir = Math.min(255, tr * 1.125 + 63.75);
  const ig = Math.min(255, tg * 1.125 + 63.75);
  const ib = Math.min(255, tb * 1.125 + 63.75);
  const colourAt = (p) => {
    if (p <= SLIDER_SHADOW_PORTION)
      return `rgba(0,0,0,${0.25 * (p / SLIDER_SHADOW_PORTION)})`;
    if (p <= SLIDER_BORDER_PORTION)
      return borderColor;
    const t = (p - SLIDER_BORDER_PORTION) / (1 - SLIDER_BORDER_PORTION);
    const r = Math.round(or + t * (ir - or));
    const g = Math.round(og + t * (ig - og));
    const b = Math.round(ob + t * (ib - ob));
    return `rgba(${r},${g},${b},0.7)`;
  };
  const steps = Math.max(24, Math.min(64, Math.ceil(radius * quality / 2)));
  for (let s = steps - 1; s >= 0; s--) {
    const lw = 2 * radius * (s + 1) / steps;
    oc.globalCompositeOperation = "destination-out";
    strokePts();
    oc.lineWidth = lw;
    oc.strokeStyle = "#000";
    oc.stroke();
    oc.globalCompositeOperation = "source-over";
    strokePts();
    oc.lineWidth = lw;
    oc.strokeStyle = colourAt(1 - (s + 0.5) / steps);
    oc.stroke();
  }
  return { bmp: osc, ox, oy, w, h };
}
function drawSliderBody(ctx, slider, path, radius, borderColor, trackColor, flipX, flipY, quality) {
  let cached = _sliderBodyCache.get(slider);
  if (cached === void 0 || cached.radius !== radius || cached.borderColor !== borderColor || cached.trackColor !== trackColor || cached.flipX !== flipX || cached.flipY !== flipY || cached.quality !== quality) {
    const built = buildSliderBody(path, radius, borderColor, trackColor, quality);
    if (built === null)
      return;
    cached = { ...built, radius, borderColor, trackColor, flipX, flipY, quality };
    _sliderBodyCache.set(slider, cached);
  }
  ctx.drawImage(cached.bmp, cached.ox, cached.oy, cached.w, cached.h);
}
function pointAtFraction3(path, t) {
  if (path.length === 0)
    return { x: 0, y: 0 };
  if (t <= 0 || path.length === 1)
    return { ...path[0] };
  if (t >= 1)
    return { ...path[path.length - 1] };
  const idx = t * (path.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, path.length - 1);
  const frac = idx - lo;
  return {
    x: path[lo].x + (path[hi].x - path[lo].x) * frac,
    y: path[lo].y + (path[hi].y - path[lo].y) * frac
  };
}
function shouldShowTailArrow(slides, timeMs, sliderStart, slideDur) {
  for (let k = 0; k < slides - 1; k++) {
    if (k % 2 !== 0)
      continue;
    if (timeMs < sliderStart + slideDur * (k + 1))
      return true;
  }
  return false;
}
function shouldShowHeadArrow(slides, timeMs, sliderStart, slideDur) {
  for (let k = 1; k < slides - 1; k++) {
    if (k % 2 !== 1)
      continue;
    if (timeMs < sliderStart + slideDur * (k + 1))
      return true;
  }
  return false;
}
function drawSliderBall(ctx, cx, cy, radius, color, images, allowTint) {
  const follow = skinImgScaled(images, "sliderfollowcircle");
  if (follow) {
    if (follow.bmp.width > 1) {
      const fd2 = canonicalDiameter(follow, radius);
      ctx.drawImage(follow.bmp, cx - fd2 / 2, cy - fd2 / 2, fd2, fd2);
    }
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  const ball = skinImgScaled(images, "sliderb") ?? skinImgScaled(images, "sliderb0");
  if (ball) {
    const d = canonicalDiameter(ball, radius);
    const sprite = allowTint ? tintBitmap2(ball.bmp, color) : ball.bmp;
    ctx.drawImage(sprite, cx - d / 2, cy - d / 2, d, d);
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}
var _uninheritedCache = /* @__PURE__ */ new WeakMap();
function getUninheritedTimingPoints(timingPoints) {
  let arr = _uninheritedCache.get(timingPoints);
  if (arr === void 0) {
    arr = timingPoints.filter((tp) => !tp.inherited);
    _uninheritedCache.set(timingPoints, arr);
  }
  return arr;
}
function getActiveTiming(timingPoints, timeMs) {
  const arr = getUninheritedTimingPoints(timingPoints);
  if (arr.length === 0 || arr[0].time > timeMs) {
    return { beatLength: 500, tpTime: 0 };
  }
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >>> 1;
    if (arr[mid].time <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return { beatLength: arr[lo].beatLength, tpTime: arr[lo].time };
}
function drawRepeatArrow(ctx, cx, cy, angle, radius, color, images, timeMs, tpTime, beatLength) {
  const beatFrac = ((timeMs - tpTime) % beatLength + beatLength) % beatLength / beatLength;
  const pulseScale = 1 + 0.3 * (1 - beatFrac);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.scale(pulseScale, pulseScale);
  const arrow = skinImgScaled(images, "reversearrow");
  if (arrow) {
    const size = canonicalDiameter(arrow, radius) / 2;
    ctx.drawImage(arrow.bmp, -size, -size, size * 2, size * 2);
  } else {
    const size = radius * 0.68;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.45, size * 0.6);
    ctx.lineTo(-size * 0.15, 0);
    ctx.lineTo(-size * 0.45, -size * 0.6);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}
function drawComboNumber(ctx, cx, cy, radius, number, skin, instafade) {
  if (number <= 0)
    return;
  const digits = String(number).split("");
  const { images } = skin;
  const prefix = skin.config.hitCirclePrefix;
  const hitCircleOverlap = skin.config.hitCircleOverlap;
  const firstDigit = digits[0];
  const digitBitmaps = digits.map(
    (d) => images.get(`${prefix}-${d}@2x.png`) ?? images.get(`${prefix}-${d}.png`)
  );
  if (digitBitmaps.every((b) => b !== void 0)) {
    const hc = skinImgScaled(images, "hitcircle");
    let scale;
    if (hc !== void 0 && !isBlankImage(hc.bmp)) {
      const hcNativeW = hc.bmp.width / hc.scale;
      const hcDrawn = canonicalDiameter(hc, radius);
      scale = hcDrawn / hcNativeW;
    } else {
      scale = 2 * radius / 128;
    }
    const sdImg = images.get(`${prefix}-${firstDigit}.png`);
    const hdImg = images.get(`${prefix}-${firstDigit}@2x.png`);
    const nativeH = sdImg?.height ?? (hdImg !== void 0 ? hdImg.height / 2 : digitBitmaps[0].height);
    const fontScale = 0.8 * scale;
    const targetH = instafade ? radius * 2 / hitCircleRatio(digitBitmaps[0]) : nativeH * fontScale;
    const widths = digitBitmaps.map((b) => b.width * (targetH / b.height));
    const scaledOverlap = instafade ? hitCircleOverlap * (targetH / nativeH) : hitCircleOverlap * fontScale;
    const advances = widths.map((w) => w - scaledOverlap);
    const totalW = advances.slice(0, -1).reduce((s, a) => s + a, 0) + widths[widths.length - 1];
    let x = cx - totalW / 2;
    for (let i = 0; i < digitBitmaps.length; i++) {
      ctx.drawImage(digitBitmaps[i], x, cy - targetH / 2, widths[i], targetH);
      x += advances[i];
    }
  } else {
    const fontSize = Math.max(8, Math.round(radius * 0.9));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(2, fontSize * 0.15);
    ctx.strokeStyle = "rgba(0,0,0,0.75)";
    ctx.strokeText(String(number), cx, cy);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(number), cx, cy);
  }
}
function drawSpinner(ctx, images, timeMs, spinner, cumAngle, progress2, isCompleted, skin, bonusTimes) {
  const [cx, cy] = toCanvas(SPINNER_CENTER_X3, SPINNER_CENTER_Y3);
  const SPINNER_SCALE = 0.624 * (CANVAS_H3 / 480);
  function resolve(stem) {
    const hd = images.get(`${stem}@2x.png`);
    if (hd && hd.width > 1)
      return { bmp: hd, scale: SPINNER_SCALE / 2 };
    const sd = images.get(`${stem}.png`);
    if (sd && sd.width > 1)
      return { bmp: sd, scale: SPINNER_SCALE };
    return void 0;
  }
  function drawAt(r, ax, ay, rotation = 0, extraScale = 1) {
    const w = r.bmp.width * r.scale * extraScale;
    const h = r.bmp.height * r.scale * extraScale;
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(rotation);
      ctx.drawImage(r.bmp, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(r.bmp, ax - w / 2, ay - h / 2, w, h);
    }
  }
  const completionScale = 0.8 + Math.min(1, progress2) * 0.2;
  const bg = resolve("spinner-background");
  if (bg)
    drawAt(bg, CANVAS_W3 / 2, CANVAS_H3 * (396.9 / 480));
  const glow = resolve("spinner-glow");
  if (glow) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    drawAt(glow, cx, cy, 0, completionScale);
    ctx.restore();
  }
  const bottom = resolve("spinner-bottom");
  if (bottom)
    drawAt(bottom, cx, cy, cumAngle / 3, completionScale);
  const top = resolve("spinner-top");
  if (top)
    drawAt(top, cx, cy, cumAngle * 0.5, completionScale);
  const middle2 = resolve("spinner-middle2");
  if (middle2)
    drawAt(middle2, cx, cy, cumAngle, completionScale);
  const middle = resolve("spinner-middle");
  if (middle) {
    const t = Math.min(1, Math.max(0, (timeMs - spinner.time) / Math.max(1, spinner.endTime - spinner.time)));
    const step = Math.round(t * 31);
    if (step > 0) {
      const chan = Math.round(255 * (1 - step / 31));
      const off = tintBitmap2(middle.bmp, `rgb(255, ${chan}, ${chan})`);
      const w = middle.bmp.width * middle.scale * completionScale;
      const h = middle.bmp.height * middle.scale * completionScale;
      ctx.drawImage(off, cx - w / 2, cy - h / 2, w, h);
    } else {
      drawAt(middle, cx, cy, 0, completionScale);
    }
  }
  const circle = resolve("spinner-circle");
  if (circle)
    drawAt(circle, cx, cy, cumAngle, completionScale);
  const metre = resolve("spinner-metre");
  if (metre && progress2 > 0) {
    const w = metre.bmp.width * metre.scale;
    const h = metre.bmp.height * metre.scale;
    const x = cx - w / 2;
    const y = cy - h / 2;
    const clipH = h * Math.min(1, progress2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + h - clipH, w, clipH);
    ctx.clip();
    ctx.drawImage(metre.bmp, x, y, w, h);
    ctx.restore();
  }
  if (timeMs < spinner.endTime) {
    const dur = Math.max(1, spinner.endTime - spinner.time);
    const elapsed = Math.max(0, timeMs - spinner.time);
    const t = Math.min(1, elapsed / dur);
    const acScale = 1.9 - 1.8 * t;
    const ac = resolve("spinner-approachcircle");
    if (ac)
      drawAt(ac, cx, cy, 0, acScale);
  }
  if (isCompleted) {
    const clear = resolve("spinner-clear");
    if (clear)
      drawAt(clear, CANVAS_W3 / 2, CANVAS_H3 * (230 / 768));
  } else if (timeMs >= spinner.time) {
    const spin = resolve("spinner-spin");
    if (spin)
      drawAt(spin, CANVAS_W3 / 2, CANVAS_H3 * (582 / 768));
  }
  if (bonusTimes.length > 0) {
    let count = 0;
    for (let i = 0; i < bonusTimes.length; i++) {
      if (bonusTimes[i] <= timeMs)
        count++;
      else
        break;
    }
    const age = count > 0 ? timeMs - bonusTimes[count - 1] : Infinity;
    const BONUS_FADE_MS = 800, BONUS_SCALE_MS = 1e3;
    if (count > 0 && age < BONUS_FADE_MS) {
      const alpha = 1 - age / BONUS_FADE_MS;
      const scale = 1 + 0.5 * Math.pow(1 - Math.min(1, age / BONUS_SCALE_MS), 5);
      const bonusY = cy + 80 * (CANVAS_H3 / 480);
      drawSpinnerBonusNumber(ctx, skin, cx, bonusY, count * 1e3, alpha, scale);
    }
  }
}
function drawSpinnerBonusNumber(ctx, skin, cx, cy, value, alpha, scale) {
  const prefix = skin.config.scorePrefix || "score";
  const text = String(value);
  const digitH = CANVAS_H3 * 0.05 * scale;
  const glyph = (ch3) => skin.images.get(`${prefix}-${ch3}@2x.png`) ?? skin.images.get(`${prefix}-${ch3}.png`);
  const widths = [];
  let totalW = 0;
  for (const ch3 of text) {
    const bmp = glyph(ch3);
    const w = bmp ? bmp.width / bmp.height * digitH : digitH * 0.55;
    widths.push(w);
    totalW += w;
  }
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  let x = cx - totalW / 2;
  const y = cy - digitH / 2;
  for (let i = 0; i < text.length; i++) {
    const ch3 = text.charAt(i);
    const bmp = glyph(ch3);
    const w = widths[i];
    if (bmp) {
      ctx.drawImage(bmp, x, y, w, digitH);
    } else {
      ctx.font = `bold ${Math.round(digitH * 0.9)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(ch3, x, y);
    }
    x += w;
  }
  ctx.restore();
}
function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// src/renderer/FollowpointRenderer.ts
function toCanvas2(x, y) {
  return [OFFSET_X + x * SCALE2, OFFSET_Y + y * SCALE2];
}
var PRE_EMPT = 800;
var LINE_DIST = 32;
var TRAIL_CAP = 5e3;
var HIT_FADE_IN = 400;
var HIT_FADE_OUT = 240;
var _artCache = /* @__PURE__ */ new WeakMap();
function resolveFollowpointArt(images) {
  const cached = _artCache.get(images);
  if (cached !== void 0)
    return cached;
  const pickReal = (stem) => {
    const hd = images.get(`${stem}@2x.png`);
    if (hd && hd.width > 1)
      return { bitmap: hd, is2x: true };
    const sd = images.get(`${stem}.png`);
    if (sd && sd.width > 1)
      return { bitmap: sd, is2x: false };
    return null;
  };
  const frames = [];
  for (let i = 0; ; i++) {
    const hasAny = images.has(`followpoint-${i}.png`) || images.has(`followpoint-${i}@2x.png`);
    if (!hasAny)
      break;
    const f = pickReal(`followpoint-${i}`);
    if (f !== null)
      frames.push(f);
  }
  let result = null;
  if (frames.length > 0) {
    result = { frames, frameDurMs: 1e3 / frames.length };
  } else {
    const single = pickReal("followpoint");
    if (single !== null)
      result = { frames: [single], frameDurMs: 1e3 };
  }
  _artCache.set(images, result);
  return result;
}
function startPosStacked(obj, radiusOsu, flipX, flipY) {
  if (obj.type === "spinner")
    return null;
  const shift = -obj.stackHeight * radiusOsu / 10;
  return { x: flipX(obj.x) + shift, y: flipY(obj.y) + shift };
}
function endPosStacked(obj, radiusOsu, flipX, flipY) {
  if (obj.type === "spinner")
    return null;
  if (obj.type === "circle") {
    const shift2 = -obj.stackHeight * radiusOsu / 10;
    return { x: flipX(obj.x) + shift2, y: flipY(obj.y) + shift2 };
  }
  const path = sampleSlider(obj);
  const endPoint = obj.slides % 2 === 1 ? path[path.length - 1] : path[0];
  const shift = -obj.stackHeight * radiusOsu / 10;
  return { x: flipX(endPoint.x) + shift, y: flipY(endPoint.y) + shift };
}
function objectEndTime2(obj, beatmap) {
  if (obj.type === "slider")
    return obj.time + slideDurationMs(beatmap, obj) * obj.slides;
  if (obj.type === "spinner")
    return obj.endTime;
  return obj.time;
}
function drawFollowpoints(ctx, beatmap, skin, timeMs, modDiff) {
  const art = resolveFollowpointArt(skin.images);
  if (art === null)
    return;
  const radiusOsu = modDiff.circleRadiusPx;
  const preempt = modDiff.preemptMs;
  const fx = modDiff.flipX ? (x) => 512 - x : (x) => x;
  const fy = modDiff.flipY ? (y) => 384 - y : (y) => y;
  const arScale = Math.min(1, preempt / 450);
  const timeFadeIn = HIT_FADE_IN * arScale;
  const timeFadeOut = HIT_FADE_OUT * arScale;
  const objects = beatmap.hitObjects;
  let firstIdx = 1;
  let lastIdx = objects.length - 1;
  if (objects.length > 1) {
    const minTime = timeMs - timeFadeOut;
    const maxTime = timeMs + preempt;
    let lo = 1;
    let hi = objects.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (objects[mid].time < minTime)
        lo = mid + 1;
      else
        hi = mid;
    }
    firstIdx = lo;
    if (firstIdx >= objects.length || objects[firstIdx].time > maxTime) {
      lastIdx = firstIdx - 1;
    } else {
      lo = firstIdx;
      hi = objects.length - 1;
      while (lo < hi) {
        const mid = lo + hi + 1 >>> 1;
        if (objects[mid].time <= maxTime)
          lo = mid;
        else
          hi = mid - 1;
      }
      lastIdx = lo;
    }
  }
  for (let i = firstIdx; i <= lastIdx; i++) {
    const prev = objects[i - 1];
    const next = objects[i];
    if (prev.type === "spinner")
      continue;
    if (next.type === "spinner")
      continue;
    if (next.newCombo)
      continue;
    const prevTime = objectEndTime2(prev, beatmap);
    const nextTime = next.time;
    const duration = nextTime - prevTime;
    if (duration <= 0)
      continue;
    const nextAppear = nextTime - preempt;
    if (timeMs < Math.max(prevTime - PRE_EMPT, nextAppear))
      continue;
    if (timeMs > nextTime + timeFadeOut)
      continue;
    const prevPos = endPosStacked(prev, radiusOsu, fx, fy);
    const nextPos = startPosStacked(next, radiusOsu, fx, fy);
    if (prevPos === null || nextPos === null)
      continue;
    const dx = nextPos.x - prevPos.x;
    const dy = nextPos.y - prevPos.y;
    const distance = Math.hypot(dx, dy);
    if (distance < LINE_DIST * 1.5)
      continue;
    const rotation = Math.atan2(dy, dx);
    const sizeFactor = radiusOsu / 64 * SCALE2;
    const startProgress = Math.max(LINE_DIST * 1.5, distance - TRAIL_CAP);
    const endProgress = distance - LINE_DIST;
    for (let progress2 = startProgress; progress2 < endProgress; progress2 += LINE_DIST) {
      const t = progress2 / distance;
      const tStart = Math.max(prevTime + t * duration - PRE_EMPT, nextAppear);
      const tEnd = prevTime + t * duration;
      if (timeMs < tStart)
        continue;
      if (timeMs > tEnd + timeFadeOut)
        continue;
      let alpha;
      if (timeMs < tStart + timeFadeIn) {
        alpha = (timeMs - tStart) / timeFadeIn;
      } else if (timeMs <= tEnd) {
        alpha = 1;
      } else {
        alpha = 1 - (timeMs - tEnd) / timeFadeOut;
      }
      if (alpha <= 0)
        continue;
      const osuX = prevPos.x + dx * t;
      const osuY = prevPos.y + dy * t;
      const [cx, cy] = toCanvas2(osuX, osuY);
      const n = art.frames.length;
      const frameIdx = n === 1 ? 0 : (Math.floor(timeMs / art.frameDurMs) % n + n) % n;
      const frame = art.frames[frameIdx];
      const bmpDiv = frame.is2x ? 2 : 1;
      const drawW = frame.bitmap.width / bmpDiv * sizeFactor;
      const drawH = frame.bitmap.height / bmpDiv * sizeFactor;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.drawImage(frame.bitmap, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }
  }
}

// src/renderer/CursorRenderer.ts
var _cumTimes = /* @__PURE__ */ new WeakMap();
function getCumulativeTimes(frames) {
  let times = _cumTimes.get(frames);
  if (times === void 0) {
    times = new Array(frames.length);
    let acc = 0;
    for (let i = 0; i < frames.length; i++) {
      acc += frames[i].timeDelta;
      times[i] = acc;
    }
    _cumTimes.set(frames, times);
  }
  return times;
}
var TRAIL_LENGTH = 10;
var CURSOR_RADIUS = 6;
var CURSOR_PX_PER_NATIVE = SCALE2 / 1.6;
function toCanvas3(x, y) {
  return [OFFSET_X + x * SCALE2, OFFSET_Y + y * SCALE2];
}
function resolveCursorSprite(images, stem) {
  const hd = images.get(`${stem}@2x.png`);
  if (hd)
    return hd.width <= 1 && hd.height <= 1 ? void 0 : { bmp: hd, scale: 2 };
  const sd = images.get(`${stem}.png`);
  if (sd)
    return sd.width <= 1 && sd.height <= 1 ? void 0 : { bmp: sd, scale: 1 };
  return void 0;
}
function drawSprite(ctx, s, cx, cy) {
  const w = s.bmp.width / s.scale * CURSOR_PX_PER_NATIVE;
  const h = s.bmp.height / s.scale * CURSOR_PX_PER_NATIVE;
  ctx.drawImage(s.bmp, cx - w / 2, cy - h / 2, w, h);
}
function findFrameIndex(times, timeMs) {
  if (times.length === 0)
    return -1;
  if (timeMs < times[0])
    return -1;
  if (timeMs >= times[times.length - 1])
    return times.length - 1;
  let lo = 0;
  let hi = times.length - 2;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (times[mid] <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return lo;
}
function interpolateCursor(frames, times, timeMs) {
  const idx = findFrameIndex(times, timeMs);
  if (idx < 0) {
    const f = frames[0];
    return toCanvas3(f.x, f.y);
  }
  if (idx >= frames.length - 1) {
    const f = frames[frames.length - 1];
    return toCanvas3(f.x, f.y);
  }
  const t0 = times[idx];
  const t1 = times[idx + 1];
  const dt = t1 - t0;
  const frac = dt < 1e-6 ? 0 : (timeMs - t0) / dt;
  const f0 = frames[idx];
  const f1 = frames[idx + 1];
  const x = f0.x + (f1.x - f0.x) * frac;
  const y = f0.y + (f1.y - f0.y) * frac;
  return toCanvas3(x, y);
}
function drawCursor(ctx, replay, timeMs, skin) {
  const { frames } = replay;
  if (frames.length === 0)
    return;
  const times = getCumulativeTimes(frames);
  const idx = findFrameIndex(times, timeMs);
  if (idx < 0)
    return;
  const trailStart = Math.max(0, idx - TRAIL_LENGTH + 1);
  const trail = skin ? resolveCursorSprite(skin.images, "cursortrail") : void 0;
  if (trail || !skin) {
    for (let i = idx; i >= trailStart; i--) {
      const age = idx - i;
      const alpha = 1 - age / TRAIL_LENGTH;
      const [tx, ty] = toCanvas3(frames[i].x, frames[i].y);
      ctx.save();
      if (trail) {
        ctx.globalAlpha = alpha * 0.7;
        drawSprite(ctx, trail, tx, ty);
      } else {
        ctx.globalAlpha = alpha * 0.55;
        ctx.beginPath();
        ctx.arc(tx, ty, CURSOR_RADIUS * (1 - age / (TRAIL_LENGTH * 1.5)), 0, Math.PI * 2);
        ctx.fillStyle = "#e879a0";
        ctx.fill();
      }
      ctx.restore();
    }
  }
  const [cx, cy] = interpolateCursor(frames, times, timeMs);
  const cursor = skin ? resolveCursorSprite(skin.images, "cursor") : void 0;
  const cursorMiddle = skin ? resolveCursorSprite(skin.images, "cursormiddle") : void 0;
  if (cursor || cursorMiddle) {
    if (cursor)
      drawSprite(ctx, cursor, cx, cy);
    if (cursorMiddle)
      drawSprite(ctx, cursorMiddle, cx, cy);
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, CURSOR_RADIUS + 4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(232, 121, 160, 0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, CURSOR_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#e879a0";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, CURSOR_RADIUS * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

// src/renderer/JudgementRenderer.ts
function toCanvas4(x, y) {
  return [OFFSET_X + x * SCALE2, OFFSET_Y + y * SCALE2];
}
var RESULT_FADE_IN = 120;
var POST_EMPT = 500;
var RESULT_FADE_OUT = 600;
var TOTAL_MS = POST_EMPT + RESULT_FADE_OUT;
var MISS_Y_START = -5;
var MISS_Y_END = 40;
var MISS_ROT_RANGE = 0.3;
var MISS_ROT_CENTER = 0.15;
var LEGACY_TAIKO_FADE_IN_MS = 120;
var LEGACY_TAIKO_FADE_OUT_DELAY_MS = 500;
var LEGACY_TAIKO_FADE_OUT_MS = 600;
var LEGACY_TAIKO_TOTAL_MS = LEGACY_TAIKO_FADE_OUT_DELAY_MS + LEGACY_TAIKO_FADE_OUT_MS;
var LEGACY_TAIKO_ANIM_TOTAL_MS = 1e3;
var LEGACY_TAIKO_MISS_SCALE_MS = 100;
var LEGACY_TAIKO_MISS_SCALE_START = 1.6;
var LEGACY_TAIKO_MISS_SCALE_END = 1;
var LEGACY_TAIKO_MISS_Y_START_PX = -5;
var LEGACY_TAIKO_MISS_Y_END_PX = 75;
var LEGACY_TAIKO_MISS_ROT_MAX_RAD = 8.6 * Math.PI / 180;
function clamp01(t) {
  return t <= 0 ? 0 : t >= 1 ? 1 : t;
}
function inQuad(t) {
  const x = clamp01(t);
  return x * x;
}
function legacyTaikoFade(age) {
  if (age < LEGACY_TAIKO_FADE_IN_MS)
    return age / LEGACY_TAIKO_FADE_IN_MS;
  if (age < LEGACY_TAIKO_FADE_OUT_DELAY_MS)
    return 1;
  return 1 - (age - LEGACY_TAIKO_FADE_OUT_DELAY_MS) / LEGACY_TAIKO_FADE_OUT_MS;
}
function legacyTaikoHitScale(age) {
  if (age < 96)
    return 0.6 + (1.1 - 0.6) * (age / 96);
  if (age < 120)
    return 1.1;
  if (age < 144)
    return 1.1 + (0.9 - 1.1) * ((age - 120) / 24);
  if (age < 168)
    return 0.95 + (1 - 0.95) * ((age - 144) / 24);
  return 1;
}
var SKIN_STEMS = {
  300: ["hit300", "hit300-0"],
  100: ["hit100", "hit100-0"],
  50: ["hit50", "hit50-0"],
  0: ["hit0", "hit0-0"]
};
var TAIKO_SKIN_STEMS = {
  300: ["taiko-hit300"],
  100: ["taiko-hit100"],
  0: ["taiko-hit0"]
};
var TAIKO_STRONG_STEMS = {
  300: ["taiko-hit300k", "taiko-hit300"],
  100: ["taiko-hit100k", "taiko-hit100"],
  0: ["taiko-hit0"]
};
var TAIKO_STD_FALLBACK = {
  300: ["hit300", "hit300-0"],
  100: ["hit100", "hit100-0"],
  0: ["hit0", "hit0-0"]
};
function lookupStem(images, stem) {
  return images.get(`${stem}@2x.png`) ?? images.get(`${stem}.png`);
}
function lookupStemNatural(images, stem) {
  const at2x = images.get(`${stem}@2x.png`);
  if (at2x !== void 0 && at2x.width > 1)
    return { bitmap: at2x, pixelScale: 0.5 };
  const at1x = images.get(`${stem}.png`);
  if (at1x !== void 0 && at1x.width > 1)
    return { bitmap: at1x, pixelScale: 1 };
  return void 0;
}
function isStemSuppressed(images, stem) {
  const at2x = images.get(`${stem}@2x.png`);
  if (at2x !== void 0 && at2x.width === 1)
    return true;
  const at1x = images.get(`${stem}.png`);
  if (at1x !== void 0 && at1x.width === 1)
    return true;
  return false;
}
function resolveStemFrames(images, stem) {
  const frames = [];
  for (let i = 0; ; i++) {
    const f = lookupStemNatural(images, `${stem}-${i}`);
    if (f === void 0) {
      if (isStemSuppressed(images, `${stem}-${i}`))
        return [];
      break;
    }
    frames.push(f);
  }
  if (frames.length > 0)
    return frames;
  const single = lookupStemNatural(images, stem);
  return single !== void 0 ? [single] : [];
}
function resolveStdJudgementSprite(images, judgement) {
  const stems = SKIN_STEMS[judgement];
  if (!stems)
    return void 0;
  for (const stem of stems) {
    const sp = lookupStemNatural(images, stem);
    if (sp !== void 0)
      return sp;
  }
  return void 0;
}
function resolveJudgementImage(images, judgement, taiko, strong) {
  if (taiko) {
    const taikoStems = (strong ? TAIKO_STRONG_STEMS : TAIKO_SKIN_STEMS)[judgement] ?? [];
    let suppressed = false;
    for (const stem of taikoStems) {
      const bm = lookupStem(images, stem);
      if (bm === void 0)
        continue;
      if (bm.width > 1)
        return bm;
      suppressed = true;
    }
    if (suppressed)
      return void 0;
    for (const stem of TAIKO_STD_FALLBACK[judgement] ?? []) {
      const bm = lookupStem(images, stem);
      if (bm !== void 0 && bm.width > 1)
        return bm;
    }
    return void 0;
  }
  const stems = SKIN_STEMS[judgement];
  if (!stems)
    return void 0;
  for (const stem of stems) {
    const bm = lookupStem(images, stem);
    if (bm !== void 0 && bm.width > 1)
      return bm;
  }
  return void 0;
}
function resolveTaikoPopupFrames(images, judgement, strong) {
  const taikoStems = (strong ? TAIKO_STRONG_STEMS : TAIKO_SKIN_STEMS)[judgement] ?? [];
  let suppressed = false;
  for (const stem of taikoStems) {
    const frames = resolveStemFrames(images, stem);
    if (frames.length > 0)
      return frames;
    if (isStemSuppressed(images, stem))
      suppressed = true;
  }
  return suppressed ? null : [];
}
var LABEL = {
  300: "300",
  100: "100",
  50: "50",
  0: "\u2717"
};
var COLOR = {
  300: "#ffff44",
  100: "#44ccff",
  50: "#88ff88",
  0: "#ff5555"
};
var FONT_SIZE = {
  300: 22,
  100: 20,
  50: 18,
  0: 26
};
var IMAGE_SIZE = 128;
var OBJECT_DIAMETER_PX2 = 128;
function bounceScale(age) {
  const a = RESULT_FADE_IN * 0.8;
  const b = RESULT_FADE_IN;
  const c = RESULT_FADE_IN * 1.2;
  const d = RESULT_FADE_IN * 1.4;
  if (age < a)
    return 0.6 + (1.1 - 0.6) * (age / a);
  if (age < b)
    return 1.1;
  if (age < c)
    return 1.1 + (0.9 - 1.1) * ((age - b) / (c - b));
  if (age < d)
    return 0.9 + (1 - 0.9) * ((age - c) / (d - c));
  return 1;
}
function missRotationSeed(time) {
  const x = Math.sin(time * 0.1234567) * 43758.5453;
  const frac = x - Math.floor(x);
  return frac * MISS_ROT_RANGE - MISS_ROT_CENTER;
}
function drawJudgements(ctx, results, timeMs, skin, mode = "std", circleRadiusOsuPx) {
  const isTaiko = mode === "taiko";
  for (const result of results) {
    if (isTaiko) {
      if (result.comboIgnore === true)
        continue;
    } else {
      if (result.isSliderSub === true)
        continue;
      if (result.judgement === 300)
        continue;
    }
    const displayJudgement = result.judgement;
    const popupTime = result.displayTime ?? result.time;
    const age = timeMs - popupTime;
    const lifetime = isTaiko ? LEGACY_TAIKO_TOTAL_MS : TOTAL_MS;
    if (age < 0 || age > lifetime)
      continue;
    const isMissDisplay = displayJudgement === 0;
    const [cx, cy] = isTaiko ? [result.x, result.y] : toCanvas4(result.x, result.y);
    let alpha;
    let scale;
    let x = cx;
    let y = cy;
    let rotation = 0;
    let taikoFrames2;
    if (isTaiko && skin) {
      taikoFrames2 = resolveTaikoPopupFrames(skin.images, displayJudgement, result.strong === true);
    }
    const isTaikoAnim = isTaiko && taikoFrames2 !== void 0 && taikoFrames2 !== null && taikoFrames2.length > 1;
    if (isTaiko) {
      alpha = legacyTaikoFade(age);
      if (isTaikoAnim) {
        scale = 1;
      } else if (isMissDisplay) {
        scale = age >= LEGACY_TAIKO_MISS_SCALE_MS ? LEGACY_TAIKO_MISS_SCALE_END : LEGACY_TAIKO_MISS_SCALE_START + (LEGACY_TAIKO_MISS_SCALE_END - LEGACY_TAIKO_MISS_SCALE_START) * inQuad(age / LEGACY_TAIKO_MISS_SCALE_MS);
        const yu = clamp01(age / LEGACY_TAIKO_TOTAL_MS);
        y += LEGACY_TAIKO_MISS_Y_START_PX + (LEGACY_TAIKO_MISS_Y_END_PX - LEGACY_TAIKO_MISS_Y_START_PX) * (yu * yu);
        const r = missRotationSeed(result.time) * (LEGACY_TAIKO_MISS_ROT_MAX_RAD / MISS_ROT_CENTER);
        if (age < LEGACY_TAIKO_FADE_IN_MS) {
          rotation = r * (age / LEGACY_TAIKO_FADE_IN_MS);
        } else {
          const ru = clamp01(
            (age - LEGACY_TAIKO_FADE_IN_MS) / (LEGACY_TAIKO_TOTAL_MS - LEGACY_TAIKO_FADE_IN_MS)
          );
          rotation = r + r * (ru * ru);
        }
      } else {
        scale = legacyTaikoHitScale(age);
      }
    } else {
      if (age < RESULT_FADE_IN)
        alpha = age / RESULT_FADE_IN;
      else if (age < POST_EMPT)
        alpha = 1;
      else
        alpha = 1 - (age - POST_EMPT) / RESULT_FADE_OUT;
      scale = bounceScale(age);
      if (isMissDisplay) {
        y = cy + MISS_Y_START + (MISS_Y_END - MISS_Y_START) * (age / TOTAL_MS);
        const r = missRotationSeed(result.time);
        if (age < RESULT_FADE_IN) {
          rotation = r * (age / RESULT_FADE_IN);
        } else {
          rotation = r + r * ((age - RESULT_FADE_IN) / (TOTAL_MS - RESULT_FADE_IN));
        }
      }
    }
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.translate(x, y);
    if (rotation !== 0)
      ctx.rotate(rotation);
    ctx.scale(scale, scale);
    const strong = isTaiko && result.strong === true;
    if (isTaiko && taikoFrames2 !== void 0 && taikoFrames2 !== null && taikoFrames2.length > 0) {
      let frameIdx = 0;
      if (taikoFrames2.length > 1) {
        const frameLen = LEGACY_TAIKO_ANIM_TOTAL_MS / taikoFrames2.length;
        frameIdx = Math.min(taikoFrames2.length - 1, Math.max(0, Math.floor(age / frameLen)));
      }
      const sp = taikoFrames2[frameIdx];
      const drawW = sp.bitmap.width * sp.pixelScale;
      const drawH = sp.bitmap.height * sp.pixelScale;
      ctx.drawImage(sp.bitmap, -drawW / 2, -drawH / 2, drawW, drawH);
    } else if (isTaiko && taikoFrames2 === null) {
    } else {
      let burst;
      if (!isTaiko) {
        const sp = skin ? resolveStdJudgementSprite(skin.images, displayJudgement) : void 0;
        if (sp !== void 0 && circleRadiusOsuPx !== void 0) {
          const k = 2 * circleRadiusOsuPx * SCALE2 / OBJECT_DIAMETER_PX2;
          burst = {
            bitmap: sp.bitmap,
            drawW: sp.bitmap.width * sp.pixelScale * k,
            drawH: sp.bitmap.height * sp.pixelScale * k
          };
        }
      } else {
        const bitmap = skin ? resolveJudgementImage(skin.images, displayJudgement, true, strong) : void 0;
        if (bitmap !== void 0) {
          const aspect = bitmap.width / bitmap.height;
          burst = {
            bitmap,
            drawW: aspect >= 1 ? IMAGE_SIZE : IMAGE_SIZE * aspect,
            drawH: aspect >= 1 ? IMAGE_SIZE / aspect : IMAGE_SIZE
          };
        }
      }
      if (burst !== void 0) {
        ctx.drawImage(burst.bitmap, -burst.drawW / 2, -burst.drawH / 2, burst.drawW, burst.drawH);
      } else {
        const label = LABEL[displayJudgement] ?? "?";
        const color = COLOR[displayJudgement] ?? "#ffffff";
        const fontSize = FONT_SIZE[displayJudgement] ?? 20;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 3;
        ctx.strokeText(label, 0, 0);
        ctx.fillStyle = color;
        ctx.fillText(label, 0, 0);
      }
    }
    ctx.restore();
  }
}

// src/renderer/KeyOverlayRenderer.ts
var KEY_DEFS = [
  { bit: 4, exclude: 0, pressedColor: "#ffde00" },
  { bit: 8, exclude: 0, pressedColor: "#ffde00" },
  { bit: 1, exclude: 4, pressedColor: "#f8009e" },
  { bit: 2, exclude: 8, pressedColor: "#f8009e" }
];
var _cumTimes2 = /* @__PURE__ */ new WeakMap();
function getCumulativeTimes2(frames) {
  let times = _cumTimes2.get(frames);
  if (times === void 0) {
    times = new Array(frames.length);
    let acc = 0;
    for (let i = 0; i < frames.length; i++) {
      acc += frames[i].timeDelta;
      times[i] = acc;
    }
    _cumTimes2.set(frames, times);
  }
  return times;
}
function findFrameIndex2(times, timeMs) {
  if (times.length === 0)
    return -1;
  if (timeMs < times[0])
    return -1;
  if (timeMs >= times[times.length - 1])
    return times.length - 1;
  let lo = 0;
  let hi = times.length - 2;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (times[mid] <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return lo;
}
var _timelines = /* @__PURE__ */ new WeakMap();
var _pressCounts = /* @__PURE__ */ new WeakMap();
var PRESS_ANIM_MS = 100;
function outQuad(t) {
  const u = 1 - t;
  return 1 - u * u;
}
function buildKeyTimelines(times, keyCount, activeAt) {
  const n = times.length;
  const timelines = [];
  const counts = [];
  for (let k = 0; k < keyCount; k++) {
    timelines.push([]);
    counts.push(new Array(n));
  }
  const running = new Array(keyCount).fill(0);
  const prev = new Array(keyCount).fill(false);
  for (let i = 0; i < n; i++) {
    const t = times[i];
    for (let k = 0; k < keyCount; k++) {
      const wasActive = prev[k];
      const isActive = activeAt(i, k);
      if (wasActive !== isActive) {
        const tl = timelines[k];
        const p = tl.length > 0 ? tl[tl.length - 1] : null;
        let scaleAt = 1;
        let tintAt = 0;
        if (p !== null) {
          const u = Math.min(1, (t - p.time) / PRESS_ANIM_MS);
          const e = outQuad(u);
          const targetScale = p.isPress ? 0.8 : 1;
          const targetTint = p.isPress ? 1 : 0;
          scaleAt = p.scaleAt + (targetScale - p.scaleAt) * e;
          tintAt = p.tintAt + (targetTint - p.tintAt) * e;
        }
        tl.push({ time: t, isPress: isActive, scaleAt, tintAt });
      }
      if (!wasActive && isActive)
        running[k] = running[k] + 1;
      counts[k][i] = running[k];
      prev[k] = isActive;
    }
  }
  return { timelines, counts };
}
function buildTimelines(frames) {
  const times = getCumulativeTimes2(frames);
  const { timelines, counts } = buildKeyTimelines(times, KEY_DEFS.length, (i, k) => {
    const def = KEY_DEFS[k];
    const keys = frames[i].keys;
    return (keys & def.bit) !== 0 && (keys & def.exclude) === 0;
  });
  return {
    timelines,
    counts
  };
}
function getTimelines(frames) {
  let tl = _timelines.get(frames);
  if (tl === void 0) {
    const built = buildTimelines(frames);
    _timelines.set(frames, built.timelines);
    _pressCounts.set(frames, built.counts);
    tl = built.timelines;
  }
  return tl;
}
function getPressCounts(frames) {
  let c = _pressCounts.get(frames);
  if (c === void 0) {
    const built = buildTimelines(frames);
    _timelines.set(frames, built.timelines);
    _pressCounts.set(frames, built.counts);
    c = built.counts;
  }
  return c;
}
function findEventBefore(events, timeMs) {
  if (events.length === 0 || timeMs < events[0].time)
    return -1;
  if (timeMs >= events[events.length - 1].time)
    return events.length - 1;
  let lo = 0, hi = events.length - 2;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (events[mid].time <= timeMs)
      lo = mid;
    else
      hi = mid - 1;
  }
  return lo;
}
function computeKeyState(events, timeMs) {
  const idx = findEventBefore(events, timeMs);
  if (idx < 0)
    return { pressed: false, scale: 1, tint: 0 };
  const ev = events[idx];
  const u = Math.min(1, (timeMs - ev.time) / PRESS_ANIM_MS);
  const e = outQuad(u);
  const targetScale = ev.isPress ? 0.8 : 1;
  const targetTint = ev.isPress ? 1 : 0;
  return {
    pressed: ev.isPress,
    scale: ev.scaleAt + (targetScale - ev.scaleAt) * e,
    tint: ev.tintAt + (targetTint - ev.tintAt) * e
  };
}
function skinAsset(images, stem) {
  if (images === void 0)
    return null;
  const hd = images.get(`${stem}@2x.png`);
  if (hd !== void 0)
    return { bmp: hd, div: 2 };
  const sd = images.get(`${stem}.png`);
  if (sd !== void 0)
    return { bmp: sd, div: 1 };
  return null;
}
var _tintCache3 = /* @__PURE__ */ new WeakMap();
function tintBitmap3(bitmap, color) {
  let m = _tintCache3.get(bitmap);
  if (m === void 0) {
    m = /* @__PURE__ */ new Map();
    _tintCache3.set(bitmap, m);
  }
  const cached = m.get(color);
  if (cached !== void 0)
    return cached;
  const { width: w, height: h } = bitmap;
  const osc = new OffscreenCanvas(w, h);
  const oc = osc.getContext("2d");
  oc.drawImage(bitmap, 0, 0);
  oc.globalCompositeOperation = "multiply";
  oc.fillStyle = color;
  oc.fillRect(0, 0, w, h);
  oc.globalCompositeOperation = "destination-in";
  oc.drawImage(bitmap, 0, 0);
  m.set(color, osc);
  return osc;
}
var CANVAS_W4 = 1280;
var CANVAS_H4 = 720;
var VIRTUAL_H = 768;
var S2 = CANVAS_H4 / VIRTUAL_H;
var PANEL_TOP_V = VIRTUAL_H / 2 - 64;
var PANEL_TOP = PANEL_TOP_V * S2;
var KEY_FIRST_OFF_V = 30.4;
var KEY_SPACING_V = 47.2;
var KEY_INSET_V = 24;
var BG_LENGTH_SCALE = 1.05;
var COUNT_TEXT_HEIGHT_V = 16;
var COUNT_OVERLAP_V = 1.6;
function drawBackgroundFallback(ctx) {
  const w = 90 * S2;
  const h = 193 * BG_LENGTH_SCALE * S2;
  const x = CANVAS_W4 - w;
  const y = PANEL_TOP;
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(x, y, w, h);
}
function drawKeyFallback(ctx, cx, cy, size, tint, pressedColor) {
  const r = size / 2;
  ctx.save();
  ctx.beginPath();
  const cr = size * 0.18;
  ctx.moveTo(cx - r + cr, cy - r);
  ctx.lineTo(cx + r - cr, cy - r);
  ctx.quadraticCurveTo(cx + r, cy - r, cx + r, cy - r + cr);
  ctx.lineTo(cx + r, cy + r - cr);
  ctx.quadraticCurveTo(cx + r, cy + r, cx + r - cr, cy + r);
  ctx.lineTo(cx - r + cr, cy + r);
  ctx.quadraticCurveTo(cx - r, cy + r, cx - r, cy + r - cr);
  ctx.lineTo(cx - r, cy - r + cr);
  ctx.quadraticCurveTo(cx - r, cy - r, cx - r + cr, cy - r);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  if (tint > 0) {
    ctx.fillStyle = pressedColor;
    ctx.globalAlpha = tint;
    ctx.fill();
  }
  ctx.restore();
}
function drawCount(ctx, images, scorePrefix, count, cx, cy, heightCanvas, overlapCanvas) {
  const text = String(count);
  const digits = Array.from(text);
  const bmps = [];
  let allBitmap = true;
  for (const d of digits) {
    const asset = skinAsset(images, `scoreentry-${d}`) ?? skinAsset(images, `${scorePrefix}-${d}`);
    if (asset === null) {
      allBitmap = false;
      break;
    }
    bmps.push(asset.bmp);
  }
  if (allBitmap) {
    const widths = bmps.map((b) => b.width / b.height * heightCanvas);
    const totalW = widths.reduce((s, w) => s + w, 0) - overlapCanvas * (digits.length - 1);
    let x = cx - totalW / 2;
    const y = cy - heightCanvas / 2;
    for (let i = 0; i < digits.length; i++) {
      ctx.drawImage(bmps[i], x, y, widths[i], heightCanvas);
      x += widths[i] - overlapCanvas;
    }
    return;
  }
  ctx.save();
  ctx.font = `bold ${Math.round(heightCanvas * 0.85)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.fillText(text, cx, cy);
  ctx.restore();
}
function drawKeyPanel(ctx, states, skin) {
  const images = skin?.images;
  const bgAsset = skinAsset(images, "inputoverlay-background");
  if (bgAsset !== null) {
    const nw = bgAsset.bmp.width / bgAsset.div;
    const nh = bgAsset.bmp.height / bgAsset.div;
    const w = nw * S2;
    const h = nh * S2;
    ctx.save();
    ctx.translate(CANVAS_W4, PANEL_TOP);
    ctx.rotate(Math.PI / 2);
    ctx.scale(BG_LENGTH_SCALE, 1);
    ctx.drawImage(bgAsset.bmp, 0, 0, w, h);
    ctx.restore();
  } else {
    drawBackgroundFallback(ctx);
  }
  const keyAsset = skinAsset(images, "inputoverlay-key");
  const keyNativeW = keyAsset !== null ? keyAsset.bmp.width / keyAsset.div : 46;
  const keyNativeH = keyAsset !== null ? keyAsset.bmp.height / keyAsset.div : 46;
  const keyCanvasW = keyNativeW * S2;
  const keyCanvasH = keyNativeH * S2;
  const cx = CANVAS_W4 - KEY_INSET_V * S2;
  const scorePrefix = skin?.config.scorePrefix ?? "score";
  for (let k = 0; k < states.length; k++) {
    const st = states[k];
    const cy = PANEL_TOP + (KEY_FIRST_OFF_V + k * KEY_SPACING_V) * S2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(st.scale, st.scale);
    if (keyAsset !== null) {
      const x = -keyCanvasW / 2;
      const y = -keyCanvasH / 2;
      ctx.drawImage(keyAsset.bmp, x, y, keyCanvasW, keyCanvasH);
      if (st.tint > 0) {
        ctx.save();
        ctx.globalAlpha = st.tint;
        ctx.drawImage(tintBitmap3(keyAsset.bmp, st.pressedColor), x, y, keyCanvasW, keyCanvasH);
        ctx.restore();
      }
    } else {
      drawKeyFallback(ctx, 0, 0, keyCanvasW, st.tint, st.pressedColor);
    }
    drawCount(ctx, images, scorePrefix, st.count, 0, 0, COUNT_TEXT_HEIGHT_V * S2, COUNT_OVERLAP_V * S2);
    ctx.restore();
  }
}
function drawKeyOverlay(ctx, replay, timeMs, skin) {
  const { frames } = replay;
  if (frames.length === 0)
    return;
  const times = getCumulativeTimes2(frames);
  const idx = findFrameIndex2(times, timeMs);
  const timelines = getTimelines(frames);
  const counts = getPressCounts(frames);
  const states = [];
  for (let k = 0; k < KEY_DEFS.length; k++) {
    const { scale, tint } = computeKeyState(timelines[k], timeMs);
    const count = idx >= 0 ? counts[k][idx] ?? 0 : 0;
    states.push({ scale, tint, count, pressedColor: KEY_DEFS[k].pressedColor });
  }
  drawKeyPanel(ctx, states, skin);
}
var CATCH_KEY_COLORS = ["#ffde00", "#ffde00", "#f8009e"];
var _catchTimelines = /* @__PURE__ */ new WeakMap();
var _catchCounts = /* @__PURE__ */ new WeakMap();
var _catchTimes = /* @__PURE__ */ new WeakMap();
function buildCatchData(path) {
  const times = new Array(path.length);
  for (let i = 0; i < path.length; i++)
    times[i] = path[i].time;
  const { timelines, counts } = buildKeyTimelines(times, 3, (i, k) => {
    if (k === 2)
      return path[i].dash;
    if (i >= path.length - 1)
      return false;
    const dx = path[i + 1].x - path[i].x;
    return k === 0 ? dx < 0 : dx > 0;
  });
  return {
    timelines,
    counts,
    times
  };
}
function getCatchData(path) {
  const cached = _catchTimelines.get(path);
  if (cached === void 0) {
    const built = buildCatchData(path);
    _catchTimelines.set(path, built.timelines);
    _catchCounts.set(path, built.counts);
    _catchTimes.set(path, built.times);
    return built;
  }
  return { timelines: cached, counts: _catchCounts.get(path), times: _catchTimes.get(path) };
}
function drawCatchKeyOverlay(ctx, path, timeMs, skin) {
  if (path.length === 0)
    return;
  const { timelines, counts, times } = getCatchData(path);
  const idx = findFrameIndex2(times, timeMs);
  const states = [];
  for (let k = 0; k < 3; k++) {
    const { scale, tint } = computeKeyState(timelines[k], timeMs);
    const count = idx >= 0 ? counts[k][idx] ?? 0 : 0;
    states.push({ scale, tint, count, pressedColor: CATCH_KEY_COLORS[k] });
  }
  drawKeyPanel(ctx, states, skin);
}

// src/renderer/FlashlightRenderer.ts
var DEFAULT_FL_SIZE2 = 168;
var INTRO_START_SIZE = DEFAULT_FL_SIZE2 * 8;
var BREAK_SIZE = DEFAULT_FL_SIZE2 * 2.5;
var FL_DURATION_MS = 800;
var BREAK_MIN_DURATION2 = FL_DURATION_MS * 2;
var FOLLOW_DELAY_MS = 120;
var SLIDER_DIM = 0.8;
var DIM_TRANSITION_MS = 50;
var MAX_DIM = 1;
var CURSOR_STEP_MS = 16;
var TIER1_COMBO_MIN = 100;
var TIER2_COMBO_MIN = 200;
var TIER1_MULT = 0.8125;
var TIER2_MULT = 0.625;
function tierSize(combo) {
  if (combo > TIER2_COMBO_MIN)
    return DEFAULT_FL_SIZE2 * TIER2_MULT;
  if (combo > TIER1_COMBO_MIN)
    return DEFAULT_FL_SIZE2 * TIER1_MULT;
  return DEFAULT_FL_SIZE2;
}
function evaluateSegments(segments, t, initial) {
  if (segments.length === 0)
    return initial;
  let lo = 0;
  let hi = segments.length - 1;
  let idx = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (segments[mid].tStart <= t) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (idx < 0) {
    const first = segments[0];
    return first.vStart;
  }
  const seg = segments[idx];
  if (t >= seg.tEnd)
    return seg.vEnd;
  const u = (t - seg.tStart) / (seg.tEnd - seg.tStart);
  const eu = seg.ease === "outQuad" ? 1 - (1 - u) * (1 - u) : u;
  return seg.vStart + (seg.vEnd - seg.vStart) * eu;
}
function addTimelineEvent(segments, initial, t, target, duration, ease) {
  const startVal = evaluateSegments(segments, t, initial);
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    if (last.tEnd > t) {
      last.tEnd = t;
      last.vEnd = startVal;
    }
  }
  segments.push({ tStart: t, tEnd: t + duration, vStart: startVal, vEnd: target, ease });
}
function buildCumTimes2(frames) {
  const out = new Array(frames.length);
  let acc = 0;
  for (let i = 0; i < frames.length; i++) {
    acc += frames[i].timeDelta;
    out[i] = acc;
  }
  return out;
}
function cursorAtTime(frames, cumTimes, t, hintIdx) {
  let idx = hintIdx;
  while (idx + 1 < frames.length && cumTimes[idx + 1] <= t)
    idx++;
  if (idx >= frames.length - 1) {
    const f = frames[frames.length - 1];
    return { x: f.x, y: f.y, idx };
  }
  const t0 = cumTimes[idx];
  const t1 = cumTimes[idx + 1];
  const dt = t1 - t0;
  const frac = dt < 1e-6 ? 0 : (t - t0) / dt;
  const f0 = frames[idx];
  const f1 = frames[idx + 1];
  return {
    x: f0.x + (f1.x - f0.x) * frac,
    y: f0.y + (f1.y - f0.y) * frac,
    idx
  };
}
function buildSmoothedCursor(replay) {
  const frames = replay.frames;
  if (frames.length === 0) {
    return { startTimeMs: 0, stepMs: CURSOR_STEP_MS, xs: new Float32Array(0), ys: new Float32Array(0) };
  }
  const cumTimes = buildCumTimes2(frames);
  const tFirst = cumTimes[0];
  const tLast = cumTimes[cumTimes.length - 1];
  const span = Math.max(0, tLast - tFirst);
  const numSteps = Math.ceil(span / CURSOR_STEP_MS) + 1;
  const xs = new Float32Array(numSteps);
  const ys = new Float32Array(numSteps);
  let sx = frames[0].x;
  let sy = frames[0].y;
  xs[0] = sx;
  ys[0] = sy;
  const uStep = Math.min(CURSOR_STEP_MS, FOLLOW_DELAY_MS) / FOLLOW_DELAY_MS;
  const eStep = 1 - (1 - uStep) * (1 - uStep);
  let hintIdx = 0;
  for (let i = 1; i < numSteps; i++) {
    const t = tFirst + i * CURSOR_STEP_MS;
    const c = cursorAtTime(frames, cumTimes, t, hintIdx);
    hintIdx = c.idx;
    sx = sx + (c.x - sx) * eStep;
    sy = sy + (c.y - sy) * eStep;
    xs[i] = sx;
    ys[i] = sy;
  }
  return { startTimeMs: tFirst, stepMs: CURSOR_STEP_MS, xs, ys };
}
function smoothedAt(sc, timeMs) {
  const n = sc.xs.length;
  if (n === 0)
    return { x: 256, y: 192 };
  const idxF = (timeMs - sc.startTimeMs) / sc.stepMs;
  if (idxF <= 0)
    return { x: sc.xs[0], y: sc.ys[0] };
  if (idxF >= n - 1)
    return { x: sc.xs[n - 1], y: sc.ys[n - 1] };
  const i = Math.floor(idxF);
  const frac = idxF - i;
  return {
    x: sc.xs[i] + (sc.xs[i + 1] - sc.xs[i]) * frac,
    y: sc.ys[i] + (sc.ys[i + 1] - sc.ys[i]) * frac
  };
}
var _falloffBitmap = null;
function getFalloffBitmap() {
  if (_falloffBitmap !== null)
    return _falloffBitmap;
  const SIZE = 512;
  const osc = new OffscreenCanvas(SIZE, SIZE);
  const ctx = osc.getContext("2d");
  const cx = SIZE / 2;
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = 1 - Math.pow(u, 5);
    grad.addColorStop(u, `rgba(0, 0, 0, ${a})`);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);
  _falloffBitmap = osc;
  return osc;
}
function buildSizeTimeline2(beatmap, modDiff, hitResults) {
  const segments = [];
  const hos = beatmap.hitObjects;
  if (hos.length === 0)
    return segments;
  const mapStart = hos[0].time;
  const lastObj = hos[hos.length - 1];
  const lastEnd = "endTime" in lastObj ? lastObj.endTime : lastObj.time;
  const mapEndAt = lastEnd + modDiff.hitWindow50 + 5;
  addTimelineEvent(
    segments,
    INTRO_START_SIZE,
    mapStart - FL_DURATION_MS,
    DEFAULT_FL_SIZE2,
    FL_DURATION_MS,
    "outQuad"
  );
  const events = [];
  const comboFrames = computeComboTimeline(hitResults);
  for (const cf of comboFrames)
    events.push({ kind: "combo", t: cf.time, combo: cf.combo });
  for (const b of beatmap.breaks) {
    if (b.endTime - b.startTime > BREAK_MIN_DURATION2) {
      events.push({ kind: "breakStart", t: b.startTime });
      events.push({ kind: "breakEndPrep", t: b.endTime - FL_DURATION_MS });
    }
  }
  events.sort((a, b) => {
    if (a.t !== b.t)
      return a.t - b.t;
    const rank = (k) => k === "combo" ? 0 : k === "breakStart" ? 1 : 2;
    return rank(a.kind) - rank(b.kind);
  });
  let comboTarget = DEFAULT_FL_SIZE2;
  for (const e of events) {
    if (e.kind === "combo") {
      const target = tierSize(e.combo);
      if (target !== comboTarget) {
        comboTarget = target;
        addTimelineEvent(
          segments,
          INTRO_START_SIZE,
          e.t,
          target,
          FL_DURATION_MS,
          "outQuad"
        );
      }
    } else if (e.kind === "breakStart") {
      addTimelineEvent(
        segments,
        INTRO_START_SIZE,
        e.t,
        BREAK_SIZE,
        FL_DURATION_MS,
        "outQuad"
      );
    } else {
      addTimelineEvent(
        segments,
        INTRO_START_SIZE,
        e.t,
        comboTarget,
        FL_DURATION_MS,
        "outQuad"
      );
    }
  }
  addTimelineEvent(
    segments,
    INTRO_START_SIZE,
    mapEndAt,
    INTRO_START_SIZE,
    FL_DURATION_MS,
    "outQuad"
  );
  return segments;
}
function buildDimTimeline(trackingIntervals) {
  const segments = [];
  for (const iv of trackingIntervals) {
    addTimelineEvent(segments, 0, iv.start, SLIDER_DIM, DIM_TRANSITION_MS, "linear");
    addTimelineEvent(segments, 0, iv.end, 0, DIM_TRANSITION_MS, "linear");
  }
  return segments;
}
var Flashlight = class {
  constructor(beatmap, replay, modDiff, hitResults, trackingIntervals, qualityTotal = 1) {
    this.timelines = {
      sizeSegments: buildSizeTimeline2(beatmap, modDiff, hitResults),
      dimSegments: buildDimTimeline(trackingIntervals),
      smoothed: buildSmoothedCursor(replay)
    };
    this.falloff = getFalloffBitmap();
    this.buffer = new OffscreenCanvas(CANVAS_W3 * qualityTotal, CANVAS_H3 * qualityTotal);
    const bctx = this.buffer.getContext("2d");
    if (bctx === null)
      throw new Error("Flashlight: failed to get 2D context on buffer canvas");
    bctx.scale(qualityTotal, qualityTotal);
    this.bctx = bctx;
  }
  /** Composite the darkness-with-beam overlay onto `ctx` (logical 1280×720 coords) for the
   * given beatmap time. Call after gameplay is drawn, before HUD layers. */
  draw(ctx, timeMs) {
    const size = evaluateSegments(this.timelines.sizeSegments, timeMs, INTRO_START_SIZE);
    const dim = evaluateSegments(this.timelines.dimSegments, timeMs, 0);
    const pos = smoothedAt(this.timelines.smoothed, timeMs);
    const cx = OFFSET_X + pos.x * SCALE2;
    const cy = OFFSET_Y + pos.y * SCALE2;
    const d = size * SCALE2 * 2;
    const bctx = this.bctx;
    bctx.globalCompositeOperation = "source-over";
    bctx.globalAlpha = 1;
    bctx.clearRect(0, 0, CANVAS_W3, CANVAS_H3);
    bctx.fillStyle = `rgba(0, 0, 0, ${MAX_DIM})`;
    bctx.fillRect(0, 0, CANVAS_W3, CANVAS_H3);
    bctx.globalCompositeOperation = "destination-out";
    bctx.globalAlpha = 1 - dim;
    bctx.drawImage(this.falloff, cx - d / 2, cy - d / 2, d, d);
    bctx.globalCompositeOperation = "source-over";
    bctx.globalAlpha = 1;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.drawImage(this.buffer, 0, 0, CANVAS_W3, CANVAS_H3);
    ctx.restore();
  }
};

// src/rulesets/std/index.ts
var _hdFlipCache = /* @__PURE__ */ new WeakMap();
function effectiveModDiff(s, modHidden) {
  if (modHidden === s.modDiff.isHD)
    return s.modDiff;
  let md = _hdFlipCache.get(s);
  if (md === void 0) {
    md = { ...s.modDiff, isHD: !s.modDiff.isHD };
    _hdFlipCache.set(s, md);
  }
  return md;
}
var _flCache2 = /* @__PURE__ */ new WeakMap();
function stdFlashlight(s) {
  if (s.flashlight !== null)
    return s.flashlight;
  let fl2 = _flCache2.get(s);
  if (fl2 === void 0) {
    fl2 = new Flashlight(s.beatmap, s.replay, s.modDiff, s.hitResults, s.trackingIntervals, s.qualityTotal);
    _flCache2.set(s, fl2);
  }
  return fl2;
}
var stdRuleset = {
  build(beatmap, replay, modDiff, skin, qualityTotal) {
    const { results, spinnerAngles, trackingIntervals } = computeHitResults(beatmap, replay, modDiff);
    const accFrames = computeAccTimeline(results);
    const comboFrames = computeComboTimeline(results);
    const scoreFrames = computeScoreTimeline(results, beatmap, modDiff);
    const urTimeline = computeURTimeline(results, beatmap, modDiff);
    const flashlight = modDiff.isFL ? new Flashlight(beatmap, replay, modDiff, results, trackingIntervals, qualityTotal) : null;
    return {
      beatmap,
      replay,
      modDiff,
      skin,
      hitResults: results,
      spinnerAngles,
      trackingIntervals,
      flashlight,
      accFrames,
      comboFrames,
      scoreFrames,
      urTimeline,
      qualityTotal
    };
  },
  draw(ctx, s, timeMs, options) {
    const md = effectiveModDiff(s, options.modHidden);
    if (options.showFollowpoints)
      drawFollowpoints(ctx, s.beatmap, s.skin, timeMs, md);
    drawHitObjects(ctx, s.beatmap, s.skin, timeMs, s.hitResults, s.spinnerAngles, md, s.qualityTotal);
    drawJudgements(ctx, s.hitResults, timeMs, s.skin, "std", md.circleRadiusPx);
    if (options.modFlashlight)
      stdFlashlight(s).draw(ctx, timeMs);
  },
  drawAboveStoryboard(ctx, s, timeMs, options) {
    drawCursor(ctx, s.replay, timeMs, s.skin);
    if (options.showKeyOverlay)
      drawKeyOverlay(ctx, s.replay, timeMs, s.skin);
  },
  hitResults: (s) => s.hitResults,
  scoreFrames: (s) => s.scoreFrames,
  accFrames: (s) => s.accFrames,
  comboFrames: (s) => s.comboFrames,
  urTimeline: (s) => s.urTimeline
};

// src/rulesets/taiko/index.ts
var taikoRuleset = {
  build(beatmap, replay, modDiff, skin, _qualityTotal) {
    console.assert(
      beatmap.mode === 1 || beatmap.mode === 0,
      `taikoRuleset received unsupported beatmap.mode=${beatmap.mode}`
    );
    const objects = convertBeatmapToTaiko(beatmap);
    const inputEvents = replay.mode === 1 ? taikoFrames(replay) : [];
    const barLines = computeBarLineTimes(beatmap);
    const isConstantSpeed = false;
    const smFactor = taikoScrollMultiplier(modDiff);
    const objectVel = new Array(objects.length);
    let minVel = Infinity;
    for (let i = 0; i < objects.length; i++) {
      const v = scrollVelocityAt(beatmap, objects[i].time, isConstantSpeed, smFactor);
      objectVel[i] = v;
      if (v > 0 && v < minVel)
        minVel = v;
    }
    const barLineVel = new Array(barLines.length);
    for (let i = 0; i < barLines.length; i++) {
      const v = scrollVelocityAt(beatmap, barLines[i], isConstantSpeed, smFactor);
      barLineVel[i] = v;
      if (v > 0 && v < minVel)
        minVel = v;
    }
    const maxScrollMs = isFinite(minVel) && minVel > 0 ? LANE_WIDTH_PX / minVel : 5e3;
    const session = {
      beatmap,
      replay,
      modDiff,
      skin,
      objects,
      inputEvents,
      ghostTaps: [],
      barLines,
      objectVel,
      barLineVel,
      maxScrollMs,
      hitResults: [],
      accFrames: [],
      comboFrames: [],
      scoreFrames: [],
      swellProgress: /* @__PURE__ */ new Map(),
      hitJudgmentByNote: /* @__PURE__ */ new Map(),
      flashlight: null,
      urTimeline: { hits: [], zones: [] }
    };
    const { results: hitResults, ghostTaps } = computeTaikoHitResults(session, modDiff);
    const swellSrc = /* @__PURE__ */ new Set();
    for (const o of objects)
      if (o.kind === "swell")
        swellSrc.add(o.sourceIndex);
    const swellProgress = /* @__PURE__ */ new Map();
    for (const r of hitResults) {
      if (!r.comboIgnore || !swellSrc.has(r.objectIndex))
        continue;
      let entry = swellProgress.get(r.objectIndex);
      if (entry === void 0) {
        entry = { tickTimes: [] };
        swellProgress.set(r.objectIndex, entry);
      }
      if (r.strong)
        entry.completionTime = r.time;
      else
        entry.tickTimes.push(r.time);
    }
    const hitJudgmentByNote = /* @__PURE__ */ new Map();
    for (const r of hitResults) {
      if (r.comboIgnore || r.noteId === void 0)
        continue;
      hitJudgmentByNote.set(r.noteId, { time: r.time, judgement: r.judgement });
    }
    const sessionWithResults = {
      ...session,
      hitResults,
      ghostTaps,
      swellProgress,
      hitJudgmentByNote
    };
    const accFrames = computeTaikoAccTimeline(hitResults);
    const comboFrames = computeComboTimeline(hitResults);
    const scoreFrames = modDiff.isLazer ? computeTaikoScoreV2Timeline(sessionWithResults, modDiff) : computeTaikoScoreV1Timeline(sessionWithResults, modDiff);
    const flashlight = modDiff.isFL ? new TaikoFlashlight(beatmap, comboFrames) : null;
    const urTimeline = computeTaikoURTimeline(objects, hitResults, modDiff);
    return { ...sessionWithResults, accFrames, comboFrames, scoreFrames, flashlight, urTimeline };
  },
  draw(ctx, s, timeMs, options) {
    drawTaikoPlayfield(ctx, s, timeMs, options);
    if (options.showJudgement && !hasTaikoExplosion(s.skin)) {
      drawJudgements(ctx, s.hitResults, timeMs, s.skin, "taiko");
    }
  },
  hitResults: (s) => s.hitResults,
  scoreFrames: (s) => s.scoreFrames,
  accFrames: (s) => s.accFrames,
  comboFrames: (s) => s.comboFrames,
  urTimeline: (s) => s.urTimeline
};

// src/rulesets/mania/scroll.ts
var DEFAULT_BEAT_LENGTH2 = 1e3;
function mostCommonBeatLength(beatmap) {
  const red = beatmap.timingPoints.filter((tp) => !tp.inherited);
  if (red.length === 0)
    return DEFAULT_BEAT_LENGTH2;
  let lastTime = 0;
  for (const obj of beatmap.hitObjects) {
    const t = obj.type === "spinner" ? obj.endTime : obj.time;
    if (t > lastTime)
      lastTime = t;
  }
  for (const h of beatmap.maniaHolds)
    if (h.endTime > lastTime)
      lastTime = h.endTime;
  const durByLen = /* @__PURE__ */ new Map();
  for (let i = 0; i < red.length; i++) {
    const tp = red[i];
    const currentTime = i === 0 ? 0 : tp.time;
    const nextTime = i === red.length - 1 ? lastTime : red[i + 1].time;
    const key = Math.round(tp.beatLength * 1e3) / 1e3;
    durByLen.set(key, (durByLen.get(key) ?? 0) + (nextTime - currentTime));
  }
  let bestLen = DEFAULT_BEAT_LENGTH2;
  let bestDur = -Infinity;
  for (const [len, dur] of durByLen) {
    if (dur > bestDur) {
      bestDur = dur;
      bestLen = len;
    }
  }
  return bestLen > 0 ? bestLen : DEFAULT_BEAT_LENGTH2;
}
function buildManiaScroll(beatmap) {
  const tps = beatmap.timingPoints;
  const mostCommon = mostCommonBeatLength(beatmap);
  const times = [];
  const multipliers = [];
  let currentBeatLength = DEFAULT_BEAT_LENGTH2;
  let currentScrollSpeed = 1;
  for (const tp of tps) {
    if (tp.inherited) {
      currentScrollSpeed = tp.beatLength < 0 ? 100 / -tp.beatLength : 1;
    } else {
      currentBeatLength = tp.beatLength > 0 ? tp.beatLength : DEFAULT_BEAT_LENGTH2;
      currentScrollSpeed = 1;
    }
    const mult = currentScrollSpeed * mostCommon / currentBeatLength;
    if (times.length > 0 && times[times.length - 1] === tp.time) {
      multipliers[multipliers.length - 1] = mult;
    } else {
      times.push(tp.time);
      multipliers.push(mult);
    }
  }
  if (times.length === 0) {
    times.push(0);
    multipliers.push(1);
  }
  const cumRaw = new Array(times.length);
  cumRaw[0] = 0;
  for (let i = 1; i < times.length; i++) {
    cumRaw[i] = cumRaw[i - 1] + (times[i] - times[i - 1]) * multipliers[i - 1];
  }
  return { times, multipliers, cumRaw };
}
function lastIndexLE(arr, key) {
  if (key < arr[0])
    return 0;
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >>> 1;
    if (arr[mid] <= key)
      lo = mid;
    else
      hi = mid - 1;
  }
  return lo;
}
function scrollRawAt(scroll, t) {
  const k = lastIndexLE(scroll.times, t);
  return scroll.cumRaw[k] + (t - scroll.times[k]) * scroll.multipliers[k];
}
function scrollTimeAtRaw(scroll, raw) {
  const k = lastIndexLE(scroll.cumRaw, raw);
  return scroll.times[k] + (raw - scroll.cumRaw[k]) / scroll.multipliers[k];
}

// src/rulesets/mania/Playfield.ts
var LOGICAL_W2 = 1280;
var LOGICAL_H2 = 720;
var COLUMN_WIDTH = 80;
var SPECIAL_COLUMN_WIDTH = 70;
var COLUMN_SPACING = 0;
var HIT_TARGET_OFFSET_FROM_BOTTOM = 110;
var DEFAULT_LIGHT_POSITION_OFFSET_FROM_BOTTOM = (480 - 413) * (LOGICAL_H2 / 480);
var MAX_TIME_RANGE = 11485;
var SKIN_SCALE = LOGICAL_H2 / 480;
var LAZER_SPRITE_SCALE = LOGICAL_H2 / 768;
var DEFAULT_COLUMN_LINE_WIDTH = 2;
var DEFAULT_COLUMN_LINE_COLOUR = "#ffffffff";
var DEFAULT_JUDGEMENT_LINE_COLOUR = "#ffffffff";
var JUDGEMENT_LINE_ALPHA = 0.9;
var JUDGEMENT_LINE_HEIGHT = 2;
var COLUMN_LINE_SCALE_X = 0.74;
var DEFAULT_LIGHT_FRAME_PER_SECOND = 60;
var BODY_STYLE_STRETCH = 0;
var TALL_BODY_ASPECT = 4;
function isSpecialColumn(stage, absCol) {
  if (stage.columns % 2 !== 1)
    return false;
  const offset = absCol - stage.firstColumnIndex;
  return offset === Math.floor(stage.columns / 2);
}
function textureSuffixFor(stage, absCol) {
  if (isSpecialColumn(stage, absCol))
    return "S";
  const distLeft = absCol - stage.firstColumnIndex;
  const distRight = stage.firstColumnIndex + stage.columns - 1 - absCol;
  const distToEdge = Math.min(distLeft, distRight);
  return distToEdge % 2 === 0 ? "1" : "2";
}
function findManiaSection(skin, totalColumns) {
  const sections = skin?.config.maniaSections;
  if (sections === void 0)
    return void 0;
  for (const s of sections)
    if (s.keys === totalColumns)
      return s;
  return void 0;
}
function maniaSkinUpsideDown(skin, totalColumns) {
  return findManiaSection(skin, totalColumns)?.upsideDown === true;
}
function bodyStyleIsRepeat(section) {
  const explicit = section?.noteBodyStyle;
  return explicit !== void 0 && explicit !== BODY_STYLE_STRETCH;
}
function stageLightFrameLengthMs(section) {
  const fps = section?.lightFramePerSecond ?? DEFAULT_LIGHT_FRAME_PER_SECOND;
  return 1e3 / fps;
}
function resolveColumnStems(section, absCol, suffix) {
  const sfx = suffix.toLowerCase();
  const lookups = section?.imageLookups;
  const noteKey = `noteimage${absCol}`;
  const noteHeadKey = `noteimage${absCol}h`;
  const noteTailKey = `noteimage${absCol}t`;
  const noteBodyKey = `noteimage${absCol}l`;
  const keyKey = `keyimage${absCol}`;
  const keyDownKey = `keyimage${absCol}d`;
  const explicitNote = lookups?.[noteKey];
  const explicitHead = lookups?.[noteHeadKey];
  const explicitTail = lookups?.[noteTailKey];
  const explicitBody = lookups?.[noteBodyKey];
  const explicitKey = lookups?.[keyKey];
  const explicitKD = lookups?.[keyDownKey];
  const bodyStem = explicitBody ?? `mania-note${sfx}l`;
  const noteStem = explicitNote ?? `mania-note${sfx}`;
  const headStem = explicitHead ?? explicitNote ?? `mania-note${sfx}h`;
  const tailStem = explicitTail ?? explicitHead ?? explicitNote ?? `mania-note${sfx}t`;
  const keyStem = explicitKey ?? `mania-key${sfx}`;
  const keyDownStem = explicitKD ?? `mania-key${sfx}d`;
  return { noteStem, headStem, tailStem, bodyStem, keyStem, keyDownStem };
}
function buildManiaLayout(stages, totalColumns, skin) {
  const section = findManiaSection(skin, totalColumns);
  const columnWidthsPx = new Array(totalColumns);
  const stage0 = stages[0];
  for (let c = 0; c < totalColumns; c++) {
    const special = isSpecialColumn(stage0, c);
    const skinW = section?.columnWidth?.[c];
    columnWidthsPx[c] = skinW !== void 0 && skinW > 0 ? skinW * SKIN_SCALE : special ? SPECIAL_COLUMN_WIDTH : COLUMN_WIDTH;
  }
  const columnSpacingsPx = new Array(Math.max(0, totalColumns - 1));
  for (let i = 0; i < columnSpacingsPx.length; i++) {
    const skinSpacing = section?.columnSpacing?.[i];
    columnSpacingsPx[i] = skinSpacing !== void 0 && skinSpacing > 0 ? skinSpacing * SKIN_SCALE : COLUMN_SPACING;
  }
  let stageContentWidth = 0;
  for (let c = 0; c < totalColumns; c++) {
    stageContentWidth += columnWidthsPx[c];
    if (c < totalColumns - 1)
      stageContentWidth += columnSpacingsPx[c];
  }
  const stageLeftX = Math.round((LOGICAL_W2 - stageContentWidth) / 2);
  const columns = new Array(totalColumns);
  let cursor = stageLeftX;
  for (let c = 0; c < totalColumns; c++) {
    const special = isSpecialColumn(stage0, c);
    const suffix = textureSuffixFor(stage0, c);
    const stems = resolveColumnStems(section, c, suffix);
    columns[c] = {
      x: cursor,
      width: columnWidthsPx[c],
      isSpecial: special,
      textureSuffix: suffix,
      ...stems
    };
    cursor += columnWidthsPx[c];
    if (c < totalColumns - 1)
      cursor += columnSpacingsPx[c];
  }
  let hitOffsetFromBottom = HIT_TARGET_OFFSET_FROM_BOTTOM;
  if (section?.hitPosition !== void 0) {
    const clamped = Math.max(240, Math.min(480, section.hitPosition));
    hitOffsetFromBottom = (480 - clamped) * SKIN_SCALE;
  }
  const hitTargetY = LOGICAL_H2 - hitOffsetFromBottom;
  return {
    columns,
    stageLeftX,
    stageRightX: cursor,
    hitTargetY,
    scrollLength: hitTargetY
  };
}
function positionYAt(scroll, rNow, objectTime, timeRange, layout) {
  const position = (scrollRawAt(scroll, objectTime) - rNow) / timeRange * layout.scrollLength;
  return layout.hitTargetY - position;
}
var VISIBLE_AHEAD_PX = 250;
var VISIBLE_BEHIND_PX = 300;
function visibleTimeWindow(scroll, rNow, timeRange, layout) {
  const rawPerPx = timeRange / layout.scrollLength;
  const maxTime = scrollTimeAtRaw(scroll, rNow + (layout.scrollLength + VISIBLE_AHEAD_PX) * rawPerPx);
  const minTime = scrollTimeAtRaw(scroll, rNow - VISIBLE_BEHIND_PX * rawPerPx);
  return { minTime, maxTime };
}
function stripAt2x(stem) {
  return stem.replace(/@2x/gi, "");
}
function skinImg3(skin, stem) {
  if (skin === void 0 || stem === "")
    return void 0;
  const s = stripAt2x(stem);
  return skin.images.get(`${s}@2x.png`) ?? skin.images.get(`${s}.png`);
}
function skinSpriteNatural2(skin, stem) {
  if (skin === void 0 || stem === "")
    return void 0;
  const s = stripAt2x(stem);
  const at2x = skin.images.get(`${s}@2x.png`);
  if (at2x !== void 0 && at2x.width > 1)
    return { bitmap: at2x, pixelScale: 0.5 };
  const at1x = skin.images.get(`${s}.png`);
  if (at1x !== void 0 && at1x.width > 1)
    return { bitmap: at1x, pixelScale: 1 };
  return void 0;
}
function resolveReceptorSprite(skin, stem) {
  if (skin === void 0 || stem === "")
    return void 0;
  const s = stripAt2x(stem);
  const at2x = skin.images.get(`${s}@2x.png`);
  if (at2x !== void 0)
    return at2x.width > 1 ? { bitmap: at2x, pixelScale: 0.5 } : null;
  const at1x = skin.images.get(`${s}.png`);
  if (at1x !== void 0)
    return at1x.width > 1 ? { bitmap: at1x, pixelScale: 1 } : null;
  return void 0;
}
var tintCache = /* @__PURE__ */ new WeakMap();
function tintSprite(bitmap, tintHex) {
  let bucket = tintCache.get(bitmap);
  if (bucket === void 0) {
    bucket = /* @__PURE__ */ new Map();
    tintCache.set(bitmap, bucket);
  }
  const cached = bucket.get(tintHex);
  if (cached !== void 0)
    return cached;
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const sctx = canvas.getContext("2d");
  if (sctx === null)
    return bitmap;
  sctx.drawImage(bitmap, 0, 0);
  sctx.globalCompositeOperation = "multiply";
  sctx.fillStyle = tintHex;
  sctx.fillRect(0, 0, bitmap.width, bitmap.height);
  sctx.globalCompositeOperation = "destination-in";
  sctx.drawImage(bitmap, 0, 0);
  bucket.set(tintHex, canvas);
  return canvas;
}
function resolveStem(skin, primary, fallback) {
  const first = skinImg3(skin, primary);
  if (first !== void 0)
    return first;
  if (fallback !== void 0 && fallback !== primary)
    return skinImg3(skin, fallback);
  return void 0;
}
function findVisibleObjectRange(objects, minTime, maxTime, maxHoldDurationMs) {
  const n = objects.length;
  if (n === 0)
    return { firstIdx: 0, lastIdx: -1 };
  const widenedMinStart = minTime - maxHoldDurationMs;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    const o = objects[mid];
    const start = o.kind === "note" ? o.time : o.startTime;
    if (start < widenedMinStart)
      lo = mid + 1;
    else
      hi = mid;
  }
  const firstIdx = lo;
  if (firstIdx >= n)
    return { firstIdx, lastIdx: firstIdx - 1 };
  const firstStart = objects[firstIdx].kind === "note" ? objects[firstIdx].time : objects[firstIdx].startTime;
  if (firstStart > maxTime)
    return { firstIdx, lastIdx: firstIdx - 1 };
  lo = firstIdx;
  hi = n - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >>> 1;
    const o = objects[mid];
    const start = o.kind === "note" ? o.time : o.startTime;
    if (start <= maxTime)
      lo = mid;
    else
      hi = mid - 1;
  }
  return { firstIdx, lastIdx: lo };
}
function findVisibleBarLineRange(barLines, minTime, maxTime) {
  const n = barLines.length;
  if (n === 0)
    return { firstIdx: 0, lastIdx: -1 };
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (barLines[mid].time < minTime)
      lo = mid + 1;
    else
      hi = mid;
  }
  const firstIdx = lo;
  if (firstIdx >= n || barLines[firstIdx].time > maxTime) {
    return { firstIdx, lastIdx: firstIdx - 1 };
  }
  lo = firstIdx;
  hi = n - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >>> 1;
    if (barLines[mid].time <= maxTime)
      lo = mid;
    else
      hi = mid - 1;
  }
  return { firstIdx, lastIdx: lo };
}
function drawColumnBackground(ctx, layout, section) {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(layout.stageLeftX, 0, layout.stageRightX - layout.stageLeftX, LOGICAL_H2);
  for (let i = 0; i < layout.columns.length; i++) {
    const col = layout.columns[i];
    const colour = section?.colours[i];
    ctx.fillStyle = colour ?? "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(col.x, 0, col.width, LOGICAL_H2);
  }
}
function drawStageChrome(ctx, layout, skin, section) {
  const stageWidth = layout.stageRightX - layout.stageLeftX;
  const leftStem = section?.imageLookups["stageleft"] ?? "mania-stage-left";
  const rightStem = section?.imageLookups["stageright"] ?? "mania-stage-right";
  const leftSpr = skinImg3(skin, leftStem);
  const rightSpr = skinImg3(skin, rightStem);
  if (leftSpr !== void 0 && leftSpr.width > 1) {
    const aspect = leftSpr.width / leftSpr.height;
    const w = LOGICAL_H2 * aspect;
    ctx.drawImage(leftSpr, layout.stageLeftX - w, 0, w, LOGICAL_H2);
  }
  if (rightSpr !== void 0 && rightSpr.width > 1) {
    const aspect = rightSpr.width / rightSpr.height;
    const w = LOGICAL_H2 * aspect;
    ctx.drawImage(rightSpr, layout.stageRightX, 0, w, LOGICAL_H2);
  }
  const hintStem = section?.imageLookups["stagehint"] ?? "mania-stage-hint";
  const hint = skinImg3(skin, hintStem);
  if (hint !== void 0 && hint.width > 1) {
    const aspect = hint.height / hint.width;
    const h = stageWidth * aspect;
    ctx.drawImage(hint, layout.stageLeftX, layout.hitTargetY - h / 2, stageWidth, h);
  }
  const judgementLineOn = section?.judgementLine ?? true;
  if (judgementLineOn) {
    const colour = section?.judgementLineColour ?? DEFAULT_JUDGEMENT_LINE_COLOUR;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = prevAlpha * JUDGEMENT_LINE_ALPHA;
    ctx.fillStyle = colour;
    ctx.fillRect(
      layout.stageLeftX,
      layout.hitTargetY - JUDGEMENT_LINE_HEIGHT / 2,
      stageWidth,
      JUDGEMENT_LINE_HEIGHT
    );
    ctx.globalAlpha = prevAlpha;
  }
}
function drawColumnLines(ctx, layout, section) {
  const totalColumns = layout.columns.length;
  const widths = section?.columnLineWidth;
  const colour = section?.colourColumnLine ?? DEFAULT_COLUMN_LINE_COLOUR;
  for (let i = 0; i <= totalColumns; i++) {
    const raw = widths !== void 0 ? widths[i] : DEFAULT_COLUMN_LINE_WIDTH;
    if (raw === void 0 || raw <= 0)
      continue;
    const w = raw * SKIN_SCALE * COLUMN_LINE_SCALE_X;
    let cx;
    if (i === 0) {
      cx = layout.columns[0].x;
    } else if (i === totalColumns) {
      cx = layout.columns[totalColumns - 1].x + layout.columns[totalColumns - 1].width;
    } else {
      const left = layout.columns[i - 1];
      const right = layout.columns[i];
      cx = (left.x + left.width + right.x) / 2;
    }
    ctx.fillStyle = colour;
    ctx.fillRect(cx - w / 2, 0, w, layout.hitTargetY);
  }
}
function drawStageBottom(ctx, layout, skin) {
  const stageWidth = layout.stageRightX - layout.stageLeftX;
  const bottom = skinImg3(skin, "mania-stage-bottom");
  if (bottom !== void 0) {
    const aspect = bottom.height / bottom.width;
    const h = stageWidth * aspect;
    ctx.drawImage(bottom, layout.stageLeftX, LOGICAL_H2 - h, stageWidth, h);
  }
}
function drawKeyReceptors(ctx, layout, skin, heldByCol) {
  const hitAreaH = LOGICAL_H2 - layout.hitTargetY;
  for (let i = 0; i < layout.columns.length; i++) {
    const col = layout.columns[i];
    const isHeld = heldByCol[i] === true;
    const stem = isHeld ? col.keyDownStem : col.keyStem;
    const fallback = isHeld ? `mania-key${col.textureSuffix.toLowerCase()}d` : `mania-key${col.textureSuffix.toLowerCase()}`;
    let natural;
    for (const cand of [stem, fallback, isHeld ? "mania-key1d" : "mania-key1"]) {
      natural = resolveReceptorSprite(skin, cand);
      if (natural !== void 0)
        break;
    }
    if (natural != null) {
      const nativeH = natural.bitmap.height * natural.pixelScale * LAZER_SPRITE_SCALE;
      ctx.drawImage(natural.bitmap, col.x, LOGICAL_H2 - nativeH, col.width, nativeH);
    } else if (natural === void 0) {
      ctx.fillStyle = isHeld ? "rgba(160, 160, 200, 0.95)" : "rgba(80, 80, 100, 0.85)";
      ctx.fillRect(col.x, layout.hitTargetY, col.width, hitAreaH);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(col.x + 0.5, layout.hitTargetY + 0.5, col.width - 1, hitAreaH - 1);
    }
  }
}
function drawBarLines2(ctx, barLines, scroll, rNow, timeRange, layout, section) {
  const barH = section?.barlineHeight ?? 1;
  if (barH <= 0)
    return;
  const { minTime, maxTime } = visibleTimeWindow(scroll, rNow, timeRange, layout);
  const { firstIdx, lastIdx } = findVisibleBarLineRange(barLines, minTime, maxTime);
  if (lastIdx < firstIdx)
    return;
  const x0 = layout.stageLeftX;
  const x1 = layout.stageRightX;
  for (let i = firstIdx; i <= lastIdx; i++) {
    const bl = barLines[i];
    const y = positionYAt(scroll, rNow, bl.time, timeRange, layout);
    if (y < -2 || y > layout.hitTargetY + 2)
      continue;
    if (bl.major) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
      ctx.fillRect(x0, y - barH, x1 - x0, barH * 2);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.13)";
      ctx.fillRect(x0, y, x1 - x0, barH);
    }
  }
}
function noteSpriteHeight(width, sprite, widthForNoteHeightScale) {
  if (sprite === void 0)
    return Math.round(width * 0.35);
  const heightBasis = widthForNoteHeightScale !== void 0 ? widthForNoteHeightScale * SKIN_SCALE : width;
  return heightBasis * (sprite.height / sprite.width);
}
function drawTapNote(ctx, col, yBottom, skin, widthForNoteHeightScale) {
  const spr = resolveStem(skin, col.noteStem, `mania-note${col.textureSuffix.toLowerCase()}`) ?? skinImg3(skin, "mania-note1");
  const h = noteSpriteHeight(col.width, spr, widthForNoteHeightScale);
  if (spr !== void 0) {
    ctx.drawImage(spr, col.x, yBottom - h, col.width, h);
  } else {
    ctx.fillStyle = "rgba(220, 230, 255, 0.95)";
    ctx.fillRect(col.x, yBottom - h, col.width, h);
  }
}
var BODY_ANIMATION_FRAME_MS = 30;
function resolveBodySprite(skin, primaryStem, fallbackStem, timeMs) {
  const tryStem = (stem) => {
    if (skin === void 0 || stem === "")
      return void 0;
    const direct = skinImg3(skin, stem);
    if (direct !== void 0)
      return direct;
    const frames = resolveSkinFrames2(skin, stem);
    if (frames.length === 0)
      return void 0;
    const idx = Math.floor(timeMs / BODY_ANIMATION_FRAME_MS) % frames.length;
    return frames[idx >= 0 ? idx : idx + frames.length].bitmap;
  };
  return tryStem(primaryStem) ?? tryStem(fallbackStem);
}
function drawHoldNote(ctx, col, yHead, yTail, skin, widthForNoteHeightScale, bodyRepeats, timeMs) {
  const headSpr = resolveStem(skin, col.headStem, `mania-note${col.textureSuffix.toLowerCase()}`) ?? skinImg3(skin, "mania-note1");
  const bodySpr = resolveBodySprite(
    skin,
    col.bodyStem,
    `mania-note${col.textureSuffix.toLowerCase()}l`,
    timeMs
  ) ?? skinImg3(skin, "mania-note1l") ?? headSpr;
  const headH = noteSpriteHeight(col.width, headSpr, widthForNoteHeightScale);
  const explicitTailSpr = col.tailStem !== col.headStem ? resolveStem(skin, col.tailStem) : void 0;
  const tailSpr = explicitTailSpr ?? headSpr;
  const tailH = noteSpriteHeight(col.width, tailSpr, widthForNoteHeightScale);
  const bodyTopY = yTail - tailH / 2;
  const bodyBottomY = yHead - headH / 2;
  const bodyH = bodyBottomY - bodyTopY;
  if (bodyH > 0 && bodySpr !== void 0) {
    if (bodySpr.height >= bodySpr.width * TALL_BODY_ASPECT) {
      const nativeFitH = col.width * (bodySpr.height / bodySpr.width);
      ctx.save();
      ctx.beginPath();
      ctx.rect(col.x, bodyTopY, col.width, bodyH);
      ctx.clip();
      ctx.drawImage(bodySpr, col.x, bodyTopY, col.width, Math.max(nativeFitH, bodyH));
      ctx.restore();
    } else if (bodyRepeats) {
      const tileH = col.width * (bodySpr.height / bodySpr.width);
      if (tileH > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(col.x, bodyTopY, col.width, bodyH);
        ctx.clip();
        for (let y = bodyBottomY; y > bodyTopY; y -= tileH) {
          ctx.drawImage(bodySpr, col.x, y - tileH, col.width, tileH);
        }
        ctx.restore();
      }
    } else {
      ctx.drawImage(bodySpr, col.x, bodyTopY, col.width, bodyH);
    }
  }
  if (tailSpr !== void 0) {
    ctx.save();
    ctx.translate(col.x + col.width / 2, yTail - tailH / 2);
    ctx.scale(1, -1);
    ctx.drawImage(tailSpr, -col.width / 2, -tailH / 2, col.width, tailH);
    ctx.restore();
  } else {
    ctx.fillStyle = "rgba(220, 230, 255, 0.95)";
    ctx.fillRect(col.x, yTail - tailH, col.width, tailH);
  }
  if (headSpr !== void 0) {
    ctx.drawImage(headSpr, col.x, yHead - headH, col.width, headH);
  } else {
    ctx.fillStyle = "rgba(220, 230, 255, 0.95)";
    ctx.fillRect(col.x, yHead - headH, col.width, headH);
  }
}
function drawObjects(ctx, session, rNow, timeMs, timeRange, section) {
  const { objects, layout, scroll, maxHoldDurationMs, holdStates } = session;
  const { minTime, maxTime } = visibleTimeWindow(scroll, rNow, timeRange, layout);
  const { firstIdx, lastIdx } = findVisibleObjectRange(objects, minTime, maxTime, maxHoldDurationMs);
  if (lastIdx < firstIdx)
    return;
  const bodyRepeats = bodyStyleIsRepeat(section);
  const heightScale = section?.widthForNoteHeightScale;
  for (let i = firstIdx; i <= lastIdx; i++) {
    const o = objects[i];
    const col = layout.columns[o.column];
    if (col === void 0)
      continue;
    if (o.kind === "note") {
      if (o.time < minTime)
        continue;
      const r = session.noteResultByIndex.get(o.sourceIndex);
      if (r !== void 0 && r.judgement > 0 && timeMs >= r.time)
        continue;
      const y = positionYAt(scroll, rNow, o.time, timeRange, layout);
      if (y < -200 || y > layout.hitTargetY + 200)
        continue;
      drawTapNote(ctx, col, y, session.skin, heightScale);
    } else {
      if (o.endTime < minTime)
        continue;
      const yTail = positionYAt(scroll, rNow, o.endTime, timeRange, layout);
      if (yTail > layout.hitTargetY + 200)
        continue;
      const st = holdStates.get(o.sourceIndex);
      const headHit = st !== void 0 && st.headJudgement > 0 && st.pressedAt !== null;
      const releasedAt = st?.releasedAt ?? null;
      const completionTime = releasedAt ?? o.endTime;
      if (headHit && timeMs >= completionTime)
        continue;
      const isCurrentlyHeld = headHit && timeMs >= st.pressedAt && timeMs < completionTime;
      let yHead;
      if (isCurrentlyHeld) {
        yHead = layout.hitTargetY;
      } else {
        yHead = positionYAt(scroll, rNow, o.startTime, timeRange, layout);
      }
      const yTailDraw = isCurrentlyHeld ? Math.min(yTail, layout.hitTargetY) : yTail;
      drawHoldNote(ctx, col, yHead, yTailDraw, session.skin, heightScale, bodyRepeats, timeMs);
    }
  }
}
var EXPLOSION_FADE_IN_MS2 = 80;
var EXPLOSION_FADE_OUT_MS2 = 120;
var EXPLOSION_TOTAL_MS = EXPLOSION_FADE_IN_MS2 + EXPLOSION_FADE_OUT_MS2;
var EXPLOSION_ANIM_TOTAL_MS = 170;
var MIN_FRAME_LENGTH_MS = 1e3 / 60;
var STAGE_LIGHT_FADE_OUT_MS = 250;
var POPUP_FADE_IN_MS = 20;
var POPUP_HOLD_MS = 160;
var POPUP_FADE_OUT_MS = 40;
var POPUP_TOTAL_MS = POPUP_FADE_IN_MS + POPUP_HOLD_MS + POPUP_FADE_OUT_MS;
function currentOrLastInterval(intervals, time) {
  if (intervals.length === 0)
    return null;
  let lo = 0, hi = intervals.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (intervals[mid].start <= time)
      lo = mid + 1;
    else
      hi = mid;
  }
  return lo === 0 ? null : intervals[lo - 1];
}
function isHeldAt(intervals, time) {
  const iv = currentOrLastInterval(intervals, time);
  return iv !== null && time >= iv.start && time < iv.end;
}
function resolveSkinFrames2(skin, stem) {
  if (skin === void 0 || stem === "")
    return [];
  const frames = [];
  for (let i = 0; ; i++) {
    const f = skinSpriteNatural2(skin, `${stem}-${i}`);
    if (f === void 0)
      break;
    frames.push(f);
  }
  if (frames.length > 0)
    return frames;
  const single = skinSpriteNatural2(skin, stem);
  return single !== void 0 ? [single] : [];
}
function explosionFrameLengthMs(frameCount) {
  if (frameCount <= 1)
    return EXPLOSION_ANIM_TOTAL_MS;
  return Math.max(MIN_FRAME_LENGTH_MS, EXPLOSION_ANIM_TOTAL_MS / frameCount);
}
function pickFrame(frames, ageMs, frameLenMs, loop = false) {
  if (frames.length === 1)
    return frames[0];
  const raw = Math.max(0, Math.floor(ageMs / frameLenMs));
  const idx = loop ? raw % frames.length : Math.min(frames.length - 1, raw);
  return frames[idx];
}
function drawFrameNatural(ctx, frame, cx, cy, scale) {
  const w = frame.bitmap.width * frame.pixelScale * scale;
  const h = frame.bitmap.height * frame.pixelScale * scale;
  ctx.drawImage(frame.bitmap, cx - w / 2, cy - h / 2, w, h);
}
function explosionAlpha(ageMs) {
  if (ageMs < 0 || ageMs >= EXPLOSION_TOTAL_MS)
    return 0;
  if (ageMs < EXPLOSION_FADE_IN_MS2)
    return ageMs / EXPLOSION_FADE_IN_MS2;
  return 1 - (ageMs - EXPLOSION_FADE_IN_MS2) / EXPLOSION_FADE_OUT_MS2;
}
function drawHitExplosions2(ctx, session, timeMs, section) {
  const { hitResults, objectIndexToColumn, layout, skin } = session;
  if (hitResults.length === 0)
    return;
  const stem = section?.imageLookups["lightingn"] ?? "lightingn";
  const frames = resolveSkinFrames2(skin, stem);
  if (frames.length === 0)
    return;
  const frameLenMs = explosionFrameLengthMs(frames.length);
  const minT = timeMs - EXPLOSION_TOTAL_MS;
  let lo = 0, hi = hitResults.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (hitResults[mid].time < minT)
      lo = mid + 1;
    else
      hi = mid;
  }
  const prevComposite = ctx.globalCompositeOperation;
  const prevAlpha = ctx.globalAlpha;
  ctx.globalCompositeOperation = "lighter";
  for (let i = lo; i < hitResults.length; i++) {
    const r = hitResults[i];
    if (r.time > timeMs)
      break;
    if (r.judgement === 0)
      continue;
    if (r.subResult === "body")
      continue;
    const col = objectIndexToColumn.get(r.objectIndex);
    if (col === void 0)
      continue;
    const layoutCol = layout.columns[col];
    if (layoutCol === void 0)
      continue;
    const age = timeMs - r.time;
    const a = explosionAlpha(age);
    if (a <= 0)
      continue;
    const frame = pickFrame(frames, age, frameLenMs);
    ctx.globalAlpha = prevAlpha * a;
    drawFrameNatural(
      ctx,
      frame,
      layoutCol.x + layoutCol.width / 2,
      layout.hitTargetY,
      1
    );
  }
  ctx.globalAlpha = prevAlpha;
  ctx.globalCompositeOperation = prevComposite;
}
function drawHoldLights(ctx, session, timeMs, section) {
  const { objects, holdStates, layout, skin } = session;
  if (holdStates.size === 0)
    return;
  const stem = section?.imageLookups["lightingl"] ?? "lightingl";
  const frames = resolveSkinFrames2(skin, stem);
  if (frames.length === 0)
    return;
  const frameLenMs = explosionFrameLengthMs(frames.length);
  const prevComposite = ctx.globalCompositeOperation;
  const prevAlpha = ctx.globalAlpha;
  ctx.globalCompositeOperation = "lighter";
  for (const o of objects) {
    if (o.kind !== "hold")
      continue;
    const st = holdStates.get(o.sourceIndex);
    if (st === void 0)
      continue;
    if (st.pressedAt === null)
      continue;
    if (st.headJudgement === 0)
      continue;
    const holdEnd = st.releasedAt === null ? o.endTime : Math.min(st.releasedAt, o.endTime);
    if (timeMs < st.pressedAt)
      continue;
    const fadeOutEnd = holdEnd + EXPLOSION_FADE_OUT_MS2;
    if (timeMs >= fadeOutEnd)
      continue;
    let alpha;
    if (timeMs < st.pressedAt + EXPLOSION_FADE_IN_MS2) {
      alpha = (timeMs - st.pressedAt) / EXPLOSION_FADE_IN_MS2;
    } else if (timeMs < holdEnd) {
      alpha = 1;
    } else {
      alpha = 1 - (timeMs - holdEnd) / EXPLOSION_FADE_OUT_MS2;
    }
    if (alpha <= 0)
      continue;
    const col = layout.columns[o.column];
    if (col === void 0)
      continue;
    const age = timeMs - st.pressedAt;
    const frame = pickFrame(frames, age, frameLenMs, true);
    ctx.globalAlpha = prevAlpha * alpha;
    drawFrameNatural(ctx, frame, col.x + col.width / 2, layout.hitTargetY, 1);
  }
  ctx.globalAlpha = prevAlpha;
  ctx.globalCompositeOperation = prevComposite;
}
function drawStageLights(ctx, session, timeMs, section) {
  const { layout, pressIntervals, skin } = session;
  const lightStem = section?.imageLookups["stagelight"] ?? "mania-stage-light";
  const frames = resolveSkinFrames2(skin, lightStem);
  if (frames.length === 0)
    return;
  const frameLenMs = stageLightFrameLengthMs(section);
  const lightOffsetFromBottom = section?.lightPosition !== void 0 ? (480 - section.lightPosition) * SKIN_SCALE : DEFAULT_LIGHT_POSITION_OFFSET_FROM_BOTTOM;
  const lightBottomY = LOGICAL_H2 - lightOffsetFromBottom;
  for (let i = 0; i < layout.columns.length; i++) {
    const col = layout.columns[i];
    const iv = currentOrLastInterval(pressIntervals[i] ?? [], timeMs);
    if (iv === null)
      continue;
    let alpha;
    let vScale;
    if (timeMs < iv.end) {
      alpha = 1;
      vScale = 1;
    } else {
      const sinceRelease = timeMs - iv.end;
      if (sinceRelease >= STAGE_LIGHT_FADE_OUT_MS)
        continue;
      const t = sinceRelease / STAGE_LIGHT_FADE_OUT_MS;
      alpha = 1 - t;
      vScale = 1 - t;
    }
    if (alpha <= 0)
      continue;
    const ageMs = timeMs - iv.start;
    const frame = pickFrame(frames, ageMs, frameLenMs, true);
    const naturalH = frame.bitmap.height * frame.pixelScale;
    const drawH = naturalH * vScale;
    if (drawH <= 0)
      continue;
    const tint = section?.coloursLight[i];
    const img = tint !== void 0 ? tintSprite(frame.bitmap, tint) : frame.bitmap;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = prevAlpha * alpha;
    ctx.drawImage(img, col.x, lightBottomY - drawH, col.width, drawH);
    ctx.globalAlpha = prevAlpha;
  }
}
function popupStemFor(judgement) {
  switch (judgement) {
    case 305:
      return "mania-hit300g";
    case 300:
      return "mania-hit300";
    case 200:
      return "mania-hit200";
    case 100:
      return "mania-hit100";
    case 50:
      return "mania-hit50";
    default:
      return "mania-hit0";
  }
}
function popupTransform(ageMs, isMiss) {
  if (ageMs < 0 || ageMs >= POPUP_TOTAL_MS)
    return { alpha: 0, scale: 1, rot: 0 };
  let alpha;
  if (ageMs < POPUP_FADE_IN_MS) {
    alpha = ageMs / POPUP_FADE_IN_MS;
  } else if (ageMs < POPUP_FADE_IN_MS + POPUP_HOLD_MS) {
    alpha = 1;
  } else {
    alpha = 1 - (ageMs - POPUP_FADE_IN_MS - POPUP_HOLD_MS) / POPUP_FADE_OUT_MS;
  }
  let scale;
  let rot = 0;
  if (isMiss) {
    const t = Math.min(1, ageMs / 80);
    scale = 1.2 - 0.2 * t;
    rot = 0;
  } else {
    if (ageMs < 40)
      scale = 0.8 + 0.2 * (ageMs / 40);
    else if (ageMs < 100)
      scale = 1 - 0.15 * ((ageMs - 40) / 60);
    else
      scale = 0.85 - 0.45 * Math.min(1, (ageMs - 100) / (POPUP_TOTAL_MS - 100));
  }
  return { alpha, scale, rot };
}
function drawJudgementPopups(ctx, session, timeMs, section, upscroll) {
  const { hitResults, layout } = session;
  if (hitResults.length === 0)
    return;
  const minT = timeMs - POPUP_TOTAL_MS;
  let lo = 0, hi = hitResults.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (hitResults[mid].time < minT)
      lo = mid + 1;
    else
      hi = mid;
  }
  let chosen = null;
  for (let i = hitResults.length - 1; i >= lo; i--) {
    const r = hitResults[i];
    if (r.time > timeMs)
      continue;
    if (r.subResult === "body")
      continue;
    chosen = r;
    break;
  }
  if (chosen === null)
    return;
  const age = timeMs - chosen.time;
  const isMiss = chosen.judgement === 0;
  const { alpha, scale } = popupTransform(age, isMiss);
  if (alpha <= 0)
    return;
  const stem = popupStemFor(chosen.judgement);
  const frames = resolveSkinFrames2(session.skin, stem);
  if (frames.length === 0)
    return;
  const frameLen = frames.length > 1 ? 50 : POPUP_TOTAL_MS;
  const frame = pickFrame(frames, age, frameLen);
  const scorePositionPx = (section?.scorePosition ?? 300) * SKIN_SCALE;
  const popupY = upscroll ? LOGICAL_H2 - scorePositionPx : scorePositionPx;
  const stageCx = (layout.stageLeftX + layout.stageRightX) / 2;
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * alpha;
  drawFrameNatural(ctx, frame, stageCx, popupY, scale);
  ctx.globalAlpha = prevAlpha;
}
function computeHeldByColumn(session, timeMs) {
  const held = new Array(session.totalColumns);
  for (let c = 0; c < session.totalColumns; c++) {
    held[c] = isHeldAt(session.pressIntervals[c] ?? [], timeMs);
  }
  return held;
}
var REFERENCE_PLAYFIELD_HEIGHT = 768;
var COVER_FADE_FRACTION = 0.25;
var COVER_COMBO_MIN_PX = 160;
var COVER_COMBO_MAX_PX = 400;
var COVER_COMBO_INCREASE_PER_COMBO = 0.5;
var FL_DEFAULT_SIZE = 50;
var FL_SMOOTHNESS2 = 1.1;
var FL_BREAK_MULTIPLIER = 2.5;
var FL_SCALE = LOGICAL_H2 / REFERENCE_PLAYFIELD_HEIGHT;
var coverLayer = null;
function getCoverLayer() {
  coverLayer ?? (coverLayer = new OffscreenCanvas(LOGICAL_W2, LOGICAL_H2));
  return { canvas: coverLayer, ctx: coverLayer.getContext("2d") };
}
function comboAtTime(comboFrames, timeMs) {
  let lo = 0, hi = comboFrames.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (comboFrames[mid].time <= timeMs) {
      idx = mid;
      lo = mid + 1;
    } else
      hi = mid - 1;
  }
  return idx >= 0 ? comboFrames[idx].combo : 0;
}
function isManiaBreak(breaks, timeMs) {
  for (const b of breaks)
    if (timeMs >= b.startTime && timeMs <= b.endTime)
      return true;
  return false;
}
function resolveManiaCover(session, timeMs, options) {
  const m = session.modDiff;
  if (options.modCover) {
    return { along: m.coverAlong, coverage: m.coverCoverage };
  }
  if (options.modHidden || options.modFadeIn) {
    if (isManiaBreak(session.beatmap.breaks, timeMs))
      return null;
    const combo = comboAtTime(session.comboFrames, timeMs);
    const px = Math.min(COVER_COMBO_MAX_PX, COVER_COMBO_MIN_PX + combo * COVER_COMBO_INCREASE_PER_COMBO);
    return { along: options.modFadeIn, coverage: px / REFERENCE_PLAYFIELD_HEIGHT };
  }
  return null;
}
function buildCoverGradient(ctx, h, spec) {
  const c = Math.max(0, Math.min(1, spec.coverage));
  const f = COVER_FADE_FRACTION;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  const stop = (o, a) => g.addColorStop(Math.max(0, Math.min(1, o)), `rgba(255,255,255,${a})`);
  if (spec.along) {
    stop(0, 1);
    stop(c, 1);
    stop(c + f, 0);
    stop(1, 0);
  } else {
    stop(0, 0);
    stop(1 - c - f, 0);
    stop(1 - c, 1);
    stop(1, 1);
  }
  return g;
}
function drawManiaFlashlight(ctx, layout, combo, isBreak, sizeMult) {
  const comboScale2 = combo >= 200 ? 0.625 : combo >= 100 ? 0.8125 : 1;
  const sizePx = FL_DEFAULT_SIZE * sizeMult * (isBreak ? FL_BREAK_MULTIPLIER : comboScale2);
  const halfH = sizePx * FL_SCALE;
  const centerY = LOGICAL_H2 / 2;
  const x = layout.stageLeftX;
  const w = layout.stageRightX - layout.stageLeftX;
  const inner = halfH;
  const outer = halfH * FL_SMOOTHNESS2;
  const g = ctx.createLinearGradient(0, 0, 0, LOGICAL_H2);
  const at = (y, a) => g.addColorStop(Math.max(0, Math.min(1, y / LOGICAL_H2)), `rgba(0,0,0,${a})`);
  at(0, 1);
  at(centerY - outer, 1);
  at(centerY - inner, 0);
  at(centerY + inner, 0);
  at(centerY + outer, 1);
  at(LOGICAL_H2, 1);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x, 0, w, LOGICAL_H2);
  ctx.restore();
}
function drawManiaPlayfield(ctx, session, timeMs, options) {
  const showJudgement = options.showJudgement;
  const speed = Math.max(1, Math.min(40, options.maniaScrollSpeed));
  const timeRange = MAX_TIME_RANGE / speed;
  const upscroll = options.maniaUpscroll;
  const { layout, scroll } = session;
  const rNow = scrollRawAt(scroll, timeMs);
  const section = findManiaSection(session.skin, session.totalColumns);
  if (upscroll) {
    ctx.save();
    ctx.translate(0, LOGICAL_H2);
    ctx.scale(1, -1);
  }
  drawColumnBackground(ctx, layout, section);
  drawColumnLines(ctx, layout, section);
  const keysUnderNotes = section?.keysUnderNotes ?? false;
  const heldByCol = computeHeldByColumn(session, timeMs);
  if (keysUnderNotes) {
    drawKeyReceptors(ctx, layout, session.skin, heldByCol);
  }
  const stageWidth = layout.stageRightX - layout.stageLeftX;
  ctx.save();
  ctx.beginPath();
  ctx.rect(layout.stageLeftX, 0, stageWidth, layout.hitTargetY);
  ctx.clip();
  drawBarLines2(ctx, session.barLines, scroll, rNow, timeRange, layout, section);
  ctx.restore();
  const cover = resolveManiaCover(session, timeMs, options);
  if (cover) {
    const { canvas: layer, ctx: lctx } = getCoverLayer();
    lctx.clearRect(0, 0, LOGICAL_W2, LOGICAL_H2);
    lctx.save();
    lctx.beginPath();
    lctx.rect(layout.stageLeftX, 0, stageWidth, layout.hitTargetY);
    lctx.clip();
    drawObjects(lctx, session, rNow, timeMs, timeRange, section);
    lctx.globalCompositeOperation = "destination-out";
    lctx.fillStyle = buildCoverGradient(lctx, layout.scrollLength, cover);
    lctx.fillRect(layout.stageLeftX, 0, stageWidth, layout.scrollLength);
    lctx.restore();
    ctx.drawImage(layer, 0, 0);
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.rect(layout.stageLeftX, 0, stageWidth, layout.hitTargetY);
    ctx.clip();
    drawObjects(ctx, session, rNow, timeMs, timeRange, section);
    ctx.restore();
  }
  drawStageChrome(ctx, layout, session.skin, section);
  drawStageLights(ctx, session, timeMs, section);
  if (!keysUnderNotes) {
    drawKeyReceptors(ctx, layout, session.skin, heldByCol);
  }
  drawStageBottom(ctx, layout, session.skin);
  drawHoldLights(ctx, session, timeMs, section);
  drawHitExplosions2(ctx, session, timeMs, section);
  if (upscroll)
    ctx.restore();
  if (showJudgement)
    drawJudgementPopups(ctx, session, timeMs, section, upscroll);
  if (options.modFlashlight) {
    const combo = comboAtTime(session.comboFrames, timeMs);
    const isBreak = isManiaBreak(session.beatmap.breaks, timeMs);
    drawManiaFlashlight(ctx, layout, combo, isBreak, 1);
  }
  if (showJudgement) {
    const comboPositionRaw = section?.comboPosition ?? 111;
    const comboBaseY = comboPositionRaw * SKIN_SCALE;
    const comboCy = upscroll ? LOGICAL_H2 - comboBaseY : comboBaseY;
    const stageCx = (layout.stageLeftX + layout.stageRightX) / 2;
    drawManiaCombo(ctx, session.comboFrames, timeMs, stageCx, comboCy, session.skin);
  }
}

// src/rulesets/mania/index.ts
var maniaRuleset = {
  build(beatmap, replay, modDiff, skin, _qualityTotal) {
    console.assert(
      beatmap.mode === 3,
      `maniaRuleset received unsupported beatmap.mode=${beatmap.mode}`
    );
    const { stages, totalColumns, objects } = convertBeatmapToMania(beatmap, modDiff);
    const barLines = computeManiaBarLines(beatmap);
    const inputEvents = replay.mode === 3 ? maniaFrames(replay, totalColumns) : [];
    const layout = buildManiaLayout(stages, totalColumns, skin);
    const scroll = buildManiaScroll(beatmap);
    let maxHoldDurationMs = 0;
    for (const o of objects) {
      if (o.kind === "hold") {
        const d = o.endTime - o.startTime;
        if (d > maxHoldDurationMs)
          maxHoldDurationMs = d;
      }
    }
    const pressIntervals = Array.from(
      { length: totalColumns },
      () => []
    );
    const openPress = new Array(totalColumns).fill(null);
    for (const ev of inputEvents) {
      const col = ev.column;
      if (col < 0 || col >= totalColumns)
        continue;
      if (ev.kind === "press") {
        if (openPress[col] === null)
          openPress[col] = ev.time;
      } else {
        const start = openPress[col];
        if (start !== null && start !== void 0) {
          pressIntervals[col].push({ start, end: ev.time });
          openPress[col] = null;
        }
      }
    }
    for (let c = 0; c < totalColumns; c++) {
      const start = openPress[c];
      if (start !== null && start !== void 0) {
        pressIntervals[c].push({ start, end: Number.POSITIVE_INFINITY });
      }
    }
    const objectIndexToColumn = /* @__PURE__ */ new Map();
    for (const o of objects)
      objectIndexToColumn.set(o.sourceIndex, o.column);
    const samplesBySource = /* @__PURE__ */ new Map();
    for (const o of objects)
      samplesBySource.set(o.sourceIndex, o.hitSample);
    const preliminarySession = {
      beatmap,
      replay,
      modDiff,
      skin,
      stages,
      totalColumns,
      defaultUpscroll: maniaSkinUpsideDown(skin, totalColumns),
      objects,
      barLines,
      inputEvents,
      layout,
      scroll,
      maxHoldDurationMs,
      pressIntervals,
      objectIndexToColumn,
      samplesBySource,
      holdStates: /* @__PURE__ */ new Map(),
      hitResults: [],
      noteResultByIndex: /* @__PURE__ */ new Map(),
      accFrames: [],
      comboFrames: [],
      scoreFrames: [],
      urTimeline: { hits: [], zones: [] }
    };
    const { results: hitResults, holdStates } = computeManiaHitResults(preliminarySession, modDiff);
    const noteResultByIndex = /* @__PURE__ */ new Map();
    for (const r of hitResults) {
      if (r.subResult === void 0)
        noteResultByIndex.set(r.objectIndex, r);
    }
    const accFrames = computeManiaAccTimeline(hitResults, modDiff);
    const comboFrames = computeManiaComboTimeline(hitResults, objects, modDiff);
    const scoreFrames = computeManiaScoreTimeline(hitResults, objects, modDiff);
    const urTimeline = computeManiaURTimeline(objects, hitResults, modDiff);
    return { ...preliminarySession, hitResults, holdStates, noteResultByIndex, accFrames, comboFrames, scoreFrames, urTimeline };
  },
  draw(ctx, s, timeMs, options) {
    drawManiaPlayfield(ctx, s, timeMs, options);
  },
  hitResults: (s) => s.hitResults,
  scoreFrames: (s) => s.scoreFrames,
  accFrames: (s) => s.accFrames,
  comboFrames: (s) => s.comboFrames,
  urTimeline: (s) => s.urTimeline
};

// src/rulesets/catch/Flashlight.ts
var CANVAS_W5 = 1280;
var CANVAS_H5 = 720;
var DEFAULT_FL_SIZE3 = 203.125;
var SIZE_MULTIPLIER2 = 1;
var FL_SMOOTHNESS3 = 1.4;
var FL_FADE_MS2 = 800;
var BREAK_SCALE2 = 2.5;
var COMBO_TIER1_MIN2 = 100;
var COMBO_TIER2_MIN2 = 200;
var COMBO_TIER1_MULT2 = 0.885;
var COMBO_TIER2_MULT2 = 0.77;
var BREAK_MIN_DURATION3 = FL_FADE_MS2 * 2;
function comboTierMult2(combo) {
  if (combo >= COMBO_TIER2_MIN2)
    return COMBO_TIER2_MULT2;
  if (combo >= COMBO_TIER1_MIN2)
    return COMBO_TIER1_MULT2;
  return 1;
}
function evalSegments2(segments, t, initial) {
  if (segments.length === 0)
    return initial;
  let lo = 0, hi = segments.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (segments[mid].tStart <= t) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (idx < 0)
    return segments[0].vStart;
  const seg = segments[idx];
  if (t >= seg.tEnd)
    return seg.vEnd;
  const u = (t - seg.tStart) / (seg.tEnd - seg.tStart);
  return seg.vStart + (seg.vEnd - seg.vStart) * u;
}
function addEvent2(segments, initial, t, target) {
  const startVal = evalSegments2(segments, t, initial);
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    if (last.tEnd > t) {
      last.tEnd = t;
      last.vEnd = startVal;
    }
  }
  segments.push({ tStart: t, tEnd: t + FL_FADE_MS2, vStart: startVal, vEnd: target });
}
function buildSizeTimeline3(beatmap, comboFrames) {
  const segments = [];
  const baseSize = DEFAULT_FL_SIZE3 * SIZE_MULTIPLIER2;
  const events = [];
  let lastTier = 1;
  for (const cf of comboFrames) {
    const tier = comboTierMult2(cf.combo);
    if (tier !== lastTier) {
      events.push({ kind: "combo", t: cf.time, combo: cf.combo });
      lastTier = tier;
    }
  }
  for (const b of beatmap.breaks) {
    if (b.endTime - b.startTime > BREAK_MIN_DURATION3) {
      events.push({ kind: "breakStart", t: b.startTime });
      events.push({ kind: "breakEndPrep", t: b.endTime - FL_FADE_MS2 });
    }
  }
  events.sort((a, b) => {
    if (a.t !== b.t)
      return a.t - b.t;
    const rank = (k) => k === "combo" ? 0 : k === "breakStart" ? 1 : 2;
    return rank(a.kind) - rank(b.kind);
  });
  let comboTarget = baseSize;
  for (const e of events) {
    if (e.kind === "combo") {
      const newTarget = baseSize * comboTierMult2(e.combo);
      if (newTarget !== comboTarget) {
        comboTarget = newTarget;
        addEvent2(segments, baseSize, e.t, newTarget);
      }
    } else if (e.kind === "breakStart") {
      addEvent2(segments, baseSize, e.t, baseSize * BREAK_SCALE2);
    } else {
      addEvent2(segments, baseSize, e.t, comboTarget);
    }
  }
  return segments;
}
var CatchFlashlight = class {
  // `scale` = the catch playfield osu-px → screen-px factor (Playfield's S).
  constructor(beatmap, comboFrames, scale) {
    this.scale = scale;
    this.initialSize = DEFAULT_FL_SIZE3 * SIZE_MULTIPLIER2;
    this.sizeSegments = buildSizeTimeline3(beatmap, comboFrames);
  }
  // Darken the whole canvas with a circular reveal centred on (cx, cy) = the catcher position.
  draw(ctx, timeMs, cx, cy) {
    const sizeOsu = evalSegments2(this.sizeSegments, timeMs, this.initialSize);
    const innerR = sizeOsu * this.scale;
    if (innerR <= 0)
      return;
    const outerR = innerR * FL_SMOOTHNESS3;
    drawFlashlightReveal(ctx, cx, cy, outerR, 1 / FL_SMOOTHNESS3, 0, 0, CANVAS_W5, CANVAS_H5);
  }
};

// src/rulesets/catch/Playfield.ts
var PLAYFIELD_W2 = 512;
var OBJECT_RADIUS = 64;
var CATCHER_BASE_SIZE2 = 106.75;
var ALLOWED_CATCH_RANGE3 = 0.8;
var CANVAS_W6 = 1280;
var FALL_TOP_OSU = -100;
var CATCH_LINE_OSU = 340;
var FALL_BAND_OSU = CATCH_LINE_OSU - FALL_TOP_OSU;
var S3 = 1.4;
var SCREEN_PLAYFIELD_W = PLAYFIELD_W2 * S3;
var OFFSET_X2 = (CANVAS_W6 - SCREEN_PLAYFIELD_W) / 2;
var CATCH_LINE_Y = 628;
var CATCH_PLAYFIELD_LOGICAL_H = 384;
var COMBO_MARGIN_BOTTOM_OSU = 350;
var COMBO_CENTRE_ABOVE_LINE_OSU = COMBO_MARGIN_BOTTOM_OSU / 2 * (FALL_BAND_OSU / CATCH_PLAYFIELD_LOGICAL_H);
function screenX(effectiveX) {
  return OFFSET_X2 + effectiveX * S3;
}
function screenYFromFrac(frac) {
  return CATCH_LINE_Y - frac * FALL_BAND_OSU * S3;
}
function difficultyRange2(diff, min, mid, max2) {
  if (diff > 5)
    return mid + (max2 - mid) * (diff - 5) / 5;
  if (diff < 5)
    return mid + (mid - min) * (diff - 5) / 5;
  return mid;
}
function fallTimeMs(ar) {
  return difficultyRange2(ar, 1800, 1200, 450);
}
function hdFadeAlpha(frac) {
  if (frac >= 0.6)
    return 1;
  if (frac <= 0.44)
    return 0;
  return (frac - 0.44) / 0.16;
}
function catchWidthOsu(cs) {
  return CATCHER_BASE_SIZE2 * Math.abs(calculateScaleFromCircleSize(cs) * 2) * ALLOWED_CATCH_RANGE3;
}
function randomSingle(seed, series) {
  let h = Math.imul(Math.trunc(seed) | 0, 2654435761) + Math.imul(series | 0, 40503) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489917) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
var DEFAULT_COMBO_COLORS2 = ["#e879a0", "#68b3f0", "#f7e04a", "#90e070", "#f08040"];
var BANANA_COLORS = ["rgb(255,240,0)", "rgb(255,192,0)", "rgb(214,221,28)"];
var HYPER_COLOR = "rgb(255,0,0)";
function comboColorFor(session, indexInBeatmap) {
  const palette = session.skin.config.comboColors.length > 0 ? session.skin.config.comboColors : DEFAULT_COMBO_COLORS2;
  return palette[(indexInBeatmap + 1) % palette.length];
}
var RADIUS_ADJUST = 1.1;
var LARGE_PULP_3 = 16 * RADIUS_ADJUST;
var LARGE_PULP_4 = LARGE_PULP_3 * 0.925;
var SMALL_PULP = 8 * RADIUS_ADJUST;
var DIST_3 = 0.15;
var DIST_4 = 0.15 / 0.925;
var BORDER_THICKNESS = 6 * RADIUS_ADJUST;
var HYPER_BORDER_THICKNESS = 12 * RADIUS_ADJUST;
var PULP_LAYOUTS = [
  { topSmall: [0, -0.33], largeAngles: [60, 180, 300], largeSize: LARGE_PULP_3, largeDist: DIST_3 },
  { topSmall: [0, -0.25], largeAngles: [0, 120, 240], largeSize: LARGE_PULP_3, largeDist: DIST_3 },
  { topSmall: [0, -0.3], largeAngles: [45, 135, 225, 315], largeSize: LARGE_PULP_4, largeDist: DIST_4 },
  { topSmall: [0, -0.34], largeAngles: [0, 90, 180, 270], largeSize: LARGE_PULP_4, largeDist: DIST_4 }
];
function pulpOffset(angleDeg, dist) {
  const a = angleDeg * Math.PI / 180;
  return [dist * Math.sin(a), dist * Math.cos(a)];
}
function drawPulp(ctx, cx, cy, r, accent) {
  ctx.save();
  const a = ctx.globalAlpha;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.45 * a;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.9 * a;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function drawFruit(ctx, cx, cy, obj, accent, frac, fallMs) {
  const fruitScale = obj.scale * S3;
  const boxR = OBJECT_RADIUS * fruitScale;
  const layout = PULP_LAYOUTS[obj.indexInBeatmap % 4];
  const rotation = (randomSingle(obj.startTime, 1) - 0.5) * 40 * Math.PI / 180;
  ctx.save();
  const a = ctx.globalAlpha;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const largeR = layout.largeSize * 0.5 * fruitScale;
  for (const ang of layout.largeAngles) {
    const [ox, oy] = pulpOffset(ang, layout.largeDist);
    drawPulp(ctx, ox * boxR * 2, oy * boxR * 2, largeR, accent);
  }
  drawPulp(ctx, layout.topSmall[0] * boxR * 2, layout.topSmall[1] * boxR * 2, SMALL_PULP * 0.5 * fruitScale, accent);
  const borderAlpha = Math.max(0, Math.min(1, frac * fallMs / 500));
  if (borderAlpha > 0) {
    ctx.globalAlpha = borderAlpha * a;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = BORDER_THICKNESS * fruitScale;
    ctx.beginPath();
    ctx.arc(0, 0, boxR - BORDER_THICKNESS * fruitScale / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = a;
  }
  if (obj.hyperDash)
    drawHyperRing(ctx, boxR, HYPER_BORDER_THICKNESS * fruitScale);
  ctx.restore();
}
function drawHyperRing(ctx, boxR, thickness) {
  ctx.save();
  const a = ctx.globalAlpha;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.3 * a;
  ctx.fillStyle = HYPER_COLOR;
  ctx.beginPath();
  ctx.arc(0, 0, boxR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = HYPER_COLOR;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(0, 0, boxR - thickness / 2, 0, Math.PI * 2);
  ctx.stroke();
}
function drawDroplet(ctx, cx, cy, obj, accent) {
  const factor = obj.type === "tinyDroplet" ? 0.5 : 1;
  const r = OBJECT_RADIUS / 4 * obj.scale * factor * S3;
  ctx.save();
  const a = ctx.globalAlpha;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.9 * a;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (obj.hyperDash && obj.type === "droplet") {
    ctx.save();
    ctx.translate(cx, cy);
    drawHyperRing(ctx, r, 6 * obj.scale * S3);
    ctx.restore();
  }
}
function drawBanana(ctx, cx, cy, obj, frac) {
  const seed = obj.startTime;
  const color = BANANA_COLORS[Math.floor(randomSingle(seed, 0) * 3) % 3];
  const p = Math.max(0, Math.min(1, 1 - frac));
  const startScale = 0.6 + 1.6 * randomSingle(seed, 3);
  const scale = startScale + (0.6 - startScale) * p;
  const startAngle = 180 * (randomSingle(seed, 1) * 2 - 1);
  const endAngle = 180 * (randomSingle(seed, 2) * 2 - 1);
  const rot = (startAngle + (endAngle - startAngle) * p) * Math.PI / 180;
  const boxR = OBJECT_RADIUS * obj.scale * scale * S3;
  ctx.save();
  const a = ctx.globalAlpha;
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.9 * a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, boxR * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = a;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = BORDER_THICKNESS * obj.scale * scale * S3;
  ctx.beginPath();
  ctx.arc(0, 0, boxR - BORDER_THICKNESS * obj.scale * scale * S3 / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
function skinSprite(skin, stem) {
  const hi = skin.images.get(`${stem}@2x.png`);
  if (hi !== void 0)
    return { bitmap: hi, logW: hi.width / 2, logH: hi.height / 2 };
  const lo = skin.images.get(`${stem}.png`);
  if (lo !== void 0)
    return { bitmap: lo, logW: lo.width, logH: lo.height };
  return void 0;
}
var LEGACY_FRUIT_STEMS = ["fruit-pear", "fruit-grapes", "fruit-apple", "fruit-orange"];
var HYPER_HEX = "#ff0000";
var BANANA_TINTS = ["#fff000", "#ffc000", "#d6dd1c"];
function blitPiece(ctx, base, overlay, pxPerOsu, tintHex, hyper) {
  const bw = base.logW * pxPerOsu;
  const bh = base.logH * pxPerOsu;
  const a = ctx.globalAlpha;
  if (hyper) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.7 * a;
    const hw = bw * 1.2;
    const hh = bh * 1.2;
    ctx.drawImage(tintSprite2(base.bitmap, HYPER_HEX), -hw / 2, -hh / 2, hw, hh);
    ctx.restore();
  }
  ctx.drawImage(tintSprite2(base.bitmap, tintHex), -bw / 2, -bh / 2, bw, bh);
  if (overlay !== void 0) {
    const ow = overlay.logW * pxPerOsu;
    const oh = overlay.logH * pxPerOsu;
    ctx.drawImage(overlay.bitmap, -ow / 2, -oh / 2, ow, oh);
  }
}
function drawLegacyFruit(ctx, session, cx, cy, obj) {
  const base = skinSprite(session.skin, LEGACY_FRUIT_STEMS[obj.indexInBeatmap % 4]);
  if (base === void 0)
    return false;
  const overlay = skinSprite(session.skin, `${LEGACY_FRUIT_STEMS[obj.indexInBeatmap % 4]}-overlay`);
  const rotation = (randomSingle(obj.startTime, 1) - 0.5) * 40 * Math.PI / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  blitPiece(ctx, base, overlay, obj.scale * S3, comboColorFor(session, obj.indexInBeatmap), obj.hyperDash);
  ctx.restore();
  return true;
}
function drawLegacyDroplet(ctx, session, cx, cy, obj, frac, fallMs) {
  const base = skinSprite(session.skin, "fruit-drop");
  if (base === void 0)
    return false;
  const overlay = skinSprite(session.skin, "fruit-drop-overlay");
  const tinyFactor = obj.type === "tinyDroplet" ? 0.5 : 1;
  const startRot = randomSingle(obj.startTime, 1) * 20;
  const preemptProgress = fallMs * (1 - frac) / (fallMs + 2e3);
  const rotation = (startRot + 720 * preemptProgress) * Math.PI / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  blitPiece(
    ctx,
    base,
    overlay,
    obj.scale * S3 * 0.8 * tinyFactor,
    comboColorFor(session, obj.indexInBeatmap),
    obj.hyperDash && obj.type === "droplet"
  );
  ctx.restore();
  return true;
}
function drawLegacyBanana(ctx, session, cx, cy, obj, frac) {
  const base = skinSprite(session.skin, "fruit-bananas");
  if (base === void 0)
    return false;
  const overlay = skinSprite(session.skin, "fruit-bananas-overlay");
  const seed = obj.startTime;
  const tint = BANANA_TINTS[Math.floor(randomSingle(seed, 0) * 3) % 3];
  const p = Math.max(0, Math.min(1, 1 - frac));
  const startScale = 0.6 + 1.6 * randomSingle(seed, 3);
  const scaleAnim = startScale + (0.6 - startScale) * p;
  const startAngle = 180 * (randomSingle(seed, 1) * 2 - 1);
  const endAngle = 180 * (randomSingle(seed, 2) * 2 - 1);
  const rotation = (startAngle + (endAngle - startAngle) * p) * Math.PI / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  blitPiece(ctx, base, overlay, obj.scale * S3 * scaleAnim, tint, false);
  ctx.restore();
  return true;
}
function catcherVisualWidthOsu(cs) {
  return catchWidthOsu(cs) / ALLOWED_CATCH_RANGE3;
}
var CATCHER_RIM_Y = 16;
var CATCHER_SCALE = 1;
var CATCHER_TOP_OFFSET = 0;
function skinVersionAsNumber2(version) {
  const v = version.trim().toLowerCase();
  if (v === "")
    return 1;
  if (v === "latest")
    return Infinity;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 1;
}
function isOldStyleCatcher(skin) {
  return skinVersionAsNumber2(skin.config.version) < 2.3 && skinImg4(skin, "fruit-ryuuta") !== void 0;
}
var HYPER_TRANSITION_MS = 180;
var TRAIL_STEP_MS = 16;
var TRAIL_FADE_MS = 800;
var AFTERIMAGE_MS = 1200;
var SPLASH_MS = 400;
function outQuint(p) {
  const x = p < 0 ? 0 : p > 1 ? 1 : p;
  const inv = 1 - x;
  return 1 - inv * inv * inv * inv * inv;
}
function outSine(p) {
  return Math.sin(Math.max(0, Math.min(1, p)) * Math.PI / 2);
}
function inSine(p) {
  return 1 - Math.cos(Math.max(0, Math.min(1, p)) * Math.PI / 2);
}
function skinImg4(skin, stem) {
  return skin.images.get(`${stem}@2x.png`) ?? skin.images.get(`${stem}.png`);
}
var tintCache2 = /* @__PURE__ */ new WeakMap();
function tintSprite2(bitmap, tintHex) {
  let bucket = tintCache2.get(bitmap);
  if (bucket === void 0) {
    bucket = /* @__PURE__ */ new Map();
    tintCache2.set(bitmap, bucket);
  }
  const cached = bucket.get(tintHex);
  if (cached !== void 0)
    return cached;
  const c = new OffscreenCanvas(bitmap.width, bitmap.height);
  const cx = c.getContext("2d");
  if (cx === null)
    return bitmap;
  cx.drawImage(bitmap, 0, 0);
  cx.globalCompositeOperation = "multiply";
  cx.fillStyle = tintHex;
  cx.fillRect(0, 0, c.width, c.height);
  cx.globalCompositeOperation = "destination-in";
  cx.drawImage(bitmap, 0, 0);
  bucket.set(tintHex, c);
  return c;
}
function redTinted(bitmap) {
  return tintSprite2(bitmap, "#ff0000");
}
var _visualCache = /* @__PURE__ */ new WeakMap();
function kiaiAt(session, time) {
  let kiai = false;
  for (const tp of session.beatmap.timingPoints) {
    if (tp.time > time)
      break;
    kiai = tp.kiai;
  }
  return kiai;
}
function visualState(session) {
  let vs = _visualCache.get(session);
  if (vs !== void 0)
    return vs;
  const sorted = sortedObjects(session);
  const results = session.hitResults;
  const stateChanges = [];
  const caught = [];
  let combo = 0;
  for (let i = 0; i < sorted.length; i++) {
    const obj = sorted[i];
    const caughtHit = (results[i]?.judgement ?? 0) > 0;
    if (obj.type === "fruit" || obj.type === "droplet") {
      stateChanges.push({
        time: obj.startTime,
        state: caughtHit ? kiaiAt(session, obj.startTime) ? "kiai" : "idle" : "fail"
      });
      combo = caughtHit ? combo + 1 : 0;
    }
    if (caughtHit && obj.type !== "tinyDroplet") {
      caught.push({ time: obj.startTime, x: obj.effectiveX, type: obj.type, scale: obj.scale, indexInBeatmap: obj.indexInBeatmap, combo });
    }
  }
  const hypers = [];
  let prevIdx = -1;
  for (let i = 0; i < sorted.length; i++) {
    const obj = sorted[i];
    if (obj.type !== "fruit" && obj.type !== "droplet")
      continue;
    if (prevIdx >= 0) {
      const prev = sorted[prevIdx];
      if (prev.hyperDash && (results[prevIdx]?.judgement ?? 0) > 0) {
        hypers.push({ start: prev.startTime, end: obj.startTime });
      }
    }
    prevIdx = i;
  }
  const groups = [];
  let curSource = -1;
  for (const obj of session.objects) {
    if (obj.sourceIndex !== curSource) {
      curSource = obj.sourceIndex;
      const src = session.beatmap.hitObjects[obj.sourceIndex];
      const nc = src !== void 0 && (src.type === "circle" || src.type === "slider") ? src.newCombo : true;
      groups.push({ newCombo: nc, endTime: obj.startTime });
    } else {
      const g = groups[groups.length - 1];
      if (obj.startTime > g.endTime)
        g.endTime = obj.startTime;
    }
  }
  const clearTimes = [];
  for (let i = 0; i < groups.length; i++) {
    if (i === groups.length - 1 || groups[i + 1].newCombo)
      clearTimes.push(groups[i].endTime);
  }
  clearTimes.sort((a, b) => a - b);
  const plated = [];
  for (const c of caught) {
    if (c.type !== "fruit")
      continue;
    let lo = 0, hi = clearTimes.length - 1, ex = Infinity;
    while (lo <= hi) {
      const mid = lo + hi >> 1;
      if (clearTimes[mid] >= c.time) {
        ex = clearTimes[mid];
        hi = mid - 1;
      } else
        lo = mid + 1;
    }
    plated.push({ ...c, explodeAt: ex });
  }
  vs = { stateChanges, hypers, caught, clearTimes, plated };
  _visualCache.set(session, vs);
  return vs;
}
function catcherStateAt(vs, t) {
  const a = vs.stateChanges;
  let lo = 0, hi = a.length - 1, res = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (a[mid].time <= t) {
      res = mid;
      lo = mid + 1;
    } else
      hi = mid - 1;
  }
  return res < 0 ? "idle" : a[res].state;
}
function hyperFactorAt(vs, t) {
  const a = vs.hypers;
  let lo = 0, hi = a.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (a[mid].start <= t) {
      idx = mid;
      lo = mid + 1;
    } else
      hi = mid - 1;
  }
  let f = 0;
  for (let i = idx; i >= 0; i--) {
    const h = a[i];
    if (h.end + HYPER_TRANSITION_MS < t)
      break;
    if (t <= h.end)
      f = Math.max(f, outQuint((t - h.start) / HYPER_TRANSITION_MS));
    else
      f = Math.max(f, 1 - outQuint((t - h.end) / HYPER_TRANSITION_MS));
  }
  return f;
}
function facingAt(path, t) {
  const now = sampleCatcherX(path, t);
  for (const w of [24, 60, 140, 320]) {
    const dx = now - sampleCatcherX(path, t - w);
    if (dx > 2)
      return 1;
    if (dx < -2)
      return -1;
  }
  return 1;
}
function dashAt(path, t) {
  const n = path.length;
  if (n === 0)
    return false;
  if (t <= path[0].time)
    return path[0].dash;
  if (t >= path[n - 1].time)
    return path[n - 1].dash;
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) {
    const mid = lo + hi >> 1;
    if (path[mid].time <= t)
      lo = mid;
    else
      hi = mid;
  }
  return path[lo].dash;
}
function blitCatcher(ctx, bitmap, centreX, topY, widthScreen, facing, opts = {}) {
  const dw = widthScreen;
  const dh = widthScreen * (bitmap.height / bitmap.width);
  ctx.save();
  if (opts.additive)
    ctx.globalCompositeOperation = "lighter";
  if (opts.alpha !== void 0)
    ctx.globalAlpha = opts.alpha;
  ctx.translate(centreX, topY);
  ctx.scale(facing, 1);
  const src = opts.tintFull ? redTinted(bitmap) : bitmap;
  ctx.drawImage(src, -dw / 2, 0, dw, dh);
  if (opts.extraTint !== void 0 && opts.extraTint > 0.02 && !opts.tintFull) {
    ctx.globalAlpha = (opts.alpha ?? 1) * opts.extraTint;
    ctx.drawImage(redTinted(bitmap), -dw / 2, 0, dw, dh);
  }
  ctx.restore();
}
function drawDashTrail(ctx, session, vs, idle, timeMs, topY, widthScreen) {
  const path = session.catcherPath;
  if (path.length === 0)
    return;
  const firstT = path[0].time;
  const newest = Math.floor(timeMs / TRAIL_STEP_MS) * TRAIL_STEP_MS;
  for (let gt = newest; gt > timeMs - TRAIL_FADE_MS; gt -= TRAIL_STEP_MS) {
    if (gt < firstT)
      break;
    const hyper = hyperFactorAt(vs, gt) > 0.5;
    if (!hyper && !dashAt(path, gt))
      continue;
    const age = timeMs - gt;
    const alpha = 0.4 * (1 - outQuint(age / TRAIL_FADE_MS));
    if (alpha <= 0.01)
      continue;
    blitCatcher(
      ctx,
      idle,
      screenX(sampleCatcherX(path, gt)),
      topY,
      widthScreen,
      facingAt(path, gt),
      { alpha, additive: true, tintFull: hyper }
    );
  }
}
function drawHyperAfterimages(ctx, session, vs, idle, timeMs, topY, widthScreen) {
  const path = session.catcherPath;
  for (const h of vs.hypers) {
    if (h.start > timeMs)
      break;
    const p = (timeMs - h.start) / AFTERIMAGE_MS;
    if (p < 0 || p > 1)
      continue;
    const e = outQuint(p);
    const scale = 0.95 + (1.2 - 0.95) * e;
    const w = widthScreen * scale;
    const y = topY - 10 * S3 * e;
    blitCatcher(
      ctx,
      idle,
      screenX(sampleCatcherX(path, h.start)),
      y,
      w,
      facingAt(path, h.start),
      { alpha: 1 - p, additive: true, tintFull: true }
    );
  }
}
var EXPLOSION_STREAK_MS = 300;
var EXPLOSION_GLOW_MS = 700;
function blitExplosion(ctx, sprite, px, colourHex, xScale, yScale, alpha, unit) {
  if (alpha <= 0.01)
    return;
  const len = sprite.logW * xScale * unit;
  const wid = sprite.logH * yScale * unit;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.translate(px, CATCH_LINE_Y);
  ctx.rotate(-Math.PI / 2);
  ctx.drawImage(tintSprite2(sprite.bitmap, colourHex), 0, -wid / 2, len, wid);
  ctx.restore();
}
function drawHitExplosions3(ctx, session, vs, timeMs, catcherX) {
  const streak = skinSprite(session.skin, "scoreboard-explosion-2");
  const glow = skinSprite(session.skin, "scoreboard-explosion-1");
  if (streak === void 0 || glow === void 0) {
    drawCatchSplashes(ctx, session, vs, timeMs);
    return;
  }
  const path = session.catcherPath;
  const halfCatchOsu = catchWidthOsu(session.modDiff.cs) / 2;
  const unit = calculateScaleFromCircleSize(session.modDiff.cs) * S3;
  const start = firstCaughtAtOrAfter(vs.caught, timeMs - EXPLOSION_GLOW_MS);
  for (let i = start; i < vs.caught.length; i++) {
    const c = vs.caught[i];
    if (c.time > timeMs)
      break;
    const age = timeMs - c.time;
    const landOffset = Math.max(-halfCatchOsu, Math.min(halfCatchOsu, c.x - sampleCatcherX(path, c.time)));
    const px = screenX(catcherX + landOffset);
    const colour = c.type === "banana" ? "#fff000" : comboColorFor(session, c.indexInBeatmap);
    const comboScale2 = Math.max(0.35, Math.min(1.125, c.combo / 200));
    const gt = outQuint(Math.min(1, age / 500));
    blitExplosion(ctx, glow, px, colour, 0.9, 1 + 0.3 * gt, 1 - age / EXPLOSION_GLOW_MS, unit);
    if (c.type !== "droplet" && age <= EXPLOSION_STREAK_MS) {
      const st = outQuint(Math.min(1, age / 160));
      blitExplosion(
        ctx,
        streak,
        px,
        colour,
        1 + (16 * comboScale2 - 1) * st,
        0.9 + 0.2 * st,
        1 - age / EXPLOSION_STREAK_MS,
        unit
      );
    }
  }
}
function firstCaughtAtOrAfter(caught, t) {
  let lo = 0, hi = caught.length - 1, res = caught.length;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (caught[mid].time >= t) {
      res = mid;
      hi = mid - 1;
    } else
      lo = mid + 1;
  }
  return res;
}
function drawCatchSplashes(ctx, session, vs, timeMs) {
  const start = firstCaughtAtOrAfter(vs.caught, timeMs - SPLASH_MS);
  for (let i = start; i < vs.caught.length; i++) {
    const c = vs.caught[i];
    if (c.time > timeMs)
      break;
    const p = (timeMs - c.time) / SPLASH_MS;
    if (p < 0 || p > 1)
      continue;
    const baseR = (c.type === "droplet" ? OBJECT_RADIUS / 4 : OBJECT_RADIUS) * c.scale * S3;
    const e = outQuint(p);
    const alpha = (1 - p) * 0.6;
    const w = baseR * (1 + 4 * e);
    const h = baseR * 0.7;
    const cx = screenX(c.x);
    const colour = c.type === "banana" ? "#fff000" : comboColorFor(session, c.indexInBeatmap);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(cx, CATCH_LINE_Y, 0, cx, CATCH_LINE_Y, w);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.4, colour);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(cx, CATCH_LINE_Y);
    ctx.scale(1, h / w);
    ctx.beginPath();
    ctx.arc(0, 0, w, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }
}
var PLATE_EXPLODE_MS = 750;
var PLATE_MAX = 8;
var PLATE_Y_OFFSET = 5;
function drawCaughtPlate(ctx, session, vs, timeMs, catcherX) {
  const path = session.catcherPath;
  const halfCatchOsu = catchWidthOsu(session.modDiff.cs) / 2;
  const plated = vs.plated;
  let i = -1;
  {
    let lo = 0, hi = plated.length - 1;
    while (lo <= hi) {
      const m = lo + hi >> 1;
      if (plated[m].time <= timeMs) {
        i = m;
        lo = m + 1;
      } else
        hi = m - 1;
    }
  }
  let restDrawn = 0;
  const batchDrawn = /* @__PURE__ */ new Map();
  for (; i >= 0; i--) {
    const f = plated[i];
    if (f.explodeAt + PLATE_EXPLODE_MS <= timeMs)
      break;
    const landOffset = Math.max(-halfCatchOsu, Math.min(halfCatchOsu, f.x - sampleCatcherX(path, f.time)));
    const accent = comboColorFor(session, f.indexInBeatmap);
    if (f.explodeAt > timeMs) {
      if (restDrawn >= PLATE_MAX)
        continue;
      restDrawn++;
      const jx = (randomSingle(f.time, 7) - 0.5) * halfCatchOsu * 0.5;
      const jy = randomSingle(f.time, 8) * 8 * S3;
      drawPlateFruit(ctx, session, screenX(catcherX + landOffset + jx), CATCH_LINE_Y - PLATE_Y_OFFSET * S3 - jy, f, accent);
    } else {
      const cnt = batchDrawn.get(f.explodeAt) ?? 0;
      if (cnt >= PLATE_MAX)
        continue;
      batchDrawn.set(f.explodeAt, cnt + 1);
      const age = timeMs - f.explodeAt;
      const xProg = Math.min(1, age / 1e3);
      const px = screenX(sampleCatcherX(path, f.explodeAt) + landOffset * (1 + 6 * xProg));
      const yOsu = age < 250 ? -50 * outSine(age / 250) : -50 + 100 * inSine((age - 250) / 500);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - age / PLATE_EXPLODE_MS);
      drawPlateFruit(ctx, session, px, CATCH_LINE_Y - PLATE_Y_OFFSET * S3 + yOsu * S3, f, accent);
      ctx.restore();
    }
  }
}
function drawPlateFruit(ctx, session, cx, cy, c, accent) {
  const base = skinSprite(session.skin, LEGACY_FRUIT_STEMS[c.indexInBeatmap % 4]);
  if (base !== void 0) {
    const overlay = skinSprite(session.skin, `${LEGACY_FRUIT_STEMS[c.indexInBeatmap % 4]}-overlay`);
    ctx.save();
    ctx.translate(cx, cy);
    blitPiece(ctx, base, overlay, c.scale * S3 * 0.5, accent, false);
    ctx.restore();
    return;
  }
  const fruitScale = c.scale * S3 * 0.5;
  const boxR = OBJECT_RADIUS * fruitScale;
  const layout = PULP_LAYOUTS[c.indexInBeatmap % 4];
  ctx.save();
  ctx.translate(cx, cy);
  const largeR = layout.largeSize * 0.5 * fruitScale;
  for (const ang of layout.largeAngles) {
    const [ox, oy] = pulpOffset(ang, layout.largeDist);
    drawPulp(ctx, ox * boxR * 2, oy * boxR * 2, largeR, accent);
  }
  drawPulp(ctx, layout.topSmall[0] * boxR * 2, layout.topSmall[1] * boxR * 2, SMALL_PULP * 0.5 * fruitScale, accent);
  ctx.restore();
}
var _sortedCache = /* @__PURE__ */ new WeakMap();
function sortedObjects(session) {
  let s = _sortedCache.get(session);
  if (s === void 0) {
    s = [...session.objects].sort((a, b) => a.startTime - b.startTime);
    _sortedCache.set(session, s);
  }
  return s;
}
function lastIndexAtOrBefore(objs, t) {
  let lo = 0, hi = objs.length - 1, res = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (objs[mid].startTime <= t) {
      res = mid;
      lo = mid + 1;
    } else
      hi = mid - 1;
  }
  return res;
}
function firstIndexAtOrAfter(objs, t) {
  let lo = 0, hi = objs.length - 1, res = objs.length;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (objs[mid].startTime >= t) {
      res = mid;
      hi = mid - 1;
    } else
      lo = mid + 1;
  }
  return res;
}
var _flCache3 = /* @__PURE__ */ new WeakMap();
function catchFlashlight(session) {
  let fl2 = _flCache3.get(session);
  if (fl2 === void 0) {
    fl2 = new CatchFlashlight(session.beatmap, session.comboFrames, S3);
    _flCache3.set(session, fl2);
  }
  return fl2;
}
function drawCatcherAndFeedback(ctx, session, timeMs) {
  const cs = session.modDiff.cs;
  const path = session.catcherPath;
  const vs = visualState(session);
  const catcherX = sampleCatcherX(path, timeMs);
  const widthScreen = catcherVisualWidthOsu(cs) * S3 * CATCHER_SCALE;
  const old = isOldStyleCatcher(session.skin);
  const stem = old ? "fruit-ryuuta" : "fruit-catcher-idle";
  const dims = skinSprite(session.skin, stem);
  const idle = skinImg4(session.skin, stem);
  const state = catcherStateAt(vs, timeMs);
  const body = old ? idle : skinImg4(session.skin, `fruit-catcher-${state}`) ?? idle;
  if (body === void 0 || idle === void 0 || dims === void 0)
    return;
  const dh = widthScreen * (dims.logH / dims.logW);
  const topY = CATCH_LINE_Y - dh * (CATCHER_RIM_Y / dims.logH) + CATCHER_TOP_OFFSET;
  drawDashTrail(ctx, session, vs, idle, timeMs, topY, widthScreen);
  drawHyperAfterimages(ctx, session, vs, idle, timeMs, topY, widthScreen);
  blitCatcher(
    ctx,
    body,
    screenX(catcherX),
    topY,
    widthScreen,
    facingAt(path, timeMs),
    { extraTint: hyperFactorAt(vs, timeMs) }
  );
  drawCaughtPlate(ctx, session, vs, timeMs, catcherX);
  drawHitExplosions3(ctx, session, vs, timeMs, catcherX);
}
function drawCatchPlayfield(ctx, session, timeMs, options) {
  const { modDiff } = session;
  const fallMs = fallTimeMs(modDiff.ar);
  const objs = sortedObjects(session);
  const lo = firstIndexAtOrAfter(objs, timeMs);
  const hi = lastIndexAtOrBefore(objs, timeMs + fallMs);
  for (let i = hi; i >= lo; i--) {
    const obj = objs[i];
    const frac = (obj.startTime - timeMs) / fallMs;
    if (frac < 0 || frac > 1)
      continue;
    const hd = options.modHidden ? hdFadeAlpha(frac) : 1;
    if (hd <= 0)
      continue;
    ctx.globalAlpha = hd;
    const cy = screenYFromFrac(frac);
    const cx = screenX(obj.effectiveX);
    if (obj.type === "banana") {
      if (!drawLegacyBanana(ctx, session, cx, cy, obj, frac))
        drawBanana(ctx, cx, cy, obj, frac);
    } else if (obj.type === "fruit") {
      if (!drawLegacyFruit(ctx, session, cx, cy, obj)) {
        drawFruit(ctx, cx, cy, obj, comboColorFor(session, obj.indexInBeatmap), frac, fallMs);
      }
    } else {
      if (!drawLegacyDroplet(ctx, session, cx, cy, obj, frac, fallMs)) {
        drawDroplet(ctx, cx, cy, obj, comboColorFor(session, obj.indexInBeatmap));
      }
    }
    ctx.globalAlpha = 1;
  }
  drawCatcherAndFeedback(ctx, session, timeMs);
  if (options.modFlashlight) {
    const catcherX = sampleCatcherX(session.catcherPath, timeMs);
    catchFlashlight(session).draw(ctx, timeMs, screenX(catcherX), CATCH_LINE_Y);
  }
  const comboX = sampleCatcherX(session.catcherPath, timeMs);
  drawManiaCombo(ctx, session.comboFrames, timeMs, screenX(comboX), CATCH_LINE_Y - COMBO_CENTRE_ABOVE_LINE_OSU * S3, session.skin);
}

// src/rulesets/catch/index.ts
var catchRuleset = {
  build(beatmap, replay, modDiff, skin, _qualityTotal) {
    console.assert(
      beatmap.mode === 2 || beatmap.mode === 0,
      `catchRuleset received unsupported beatmap.mode=${beatmap.mode}`
    );
    const objects = convertBeatmapToCatch(beatmap, modDiff);
    applyPositionOffsets(objects, beatmap, modDiff);
    const catcherPath = catchFrames(replay);
    const hitResults = computeCatchHitResults(objects, catcherPath, modDiff.cs);
    const accFrames = computeCatchAccTimeline(hitResults);
    const comboFrames = computeComboTimeline(hitResults);
    const scoreFrames = computeCatchScoreTimeline(objects, hitResults, beatmap, replay, modDiff);
    logCatchScoreCheck(hitResults, scoreFrames, accFrames, replay, modDiff);
    logCatchMissReport(objects, catcherPath, modDiff.cs);
    return {
      beatmap,
      replay,
      modDiff,
      skin,
      objects,
      catcherPath,
      hitResults,
      accFrames,
      comboFrames,
      scoreFrames,
      urTimeline: { hits: [], zones: [] }
    };
  },
  draw(ctx, s, timeMs, options) {
    drawCatchPlayfield(ctx, s, timeMs, options);
  },
  // Key overlay (Left/Right/Dash): HUD in osu!, so above the storyboard's Overlay layer.
  drawAboveStoryboard(ctx, s, timeMs, options) {
    if (options.showKeyOverlay)
      drawCatchKeyOverlay(ctx, s.catcherPath, timeMs, s.skin);
  },
  hitResults: (s) => s.hitResults,
  scoreFrames: (s) => s.scoreFrames,
  accFrames: (s) => s.accFrames,
  comboFrames: (s) => s.comboFrames,
  urTimeline: (s) => s.urTimeline
};

// src/storyboard/evaluate.ts
var VISIBILITY_CUTOFF = 1e-4;
var COLOUR_LERP_LINEAR = true;
var lerpNumber = (a, b, k) => a + (b - a) * k;
function toLinearExact(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function toSRGBExact(c) {
  return c <= 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
var LINEAR_OF_8BIT = new Float64Array(256);
for (let i = 0; i < 256; i++)
  LINEAR_OF_8BIT[i] = toLinearExact(i / 255);
var SRGB_STEPS = 1024;
var SRGB_OF_LINEAR = new Float64Array(SRGB_STEPS + 1);
for (let i = 0; i <= SRGB_STEPS; i++)
  SRGB_OF_LINEAR[i] = toSRGBExact(i / SRGB_STEPS);
function toLinear(c) {
  const i = c * 255;
  const j = i | 0;
  return i === j && j >= 0 && j <= 255 ? LINEAR_OF_8BIT[j] : toLinearExact(c);
}
function toSRGB(c) {
  if (!(c > 0))
    return 0;
  if (c >= 1)
    return 1;
  const x = c * SRGB_STEPS;
  const i = x | 0;
  const f = x - i;
  return SRGB_OF_LINEAR[i] + (SRGB_OF_LINEAR[i + 1] - SRGB_OF_LINEAR[i]) * f;
}
function lerpChannel(x, y, k) {
  if (x === y)
    return x;
  return COLOUR_LERP_LINEAR ? toSRGB(toLinear(x) + (toLinear(y) - toLinear(x)) * k) : x + (y - x) * k;
}
function findCommand(track, t) {
  const starts = track.starts;
  const n = starts.length;
  const last = track.last;
  if (last >= 0 && last < n && starts[last] <= t) {
    if (last + 1 >= n || starts[last + 1] > t)
      return last;
    if (last + 2 >= n || starts[last + 2] > t) {
      track.last = last + 1;
      return last + 1;
    }
  } else if (last < 0 && n > 0 && starts[0] > t) {
    return -1;
  }
  let lo = 0, hi = n - 1, ans = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (starts[mid] <= t) {
      ans = mid;
      lo = mid + 1;
    } else
      hi = mid - 1;
  }
  track.last = ans;
  return ans;
}
function progress(c, t) {
  if (t <= c.startTime)
    return 0;
  if (t >= c.endTime)
    return 1;
  return applyEasing(c.easing, (t - c.startTime) / (c.endTime - c.startTime));
}
function valueAt(track, t, defaultValue, lerp, isParameter = false) {
  const cmds = track.cmds;
  if (cmds.length === 0)
    return defaultValue;
  const i = findCommand(track, t);
  if (i < 0) {
    const first = cmds[0];
    return isParameter && first.startTime !== first.endTime ? defaultValue : first.startValue;
  }
  return interpolate(cmds[i], t, lerp);
}
function interpolate(c, t, lerp) {
  if (t < c.startTime)
    return c.startValue;
  if (t >= c.endTime)
    return c.endValue;
  if (c.startValue === c.endValue)
    return c.startValue;
  const current = t - c.startTime;
  if (current === 0)
    return c.startValue;
  const duration = c.endTime - c.startTime;
  return lerp(c.startValue, c.endValue, applyEasing(c.easing, current / duration));
}
function numberAt(track, t, defaultValue) {
  const cmds = track.cmds;
  if (cmds.length === 0)
    return defaultValue;
  const i = findCommand(track, t);
  if (i < 0)
    return cmds[0].startValue;
  const c = cmds[i];
  if (t >= c.endTime)
    return c.endValue;
  const k = progress(c, t);
  return c.startValue + (c.endValue - c.startValue) * k;
}
function parameterAt(track, t, defaultValue) {
  const cmds = track.cmds;
  if (cmds.length === 0)
    return defaultValue;
  const i = findCommand(track, t);
  if (i < 0) {
    const first = cmds[0];
    return first.startTime !== first.endTime ? defaultValue : first.startValue;
  }
  const c = cmds[i];
  return t >= c.endTime ? c.endValue : c.startValue;
}
function newSpriteState() {
  return { x: 0, y: 0, scale: 1, vsx: 1, vsy: 1, rotation: 0, r: 1, g: 1, b: 1, alpha: 1, additive: false, flipH: false, flipV: false };
}
function spriteStateInto(s, t, out) {
  if (t < s.startTime || t >= s.endTimeForDisplay)
    return false;
  let alpha = numberAt(s.alpha, t, 1);
  if (alpha > 1)
    alpha = alpha % 1;
  if (!(alpha > VISIBILITY_CUTOFF))
    return false;
  const x = numberAt(s.x, t, s.initialX);
  const y = numberAt(s.y, t, s.initialY);
  if (Number.isNaN(x) || Number.isNaN(y))
    return false;
  out.alpha = alpha;
  out.x = x;
  out.y = y;
  out.scale = numberAt(s.scale, t, 1);
  out.rotation = numberAt(s.rotation, t, 0);
  const vs = s.vectorScale.cmds;
  if (vs.length === 0) {
    out.vsx = 1;
    out.vsy = 1;
  } else {
    const i = findCommand(s.vectorScale, t);
    if (i < 0) {
      const v = vs[0].startValue;
      out.vsx = v[0];
      out.vsy = v[1];
    } else {
      const c = vs[i];
      const k = progress(c, t);
      out.vsx = c.startValue[0] + (c.endValue[0] - c.startValue[0]) * k;
      out.vsy = c.startValue[1] + (c.endValue[1] - c.startValue[1]) * k;
    }
  }
  const cs = s.colour.cmds;
  if (cs.length === 0) {
    out.r = 1;
    out.g = 1;
    out.b = 1;
  } else {
    const i = findCommand(s.colour, t);
    if (i < 0) {
      const v = cs[0].startValue;
      out.r = v[0];
      out.g = v[1];
      out.b = v[2];
    } else {
      const c = cs[i];
      let k = progress(c, t);
      if (k < 0)
        k = 0;
      else if (k > 1)
        k = 1;
      const a = c.startValue, b = c.endValue;
      out.r = lerpChannel(a[0], b[0], k);
      out.g = lerpChannel(a[1], b[1], k);
      out.b = lerpChannel(a[2], b[2], k);
    }
  }
  out.additive = parameterAt(s.blending, t, "inherit") === "additive";
  out.flipH = parameterAt(s.flipH, t, false);
  out.flipV = parameterAt(s.flipV, t, false);
  return true;
}
function animationFrameIndex(a, t) {
  const n = a.frameCount, d = a.frameDelay, dur = n * d;
  if (n <= 0)
    return -1;
  if (!(dur > 0))
    return 0;
  let pos = t - a.earliestTransformTime;
  if (a.loopType === "LoopForever")
    pos = pos % dur;
  pos = Math.min(Math.max(pos, 0), dur);
  return Math.min(n - 1, Math.floor(pos / d));
}
var VIDEO_FADE_MS = 500;
function videoAlphaAt(v, t, durationMs) {
  if (durationMs === null)
    return 0;
  const videoMs = t - v.offsetMs;
  if (videoMs < 0 || videoMs > durationMs)
    return 0;
  let a = 1;
  if (videoMs < VIDEO_FADE_MS)
    a = videoMs / VIDEO_FADE_MS;
  if (videoMs > durationMs - VIDEO_FADE_MS)
    a = Math.min(a, (durationMs - videoMs) / VIDEO_FADE_MS);
  return a * valueAt(v.alpha, t, 1, lerpNumber);
}

// src/storyboard/coords.ts
var SB_WIDTH = 640;
var SB_HEIGHT = 480;
var CANVAS_W7 = 1280;
var CANVAS_H6 = 720;
var SB_SCALE2 = CANVAS_H6 / SB_HEIGHT;
var SB_OFFSET_X = (CANVAS_W7 - SB_WIDTH * SB_SCALE2) / 2;
var SB_OFFSET_Y = 0;
function toCanvasX(x) {
  return SB_OFFSET_X + x * SB_SCALE2;
}
function toCanvasY(y) {
  return SB_OFFSET_Y + y * SB_SCALE2;
}
function layerMaskRect(widescreen) {
  if (widescreen)
    return null;
  return { x: SB_OFFSET_X, y: SB_OFFSET_Y, w: SB_WIDTH * SB_SCALE2, h: SB_HEIGHT * SB_SCALE2 };
}
var ORIGIN_ANCHOR = {
  TopLeft: [0, 0],
  Centre: [0.5, 0.5],
  CentreLeft: [0, 0.5],
  TopRight: [1, 0],
  BottomCentre: [0.5, 1],
  TopCentre: [0.5, 0],
  CentreRight: [1, 0.5],
  BottomLeft: [0, 1],
  BottomRight: [1, 1]
};
function originAnchor(origin, flipX, flipY) {
  const [ax, ay] = ORIGIN_ANCHOR[origin];
  return [flipX ? 1 - ax : ax, flipY ? 1 - ay : ay];
}

// src/storyboard/StoryboardGL.ts
var PAGE_SIZE = 4096;
var PAD = 2;
var MAX_QUADS = 16383;
var FLOATS_PER_VERTEX = 8;
function packAtlas(items, pageSize, pad) {
  const placements = /* @__PURE__ */ new Map();
  const dedicated = [];
  const sorted = [...items].sort((a, b) => b.h - a.h || b.w - a.w || (a.key < b.key ? -1 : 1));
  let page = -1, shelfY = 0, shelfH = 0, x = 0;
  const openPage = () => {
    page++;
    shelfY = 0;
    shelfH = 0;
    x = 0;
  };
  for (const it of sorted) {
    const cw = it.w + 2 * pad, ch3 = it.h + 2 * pad;
    if (cw > pageSize || ch3 > pageSize) {
      dedicated.push(it.key);
      continue;
    }
    if (page < 0)
      openPage();
    if (x + cw > pageSize) {
      shelfY += shelfH;
      x = 0;
      shelfH = 0;
      if (shelfY + ch3 > pageSize)
        openPage();
    }
    if (shelfY + ch3 > pageSize)
      openPage();
    placements.set(it.key, { page, x: x + pad, y: shelfY + pad });
    x += cw;
    if (ch3 > shelfH)
      shelfH = ch3;
  }
  return { pages: page + 1, placements, dedicated };
}
var VERT = `
attribute vec2 aPos; attribute vec2 aUV; attribute vec4 aCol;
uniform vec2 uInvHalf;
varying vec2 vUV; varying vec4 vCol;
void main() {
  vUV = aUV; vCol = aCol;
  gl_Position = vec4(aPos.x * uInvHalf.x - 1.0, 1.0 - aPos.y * uInvHalf.y, 0.0, 1.0);
}`;
var FRAG = `
precision mediump float;
uniform sampler2D uTex;
varying vec2 vUV; varying vec4 vCol;
void main() {
  vec4 t = texture2D(uTex, vUV);
  gl_FragColor = vec4(t.rgb * vCol.rgb, t.a * vCol.a);
}`;
var StoryboardGL = class _StoryboardGL {
  constructor(canvas, gl, images) {
    this.verts = new Float32Array(MAX_QUADS * 4 * FLOATS_PER_VERTEX);
    this.textures = [];
    this.entries = /* @__PURE__ */ new Map();
    this.quads = 0;
    this.boundTex = null;
    this.lost = false;
    this.canvas = canvas;
    this.gl = gl;
    canvas.addEventListener("webglcontextlost", () => {
      this.lost = true;
    });
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      if (sh === null)
        throw new Error("createShader failed");
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw new Error(`shader: ${gl.getShaderInfoLog(sh) ?? ""}`);
      return sh;
    };
    const program = gl.createProgram();
    if (program === null)
      throw new Error("createProgram failed");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(program, 0, "aPos");
    gl.bindAttribLocation(program, 1, "aUV");
    gl.bindAttribLocation(program, 2, "aCol");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(`program: ${gl.getProgramInfoLog(program) ?? ""}`);
    this.program = program;
    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);
    const vbo = gl.createBuffer(), ibo = gl.createBuffer();
    if (vbo === null || ibo === null)
      throw new Error("createBuffer failed");
    this.vbo = vbo;
    this.ibo = ibo;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.verts.byteLength, gl.DYNAMIC_DRAW);
    const stride = FLOATS_PER_VERTEX * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 16);
    const indices = new Uint16Array(MAX_QUADS * 6);
    for (let q = 0; q < MAX_QUADS; q++) {
      const v = q * 4, i = q * 6;
      indices[i] = v;
      indices[i + 1] = v + 1;
      indices[i + 2] = v + 2;
      indices[i + 3] = v + 2;
      indices[i + 4] = v + 1;
      indices[i + 5] = v + 3;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    this.buildAtlas(images);
  }
  /**
   * Build the atlas for `images` (keyed by resolved archive path) on a `width`×`height` buffer.
   * Null when WebGL2 or `OffscreenCanvas` is unavailable, or when the context cannot be created.
   */
  static create(images, width, height) {
    if (typeof OffscreenCanvas !== "function")
      return null;
    try {
      const canvas = new OffscreenCanvas(width, height);
      const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false, depth: false, stencil: false });
      if (gl === null)
        return null;
      return new _StoryboardGL(canvas, gl, images);
    } catch {
      return null;
    }
  }
  buildAtlas(images) {
    const gl = this.gl;
    const pageSize = Math.min(PAGE_SIZE, gl.getParameter(gl.MAX_TEXTURE_SIZE));
    const items = [...images].map(([key, img]) => ({ key, w: img.bitmap.width, h: img.bitmap.height }));
    const { pages, placements, dedicated } = packAtlas(items, pageSize, PAD);
    const makeTexture = () => {
      const tex = gl.createTexture();
      if (tex === null)
        throw new Error("createTexture failed");
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      this.textures.push(tex);
      return tex;
    };
    if (pages > 0) {
      const scratch = new OffscreenCanvas(pageSize, pageSize);
      const c = scratch.getContext("2d");
      if (c === null)
        throw new Error("2D scratch context failed");
      c.imageSmoothingEnabled = false;
      for (let p = 0; p < pages; p++) {
        c.clearRect(0, 0, pageSize, pageSize);
        for (const [key, pl] of placements) {
          if (pl.page !== p)
            continue;
          const b = images.get(key).bitmap;
          const w = b.width, h = b.height, x = pl.x, y = pl.y;
          c.drawImage(b, x, y);
          c.drawImage(b, 0, 0, 1, h, x - PAD, y, PAD, h);
          c.drawImage(b, w - 1, 0, 1, h, x + w, y, PAD, h);
          c.drawImage(b, 0, 0, w, 1, x, y - PAD, w, PAD);
          c.drawImage(b, 0, h - 1, w, 1, x, y + h, w, PAD);
          c.drawImage(b, 0, 0, 1, 1, x - PAD, y - PAD, PAD, PAD);
          c.drawImage(b, w - 1, 0, 1, 1, x + w, y - PAD, PAD, PAD);
          c.drawImage(b, 0, h - 1, 1, 1, x - PAD, y + h, PAD, PAD);
          c.drawImage(b, w - 1, h - 1, 1, 1, x + w, y + h, PAD, PAD);
        }
        const tex = makeTexture();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch);
        gl.generateMipmap(gl.TEXTURE_2D);
        for (const [key, pl] of placements) {
          if (pl.page !== p)
            continue;
          const b = images.get(key).bitmap;
          this.entries.set(key, { tex, u0: pl.x / pageSize, v0: pl.y / pageSize, u1: (pl.x + b.width) / pageSize, v1: (pl.y + b.height) / pageSize });
        }
      }
      scratch.width = 0;
      scratch.height = 0;
    }
    for (const key of dedicated) {
      const b = images.get(key).bitmap;
      const tex = makeTexture();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, b);
      gl.generateMipmap(gl.TEXTURE_2D);
      this.entries.set(key, { tex, u0: 0, v0: 0, u1: 1, v1: 1 });
    }
  }
  /** True once the context was lost; the caller should fall back to 2D drawing. */
  get unusable() {
    return this.lost || this.gl.isContextLost();
  }
  /** Atlas location of a decoded image, by its archive key. */
  entry(key) {
    return this.entries.get(key);
  }
  /**
   * Start a pass: clear the buffer and set the scissor to `mask` (logical px; null = none).
   * `quality` is the backing-store scale of the host canvas (logical px → buffer px).
   */
  begin(mask, quality) {
    const gl = this.gl;
    const W = this.canvas.width, H = this.canvas.height;
    gl.viewport(0, 0, W, H);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (mask !== null) {
      const x0 = Math.round(mask.x * quality), x1 = Math.round((mask.x + mask.w) * quality);
      const yTop = Math.round(mask.y * quality), yBot = Math.round((mask.y + mask.h) * quality);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x0, H - yBot, x1 - x0, yBot - yTop);
    }
    gl.useProgram(this.program);
    gl.uniform2f(gl.getUniformLocation(this.program, "uInvHalf"), 2 * quality / W, 2 * quality / H);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.activeTexture(gl.TEXTURE0);
    this.quads = 0;
    this.boundTex = null;
  }
  /**
   * Append one sprite. `c` holds its four corners in logical px, in texture order
   * (top-left, top-right, bottom-left, bottom-right). `r g b` are the tint already multiplied
   * by the sprite alpha; `a` is the sprite alpha, or 0 for an additive sprite.
   */
  quad(e, c, r, g, b, a) {
    if (e.tex !== this.boundTex) {
      this.flush();
      this.gl.bindTexture(this.gl.TEXTURE_2D, e.tex);
      this.boundTex = e.tex;
    } else if (this.quads === MAX_QUADS) {
      this.flush();
    }
    const v = this.verts;
    let o = this.quads * 4 * FLOATS_PER_VERTEX;
    for (let i = 0; i < 4; i++) {
      v[o++] = c[i * 2];
      v[o++] = c[i * 2 + 1];
      v[o++] = i & 1 ? e.u1 : e.u0;
      v[o++] = i & 2 ? e.v1 : e.v0;
      v[o++] = r;
      v[o++] = g;
      v[o++] = b;
      v[o++] = a;
    }
    this.quads++;
  }
  /** Draw whatever is pending. */
  end() {
    this.flush();
  }
  flush() {
    if (this.quads === 0)
      return;
    const gl = this.gl;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verts.subarray(0, this.quads * 4 * FLOATS_PER_VERTEX));
    gl.drawElements(gl.TRIANGLES, this.quads * 6, gl.UNSIGNED_SHORT, 0);
    this.quads = 0;
  }
  /** Release GPU resources and the context (browsers cap live WebGL contexts). */
  dispose() {
    const gl = this.gl;
    for (const t of this.textures)
      gl.deleteTexture(t);
    gl.deleteBuffer(this.vbo);
    gl.deleteBuffer(this.ibo);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
};

// src/storyboard/StoryboardRenderer.ts
var TINT_CACHE_BYTES = 64 * 1024 * 1024;
var SMALL_TINT_PX = 128 * 128;
var TintCache = class {
  constructor() {
    this.entries = /* @__PURE__ */ new Map();
    this.ids = /* @__PURE__ */ new Map();
    this.bytes = 0;
  }
  get(img, r, g, b) {
    let R, G, B;
    if (img.width * img.height <= SMALL_TINT_PX) {
      R = Math.round(r * 15) * 17;
      G = Math.round(g * 15) * 17;
      B = Math.round(b * 15) * 17;
    } else {
      R = Math.round(r * 255);
      G = Math.round(g * 255);
      B = Math.round(b * 255);
    }
    if (R >= 255 && G >= 255 && B >= 255)
      return img;
    let id = this.ids.get(img);
    if (id === void 0) {
      id = this.ids.size;
      this.ids.set(img, id);
    }
    const key = `${id}:${R}:${G}:${B}`;
    const hit = this.entries.get(key);
    if (hit !== void 0) {
      this.entries.delete(key);
      this.entries.set(key, hit);
      return hit.canvas;
    }
    const w = img.width, h = img.height;
    const canvas = new OffscreenCanvas(w, h);
    const c = canvas.getContext("2d");
    if (c === null)
      return img;
    c.drawImage(img, 0, 0);
    c.globalCompositeOperation = "multiply";
    c.fillStyle = `rgb(${R},${G},${B})`;
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = "destination-in";
    c.drawImage(img, 0, 0);
    const bytes = w * h * 4;
    this.entries.set(key, { canvas, bytes });
    this.bytes += bytes;
    for (const [k, e] of this.entries) {
      if (this.bytes <= TINT_CACHE_BYTES)
        break;
      this.entries.delete(k);
      this.bytes -= e.bytes;
    }
    return canvas;
  }
};
var StoryboardRenderer = class {
  /** `triggerEvents`: the replay's gameplay events trigger groups fire on (none = triggers never fire). */
  constructor(inputs, surface, triggerEvents = NO_TRIGGER_EVENTS) {
    this.frames = /* @__PURE__ */ new Map();
    this.tints = null;
    this.state = newSpriteState();
    this.corners = new Float32Array(8);
    this.compiled = compileStoryboard(inputs.data, triggerEvents);
    this.mask = layerMaskRect(this.compiled.widescreen);
    this.quality = surface.quality;
    this.gl = this.compiled.hasSprites ? StoryboardGL.create(inputs.images, surface.width, surface.height) : null;
    for (const layer of this.compiled.layers) {
      for (const s of layer.sprites) {
        const paths = s.kind === "animation" ? Array.from({ length: s.frameCount }, (_, i) => animationFramePath(s.path, i)) : [s.path];
        const keys = paths.map((p) => resolveStoryboardPath(inputs.images, p, "image"));
        this.frames.set(s, {
          images: keys.map((k) => k === null ? null : inputs.images.get(k) ?? null),
          atlas: keys.map((k) => k === null ? null : this.gl?.entry(k) ?? null)
        });
      }
    }
    this.underlay = this.compiled.layers.filter((l) => l.name !== "Overlay");
    this.overlay = this.compiled.layers.find((l) => l.name === "Overlay" && l.sprites.length > 0) ?? null;
    const video = inputs.video ?? null;
    this.videos = video === null ? [] : this.compiled.videos.filter((v) => normaliseStoryboardPath(v.path) === normaliseStoryboardPath(video.path));
    this.videoSource = this.videos.length > 0 ? video.source : null;
  }
  /** Whether any layer has a sprite to draw (a storyboard may carry only a video). */
  get hasSprites() {
    return this.compiled.hasSprites;
  }
  /** Whether a video source is attached to a `Video` event of this storyboard. */
  get hasVideo() {
    return this.videoSource !== null;
  }
  /** The beatmap background is blacked out under a storyboard that draws it itself. */
  get replacesBackground() {
    return this.compiled.replacesBackground;
  }
  /** Overlay-layer sprites or samples keep the storyboard present even at full dim. */
  get mustAlwaysBePresent() {
    return this.compiled.mustAlwaysBePresent;
  }
  /** True while sprites go through the WebGL batcher (false = 2D per-sprite fallback). */
  get usesWebGL() {
    return this.gl !== null;
  }
  /**
   * Keep the video source in step with the map clock; call once per drawn frame whether or not
   * the video is drawn, so a hidden video is paused and a shown one is already near its frame.
   * `rate` is playback speed relative to real time (mod speed × user rate).
   */
  syncVideo(t, playing, rate) {
    const src = this.videoSource;
    if (src === null)
      return;
    const v = this.videos[0];
    src.sync({ videoMs: t - v.offsetMs, playing, rate });
  }
  /** Decode the video frame for map time `t` ahead of `drawVideo` (sources that support `prepare`). */
  async prepareVideo(t) {
    const src = this.videoSource;
    if (src === null || src.prepare === void 0)
      return;
    await src.prepare(t - this.videos[0].offsetMs);
  }
  /**
   * Draw the video frame(s) for map time `t`: cover-fit into the storyboard box (the full
   * canvas for a widescreen storyboard, the centred 4:3 box otherwise), unmasked, with the
   * fade-in/out and the video's own alpha commands.
   */
  drawVideo(ctx, t) {
    const src = this.videoSource;
    if (src === null || src.frameWidth === 0 || src.frameHeight === 0)
      return;
    const box = this.compiled.widescreen || !this.compiled.hasSprites ? null : this.mask;
    const bx = box === null ? 0 : box.x, by = box === null ? 0 : box.y;
    const bw = box === null ? CANVAS_W7 : box.w, bh = box === null ? CANVAS_H6 : box.h;
    for (const v of this.videos) {
      const a = videoAlphaAt(v, t, src.durationMs);
      if (a <= 1e-4)
        continue;
      const frame = src.frameAt(t - v.offsetMs);
      if (frame === null)
        continue;
      const s = Math.max(bw / src.frameWidth, bh / src.frameHeight);
      const dw = src.frameWidth * s, dh = src.frameHeight * s;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.drawImage(frame, bx + (bw - dw) / 2, by + (bh - dh) / 2, dw, dh);
      ctx.restore();
    }
  }
  /** Draw every non-Overlay layer visible at `t` (Pass or Fail by the passing state), back to front. */
  drawUnderlay(ctx, t) {
    const passing = this.compiled.passingAt(t);
    this.drawLayers(ctx, t, this.underlay.filter((l) => passing ? l.visibleWhenPassing : l.visibleWhenFailing), 1);
  }
  /**
   * Draw the Overlay layer, which sits above the gameplay but inside lazer's dimmable container:
   * `dimMul` (= 1 − dim) is folded into each sprite's tint.
   */
  drawOverlay(ctx, t, dimMul) {
    if (this.overlay === null)
      return;
    this.drawLayers(ctx, t, [this.overlay], dimMul);
  }
  /** Release GPU resources. The renderer is unusable afterwards. */
  dispose() {
    this.gl?.dispose();
    this.gl = null;
    this.tints = null;
  }
  drawLayers(ctx, t, layers, dimMul) {
    if (this.gl !== null && this.gl.unusable)
      this.gl = null;
    if (this.gl !== null)
      this.drawLayersGL(ctx, this.gl, t, layers, dimMul);
    else
      this.drawLayers2D(ctx, t, layers, dimMul);
  }
  /** Frame image index for `s` at `t`, or -1 when it has none to draw. */
  frameIndex(s, t) {
    return s.kind === "animation" ? animationFrameIndex(s, t) : 0;
  }
  drawLayersGL(ctx, gl, t, layers, dimMul) {
    const st = this.state, c = this.corners;
    let drawn = 0;
    gl.begin(this.mask, this.quality);
    for (const layer of layers) {
      for (const s of layer.activeAt(t)) {
        if (!spriteStateInto(s, t, st))
          continue;
        const f = this.frames.get(s);
        if (f === void 0)
          continue;
        const i = this.frameIndex(s, t);
        const img = f.images[i], e = f.atlas[i];
        if (img === null || img === void 0 || e === null || e === void 0)
          continue;
        if (!this.spriteCorners(st, s, img, c))
          continue;
        const a = st.alpha;
        gl.quad(e, c, st.r * dimMul * a, st.g * dimMul * a, st.b * dimMul * a, st.additive ? 0 : a);
        drawn++;
      }
    }
    gl.end();
    if (drawn === 0)
      return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(gl.canvas, 0, 0);
    ctx.restore();
  }
  drawLayers2D(ctx, t, layers, dimMul) {
    if (this.tints === null)
      this.tints = new TintCache();
    ctx.save();
    if (this.mask !== null) {
      ctx.beginPath();
      ctx.rect(this.mask.x, this.mask.y, this.mask.w, this.mask.h);
      ctx.clip();
    }
    const base = ctx.getTransform();
    const st = this.state, c = this.corners;
    let alpha = 1, additive = false;
    for (const layer of layers) {
      for (const s of layer.activeAt(t)) {
        if (!spriteStateInto(s, t, st))
          continue;
        const f = this.frames.get(s);
        if (f === void 0)
          continue;
        const img = f.images[this.frameIndex(s, t)];
        if (img === null || img === void 0)
          continue;
        if (!this.spriteCorners(st, s, img, c))
          continue;
        if (st.alpha !== alpha) {
          alpha = st.alpha;
          ctx.globalAlpha = alpha;
        }
        if (st.additive !== additive) {
          additive = st.additive;
          ctx.globalCompositeOperation = additive ? "lighter" : "source-over";
        }
        const w = img.width, h = img.height;
        const la = (c[2] - c[0]) / w, lb = (c[3] - c[1]) / w, lc = (c[4] - c[0]) / h, ld = (c[5] - c[1]) / h;
        ctx.setTransform(
          base.a * la + base.c * lb,
          base.b * la + base.d * lb,
          base.a * lc + base.c * ld,
          base.b * lc + base.d * ld,
          base.a * c[0] + base.c * c[1] + base.e,
          base.b * c[0] + base.d * c[1] + base.f
        );
        ctx.drawImage(this.tints.get(img.bitmap, st.r * dimMul, st.g * dimMul, st.b * dimMul), 0, 0, w, h);
      }
    }
    ctx.restore();
  }
  /**
   * Canvas-px corners of the sprite's texture box (top-left, top-right, bottom-left,
   * bottom-right) into `out`; false when the box misses the canvas / mask or the sprite has a
   * zero scale (lazer draws nothing either, and a singular matrix would be useless anyway).
   */
  spriteCorners(st, s, img, out) {
    const w = img.width, h = img.height;
    const sx = st.scale * (st.flipH ? -1 : 1) * st.vsx;
    const sy = st.scale * (st.flipV ? -1 : 1) * st.vsy;
    if (sx === 0 || sy === 0)
      return false;
    const [ax, ay] = originAnchor(s.origin, st.flipH !== st.vsx < 0, st.flipV !== st.vsy < 0);
    const ox = ax * w, oy = ay * h;
    const cx = toCanvasX(st.x), cy = toCanvasY(st.y);
    const kx = SB_SCALE2 * sx, ky = SB_SCALE2 * sy;
    const cos = Math.cos(st.rotation), sin = Math.sin(st.rotation);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < 4; i++) {
      const lx = ((i & 1 ? w : 0) - ox) * kx;
      const ly = ((i & 2 ? h : 0) - oy) * ky;
      const px = cx + lx * cos - ly * sin;
      const py = cy + lx * sin + ly * cos;
      out[i * 2] = px;
      out[i * 2 + 1] = py;
      if (px < minX)
        minX = px;
      if (px > maxX)
        maxX = px;
      if (py < minY)
        minY = py;
      if (py > maxY)
        maxY = py;
    }
    const m = this.mask;
    const left = m === null ? 0 : m.x, top = m === null ? 0 : m.y;
    const right = m === null ? CANVAS_W7 : m.x + m.w, bottom = m === null ? CANVAS_H6 : m.y + m.h;
    return maxX > left && minX < right && maxY > top && minY < bottom;
  }
};

// src/renderer/Renderer.ts
var LOGICAL_W3 = 1280;
var LOGICAL_H3 = 720;
var MAX_QUALITY = 3;
var Renderer = class _Renderer {
  constructor(canvas, player, replay, beatmap, skin, timeMapper, _background = null, modDiff, qualityOverride, pageZoom = 1, lazerModIcons = null, storyboard = null) {
    this.canvas = canvas;
    this.player = player;
    this.replay = replay;
    this.beatmap = beatmap;
    this.skin = skin;
    this.timeMapper = timeMapper;
    this._background = _background;
    this.modDiff = modDiff;
    this.lazerModIcons = lazerModIcons;
    this._rafId = null;
    this._running = false;
    this.options = {
      showJudgement: true,
      showKeyOverlay: true,
      showFollowpoints: true,
      showURBar: true,
      showModIcons: true,
      showStoryboard: true,
      showVideo: true,
      userRate: 1,
      backgroundDim: 0.8,
      audioOffsetMs: 0,
      qualityScale: "auto",
      maniaScrollSpeed: 20,
      maniaUpscroll: false,
      taikoFlyingHits: true,
      modHidden: false,
      modFlashlight: false,
      modFadeIn: false,
      modCover: false
    };
    this._bgDrawX = 0;
    this._bgDrawY = 0;
    this._bgDrawW = 0;
    this._bgDrawH = 0;
    // Background + dim pre-composited at backing resolution, so each frame pays one 1:1 blit
    // instead of a full-canvas clear + filtered scale-blit + dim fill. Rebuilt only when the
    // dim changes (the live dim slider); null until first use / when there is no background.
    this._backdrop = null;
    this._backdropDim = -1;
    this._tick = () => {
      if (!this._running)
        return;
      const timeMs = this.timeMapper.toMapTime(this.player.currentTimeMs) + this.options.audioOffsetMs * this.timeMapper.speed - this._oldOffsetMs;
      this._draw(timeMs);
      this._rafId = requestAnimationFrame(this._tick);
    };
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx === null)
      throw new Error("Failed to get 2D canvas context");
    this.ctx = ctx;
    this.options.modHidden = modDiff.isHD;
    this.options.modFlashlight = modDiff.isFL;
    this.options.modFadeIn = modDiff.isFadeIn;
    this.options.modCover = modDiff.isCover;
    this._modIconRow = buildModIconRow(
      activeModAcronyms(modDiff.mods, replay.scoreInfo?.mods),
      replay.scoreInfo?.mods,
      skin,
      lazerModIcons
    );
    const q = this.options.qualityScale;
    const dpr = (typeof devicePixelRatio === "number" ? devicePixelRatio : 1) || 1;
    const total = qualityOverride !== void 0 ? qualityOverride : q === "auto" ? Math.max(1, Math.min(dpr * pageZoom, MAX_QUALITY)) : q;
    if (qualityOverride !== void 0) {
      canvas.width = 2 * Math.round(LOGICAL_W3 * total / 2);
      canvas.height = 2 * Math.round(LOGICAL_H3 * total / 2);
    } else {
      canvas.width = LOGICAL_W3 * total;
      canvas.height = LOGICAL_H3 * total;
    }
    ctx.scale(total, total);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    this._qualityTotal = total;
    if (_background !== null) {
      const scale = Math.max(LOGICAL_W3 / _background.width, LOGICAL_H3 / _background.height);
      this._bgDrawW = _background.width * scale;
      this._bgDrawH = _background.height * scale;
      this._bgDrawX = (LOGICAL_W3 - this._bgDrawW) / 2;
      this._bgDrawY = (LOGICAL_H3 - this._bgDrawH) / 2;
    }
    const ruleset = replay.mode === 3 ? maniaRuleset : replay.mode === 1 ? taikoRuleset : replay.mode === 2 ? catchRuleset : stdRuleset;
    this._ruleset = ruleset;
    this._session = ruleset.build(beatmap, replay, modDiff, skin, this._qualityTotal);
    this._hitResults = ruleset.hitResults(this._session);
    this._accFrames = ruleset.accFrames(this._session);
    this._comboFrames = ruleset.comboFrames(this._session);
    this._scoreFrames = ruleset.scoreFrames(this._session);
    this._urTimeline = ruleset.urTimeline(this._session);
    if (replay.mode === 3) {
      this.options.maniaUpscroll = this._session.defaultUpscroll;
    }
    this._oldOffsetMs = beatmap.formatVersion < 5 ? 24 : 0;
    this._storyboardInputs = storyboard;
    const triggered = storyboard !== null && hasTriggerCommands(storyboard.data);
    this._storyboard = storyboard !== null && (storyboard.data.hasDrawable || triggered || storyboard.video != null) ? new StoryboardRenderer(
      storyboard,
      { width: canvas.width, height: canvas.height, quality: total },
      triggered ? this._storyboardTriggerEvents() : void 0
    ) : null;
  }
  /**
   * Gameplay events storyboard triggers fire on: the replay's hit samples, from the same
   * schedule the audio plays (in draw time — the pre-v5 hitsound shift is not applied, since
   * `_draw` receives visual time). Pass/fail transitions are empty: the storyboard is always passing.
   */
  _storyboardTriggerEvents() {
    const mode = this.replay.mode === 1 ? 1 : this.replay.mode === 3 ? 3 : this.replay.mode === 2 ? 2 : 0;
    const sounds = computeHitsoundSchedule({
      mode,
      beatmap: this.beatmap,
      hitResults: this._hitResults,
      maniaSamples: this.maniaSamples,
      taikoGhostTaps: this.taikoGhostTaps,
      comboFrames: this._comboFrames,
      oldOffsetMs: 0,
      fromBeatmapMs: -Infinity
    });
    return { hitSamples: hitSampleEventsFromSchedule(sounds), passing: [] };
  }
  /**
   * Whether the storyboard toggle has anything to act on: sprites attached here, or `Sample`
   * events the session's audio plays (`AudioSync.setStoryboardSamples`). False for a video-only map.
   */
  get hasStoryboard() {
    if (this._storyboard?.hasSprites)
      return true;
    return this._storyboardInputs !== null && playableStoryboardSamples(this._storyboardInputs.data).length > 0;
  }
  /** Whether a beatmap video is attached (`showVideo` has no effect otherwise). */
  get hasVideo() {
    return this._storyboard?.hasVideo ?? false;
  }
  /** Per-object judgement results computed by the ruleset at construction (map-time ms). */
  get hitResults() {
    return this._hitResults;
  }
  /** Displayed combo timeline (lazer/stable-correct per ruleset). AudioSync uses it to gate
   * the combo-break sound on osu!'s "combo was > 20 before the break" rule. */
  get comboFrames() {
    return this._comboFrames;
  }
  /** Mania-only: sourceIndex → HitSample lookup, so AudioSync can resolve per-press samples
   * for both Notes and HoldNote heads (holds aren't in beatmap.hitObjects). Null for std/taiko. */
  get maniaSamples() {
    if (this.replay.mode !== 3)
      return null;
    return this._session.samplesBySource;
  }
  /** Taiko-only: presses that hit no object, so AudioSync can play a bare don/kat
   * for them on top of the note-tied hitsounds (empty-section / warm-up taps are
   * audible in stable). Null for std/mania. */
  get taikoGhostTaps() {
    if (this.replay.mode !== 1)
      return null;
    return this._session.ghostTaps;
  }
  /** Score at the live player clock, using the same time math as the drawn HUD so
   * external displays stay in lockstep with the canvas. */
  currentScore() {
    const timeMs = this.timeMapper.toMapTime(this.player.currentTimeMs) + this.options.audioOffsetMs * this.timeMapper.speed - this._oldOffsetMs;
    return this.scoreAt(timeMs);
  }
  /**
   * Score at an explicit, already-offset beatmap time (ms). `currentScore` reads the live
   * player clock; callers that drive time explicitly (export clones have a dummy Player)
   * read scores through this with the same map time they draw each frame at.
   */
  scoreAt(mapTimeMs) {
    const frames = this._scoreFrames;
    if (frames.length === 0 || mapTimeMs < frames[0].time)
      return 0;
    if (mapTimeMs >= frames[frames.length - 1].time)
      return frames[frames.length - 1].score;
    let lo = 0, hi = frames.length - 2;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (frames[mid].time <= mapTimeMs)
        lo = mid;
      else
        hi = mid - 1;
    }
    return frames[lo].score;
  }
  /** Pre-v5 visual lag (24ms / 0). Exposed so the export loop reproduces `_tick`'s time math. */
  get oldOffsetMs() {
    return this._oldOffsetMs;
  }
  /**
   * Render a single frame for an absolute beatmap time (ms). Public entry for offline
   * callers (e.g. an export loop) that drive time explicitly instead of via the player
   * clock + rAF. The caller is responsible for applying the same audioOffset/oldOffset
   * math `_tick` does.
   */
  renderFrameAt(mapTimeMs) {
    this._draw(mapTimeMs);
  }
  /**
   * Build a second renderer over the same replay/beatmap/skin, drawing into an offscreen
   * canvas at an explicit export quality (bypasses the MAX_QUALITY clamp). Re-runs
   * ruleset.build sized to `quality` — same cost as a skin-swap rebuild — and copies the
   * current draw options so "what you see is what you export". The live renderer is untouched.
   * `video` attaches a frame source for the beatmap video (the live one is bound to this
   * renderer's clock and is not passed on); see `prepareFrameAt`.
   */
  cloneForExport(canvas, quality, video = null) {
    const clone = new _Renderer(
      canvas,
      new Player(this.timeMapper.presentationDurationMs),
      this.replay,
      this.beatmap,
      this.skin,
      this.timeMapper,
      this._background,
      this.modDiff,
      quality,
      1,
      this.lazerModIcons,
      this._storyboardForExport(video)
    );
    Object.assign(clone.options, this.options);
    return clone;
  }
  // The video source is a live decoder bound to this renderer's clock (and not clonable);
  // export renderers get the storyboard with the frame-exact source the caller supplies, or none.
  _storyboardForExport(video = null) {
    const sb = this._storyboardInputs;
    return sb === null ? null : { data: sb.data, images: sb.images, video };
  }
  /**
   * Snapshot everything `buildForExport` needs to rebuild this renderer in the export worker.
   * References, not copies — the caller structured-clones them across the worker boundary
   * (stripping skin sounds first) while the live session keeps its own.
   */
  exportBundle() {
    return {
      replay: this.replay,
      beatmap: this.beatmap,
      skin: this.skin,
      background: this._background,
      modDiff: this.modDiff,
      options: this.options,
      presentationDurationMs: this.timeMapper.presentationDurationMs,
      introOffsetMs: this.timeMapper.introOffsetMs,
      outroOffsetMs: this.timeMapper.outroOffsetMs,
      speed: this.timeMapper.speed,
      lazerModIcons: this.lazerModIcons,
      storyboard: this._storyboardForExport()
    };
  }
  /**
   * The worker-side twin of `cloneForExport`: rebuild an export renderer from a transferred
   * bundle where no live renderer exists. Reconstructs the TimeMapper from the replay frames +
   * offsets (cheap, and faithful — same constructor inputs as the live one) and adopts the
   * bundle's options exactly as cloneForExport does.
   */
  static buildForExport(canvas, quality, b) {
    const timeMapper = new TimeMapper(b.replay.frames, b.introOffsetMs, b.outroOffsetMs, b.speed);
    const r = new _Renderer(
      canvas,
      new Player(b.presentationDurationMs),
      b.replay,
      b.beatmap,
      b.skin,
      timeMapper,
      b.background,
      b.modDiff,
      quality,
      1,
      b.lazerModIcons,
      b.storyboard
    );
    Object.assign(r.options, b.options);
    return r;
  }
  /**
   * Export helper: decode the beatmap video's frame for `mapTimeMs` so the following
   * `renderFrameAt(mapTimeMs)` draws it (no-op without a video source that supports `prepare`).
   */
  prepareFrameAt(mapTimeMs) {
    return this._storyboard?.prepareVideo(mapTimeMs) ?? Promise.resolve();
  }
  /** Begin the live requestAnimationFrame loop (idempotent). */
  start() {
    if (this._running)
      return;
    this._running = true;
    this._tick();
  }
  /** Halt the live loop and cancel any pending animation frame. */
  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
  /** `stop()` plus release of GPU resources (the storyboard's WebGL context). Not reusable afterwards. */
  destroy() {
    this.stop();
    this._storyboard?.dispose();
  }
  // Lazily (re)build the pre-composited backdrop; only called when a background exists.
  _ensureBackdrop(bg, dim) {
    if (this._backdrop === null) {
      this._backdrop = new OffscreenCanvas(this.canvas.width, this.canvas.height);
    }
    if (dim !== this._backdropDim) {
      const octx = this._backdrop.getContext("2d");
      if (octx === null)
        throw new Error("Failed to get 2D backdrop context");
      octx.setTransform(this._qualityTotal, 0, 0, this._qualityTotal, 0, 0);
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";
      octx.fillStyle = "#1a1a2e";
      octx.fillRect(0, 0, LOGICAL_W3, LOGICAL_H3);
      octx.drawImage(bg, this._bgDrawX, this._bgDrawY, this._bgDrawW, this._bgDrawH);
      octx.fillStyle = `rgba(0, 0, 0, ${dim})`;
      octx.fillRect(0, 0, LOGICAL_W3, LOGICAL_H3);
      this._backdropDim = dim;
    }
    return this._backdrop;
  }
  // 1:1 blit at backing resolution (identity transform): no per-frame filtering.
  _blitBackdrop(backdrop) {
    const { ctx } = this;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(backdrop, 0, 0);
    ctx.restore();
  }
  _draw(timeMs) {
    const { ctx } = this;
    const { options } = this;
    const dim = Math.max(0, Math.min(1, options.backgroundDim));
    const sprites = options.showStoryboard && this._storyboard !== null && this._storyboard.hasSprites;
    const video = options.showVideo && this._storyboard !== null && this._storyboard.hasVideo;
    const sb = sprites || video ? this._storyboard : null;
    this._storyboard?.syncVideo(timeMs, video && this.player.isPlaying, this.timeMapper.speed * options.userRate);
    if (sb !== null) {
      if (sprites && sb.replacesBackground || this._background === null) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, LOGICAL_W3, LOGICAL_H3);
      } else {
        this._blitBackdrop(this._ensureBackdrop(this._background, 0));
      }
      if (video && dim < 1)
        sb.drawVideo(ctx, timeMs);
      if (sprites && (dim < 1 || sb.mustAlwaysBePresent))
        sb.drawUnderlay(ctx, timeMs);
      if (dim > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${dim})`;
        ctx.fillRect(0, 0, LOGICAL_W3, LOGICAL_H3);
      }
    } else if (this._background !== null) {
      this._blitBackdrop(this._ensureBackdrop(this._background, dim));
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, LOGICAL_W3, LOGICAL_H3);
      ctx.fillStyle = `rgba(0, 0, 0, ${dim})`;
      ctx.fillRect(0, 0, LOGICAL_W3, LOGICAL_H3);
    }
    this._ruleset.draw(ctx, this._session, timeMs, options);
    if (sprites)
      sb.drawOverlay(ctx, timeMs, 1 - dim);
    this._ruleset.drawAboveStoryboard?.(ctx, this._session, timeMs, options);
    if (options.showJudgement) {
      drawScore(ctx, this._scoreFrames, timeMs, this.skin);
      drawHUD(ctx, this._accFrames, timeMs, this.skin);
      if (this.replay.mode !== 3 && this.replay.mode !== 2)
        drawCombo(ctx, this._comboFrames, timeMs, this.skin);
    }
    if (options.showModIcons)
      drawModIcons(ctx, this._modIconRow);
    if (options.hudOverlay !== void 0)
      options.hudOverlay(ctx, timeMs);
    if (options.showURBar)
      drawURBar(ctx, this._urTimeline, timeMs);
  }
};

// src/session.ts
function storyboardDecodeQuality(pageZoom) {
  const dpr = (typeof devicePixelRatio === "number" ? devicePixelRatio : 1) || 1;
  return Math.max(1, Math.min(dpr * pageZoom, 3));
}
function computeIntroOffsetMs(beatmap, preempt, storyboardStartMs = null) {
  const start = trimmedIntroStartMs(beatmap, preempt);
  return storyboardStartMs === null ? start : Math.min(start, storyboardStartMs);
}
function trimmedIntroStartMs(beatmap, preempt) {
  const firstObjMs = beatmap.hitObjects[0]?.time;
  const firstHoldMs = beatmap.maniaHolds[0]?.time;
  let firstMs;
  if (firstObjMs !== void 0 && firstHoldMs !== void 0)
    firstMs = Math.min(firstObjMs, firstHoldMs);
  else
    firstMs = firstObjMs ?? firstHoldMs;
  if (firstMs === void 0)
    return 0;
  const firstApproachMs = firstMs - preempt;
  const LEAD_MS = 2e3;
  const MIN_TRIM_MS = 4e3;
  const offset = Math.max(0, firstApproachMs - LEAD_MS);
  return offset >= MIN_TRIM_MS ? offset : 0;
}
function computeOutroOffsetMs(beatmap, mapDurationMs) {
  if (beatmap.hitObjects.length === 0 && beatmap.maniaHolds.length === 0)
    return 0;
  let lastEventMs = 0;
  for (const obj of beatmap.hitObjects) {
    let endMs;
    if (obj.type === "spinner") {
      endMs = obj.endTime;
    } else if (obj.type === "slider") {
      endMs = obj.time + slideDurationMs(beatmap, obj) * obj.slides;
    } else {
      endMs = obj.time;
    }
    lastEventMs = Math.max(lastEventMs, endMs);
  }
  for (const h of beatmap.maniaHolds) {
    if (h.endTime > lastEventMs)
      lastEventMs = h.endTime;
  }
  const TAIL_MS = 1e3;
  const MIN_TRIM_MS = 4e3;
  const outroOffset = Math.max(0, mapDurationMs - (lastEventMs + TAIL_MS));
  return outroOffset >= MIN_TRIM_MS ? outroOffset : 0;
}
function resolveTaikoPippidonOwnership(base, selected) {
  const isPippidon = (k) => k.startsWith("pippidon");
  const stripPippidon = (skin) => {
    let hasPippidon = false;
    for (const k of skin.images.keys()) {
      if (isPippidon(k)) {
        hasPippidon = true;
        break;
      }
    }
    if (!hasPippidon)
      return skin;
    const images = /* @__PURE__ */ new Map();
    for (const [k, v] of skin.images)
      if (!isPippidon(k))
        images.set(k, v);
    return { ...skin, images };
  };
  let selectedOwns = false;
  let selectedHasStub = false;
  for (const [k, bmp] of selected.images) {
    if (!isPippidon(k))
      continue;
    selectedHasStub = true;
    if (!isBlankImage(bmp)) {
      selectedOwns = true;
      break;
    }
  }
  if (selectedOwns)
    return { base: stripPippidon(base), selected };
  if (selectedHasStub)
    return { base: stripPippidon(base), selected: stripPippidon(selected) };
  return { base, selected: stripPippidon(selected) };
}
function buildSkin(base, overlay, opts = {}) {
  let skinAssets = base;
  let spinnerSource = base;
  if (overlay !== void 0) {
    const { base: pBase, selected: pSelected } = opts.mode === 1 ? resolveTaikoPippidonOwnership(base, overlay) : { base, selected: overlay };
    skinAssets = mergeSkinAssets(pBase, pSelected);
    spinnerSource = overlay;
  }
  const spinnerImages = /* @__PURE__ */ new Map();
  for (const [key, val] of spinnerSource.images) {
    if (/^spinner-/i.test(key))
      spinnerImages.set(key, val);
  }
  return { ...skinAssets, spinnerImages };
}
async function createReplaySession(inputs) {
  const { canvas, audioContext } = inputs;
  const replayData = inputs.replay instanceof ArrayBuffer ? await parseReplay(inputs.replay) : inputs.replay;
  let assets;
  const fresh = inputs.beatmapSet instanceof ArrayBuffer;
  if (inputs.beatmapSet instanceof ArrayBuffer) {
    const { osuBytes, audioBuffer: songBuffer2, background: background2, beatmapSounds: beatmapSounds2, storyboard, storyboardImages, video: video2 } = await loadBeatmapSet(inputs.beatmapSet, replayData.beatmapHash, audioContext, inputs.fetchOsuOverride, {
      storyboard: inputs.storyboard === true,
      video: inputs.storyboard === true && inputs.video === true,
      storyboardDecodeQuality: storyboardDecodeQuality(inputs.pageZoom ?? 1)
    });
    const beatmap = parseBeatmap(new TextDecoder("utf-8").decode(osuBytes));
    beatmap.rawOsu = osuBytes;
    assets = { beatmap, songBuffer: songBuffer2, background: background2, beatmapSounds: beatmapSounds2, storyboard, storyboardImages, video: video2 };
  } else {
    assets = inputs.beatmapSet;
  }
  const beatmapData = assets.beatmap;
  const songBuffer = assets.songBuffer;
  const background = assets.background;
  const beatmapSounds = assets.beatmapSounds;
  const modeName = ["osu!std", "taiko", "catch", "mania"];
  if (replayData.mode !== 0 && replayData.mode !== 1 && replayData.mode !== 2 && replayData.mode !== 3) {
    const rm = modeName[replayData.mode] ?? `mode ${replayData.mode}`;
    throw new Error(`This viewer does not support ${rm} replays yet.`);
  }
  if (beatmapData.mode !== 0 && beatmapData.mode !== 1 && beatmapData.mode !== 2 && beatmapData.mode !== 3) {
    const bm = modeName[beatmapData.mode] ?? `mode ${beatmapData.mode}`;
    throw new Error(`This viewer does not support ${bm} beatmaps yet.`);
  }
  if (beatmapData.mode === 1 && replayData.mode === 0) {
    throw new Error("Beatmap/replay mode mismatch: a taiko beatmap cannot be played in osu!std.");
  }
  if (beatmapData.mode === 3 && replayData.mode !== 3) {
    throw new Error("Beatmap/replay mode mismatch: a mania beatmap requires a mania replay.");
  }
  if (replayData.mode === 3 && beatmapData.mode !== 3) {
    throw new Error("Beatmap/replay mode mismatch: mania replays on non-mania maps (converts) are not supported yet.");
  }
  if (beatmapData.mode === 2 && replayData.mode !== 2) {
    throw new Error("Beatmap/replay mode mismatch: a catch beatmap requires a catch replay.");
  }
  if (replayData.mode === 2 && beatmapData.mode !== 2 && beatmapData.mode !== 0) {
    throw new Error("Beatmap/replay mode mismatch: catch replays are only supported on catch maps or std\u2192catch converts.");
  }
  const modDiff = computeModDifficulty(beatmapData, replayData);
  if (fresh && beatmapData.mode !== 3 && replayData.mode !== 2)
    applyStacking(beatmapData, modDiff);
  warmSliderPaths(beatmapData);
  const skinAssets = inputs.skin;
  warmSkinCaches(skinAssets);
  let rawMapDurationMs = 0;
  for (const frame of replayData.frames) {
    if (frame.timeDelta >= 0)
      rawMapDurationMs += frame.timeDelta;
  }
  const videoStatus = probeVideoSupport(assets.storyboard, assets.video);
  const video = inputs.storyboard !== false && inputs.video !== false && videoStatus.kind === "playable" ? createVideoElementSource(assets.video) : null;
  const storyboardInputs = inputs.storyboard !== false && assets.storyboard !== null ? { data: assets.storyboard, images: assets.storyboardImages, video: video === null ? null : { path: assets.video.path, source: video } } : null;
  const introOffsetMs = computeIntroOffsetMs(beatmapData, modDiff.preemptMs, storyboardInputs?.data.earliestEventTime ?? null);
  const outroOffsetMs = computeOutroOffsetMs(beatmapData, rawMapDurationMs);
  const timeMapper = new TimeMapper(replayData.frames, introOffsetMs, outroOffsetMs, modDiff.speed);
  const player = new Player(timeMapper.presentationDurationMs);
  const [lazerDefaultSounds, lazerModIcons] = await Promise.all([
    loadLazerDefaultSounds(audioContext, inputs.lazerDefaultsUrl),
    loadLazerDefaultModIcons(inputs.lazerDefaultsUrl)
  ]);
  const renderer = new Renderer(
    canvas,
    player,
    replayData,
    beatmapData,
    skinAssets,
    timeMapper,
    background,
    modDiff,
    void 0,
    inputs.pageZoom ?? 1,
    lazerModIcons,
    storyboardInputs
  );
  renderer.options.userRate = inputs.userRate ?? 1;
  const mode = replayData.mode === 1 ? 1 : replayData.mode === 3 ? 3 : replayData.mode === 2 ? 2 : 0;
  const audioSync = new AudioSync({
    ctx: audioContext,
    songBuffer,
    skinSounds: inputs.skin.sounds,
    beatmapSounds,
    beatmapHitsounds: inputs.beatmapHitsounds ?? true,
    hitResults: renderer.hitResults,
    beatmap: beatmapData,
    introOffsetMs,
    speed: modDiff.speed,
    isNC: modDiff.isNC,
    userRate: inputs.userRate ?? 1,
    mode,
    maniaSamples: renderer.maniaSamples,
    taikoGhostTaps: renderer.taikoGhostTaps,
    comboFrames: renderer.comboFrames,
    lazerDefaultSounds,
    storyboardSamples: storyboardInputs === null ? null : playableStoryboardSamples(storyboardInputs.data)
  });
  return {
    player,
    renderer,
    audioSync,
    timeMapper,
    beatmap: beatmapData,
    replay: replayData,
    modDiff,
    mode,
    introOffsetMs,
    speed: modDiff.speed,
    background,
    assets,
    videoStatus,
    video,
    destroy() {
      renderer.destroy();
      audioSync.destroy();
      video?.dispose();
    }
  };
}

// src/player/workers.ts
var configuredManifest = {};
function configureWorkers(manifest2) {
  configuredManifest = { ...configuredManifest, ...manifest2 };
}
function manifest() {
  if (typeof window === "undefined")
    return null;
  const m = window.__WORKER_JS__;
  return m ?? null;
}
function workerUrl(name) {
  const file = configuredManifest[name] ?? manifest()?.[name];
  return typeof file === "string" && file.length > 0 ? file : null;
}
function workerAvailable(name) {
  return typeof Worker === "function" && workerUrl(name) !== null;
}
function spawnWorker(name) {
  const url = workerUrl(name);
  if (url === null || typeof Worker !== "function")
    return null;
  try {
    return new Worker(url, { type: "module" });
  } catch {
    return null;
  }
}

// src/player/stretchClient.ts
function stretchWorkerAvailable() {
  return workerAvailable("stretch");
}
async function stretchAudioBuffer(input, tempo, ctx) {
  if (tempo === 1)
    return input;
  const worker = spawnWorker("stretch");
  if (worker === null)
    return timeStretch(input, tempo, ctx);
  const L = input.getChannelData(0);
  const R = input.numberOfChannels > 1 ? input.getChannelData(1) : L;
  try {
    const out = await new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        const d = e.data;
        if (d.L instanceof Float32Array && d.R instanceof Float32Array)
          resolve({ L: d.L, R: d.R });
        else
          reject(new Error(d.error ?? "stretch worker returned no data"));
      };
      worker.onerror = (e) => reject(new Error(e.message || "stretch worker error"));
      worker.postMessage({ L, R, sampleRate: input.sampleRate, tempo });
    });
    const buf = ctx.createBuffer(2, out.L.length, input.sampleRate);
    buf.getChannelData(0).set(out.L);
    buf.getChannelData(1).set(out.R);
    return buf;
  } catch {
    return timeStretch(input, tempo, ctx);
  } finally {
    worker.terminate();
  }
}
export {
  AudioSync,
  MOD_ICON_SPECS,
  Mod,
  Player,
  Renderer,
  TimeMapper,
  activeModAcronyms,
  analyzeReplay,
  animationFramePath,
  applyEasing,
  applyPositionOffsets,
  applyStacking,
  buildSkin,
  collectStoryboardPaths,
  combineLN,
  composeModIcon,
  computeHitsoundSchedule,
  computeModDifficulty,
  configureWorkers,
  convertBeatmapToCatch,
  convertBeatmapToMania,
  createReplaySession,
  createVideoElementSource,
  extendedModIconInfo,
  extractBeatmapBackground,
  generateCatchAutoReplay,
  generateManiaAutoReplay,
  generateStdAutoReplay,
  generateTaikoAutoReplay,
  hasMod,
  loadBeatmapSet,
  loadLazerDefaultModIcons,
  loadSkin,
  loadSkinFromDir,
  lookupCustomSound,
  lookupEffectSound,
  lookupSkinSound,
  lookupStoryboardSample,
  md5,
  mergeSkinAssets,
  parseBeatmap,
  parseReplay,
  parseStoryboard,
  playableStoryboardSamples,
  probeVideoSupport,
  resolveSample,
  resolveStoryboardPath,
  spawnWorker,
  storyboardFilename,
  stretchAudioBuffer,
  stretchWorkerAvailable,
  synthesizeAutoReplay,
  workerAvailable,
  workerUrl
};
