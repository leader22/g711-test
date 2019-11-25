import visualizeStream from "./visualize-stream.js";
import { encode, decode } from "./g711.js";
import { float32ToInt16, int16ToFloat32 } from "./array.js";

(async () => {
  const $capture = document.querySelector("button");
  const [$original, $compressed] = document.querySelectorAll("canvas");

  $capture.onclick = async () => {
    await runSender($original, new BroadcastChannel("audio"));
    runRecver($compressed, new BroadcastChannel("audio"));
  };
})().catch(console.error);

async function runSender($canvas, sender) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // G.711 requires 8000Hz
  const audioContext = new AudioContext({ sampleRate: 8000 });
  console.log("sender:", audioContext.sampleRate);

  await audioContext.audioWorklet.addModule('./src/bypass-processor.js');

  const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
  // stereo, sampleRate: 8000
  visualizeStream(sourceNode, $canvas, { audioContext });

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

  // do not sound sender output
  const gainNode = new GainNode(audioContext, { gain: 0 });

  // run pipeline
  sourceNode
    .connect(compNode)
    .connect(gainNode)
    .connect(audioContext.destination);

  // debug
  // setTimeout(() => {
  //   sourceNode.disconnect();
  //   compNode.disconnect();
  // }, 1000);
}

function runRecver($canvas, recver) {
  const audioContext = new AudioContext();
  console.warn("recver:", audioContext.sampleRate);

  const gainNode = new GainNode(audioContext, {});
  gainNode.connect(audioContext.destination);

  // monaural, sampleRate: 8000
  visualizeStream(gainNode, $canvas, { audioContext });

  recver.onmessage = ({ data }) => {
    console.warn("recv byte", data.buffer.byteLength);

    const decoded = decode(data);
    const f32 = int16ToFloat32(decoded);
    // const f32 = new Float32Array(data.buffer);

    const audioBuffer = new AudioBuffer({
      length: f32.length,
      sampleRate: 8000 // must be same as sender sample rate
    });
    audioBuffer.getChannelData(0).set(f32);

    const sourceNode = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
    sourceNode.connect(gainNode);

    sourceNode.onended = () => sourceNode.disconnect();
    sourceNode.start(0); // should care network delay by queuing
  };
}
