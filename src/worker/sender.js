importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
importScripts("./mu-law.js");
const { Comlink, muLaw } = self;
muLaw;

class Worker {
  constructor(name) {
    this._ch = new BroadcastChannel(name);
  }

  // downsample by 2: 1024 -> 512 sample
  encode2(input) {
    const output = new Float32Array(input.length / 2);

    for (let i = 0; i < input.length; i += 2) {
      const v = input[i];

      output[i / 2] = v;
    }

    return output;
  }

  encode(input) {
    const output = new Float32Array(input.length);

    for (let i = 0; i < input.length; i++) {
      const v = input[i];

      output[i] = v;
    }

    return output;
  }

  send(data) {
    // shim networking
    setTimeout(
      () => this._ch.postMessage(this.encode2(data)),
      Math.random() * 10
    );
  }
}

Comlink.expose(Worker);
