importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
importScripts("./mu-law.js");
const { Comlink, muLaw } = self;

class Worker {
  constructor(name) {
    const ch = new BroadcastChannel(name);
    ch.onmessage = ({ data }) => {
      const decoded = this.decode(data);
      this.onmessage(Comlink.transfer(decoded, [decoded.buffer]));
    };
  }

  decode(input) {
    const output = new Float32Array(input.length);

    for (let i = 0; i < input.length; ++i) {
      const v = input[i];
      output[i] = muLaw.decode(v);
    }

    return output;
  }

  onmessage() {
    throw new Error("should be override!");
  }
}

Comlink.expose(Worker);
