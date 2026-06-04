// crypto/dsa.js

let dsaKeys = {};

function modExp(base, exponent, mod) {
  let result = 1;
  base = base % mod;
  while (exponent > 0) {
    if (exponent % 2 === 1) result = (result * base) % mod;
    exponent = Math.floor(exponent / 2);
    base = (base * base) % mod;
  }
  return result;
}

function modInverse(a, m) {
  let [m0, x0, x1] = [m, 0, 1];
  if (m === 1) return 0;
  while (a > 1) {
    const q = Math.floor(a / m);
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0 ? x1 + m0 : x1;
}

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function hashMessage(msg) {
  // Simple hash for demo: sum of char codes % q
  return msg.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function findGenerator(p, q) {
  for (let g = 2; g < p; g++) {
    if (modExp(g, q, p) !== 1) continue;
    return g;
  }
  return 2;
}

export function generateKeys() {
  // For demo: small primes
  const p = 47; // prime
  const q = 23; // q | p-1
  const g = findGenerator(p, q);

  const x = Math.floor(Math.random() * (q - 1)) + 1; // Private key
  const y = modExp(g, x, p); // Public key

  dsaKeys = { p, q, g, x, y };
  return { ...dsaKeys };
}

export function sign(message) {
  if (!dsaKeys.p) generateKeys();

  const { p, q, g, x } = dsaKeys;
  const Hm = hashMessage(message);

  let k, r, s;

  do {
    k = Math.floor(Math.random() * (q - 1)) + 1;
  } while (gcd(k, q) !== 1);

  r = modExp(g, k, p) % q;
  const kInv = modInverse(k, q);
  s = (kInv * (Hm + x * r)) % q;

  dsaKeys.k = k; // For display/demo

  return { r, s, k };
}

export function verify(message, r, s) {
  const { p, q, g, y } = dsaKeys;
  const Hm = hashMessage(message);

  const w = modInverse(s, q);
  const u1 = (Hm * w) % q;
  const u2 = (r * w) % q;

  const v = ((modExp(g, u1, p) * modExp(y, u2, p)) % p) % q;

  return v === r;
}

export function getDSAKeys() {
  return dsaKeys;
}
