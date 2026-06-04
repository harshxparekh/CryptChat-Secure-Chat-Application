// Utility to get A=0, B=1,...Z=25 and vice versa
function charToNum(c) {
    return c.toUpperCase().charCodeAt(0) - 65;
}
function numToChar(n) {
    return String.fromCharCode((n % 26 + 26) % 26 + 65);
}

// Parse key string to matrix
function parseKey(keyStr) {
    const numbers = keyStr.split(',').map(n => parseInt(n.trim()));
    if (![4, 9].includes(numbers.length)) {
        throw new Error('Key must contain 4 (2x2) or 9 (3x3) comma-separated numbers');
    }

    const size = Math.sqrt(numbers.length);
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix.push(numbers.slice(i * size, (i + 1) * size));
    }
    return matrix;
}

// Calculate matrix determinant (mod 26)
function determinant(matrix) {
    const mod = 26;
    if (matrix.length === 2) {
        return (matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0]) % mod;
    } else if (matrix.length === 3) {
        const [a,b,c] = matrix[0];
        const [d,e,f] = matrix[1];
        const [g,h,i] = matrix[2];
        return (
            a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g)
        ) % mod;
    } else {
        throw new Error('Matrix must be 2x2 or 3x3');
    }
}

// Modular inverse of a number mod 26
function modInverse(a, mod = 26) {
    a = (a % mod + mod) % mod;
    for (let x = 1; x < mod; x++) {
        if ((a * x) % mod === 1) return x;
    }
    throw new Error('Modular inverse does not exist');
}

// Adjugate matrix
function adjugate(matrix) {
    const mod = 26;
    if (matrix.length === 2) {
        return [
            [matrix[1][1], -matrix[0][1]],
            [-matrix[1][0], matrix[0][0]]
        ];
    } else if (matrix.length === 3) {
        const adj = [];
        for (let i = 0; i < 3; i++) {
            adj[i] = [];
            for (let j = 0; j < 3; j++) {
                const sub = matrix
                    .filter((_, r) => r !== i)
                    .map(row => row.filter((_, c) => c !== j));
                const det = (sub[0][0] * sub[1][1] - sub[0][1] * sub[1][0]);
                adj[i][j] = ((i + j) % 2 === 0 ? det : -det);
            }
        }
        // Transpose
        return adj[0].map((_, i) => adj.map(row => row[i]));
    }
    throw new Error('Matrix must be 2x2 or 3x3');
}

// Inverse matrix mod 26
function inverseMatrix(matrix) {
    const mod = 26;
    const det = determinant(matrix);
    const detInv = modInverse(det, mod);
    const adj = adjugate(matrix);
    return adj.map(row =>
        row.map(x => ((x * detInv) % mod + mod) % mod)
    );
}

// Multiply matrix with vector
function multiplyMatrix(matrix, vector) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
        let sum = 0;
        for (let j = 0; j < matrix[0].length; j++) {
            sum += matrix[i][j] * vector[j];
        }
        result[i] = sum % 26;
    }
    return result;
}

// Pad text to fit matrix
function prepareText(text, size) {
    const clean = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const padding = (size - (clean.length % size)) % size;
    return clean + 'X'.repeat(padding);
}

// 🔐 ENCRYPT
export function encrypt(keyStr, plaintext) {
    const matrix = parseKey(keyStr);
    const size = matrix.length;
    const text = prepareText(plaintext, size);
    let cipher = '';

    for (let i = 0; i < text.length; i += size) {
        const block = text.slice(i, i + size).split('').map(charToNum);
        const product = multiplyMatrix(matrix, block);
        cipher += product.map(numToChar).join('');
    }
    return cipher;
}

// 🔓 DECRYPT
export function decrypt(keyStr, ciphertext) {
    const matrix = parseKey(keyStr);
    const invMatrix = inverseMatrix(matrix);
    const size = matrix.length;
    const text = ciphertext.replace(/[^a-zA-Z]/g, '').toUpperCase();
    let plain = '';

    for (let i = 0; i < text.length; i += size) {
        const block = text.slice(i, i + size).split('').map(charToNum);
        const product = multiplyMatrix(invMatrix, block);
        plain += product.map(numToChar).join('');
    }
    return plain;
}
