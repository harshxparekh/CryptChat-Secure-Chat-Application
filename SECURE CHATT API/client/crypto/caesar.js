// Caesar Cipher Logic (only works on A-Z and a-z)

export function encrypt(key, plaintext) {
    const shift = parseInt(key);
    if (isNaN(shift)) throw new Error('Key must be a number');
  
    return plaintext.split('').map(char => shiftChar(char, shift)).join('');
  }
  
  export function decrypt(key, ciphertext) {
    const shift = parseInt(key);
    if (isNaN(shift)) throw new Error('Key must be a number');
  
    return ciphertext.split('').map(char => shiftChar(char, -shift)).join('');
  }
  
  // Shift a single character by `shift` positions
  function shiftChar(char, shift) {
    const code = char.charCodeAt(0);
  
    // Uppercase A-Z
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
    }
  
    // Lowercase a-z
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
    }
  
    // Leave other characters unchanged (spaces, punctuation, etc.)
    return char;
  }
  