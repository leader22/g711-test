importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
const { Comlink } = self;

class Worker {
  constructor(name) {
    this._ch = new BroadcastChannel(name);

    this._bytesSent = 0;
    setInterval(() => {
      console.log(`${(this._bytesSent * 8) / 1024} kbps`);
      this._bytesSent = 0;
    }, 1000);
  }

  // nakakura: 24000hz x f32(512) + muLaw => 752kbps
  encode6(input) {
    const output = new Float32Array(input.length / 2);

    for (let i = 0; i < input.length; i += 2) {
      output[i / 2] = muLawEncode(input[i]);
    }

    return output;

    function muLawEncode(x) {
      const MU = 255.0;
      const LN_MU = Math.log(1 + MU);
      return (Math.sign(x) * Math.log(1 + MU * Math.abs(x))) / LN_MU;
    }
  }

  // downsample+depth: 24000hz x i16(512) => 376kbps
  encode5(input) {
    const output = new Int16Array(input.length / 2);

    for (let i = 0; i < input.length; i += 2) {
      const v = Math.min(1, input[i]) * 0x7fff;
      output[i / 2] = v;
    }

    return output;
  }

  // ganeko: 24000hz x i8(512) + muLaw => 188kbps
  encode4(srcArr) {
    const l = srcArr.length;
    const arr = new Int8Array(l / 2);

    for (let i = 0; i < l; i += 2) {
      const s = srcArr[i];
      const n = _muLaw(s);
      arr[i / 2] = n;
    }

    return arr;

    function _muLaw(s) {
      const mu = 127;
      const alpha = (1.0 / Math.log(1 + mu)) * mu;
      return Math.sign(s) * Math.log(1 + mu * Math.abs(s)) * alpha;
    }
  }

  // downdepth: 48000hz x i16(1024) => 752kbps
  encode3(input) {
    const output = new Int16Array(input.length);

    let len = input.length;
    while (len--) {
      const v = Math.min(1, input[len]) * 0x7fff;
      output[len] = v;
    }

    return output;
  }

  // downsample: 24000hz x f32(512) => 752kbps
  encode2(input) {
    const output = new Float32Array(input.length / 2);

    for (let i = 0; i < input.length; i += 2) {
      output[i / 2] = input[i];
    }

    return output;
  }

  // default: 48000hz x f32(1024) => 1504kbps
  encode(input) {
    const output = new Float32Array(input.length);

    for (let i = 0; i < input.length; i++) {
      output[i] = input[i];
    }

    return output;
  }

  send(data) {
    const encoded = this.encode(data);
    this._bytesSent += encoded.byteLength;

    // shim networking
    setTimeout(() => this._ch.postMessage(encoded), Math.random() * 10);
  }
}

Comlink.expose(Worker);
