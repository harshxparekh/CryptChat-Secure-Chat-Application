// -----------------------------------------
// WebSocket Setup
// -----------------------------------------
const PORT = 3100;
const ws = new WebSocket(`ws://localhost:${PORT}`);

ws.onmessage = (event) => {
  const chatArea = document.getElementById('chatArea');

  try {
    const parsed = JSON.parse(event.data);
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');

    if (parsed.type === 'image') {
      messageBubble.innerHTML = `
        <strong>[Encrypted Image]</strong><br>
        📁 <em>${parsed.name}</em><br>
        💬 Encrypted message: ${parsed.text || '[None]'}
      `;
      messageBubble.dataset.type = 'image';
      messageBubble.dataset.ciphertext = parsed.data;
      messageBubble.dataset.filename = parsed.name;
      messageBubble.dataset.message = parsed.text || '';
      messageBubble.dataset.method = parsed.method;
    } else {
      messageBubble.innerHTML = `
        <strong>[Encrypted Text]</strong><br>
        🔐 <em>Method: ${parsed.method.toUpperCase()}</em><br>
        🧾 <code style="word-wrap: break-word; white-space: pre-wrap;">${parsed.data}</code>
      `;
      messageBubble.dataset.type = 'text';
      messageBubble.dataset.ciphertext = parsed.data;
      messageBubble.dataset.method = parsed.method;
    }

    chatArea.appendChild(messageBubble);
  } catch (err) {
    console.error('❌ Message parse failed:', err);
    const fallback = document.createElement('div');
    fallback.classList.add('message-bubble');
    fallback.textContent = '[Unknown Message]';
    chatArea.appendChild(fallback);
  }
};

// -----------------------------------------
// UI Elements
// -----------------------------------------
const messageInput = document.getElementById('messageInput');
const keyInput = document.getElementById('keyInput');
const sendButton = document.getElementById('sendButton');
const decryptKeyInput = document.getElementById('decryptKeyInput');
const decryptButton = document.getElementById('decryptButton');
const fileInput = document.getElementById('fileInput');
const mediaPreview = document.getElementById('mediaPreview');
const encryptionMethod = document.getElementById('encryptionMethod');
const senderPanel = document.querySelector('.panel.sender');
const dhOutput = document.getElementById('dhOutput');
const dhContainer = document.getElementById('dhContainer');
const eccContainer = document.getElementById('eccContainer');
const eccPrivate = document.getElementById('ecc-private');
const eccPublic = document.getElementById('ecc-public');
const eccSecret = document.getElementById('ecc-secret');

// -----------------------------------------
// Auto-fill Monoalphabetic Key & Handle Special Cases
// -----------------------------------------
encryptionMethod.addEventListener('change', async () => {
  const selected = encryptionMethod.value;

  if (selected === 'monoalphabetic') {
    const { generateRandomKey } = await import(`./crypto/monoalphabetic.js`);
    const randomKey = generateRandomKey();
    keyInput.value = randomKey;
    keyInput.disabled = false;
    decryptButton.disabled = false;
    dhContainer.style.display = 'none';
    eccContainer.style.display = 'none';
  } else if (selected === 'sha256' || selected === 'rsa' || selected === 'dsa') {
    keyInput.value = '';
    keyInput.disabled = true;
    keyInput.placeholder =
      selected === 'sha256' ? '🔒 No key required for SHA-256'
      : selected === 'rsa' ? '🔐 RSA uses internal keypair'
      : '🔏 DSA auto-generates keys';
    decryptButton.disabled = selected !== 'rsa';
    dhContainer.style.display = 'none';
    eccContainer.style.display = 'none';
  } else if (selected === 'dh') {
    keyInput.disabled = true;
    keyInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = false;
    decryptButton.disabled = true;
    dhContainer.style.display = 'block';
    eccContainer.style.display = 'none';
  } else if (selected === 'ecc') {
    keyInput.disabled = true;
    keyInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = false;
    decryptButton.disabled = true;
    dhContainer.style.display = 'none';
    eccContainer.style.display = 'block';
    const { plotCurvePoints } = await import('./crypto/ecc.js');
    plotCurvePoints('eccCanvas');
  } else {
    keyInput.disabled = false;
    messageInput.disabled = false;
    sendButton.disabled = false;
    keyInput.placeholder = 'Enter shared key';
    decryptButton.disabled = false;
    dhContainer.style.display = 'none';
    eccContainer.style.display = 'none';
  }
});

