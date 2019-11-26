class G711EncodeProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      for (let i = 0; i < input[channel].length / 2; ++i) {
        output[channel][i] = enc_u_law(input[channel][i*2]);
      }
    }

    return true;
  }
}

// mu is defined as 255: https://ja.wikipedia.org/wiki/%CE%9C-law%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0
const mu = 255.0;
const ln_mu = Math.log(1 + mu);
function enc_u_law(x) {
  const sign_x = Math.sign(x);
  const abs_x = Math.abs(x);
  return sign_x * Math.log(1 + mu * abs_x) / ln_mu;
}

registerProcessor('g711-encode-processor', G711EncodeProcessor);
