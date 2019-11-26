import visualizeStream from "./visualize-stream.js";

(async () => {
  const [$bypassButton, $g711Button, $lowpassButton] = document.querySelectorAll("button");
  const [$original, $compressed] = document.querySelectorAll("canvas");

  $bypassButton.onclick = async () => {
    await runSender("bypass", $original, $compressed);
  };
  $g711Button.onclick = async () => {
    await runSender("g711", $original, $compressed);
  };
  $lowpassButton.onclick = async () => {
    await runSender("lowpass", $original, $compressed);
  };
})().catch(console.error);

async function runSender(selector, $original, $compressed) {
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
  const originalAnalyserNode = visualizeStream(sourceNode, $original, { audioContext });

  // compand
  const bypassNode = new AudioWorkletNode(audioContext, 'bypass-processor');
  const lowpassNode = new AudioWorkletNode(audioContext, 'lowpass-processor');
  const g711EncodeNode = new AudioWorkletNode(audioContext, 'g711-encode-processor');
  const g711DecodeNode = new AudioWorkletNode(audioContext, 'g711-decode-processor');

  // run pipeline
  let processedNode;
  switch (selector) {
    case "g711":
      // source -> analyser -> g711Encode -> g711Decode
      processedNode = originalAnalyserNode
          .connect(g711EncodeNode)
          .connect(g711DecodeNode);
      break;
    case "lowpass":
      // source -> analyser -> lowpass
      processedNode = originalAnalyserNode
          .connect(lowpassNode);
      break;
    case "bypass":
      // source -> analyser -> bypass
      processedNode = originalAnalyserNode
          .connect(bypassNode);
  }
  console.log(selector);

  // -> analyser -> destination
  const compressedAnalyserNode = visualizeStream(processedNode, $compressed, { audioContext });
  compressedAnalyserNode
    .connect(audioContext.destination);
}
