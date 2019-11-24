import visualizeStream from "./visualize-stream.js";
import { encode, decode } from "./g711.js";
import { float32ToInt16, int16ToFloat32 } from "./array.js";

(async () => {
  const $capture = document.querySelector("button");
  const [$original, $compressed] = document.querySelectorAll("canvas");

  $capture.onclick = async () => {
    await runSender($original, $compressed, new BroadcastChannel("audio"));
  };
})().catch(console.error);

async function runSender($original, $compressed, sender) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // G.711 requires 8000Hz
  const audioContext = new AudioContext({ sampleRate: 8000 });
  console.log("sender:", audioContext.sampleRate);

  await audioContext.audioWorklet.addModule('./src/bypass-processor.js');

  const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
  // stereo, sampleRate: 8000
  let originalAnalyserNode = visualizeStream(sourceNode, $original, { audioContext });

  // compand
  const compNode = new AudioWorkletNode(audioContext, 'bypass-processor');
  compNode.port.onmessage = ({ data }) => {
    // netwoking shim
    const delay = Math.random() * 10;

    // send original f32
    // setTimeout(() => sender.postMessage(data), delay);

    const i16 = float32ToInt16(data);
    const encoded = encode(i16);
    setTimeout(() => sender.postMessage(encoded), delay);
  };

  // run pipeline
  originalAnalyserNode
    .connect(compNode);

  let compressedAnalyserNode = visualizeStream(compNode, $compressed, { audioContext });
  compressedAnalyserNode
    .connect(audioContext.destination);

  // debug
  // setTimeout(() => {
  //   sourceNode.disconnect();
  //   compNode.disconnect();
  // }, 1000);
}
