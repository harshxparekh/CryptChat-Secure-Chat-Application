// crypto/otp.js

function sanitize(text) {
    return text.toUpperCase().replace(/[^A-Z]/g, '');
  }
  
  function validateKeyMatch(text, key) {
    if (text.length !== key.length) {
      throw new Error('Key must be the same length as the message.');
    }
  }
  
  function charToIndex(c) {
    return c.charCodeAt(0) - 65;
  }
  
  function indexToChar(i) {
    return String.fromCharCode((i % 26) + 65);
  }
  
  export function encrypt(key, plaintext) {
    const cleanText = sanitize(plaintext);
    const cleanKey = sanitize(key);
    validateKeyMatch(cleanText, cleanKey);
  
    let ciphertext = '';
    for (let i = 0; i < cleanText.length; i++) {
      const p = charToIndex(cleanText[i]);
      const k = charToIndex(cleanKey[i]);
      const c = (p + k) % 26;
      ciphertext += indexToChar(c);
    }
    return ciphertext;
  }
  
  export function decrypt(key, ciphertext) {
    const cleanText = sanitize(ciphertext);
    const cleanKey = sanitize(key);
    validateKeyMatch(cleanText, cleanKey);
  
    let plaintext = '';
    for (let i = 0; i < cleanText.length; i++) {
      const c = charToIndex(cleanText[i]);
      const k = charToIndex(cleanKey[i]);
      const p = (c - k + 26) % 26;
      plaintext += indexToChar(p);
    }
    return plaintext;
  }
  