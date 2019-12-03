import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import visualizeStream from "./visualize-stream.js";

export async function recvBypass($canvas) {
  const Recver = Comlink.wrap(new Worker("./src/worker/recver.js"));
  const recver = await new Recver("audio");
  // const recver = new Worker("./src/worker/recver.js");

  const audioContext = new AudioContext();
  console.log("recver sampleRate:", audioContext.sampleRate);

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);

  visualizeStream(gainNode, $canvas, { audioContext });

  let startTime = 0;
  recver.onmessage = Comlink.proxy(data => {
    const audioBuffer = new AudioBuffer({
      numberOfChannels: 1,
      length: data.length,
      sampleRate: audioContext.sampleRate
    });

    audioBuffer.getChannelData(0).set(data);

    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode);
    sourceNode.onended = () => sourceNode.disconnect();

    const currentTime = audioContext.currentTime;
    if (currentTime < startTime) {
      sourceNode.start(startTime);
      startTime += audioBuffer.duration;
    } else {
      sourceNode.start(currentTime);
      startTime = currentTime + audioBuffer.duration;
    }
  });
}
