import visualizeStream from "./visualize-stream.js";
import { encode } from "./g711.js";
import { float32ToInt16 } from "./array.js";

export async function sendBypass($canvas, sender) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioContext = new AudioContext();
  console.log("sender:", audioContext.sampleRate);

  await audioContext.audioWorklet.addModule('./src/send-processor.js');

  const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
  const lowpassNode = new BiquadFilterNode(audioContext, { type: "lowpass" });

  const sendNode = new AudioWorkletNode(audioContext, 'send-processor');
  sendNode.port.onmessage = ({ data }) => {
    // netwoking shim
    setTimeout(() => sender.postMessage(data), Math.random() * 0);
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
  //   sendNode.disconnect();
  // }, 1000);
}

export async function sendG711($canvas, sender) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // G.711 requires 8000Hz
  const audioContext = new AudioContext({ sampleRate: 8000 });
  console.log("sender:", audioContext.sampleRate);

  await audioContext.audioWorklet.addModule('./src/send-processor.js');

  const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
  // stereo, sampleRate: 8000
  visualizeStream(sourceNode, $canvas, { audioContext });

  // compand
  const sendNode = new AudioWorkletNode(audioContext, 'send-processor');
  sendNode.port.onmessage = ({ data }) => {
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
    .connect(sendNode)
    .connect(gainNode)
    .connect(audioContext.destination);

  // debug
  // setTimeout(() => {
  //   sourceNode.disconnect();
  //   sendNode.disconnect();
  // }, 1000);
}
