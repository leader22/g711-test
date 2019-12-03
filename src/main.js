import { sendBypass } from "./sender.js";
import { recvBypass } from "./recver.js";

(async () => {
  const [$bypass] = document.querySelectorAll("button");
  const [$before, $after] = document.querySelectorAll("canvas");

  $bypass.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sampleRate = 8000 * 6;
    console.log("run: bypass sampleRate =", sampleRate);
    await sendBypass(stream, $before, sampleRate);
    await recvBypass($after, sampleRate);
  };
})().catch(console.error);
