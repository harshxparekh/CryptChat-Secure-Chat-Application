// 🔐 Polyalphabetic Cipher (Vigenère Cipher)

// Utility: convert A-Z to 0-25 and vice versa
const A_CODE = 'A'.charCodeAt(0);

function repeatKey(key, length) {
  return key.toUpperCase().repeat(Math.ceil(length / key.length)).slice(0, length);
}

// ✅ Encrypt
export function encrypt(key, plaintext) {
  key = key.toUpperCase();
  plaintext = plaintext.toUpperCase();

  const repeatedKey = repeatKey(key, plaintext.length);
  let ciphertext = '';

  for (let i = 0; i < plaintext.length; i++) {
    const p = plaintext.charCodeAt(i) - A_CODE;
    const k = repeatedKey.charCodeAt(i) - A_CODE;
    const c = (p + k) % 26;
    ciphertext += String.fromCharCode(c + A_CODE);
  }

  return ciphertext;
}

// ✅ Decrypt
export function decrypt(key, ciphertext) {
  key = key.toUpperCase();
  ciphertext = ciphertext.toUpperCase();

  const repeatedKey = repeatKey(key, ciphertext.length);
  let plaintext = '';

  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext.charCodeAt(i) - A_CODE;
    const k = repeatedKey.charCodeAt(i) - A_CODE;
    const p = (c - k + 26) % 26;
    plaintext += String.fromCharCode(p + A_CODE);
  }

  return plaintext;
}