// -----------------------------------------
// Upload File: Only Show Filename
// -----------------------------------------
let selectedFile = null;

fileInput.addEventListener('change', () => {
  selectedFile = fileInput.files[0];

  const existingLabel = document.getElementById('selectedFileLabel');
  if (existingLabel) existingLabel.remove();

  if (selectedFile) {
    const fileLabel = document.createElement('div');
    fileLabel.id = 'selectedFileLabel';
    fileLabel.textContent = `📁 Selected File: ${selectedFile.name}`;
    fileLabel.style.marginTop = '10px';
    fileLabel.style.fontStyle = 'italic';
    senderPanel.appendChild(fileLabel);
  }
});

// -----------------------------------------
// Encrypt and Send (also DSA: SIGN)
// -----------------------------------------
sendButton.addEventListener('click', async () => {
  const key = keyInput.value.trim();
  const plainText = messageInput.value.trim().toUpperCase();
  const method = encryptionMethod.value;

  if (method === 'dh') {
    const module = await import('./crypto/dh.js');
    const result = module.generateSharedKey();
    dhOutput.innerHTML = `
      🔑 <strong>Shared Key:</strong> ${result.sharedKey}<br>
      🧠 <strong>Sender Public:</strong> ${result.senderPublic}<br>
      📡 <strong>Receiver Public:</strong> ${result.receiverPublic}<br>
      ⚙️ <strong>Confirmed:</strong> ${result.confirmed ? 'Yes ✅' : 'No ❌'}
    `;
    return;
  }

  if (method === 'ecc') {
    const module = await import('./crypto/ecc.js');
    const { privateKey, publicKey } = module.generateKeys();
    const shared = module.computeSharedSecret(privateKey, publicKey);

    eccPrivate.textContent = privateKey;
    eccPublic.textContent = `(${publicKey.x}, ${publicKey.y})`;
    eccSecret.textContent = `(${shared.x}, ${shared.y})`;

    ws.send(JSON.stringify({
      type: 'text',
      method,
      data: `🔐 ECC Key Exchange\nPrivate: ${privateKey}\nPublic: (${publicKey.x}, ${publicKey.y})\nShared Secret: (${shared.x}, ${shared.y})`
    }));
    return;
  }

  const module = await import(`./crypto/${method}.js`);

  if (method === 'dsa') {
    const keys = module.generateKeys();
    const { r, s, k } = module.sign(plainText);
    ws.send(JSON.stringify({
      type: 'text',
      method,
      data: `✍️ Signature:\nR = ${r}\nS = ${s}\nK = ${k}\n\nKeys:\nP = ${keys.p}, Q = ${keys.q}, G = ${keys.g},\nPrivate X = ${keys.x}, Public Y = ${keys.y}`
    }));
    return;
  }

  if (method !== 'sha256' && method !== 'rsa' && !key) {
    alert('⚠️ Enter a key before sending.');
    return;
  }

  if (method === 'otp' && key.length !== plainText.length) {
    alert('⚠️ OTP key must be the same length as the message.');
    return;
  }

  if (method === 'des' && (key.length !== 8 || plainText.length !== 8)) {
    alert('⚠️ DES requires both plaintext and key to be exactly 8 characters.');
    return;
  }

  if (method === 'aes' && (key.length > 16 || plainText.length > 16)) {
    alert('⚠️ AES requires plaintext and key to be 16 characters or fewer.');
    return;
  }

  if (method === 'rc4' && selectedFile) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const binaryStr = Array.from(new Uint8Array(arrayBuffer)).map(byte => String.fromCharCode(byte)).join('');
      const encryptedImage = module.encrypt(key, binaryStr);
      const encryptedBase64 = btoa(encryptedImage);
      const encryptedText = plainText ? module.encrypt(key, plainText) : '';

      ws.send(JSON.stringify({
        type: 'image',
        method,
        name: selectedFile.name,
        data: encryptedBase64,
        text: encryptedText,
      }));
    };
    reader.readAsArrayBuffer(selectedFile);
    return;
  }

  if (plainText) {
    try {
      const encryptedText =
        method === 'aes'
          ? module.aesEncrypt(plainText.padEnd(16, ' '), key.padEnd(16, ' '))
        : method === 'sha256'
          ? module.encrypt(null, plainText)
        : module.encrypt(key, plainText);

      ws.send(JSON.stringify({
        type: 'text',
        method,
        data: encryptedText,
      }));
    } catch (e) {
      alert(`❌ Encryption failed: ${e.message}`);
    }
    return;
  }

  alert('⚠️ Please enter a message or select a file.');
});

