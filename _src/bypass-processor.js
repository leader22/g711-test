class BypassProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      // TODO: should send 1 channel?
      this.port.postMessage(input[channel]);

      // for (let i = 0; i < output[channel].length; ++i) {
      //   output[channel][i] = input[channel][i];
      // }
      // same
      output[channel].set(input[channel]);
    }

    return true;
  }
}

registerProcessor('bypass-processor', BypassProcessor);
