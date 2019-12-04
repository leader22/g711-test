import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import visualizeStream from "./visualize-stream.js";
import Player from "./player.js";

export async function recvBypass($canvas, sampleRate) {
  const audioContext = new AudioContext({ sampleRate });

  const player = new Player(audioContext);

  const Recver = Comlink.wrap(new Worker("./src/worker/recver.js"));
  const recver = await new Recver("audio");
  recver.onmessage = Comlink.proxy(data => player.enqueue(data));

  const recvNode = player.startAsNode();
  recvNode.connect(audioContext.destination);

  visualizeStream(recvNode, $canvas, { audioContext });
}
