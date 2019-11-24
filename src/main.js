import visualizeStream from "./visualize-stream.js";

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
  await audioContext.audioWorklet.addModule('./src/g711-encode-processor.js');
  await audioContext.audioWorklet.addModule('./src/g711-decode-processor.js');

  const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
  // stereo, sampleRate: 8000
  let originalAnalyserNode = visualizeStream(sourceNode, $original, { audioContext });

  // compand
  const bypassNode = new AudioWorkletNode(audioContext, 'bypass-processor');
  const g711EncodeNode = new AudioWorkletNode(audioContext, 'g711-encode-processor');
  const g711DecodeNode = new AudioWorkletNode(audioContext, 'g711-decode-processor');

  // run pipeline
  let node = originalAnalyserNode
      .connect(g711EncodeNode)
      .connect(g711DecodeNode);

  let compressedAnalyserNode = visualizeStream(node, $compressed, { audioContext });
  compressedAnalyserNode
    .connect(audioContext.destination);

  // debug
  // setTimeout(() => {
  //   sourceNode.disconnect();
  //   compNode.disconnect();
  // }, 1000);
}
