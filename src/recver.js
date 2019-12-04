import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import visualizeStream from "./visualize-stream.js";
import Player from "./player.js";
import BitrateCounter from "./counter.js";


export async function recvBypass($canvas, $bps, sampleRate) {
  const audioContext = new AudioContext({ sampleRate });

  const player = new Player(audioContext);
  const counter = new BitrateCounter();

  const Recver = Comlink.wrap(new Worker("./src/worker/recver.js"));
  const recver = await new Recver("audio");
  recver.onmessage = Comlink.proxy(data => {
    counter.count(data.byteLength);
    player.enqueue(data);
  });

  const recvNode = player.startAsNode();
  recvNode.connect(audioContext.destination);
  counter.start($bps);

  visualizeStream(recvNode, $canvas, { audioContext });
}
