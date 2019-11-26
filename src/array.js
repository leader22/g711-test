export function float32ToInt16(buffer) {
  let l = buffer.length;
  const buf = new Int16Array(l);
  while (l--) {
    buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
  }
  return buf;
}

export function int16ToFloat32(int16arr) {
  const output = new Float32Array(int16arr.length);
  for (let i = 0; i < int16arr.length; i++) {
    const int = int16arr[i];
    const float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
    output[i] = float;
  }
  return output;
}
