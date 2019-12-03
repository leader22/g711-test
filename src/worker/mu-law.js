// https://ja.wikipedia.org/wiki/%CE%9C-law%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0
const MU = 255.0;
const INV_MU = 1.0 / MU;
const LN_MU = Math.log(1 + MU);

function encode(x) {
  const signX = Math.sign(x);
  const absX = Math.abs(x);
  return (signX * Math.log(1 + MU * absX)) / LN_MU;
}

function decode(y) {
  const signY = Math.sign(y);
  const absY = Math.abs(y);
  return signY * INV_MU * (Math.pow(1 + MU, absY) - 1);
}

self.muLaw = { encode, decode };
