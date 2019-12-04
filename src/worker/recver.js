importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
importScripts("./mu-law.js");
const { Comlink, muLaw } = self;

class Worker {
  constructor(name) {
    const ch = new BroadcastChannel(name);
    ch.onmessage = ({ data }) => {
      const decoded = this.decode5(data);
      this.onmessage(Comlink.transfer(decoded, [decoded.buffer]));
    };
  }

  decode6(input) {
    const output = new Float32Array(input.length * 2);

    for (let i = 0; i < input.length; i++) {
      const v = muLaw.decode(input[i]);
      const idx = i * 2;

      // even idx: fill value
      output[idx] = v;
      if (i !== 0) {
        // odd idx: by average
        output[idx - 1] = (output[idx] + output[idx - 2]) / 2;
      }
    }
    // last odd idx: use previous(should be filled by prev tick)
    output[input.length * 2 - 1] = output[input.length * 2 - 2];

    return output;
  }

  decode5(input) {
    const output = new Float32Array(input.length * 2);

    for (let i = 0; i < input.length; i++) {
      const int = input[i];
      const v = int >= 0x8000 ? -(0x10000 - int) / 0x8000 : int / 0x7fff;
      const idx = i * 2;

      // even idx: fill value
      output[idx] = v;
      if (i !== 0) {
        // odd idx: by average
        output[idx - 1] = (output[idx] + output[idx - 2]) / 2;
      }
    }

    // last odd idx: use previous(should be filled by prev tick)
    output[input.length * 2 - 1] = output[input.length * 2 - 2];

    return output;
  }

  decode4(srcArr) {
    const mu = 127;
    const mui = 1.0 / mu;

    const l = srcArr.length;
    const arr = new Float32Array(l * 2);

    for (let i = 0; i < l; i++) {
      const n = srcArr[i];
      arr[i * 2] = _invMuLaw(n, mu, mui);

      if (i > 0) {
        arr[i * 2 - 1] = (arr[i * 2] + arr[i * 2 - 2]) / 2.0;
      }
    }
    arr[l * 2 - 1] = arr[l * 2 - 2];

    return arr;

    function _invMuLaw(n, mu, mui) {
      const sign = Math.sign(n);
      const absN = Math.abs(n);

      const f = absN * mui;
      const s = sign * mui * (Math.pow(1 + mu, f) - 1);
      return s;
    }
  }

  decode3(input) {
    const output = new Float32Array(input.length);

    for (let i = 0; i < input.length; i++) {
      const int = input[i];
      const v = int >= 0x8000 ? -(0x10000 - int) / 0x8000 : int / 0x7fff;
      output[i] = v;
    }

    return output;
  }

  decode2(input) {
    const output = new Float32Array(input.length * 2);

    for (let i = 0; i < input.length; i++) {
      const v = input[i];
      const idx = i * 2;

      // even idx: fill value
      output[idx] = v;
      if (i !== 0) {
        // odd idx: by average
        output[idx - 1] = (output[idx] + output[idx - 2]) / 2;
      }
    }

    // last odd idx: use previous(should be filled by prev tick)
    output[input.length * 2 - 1] = output[input.length * 2 - 2];

    return output;
  }

  decode(input) {
    const output = new Float32Array(input.length);

    for (let i = 0; i < input.length; i++) {
      const v = input[i];
      output[i] = v;
    }

    return output;
  }

  onmessage() {
    throw new Error("should be override!");
  }
}

Comlink.expose(Worker);
