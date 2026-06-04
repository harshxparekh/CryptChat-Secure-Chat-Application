// crypto/playfair.js

function prepareKeyMatrix(key) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let seen = new Set();
    let result = [];
  
    for (let char of key) {
      if (!seen.has(char)) {
        seen.add(char);
        result.push(char);
      }
    }
  
    for (let i = 0; i < 26; i++) {
      let char = String.fromCharCode(65 + i);
      if (char === 'J') continue;
      if (!seen.has(char)) {
        seen.add(char);
        result.push(char);
      }
    }
  
    let matrix = [];
    for (let i = 0; i < 5; i++) {
      matrix.push(result.slice(i * 5, i * 5 + 5));
    }
  
    return matrix;
  }
  
  function findPosition(matrix, letter) {
    if (letter === 'J') letter = 'I';
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (matrix[row][col] === letter) {
          return [row, col];
        }
      }
    }
    return null;
  }
  
  function preprocessText(text, forEncryption = true) {
    text = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let pairs = [];
  
    for (let i = 0; i < text.length; i++) {
      let a = text[i];
      let b = (i + 1 < text.length) ? text[i + 1] : 'X';
  
      if (a === b) {
        b = 'X';
      } else {
        i++;
      }
  
      pairs.push([a, b]);
    }
  
    if (text.length % 2 !== 0) {
      pairs.push([text[text.length - 1], 'X']);
    }
  
    return pairs;
  }
  
  function encrypt(key, plaintext) {
    const matrix = prepareKeyMatrix(key);
    const pairs = preprocessText(plaintext);
  
    let result = '';
  
    for (let [a, b] of pairs) {
      const [row1, col1] = findPosition(matrix, a);
      const [row2, col2] = findPosition(matrix, b);
  
      if (row1 === row2) {
        result += matrix[row1][(col1 + 1) % 5];
        result += matrix[row2][(col2 + 1) % 5];
      } else if (col1 === col2) {
        result += matrix[(row1 + 1) % 5][col1];
        result += matrix[(row2 + 1) % 5][col2];
      } else {
        result += matrix[row1][col2];
        result += matrix[row2][col1];
      }
    }
  
    return result;
  }
  
  function decrypt(key, ciphertext) {
    const matrix = prepareKeyMatrix(key);
    const pairs = preprocessText(ciphertext, false);
  
    let result = '';
  
    for (let [a, b] of pairs) {
      const [row1, col1] = findPosition(matrix, a);
      const [row2, col2] = findPosition(matrix, b);
  
      if (row1 === row2) {
        result += matrix[row1][(col1 + 4) % 5];
        result += matrix[row2][(col2 + 4) % 5];
      } else if (col1 === col2) {
        result += matrix[(row1 + 4) % 5][col1];
        result += matrix[(row2 + 4) % 5][col2];
      } else {
        result += matrix[row1][col2];
        result += matrix[row2][col1];
      }
    }
  
    return result;
  }
  
  export { encrypt, decrypt };
  