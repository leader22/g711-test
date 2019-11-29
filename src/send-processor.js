class SendProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const [[leftChannel]] = inputs;

    // bypass everything
    this.port.postMessage(leftChannel);

    // nothing to produce as outputs

    return true;
  }
}

registerProcessor('send-processor', SendProcessor);
