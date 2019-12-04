importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
importScripts("./mu-law.js");
const { Comlink, muLaw } = self;
muLaw;

class Worker {
  constructor(name) {
    const ch = new BroadcastChannel(name);
    ch.onmessage = ({ data }) => {
      const decoded = this.decode2(data);
      this.onmessage(Comlink.transfer(decoded, [decoded.buffer]));
    };
  }

  // upsample by 2
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
