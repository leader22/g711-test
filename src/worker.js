importScripts("//unpkg.com/comlink/dist/umd/comlink.js");
const { Comlink } = self;

class Worker {
  constructor(name) {
    this._ch = new BroadcastChannel(name);
  }

  send(data) {
    setTimeout(() => this._ch.postMessage(data), 100);
  }
}

Comlink.expose(Worker);
