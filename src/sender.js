import visualizeStream from "./visualize-stream.js";

export function sendBypass(mediaStream, $canvas, sender) {
  const audioContext = new AudioContext();
  console.log("sender:", audioContext.sampleRate);

  const sourceNode = audioContext.createMediaStreamSource(mediaStream);
  const lowpassNode = audioContext.createBiquadFilter();
  lowpassNode.type = "lowpass";

  // 0 = auto bufferSize / 1 input channel / 1 output channel(required)
  const sendNode = audioContext.createScriptProcessor(0, 1, 1);
  sendNode.onaudioprocess = ({ inputBuffer }) => {
    // TODO: send by worker thread

    // Float32Array: size is 1024 by auto in Chrome
    const data = inputBuffer.getChannelData(0);
    setTimeout(() => sender.postMessage(data), 100);
  };

  // run pipeline
  sourceNode
    .connect(lowpassNode)
    .connect(sendNode)
    .connect(audioContext.destination);
  visualizeStream(lowpassNode, $canvas, { audioContext });

  // debug
  // setTimeout(() => {
  //   sourceNode.disconnect();
  //   lowpassNode.disconnect();
  //   sendNode.disconnect();
  // }, 1000);
}
