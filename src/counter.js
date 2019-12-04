export default class BitrateCounter {
  constructor() {
    this._timer = null;
    this._bit = 0;
  }

  start($el) {
    this._timer = setInterval(() => {
      const kb = this._bit / 1024;
      $el.textContent = `${kb.toFixed(1)} kbps`;
      this._bit = 0;
    }, 1000);
  }

  count(byteLength) {
    this._bit += byteLength * 8;
  }
}
