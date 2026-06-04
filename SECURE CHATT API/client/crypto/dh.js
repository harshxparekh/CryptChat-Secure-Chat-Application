// dh.js — Diffie-Hellman Key Exchange (manual, no libraries)

// Helper: Fast modular exponentiation
function modPow(base, exponent, mod) {
  let result = 1;
  base = base % mod;
  while (exponent > 0) {
    if (exponent % 2 === 1) result = (result * base) % mod;
    exponent = Math.floor(exponent / 2);
    base = (base * base) % mod;
  }
  return result;
}

// Helper: Random integer between min and max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main DH function
export function generateSharedKey() {
  const p = 23; // Public prime (small for demo)
  const g = 5;  // Primitive root modulo p

  const a = getRandomInt(2, p - 2); // Sender private
  const b = getRandomInt(2, p - 2); // Receiver private

  const A = modPow(g, a, p); // Sender public
  const B = modPow(g, b, p); // Receiver public

  const senderSharedKey = modPow(B, a, p);
  const receiverSharedKey = modPow(A, b, p);

  return {
    p, g,
    senderPrivate: a,
    receiverPrivate: b,
    senderPublic: A,
    receiverPublic: B,
    sharedKey: senderSharedKey,
    confirmed: senderSharedKey === receiverSharedKey
  };
}
