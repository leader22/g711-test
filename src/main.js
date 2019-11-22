import visualizeStream from "./visualize-stream.js";

(async () => {
  const $capture = document.querySelector("button");
  const [$original, $compressed] = document.querySelectorAll("canvas");

  $capture.onclick = async () => {
    // G.711 requires 8000Hz
    const audioContext = new AudioContext({ sampleRate: 8000 });
    console.warn(audioContext.sampleRate);

    // compander(mu-law)
    await audioContext.audioWorklet.addModule('./src/g711-processor.js');
    await audioContext.audioWorklet.addModule('./src/bypass-processor.js');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    //                            --> visualizer(for original)
    // sourceNode -> filterNode -|
    //                            --> compander -> visualizer(for compressed)
    const sourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
    const filterNode = new BiquadFilterNode(audioContext, { type: "lowpass" });
    // compand
    const compNode = new AudioWorkletNode(audioContext, 'g711-processor');
    // const compNode = new AudioWorkletNode(audioContext, 'bypass-processor');

    // visualize
    const fftSize = 1024;
    // show original
    visualizeStream(filterNode, $original, { audioContext, fftSize });
    // show compressed
    visualizeStream(compNode, $compressed, { audioContext, fftSize });

    // run pipeline
    sourceNode
      .connect(filterNode)
      .connect(compNode)
      .connect(audioContext.destination);

    // debug
    setTimeout(() => {
      sourceNode.disconnect();
      filterNode.disconnect();
      compNode.disconnect();
    }, 1000);
  };
})().catch(console.error);