// -----------------------------------------
// Decrypt Last Message (also DSA: VERIFY)
// -----------------------------------------
decryptButton.addEventListener('click', async () => {
  const decryptionKey = decryptKeyInput.value.trim();
  const chatArea = document.getElementById('chatArea');
  const messages = chatArea.getElementsByClassName('message-bubble');

  if (!messages.length) {
    alert('⚠️ No messages to decrypt.');
    return;
  }

  const lastMessage = messages[messages.length - 1];
  const cipherText = lastMessage.dataset.ciphertext;
  const method = lastMessage.dataset.method || 'rc4';

  if (method === 'sha256') {
    alert('🔐 SHA-256 is a one-way hash function. Decryption is not possible.');
    return;
  }

  if (method === 'dsa') {
    const module = await import('./crypto/dsa.js');
    const extracted = lastMessage.textContent.match(/R = (\d+).*S = (\d+)/s);
    const msg = messageInput.value.trim().toUpperCase();
    if (!extracted || extracted.length < 3) {
      alert('⚠️ Signature not found.');
      return;
    }
    const [r, s] = [parseInt(extracted[1]), parseInt(extracted[2])];
    const valid = module.verify(msg, r, s);
    alert(valid ? '✅ Signature is valid!' : '❌ Signature is invalid.');
    return;
  }

  if (!decryptionKey && method !== 'rsa') {
    alert('⚠️ Enter a key and make sure a message exists.');
    return;
  }

  if (method === 'otp' && decryptionKey.length !== cipherText.length) {
    alert('⚠️ OTP key must match the ciphertext length.');
    return;
  }

  if (method === 'des' && decryptionKey.length !== 8) {
    alert('⚠️ DES key must be exactly 8 characters.');
    return;
  }

  const module = await import(`./crypto/${method}.js`);

  if (lastMessage.dataset.type === 'image') {
    const decryptedStr = module.decrypt(decryptionKey, atob(cipherText));
    const byteArray = new Uint8Array(decryptedStr.split('').map(c => c.charCodeAt(0)));
    const blob = new Blob([byteArray]);
    const url = URL.createObjectURL(blob);

    const img = document.createElement('img');
    img.src = url;
    img.alt = lastMessage.dataset.filename;
    img.style.maxWidth = '100%';
    img.style.marginTop = '10px';
    mediaPreview.innerHTML = '';
    mediaPreview.appendChild(img);

    const encryptedText = lastMessage.dataset.message;
    if (encryptedText) {
      const decryptedText = module.decrypt(decryptionKey, encryptedText);
      lastMessage.innerHTML = `
        <strong>[Decrypted Image]</strong><br>
        📁 <em>${lastMessage.dataset.filename}</em><br>
        💬 Message: ${decryptedText}
      `;
    }
    return;
  }

  const decryptedText = method === 'aes'
    ? module.aesDecrypt(cipherText, decryptionKey.padEnd(16, ' '))
    : module.decrypt(decryptionKey, cipherText);

  lastMessage.textContent = decryptedText;
});
