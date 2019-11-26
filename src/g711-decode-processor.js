class G711DecodeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.prev_value = [];
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      for (let i = 0; i < input[channel].length / 2; ++i) {
        output[channel][i*2 + 1] = dec_u_law(input[channel][i]);

        if(i > 0) {
          output[channel][i*2] = (output[channel][i*2 - 1] / 2.0 + output[channel][i*2 + 1] / 2.0)
        } else {
          // Prevent fft nodes from crashing
          if (this.prev_value[channel] > -1.0) {
            output[channel][0] = (this.prev_value[channel] / 2.0 + output[channel][1] / 2.0)
          }
        }
      }

      this.prev_value[channel] = output[channel][input[channel].length - 1];
    }

    return true;
  }
}

// mu is defined as 255: https://ja.wikipedia.org/wiki/%CE%9C-law%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0
const mu = 255.0;
const inv_mu = 1.0 / mu;
function dec_u_law(y) {
  const sign_y = Math.sign(y);
  const abs_y = Math.abs(y);
  return sign_y * inv_mu * (Math.pow(1 + mu, abs_y) - 1);
}

registerProcessor('g711-decode-processor', G711DecodeProcessor);

