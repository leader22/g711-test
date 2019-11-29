import visualizeStream from "./visualize-stream.js";
import { decode } from "./g711.js";
import { int16ToFloat32 } from "./array.js";

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

export function recvG711($canvas, recver) {
  const audioContext = new AudioContext();
  console.log("recver:", audioContext.sampleRate);

  const gainNode = new GainNode(audioContext, {});
  gainNode.connect(audioContext.destination);

  // monaural, sampleRate: 8000
  visualizeStream(gainNode, $canvas, { audioContext });

  recver.onmessage = ({ data }) => {
    console.log("recv byte", data.buffer.byteLength);

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
