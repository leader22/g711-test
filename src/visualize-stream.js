export default (sourceNode, $canvas, { audioContext, fftSize }) => {
  fftSize = fftSize || 1024;

  const analyserNode = new AnalyserNode(audioContext, { fftSize });
  sourceNode.connect(analyserNode);

  const drawContext = $canvas.getContext('2d');
  $canvas.width = getComputedStyle($canvas).width.slice(0, -2);

  draw();
  function draw() {
    requestAnimationFrame(draw);

    const fbc = analyserNode.frequencyBinCount;
    const freqs = new Uint8Array(fbc);
    analyserNode.getByteFrequencyData(freqs);

    drawContext.clearRect(0, 0, $canvas.width, $canvas.height);
    for (let i = 0; i < freqs.length; i++) {
      // 0 - 255の値が返るのでそれを使って描画するバーの高さを得る
      const height = $canvas.height * (freqs[i] / 255);
      const offset = $canvas.height - height;
      const barWidth = $canvas.width / fbc;
      drawContext.fillStyle = `hsl(${(i / fbc * 360)}, 100%, 50%)`;
      drawContext.fillRect(i * barWidth, offset, barWidth + 1, height);
    }
  }
};
