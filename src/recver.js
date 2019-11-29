import visualizeStream from "./visualize-stream.js";

export function recvBypass($canvas, recver) {
  const audioContext = new AudioContext();
  console.log("recver:", audioContext.sampleRate);

  const gainNode = new GainNode(audioContext, {});
  gainNode.connect(audioContext.destination);

  visualizeStream(gainNode, $canvas, { audioContext });

  let startTime = 0;
  recver.onmessage = ({ data }) => {
    const audioBuffer = new AudioBuffer({
      numberOfChannels: 1,
      length: data.length,
      sampleRate: audioContext.sampleRate
    });

    audioBuffer.getChannelData(0).set(data);

    const sourceNode = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
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
  };
}
