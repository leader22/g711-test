import { sendBypass } from "./sender.js";
import { recvBypass } from "./recver.js";

(async () => {
  const [$bypass] = document.querySelectorAll("button");
  const [$before, $after] = document.querySelectorAll("canvas");

  $bypass.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    console.log("run: bypass");
    await sendBypass(stream, $before);
    await recvBypass($after, new BroadcastChannel("audio"));
  };
})().catch(console.error);
