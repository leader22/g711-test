import { encode, decode } from "./g711.js";

function float32ToInt16(buffer) {
  let l = buffer.length;
  const buf = new Int16Array(l);
  while (l--) {
    buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
  }
  return buf;
}

function int16ToFloat32(int16arr) {
  const output = new Float32Array(int16arr.length);
  for (let i = 0; i < int16arr.length; i++) {
    const int = int16arr[i];
    const float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
    output[i] = float;
  }
  return output;
}

class G711Processor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    // use only 1 IN/OUT node
    const input = inputs[0];
    const output = outputs[0];

    // channel: stereo[L, R] = [Float32Array(128), Float32Array(128)]
    for (let channel = 0; channel < output.length; ++channel) {
      const original = input[channel];
      const i16 = float32ToInt16(original);
      const encoded = encode(i16);

      // TODO: networking here

      const decoded = decode(encoded);
      const f32 = int16ToFloat32(decoded);
      output[channel].set(f32);
    }

    return true;
  }
}

registerProcessor('g711-processor', G711Processor);
