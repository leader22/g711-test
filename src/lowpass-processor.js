class LowPassProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastPlf = [];
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    const k = 0.1;

    console.log("lowpass");
    if(this.lastPlf.length === 0) {
      this.lastPlf = new Array(input.length).fill(0.0);
    }

    for (let channel = 0; channel < output.length; ++channel) {
       for (let i = 0; i < output[channel].length; ++i) {
         output[channel][i] = (1 - k) * this.lastPlf[channel] + k * input[channel][i];
         this.lastPlf[channel] = output[channel][i];
       }
    }

    return true;
  }
}

registerProcessor('lowpass-processor', LowPassProcessor);
