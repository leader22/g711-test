import visualizeStream from "./visualize-stream.js";

(async () => {
  const $capture = document.querySelector("button");
  const [$original, $compressed] = document.querySelectorAll("canvas");

  $capture.onclick = async () => {
    const audioContext = new AudioContext({ sampleRate: 8000 });
    console.warn(audioContext.sampleRate);
    await audioContext.audioWorklet.addModule('./src/g711-processor.js');
    await audioContext.audioWorklet.addModule('./src/bypass-processor.js');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    //              --> visualizer(for original)
    // sourceNode -|
    //              --> compressor -> visualizer(for compressed)
    const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
    const fftSize = 1024;

    // show original
    visualizeStream(sourceNode, $original, { audioContext, fftSize });

    // compress
    const compNode = new AudioWorkletNode(audioContext, 'g711-processor');
    // const compNode = new AudioWorkletNode(audioContext, 'bypass-processor');
    // const compNode = new BiquadFilterNode(audioContext, { type: "lowpass" });
    sourceNode.connect(compNode);

    // show compressed
    visualizeStream(compNode, $compressed, { audioContext, fftSize });

    // debug
    compNode.connect(audioContext.destination);
    // setTimeout(() => {
    //   sourceNode.disconnect();
    //   compNode.disconnect();
    // }, 1000);
  };
})().catch(console.error);
