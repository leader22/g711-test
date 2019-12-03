importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
const { Comlink } = self;

class Worker {
  constructor(name) {
    this._ch = new BroadcastChannel(name);
  }

  encode(data) {
    return data;
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
