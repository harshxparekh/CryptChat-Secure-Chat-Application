// RC4 implementation with Base64 support for safe transmission
function RC4(key) {
    this.key = key;
    this.S = [];
    for (let i = 0; i < 256; i++) {
        this.S[i] = i;
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + this.S[i] + key.charCodeAt(i % key.length)) % 256;
        [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
    }
}

RC4.prototype.process = function (text) {
    let result = '';
    let i = 0, j = 0;
    for (let n = 0; n < text.length; n++) {
        i = (i + 1) % 256;
        j = (j + this.S[i]) % 256;
        [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
        const K = this.S[(this.S[i] + this.S[j]) % 256];
        result += String.fromCharCode(text.charCodeAt(n) ^ K);
    }
    return result;
};

// Utility to encode/decode base64
function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64) {
    return decodeURIComponent(escape(atob(b64)));
}

// Exported functions
export const encrypt = (key, plaintext) => {
    const rc4 = new RC4(key);
    const encrypted = rc4.process(plaintext);
    return toBase64(encrypted); // for safe transport
};

export const decrypt = (key, ciphertextB64) => {
    const encrypted = fromBase64(ciphertextB64);
    const rc4 = new RC4(key);
    return rc4.process(encrypted);
};
