importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
const { Comlink } = self;

class Worker {
  constructor(name) {
    const ch = new BroadcastChannel(name);
    ch.onmessage = ({ data }) => {
      const decoded = this.decode(data);
      this.onmessage(Comlink.transfer(decoded, [decoded.buffer]));
    };
  }

  decode(data) {
    return data;
  }

  onmessage() {
    throw new Error("should be override!");
  }
}

Comlink.expose(Worker);
