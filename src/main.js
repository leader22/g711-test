import { sendBypass, sendG711 } from "./sender.js";
import { recvBypass, recvG711 } from "./recver.js";

(async () => {
  const [$bypass, $g711] = document.querySelectorAll("button");
  const [$original, $compressed] = document.querySelectorAll("canvas");

  $bypass.onclick = async () => {
    console.log("run: bypass");
    await sendBypass($original, new BroadcastChannel("audio"));
    recvBypass($compressed, new BroadcastChannel("audio"));
  };

  $g711.onclick = async () => {
    console.log("run: g711");
    await sendG711($original, new BroadcastChannel("audio"));
    recvG711($compressed, new BroadcastChannel("audio"));
  };
})().catch(console.error);
