class BypassProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const [input] = inputs;
    const [output] = outputs;

    // bypass everything
    this.port.postMessage(input[0]);

    // discard outputs
    for (let channel = 0; channel < output.length; ++channel) {
      output[channel].set(new Float32Array(input[channel.length]));
    }

    return true;
  }
}

registerProcessor('bypass-processor', BypassProcessor);
