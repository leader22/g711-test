import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import visualizeStream from "./visualize-stream.js";

export async function sendBypass(mediaStream, $canvas) {
  const MyWorker = Comlink.wrap(new Worker("./src/worker.js"));
  const worker = await new MyWorker("audio");

  const audioContext = new AudioContext();
  console.log("sender sampleRate:", audioContext.sampleRate);

  const sourceNode = audioContext.createMediaStreamSource(mediaStream);
  const lowpassNode = audioContext.createBiquadFilter();
  lowpassNode.type = "lowpass";

  // 0 = auto bufferSize / 1 input channel / 1 output channel(required)
  const sendNode = audioContext.createScriptProcessor(0, 1, 1);
  sendNode.onaudioprocess = ({ inputBuffer }) => {
    // Float32Array: auto size is 1024 by auto in Chrome
    const data = inputBuffer.getChannelData(0);
    // use Transferable
    worker.send(Comlink.transfer(data, [data.buffer]));
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
