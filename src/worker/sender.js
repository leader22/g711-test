importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
importScripts("./mu-law.js");
const { Comlink, muLaw } = self;

class Worker {
  constructor(name) {
    this._ch = new BroadcastChannel(name);
  }

  encode(input) {
    const output = new Float32Array(input.length);

    for (let i = 0; i < input.length; ++i) {
      const v = input[i];
      output[i] = muLaw.encode(v);
    }

    return output;
  }

  send(data) {
    // shim networking
    setTimeout(
      () => this._ch.postMessage(this.encode(data)),
      Math.random() * 10
    );
  }
}

Comlink.expose(Worker);
