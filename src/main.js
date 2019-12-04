import { sendBypass } from "./sender.js";
import { recvBypass } from "./recver.js";

(async () => {
  const [$range] = document.querySelectorAll("input");
  const [$capture] = document.querySelectorAll("button");
  const [$before, $after] = document.querySelectorAll("canvas");

  $capture.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const step = $range.value;
    const sampleRate = 8000 * step;
    console.log("run: bypass sampleRate =", sampleRate);
    await sendBypass(stream, $before, sampleRate);
    await recvBypass($after, sampleRate);
  };
})().catch(console.error);
