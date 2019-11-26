class LowPassProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // for moving average, for each channel
    this.lastValue = [];
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
       for (let i = 0; i < output[channel].length; ++i) {
         const cur = input[channel][i];
         const last = this.lastValue[channel] || 0;

         // 移動平均
         const v = movingAverage(last, cur);
         output[channel][i] = this.lastValue[channel] = v;
       }
    }

    return true;
  }
}

function movingAverage(a, b, k = 0.1) {
  return (1 - k) * a + k * b;
}

registerProcessor('lowpass-processor', LowPassProcessor);
