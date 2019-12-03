import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import visualizeStream from "./visualize-stream.js";
import Player from "./player.js";

export async function recvBypass($canvas) {
  const Recver = Comlink.wrap(new Worker("./src/worker/recver.js"));
  const recver = await new Recver("audio");

  const audioContext = new AudioContext();
  console.log("recver sampleRate:", audioContext.sampleRate);

  const player = new Player(audioContext);
  window.player = player;

  recver.onmessage = Comlink.proxy(data => player.enqueue(data));

  const recvNode = player.startAsNode();
  recvNode.connect(audioContext.destination);

  visualizeStream(recvNode, $canvas, { audioContext });
}
