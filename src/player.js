const THRESHOLD = 2;
const QUEUE_SIZE = 16;

export default class PlayerNode {
  constructor(audioContext) {
    this._osc = audioContext.createOscillator();
    this._processor = audioContext.createScriptProcessor(0, 1, 1);

    // Map<number, Float32Array>
    this._queue = new Map();

    // range: 0 ~ QUEUE_SIZE
    this._pos = 0;
    this._cur = 0;
    this._canDeq = false;
  }

  startAsNode() {
    this._processor.onaudioprocess = this._process.bind(this);

    this._osc.connect(this._processor);
    this._osc.start();

    return this._processor;
  }

  enqueue(data) {
    this._queue.set(this._pos, data);
    this._pos = (this._pos + 1) & (QUEUE_SIZE - 1);

    const delta =
      this._pos > this._cur
        ? this._pos - this._cur
        : (this._pos | 0x10) - this._cur;

    if (delta > THRESHOLD) this._canDeq = true;
    if (this._canDeq && delta < 1) this._canDeq = false;
  }

  _process({ outputBuffer }) {
    if (!this._canDeq) return;

    const data = this._queue.get(this._cur);
    outputBuffer.getChannelData(0).set(data);
    this._cur = (this._cur + 1) & (QUEUE_SIZE - 1);
  }
}
