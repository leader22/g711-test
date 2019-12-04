importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
importScripts("./mu-law.js");
const { Comlink, muLaw } = self;

class Worker {
  constructor(name) {
    this._ch = new BroadcastChannel(name);

    this._bytesSent = 0;
    setInterval(() => {
      console.log(`${(this._bytesSent * 8) / 1024} kbps`);
      this._bytesSent = 0;
    }, 1000);
  }

  // nakakura: 48000hz x f32(512) + muLaw => 752kbps
  encode5(input) {
    const output = new Float32Array(input.length / 2);

    for (let i = 0; i < input.length; i += 2) {
      output[i / 2] = muLaw.encode(input[i]);
    }

    return output;
  }

  // ganeko: 48000hz x i8(512) + muLaw => 188kbps
  encode4(srcArr) {
    const mu = 127;
    const alpha = (1.0 / Math.log(1 + mu)) * mu;

    const l = srcArr.length;
    const arr = new Int8Array(l / 2);

    for (let i = 0; i < l; i += 2) {
      const s = srcArr[i];
      const n = _muLaw(s, mu, alpha);
      arr[i / 2] = n;
    }

    return arr;

    function _muLaw(s, mu, alpha) {
      const sign = Math.sign(s);
      const absS = Math.abs(s);

      const n = sign * Math.log(1 + mu * absS) * alpha;
      return n;
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

  // downsample: 48000hz x f32(512) => 752kbps
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
      output[i] =  input[i];
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
