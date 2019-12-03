// https://ja.wikipedia.org/wiki/%CE%9C-law%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0
const MU = 255.0;
const INV_MU = 1.0 / MU;
const LN_MU = Math.log(1 + MU);

function encode(x) {
  return (Math.sign(x) * Math.log(1 + MU * Math.abs(x))) / LN_MU;
}

function decode(y) {
  return Math.sign(y) * INV_MU * (Math.pow(1 + MU, Math.abs(y)) - 1);
}

self.muLaw = { encode, decode };
