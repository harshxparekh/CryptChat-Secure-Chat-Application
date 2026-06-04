// Rail Fence Cipher

// ✅ ENCRYPTION
export function encrypt(key, plaintext) {
    const numRails = parseInt(key);
    if (isNaN(numRails) || numRails < 2) {
      throw new Error('Key must be a number ≥ 2');
    }
  
    const rails = Array.from({ length: numRails }, () => []);
    let rail = 0;
    let direction = 1;
  
    for (let char of plaintext) {
      rails[rail].push(char);
      rail += direction;
  
      if (rail === 0 || rail === numRails - 1) {
        direction *= -1; // switch direction
      }
    }
  
    return rails.flat().join('');
  }
  
  // ✅ DECRYPTION
  export function decrypt(key, ciphertext) {
    const numRails = parseInt(key);
    if (isNaN(numRails) || numRails < 2) {
      throw new Error('Key must be a number ≥ 2');
    }
  
    // Step 1: Create matrix and mark zigzag path with placeholders
    const len = ciphertext.length;
    const railMatrix = Array.from({ length: numRails }, () =>
      Array(len).fill('\n')
    );
  
    let index = 0;
    let direction = 1;
    for (let col = 0; col < len; col++) {
      railMatrix[index][col] = '*';
      index += direction;
  
      if (index === 0 || index === numRails - 1) {
        direction *= -1;
      }
    }
  
    // Step 2: Fill the matrix with ciphertext characters row by row
    let charIndex = 0;
    for (let row = 0; row < numRails; row++) {
      for (let col = 0; col < len; col++) {
        if (railMatrix[row][col] === '*' && charIndex < len) {
          railMatrix[row][col] = ciphertext[charIndex++];
        }
      }
    }
  
    // Step 3: Read characters in zigzag order
    let result = '';
    let rail = 0;
    direction = 1;
    for (let col = 0; col < len; col++) {
      result += railMatrix[rail][col];
      rail += direction;
  
      if (rail === 0 || rail === numRails - 1) {
        direction *= -1;
      }
    }
  
    return result;
  }
  