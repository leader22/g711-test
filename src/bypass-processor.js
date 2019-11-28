class BypassProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const [[leftChannel]] = inputs;

    // bypass everything
    this.port.postMessage(leftChannel);

    // nothing to produce as outputs

    return true;
  }
}

registerProcessor('bypass-processor', BypassProcessor);
