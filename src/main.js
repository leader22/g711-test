import visualizeStream from "./visualize-stream.js";

(async () => {
  const [$bypassButton, $g711Button, $lowpassButton] = document.querySelectorAll("button");
  const [$original, $compressed] = document.querySelectorAll("canvas");

  $bypassButton.onclick = async () => {
    await runSender(0, $original, $compressed, new BroadcastChannel("audio"));
  };
  $g711Button.onclick = async () => {
    await runSender(1, $original, $compressed, new BroadcastChannel("audio"));
  };
  $lowpassButton.onclick = async () => {
    await runSender(2, $original, $compressed, new BroadcastChannel("audio"));
  };
})().catch(console.error);

async function runSender(selector, $original, $compressed, sender) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // G.711 requires 8000Hz
  const audioContext = new AudioContext({ sampleRate: 8000 });
  console.log("sender:", audioContext.sampleRate);

  await audioContext.audioWorklet.addModule('./src/bypass-processor.js');
  await audioContext.audioWorklet.addModule('./src/g711-encode-processor.js');
  await audioContext.audioWorklet.addModule('./src/g711-decode-processor.js');
  await audioContext.audioWorklet.addModule('./src/lowpass-processor.js');

  const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
  // stereo, sampleRate: 8000
  let originalAnalyserNode = visualizeStream(sourceNode, $original, { audioContext });

  // compand
  const bypassNode = new AudioWorkletNode(audioContext, 'bypass-processor');
  const lowpassNode = new AudioWorkletNode(audioContext, 'lowpass-processor');
  const g711EncodeNode = new AudioWorkletNode(audioContext, 'g711-encode-processor');
  const g711DecodeNode = new AudioWorkletNode(audioContext, 'g711-decode-processor');

  // run pipeline
  let processedNode;
  switch (selector) {
    case 1:
      processedNode = originalAnalyserNode
          .connect(g711EncodeNode)
          .connect(g711DecodeNode);
      break;
    case 2:
      processedNode = originalAnalyserNode
          .connect(lowpassNode);
      break;
    default:
      processedNode = originalAnalyserNode
          .connect(bypassNode);
  }

  let compressedAnalyserNode = visualizeStream(processedNode, $compressed, { audioContext });
  compressedAnalyserNode
    .connect(audioContext.destination);
}
