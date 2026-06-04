// Columnar Transposition Cipher

// 🔐 Helper: get column order from a string key like "ZEBRAS"
function getColumnOrder(key) {
    const sorted = key.split('').map((char, index) => ({ char, index }))
      .sort((a, b) => a.char.localeCompare(b.char));
  
    return sorted.map(({ index }) => index);
  }
  
  // ✅ ENCRYPTION
  export function encrypt(key, plaintext) {
    if (!key || key.length < 2) throw new Error("Key must be at least 2 characters.");
  
    const order = getColumnOrder(key);
    const numCols = key.length;
    const numRows = Math.ceil(plaintext.length / numCols);
    const padded = plaintext.padEnd(numCols * numRows, 'X');
  
    // Fill matrix row-by-row
    const matrix = Array.from({ length: numRows }, (_, row) =>
      padded.slice(row * numCols, (row + 1) * numCols).split('')
    );
  
    // Read columns in order
    let ciphertext = '';
    for (let col of order) {
      for (let row = 0; row < numRows; row++) {
        ciphertext += matrix[row][col];
      }
    }
  
    return ciphertext;
  }
  
  // ✅ DECRYPTION
  export function decrypt(key, ciphertext) {
    if (!key || key.length < 2) throw new Error("Key must be at least 2 characters.");
  
    const order = getColumnOrder(key);
    const numCols = key.length;
    const numRows = Math.ceil(ciphertext.length / numCols);
    const totalLen = numCols * numRows;
  
    const padded = ciphertext.padEnd(totalLen, 'X'); // in case someone encrypted and added padding
  
    // Step 1: Create an empty matrix
    const matrix = Array.from({ length: numRows }, () => Array(numCols).fill(''));
  
    // Step 2: Fill columns based on sorted order
    let index = 0;
    for (let sortedCol of order) {
      for (let row = 0; row < numRows; row++) {
        if (index < padded.length) {
          matrix[row][sortedCol] = padded[index++];
        }
      }
    }
  
    // Step 3: Read matrix row-by-row
    return matrix.flat().join('').replace(/X+$/g, ''); // strip padding Xs
  }
  