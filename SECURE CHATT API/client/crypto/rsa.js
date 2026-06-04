// rsa.js — Manual RSA Encryption and Decryption (No Libraries)

// GCD Helper
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }
  
  // Modular Inverse using Extended Euclidean Algorithm
  function modInverse(e, phi) {
    let [a, b] = [phi, e];
    let [x0, x1] = [0, 1];
  
    while (b !== 0) {
      const q = Math.floor(a / b);
      [a, b] = [b, a % b];
      [x0, x1] = [x1, x0 - q * x1];
    }
  
    return (x0 + phi) % phi;
  }
  
  // Modular Exponentiation
  function modPow(base, exp, mod) {
    let result = 1;
    base = base % mod;
  
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod;
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
  
    return result;
  }
  
  // Generate Keys
  let rsaKeys = {};
  function generateKeys() {
    const p = 11;
    const q = 13;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    const e = 7; // Must be coprime with phi
    const d = modInverse(e, phi);
  
    rsaKeys = {
      e,
      d,
      n,
      publicKey: { e, n },
      privateKey: { d, n }
    };
  }
  
  // Encrypt plaintext string → space-separated numbers
  export function encrypt(_, plaintext) {
    if (!rsaKeys.e) generateKeys();
  
    const { e, n } = rsaKeys;
    const encrypted = [];
  
    for (let i = 0; i < plaintext.length; i++) {
      const m = plaintext.charCodeAt(i);
      const c = modPow(m, e, n);
      encrypted.push(c);
    }
  
    return encrypted.join(' ');
  }
  
  // Decrypt space-separated numbers → original string
  export function decrypt(_, ciphertext) {
    if (!rsaKeys.d) generateKeys();
  
    const { d, n } = rsaKeys;
    const parts = ciphertext.trim().split(' ');
    const decrypted = parts.map(c => String.fromCharCode(modPow(parseInt(c), d, n)));
  
    return decrypted.join('');
  }
  