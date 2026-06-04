// Monoalphabetic Cipher (Substitution Cipher A–Z)

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ✅ Generate a random permutation of A–Z
export function generateRandomKey() {
  const chars = alphabet.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// ✅ Sanitize and verify the key is valid (26-letter permutation of A–Z)
function sanitizeKey(key) {
  const upperKey = key.toUpperCase();
  const seen = new Set();
  const cleanKey = [];

  for (let ch of upperKey) {
    if (alphabet.includes(ch) && !seen.has(ch)) {
      seen.add(ch);
      cleanKey.push(ch);
    }
  }

  if (cleanKey.length !== 26) {
    throw new Error("Key must be a 26-letter unique alphabet permutation.");
  }

  return cleanKey.join('');
}

// ✅ Encrypt using substitution
export function encrypt(key, plaintext) {
  const subKey = sanitizeKey(key);
  const map = {};

  for (let i = 0; i < 26; i++) {
    map[alphabet[i]] = subKey[i];
    map[alphabet[i].toLowerCase()] = subKey[i].toLowerCase();
  }

  return plaintext.split('').map(char => map[char] || char).join('');
}

// ✅ Decrypt using reverse substitution
export function decrypt(key, ciphertext) {
  const subKey = sanitizeKey(key);
  const reverseMap = {};

  for (let i = 0; i < 26; i++) {
    reverseMap[subKey[i]] = alphabet[i];
    reverseMap[subKey[i].toLowerCase()] = alphabet[i].toLowerCase();
  }

  return ciphertext.split('').map(char => reverseMap[char] || char).join('');
}
