// crypto/ecc.js

const p = 97;      // prime modulus
const a = 2;
const b = 3;
const G = { x: 3, y: 6 }; // base point

function mod(n, m) {
  return ((n % m) + m) % m;
}

function inverseMod(k, p) {
  k = mod(k, p);
  for (let x = 1; x < p; x++) {
    if ((k * x) % p === 1) return x;
  }
  throw new Error("No modular inverse found");
}

function isOnCurve(x, y) {
  return mod(y * y, p) === mod((x ** 3 + a * x + b), p);
}

function pointAdd(P, Q) {
  if (!P) return Q;
  if (!Q) return P;

  if (P.x === Q.x && P.y !== Q.y) return null;

  let m;
  if (P.x === Q.x && P.y === Q.y) {
    const numerator = (3 * P.x ** 2 + a);
    const denominator = inverseMod(2 * P.y, p);
    m = mod(numerator * denominator, p);
  } else {
    const numerator = (Q.y - P.y);
    const denominator = inverseMod(Q.x - P.x, p);
    m = mod(numerator * denominator, p);
  }

  const rx = mod(m ** 2 - P.x - Q.x, p);
  const ry = mod(m * (P.x - rx) - P.y, p);
  return { x: rx, y: ry };
}

function scalarMult(k, P) {
  let result = null;
  let addend = P;

  while (k > 0) {
    if (k % 2 === 1) {
      result = pointAdd(result, addend);
    }
    addend = pointAdd(addend, addend);
    k = Math.floor(k / 2);
  }

  return result;
}

function generateKeys() {
  const d = Math.floor(Math.random() * (p - 2)) + 1;
  const Q = scalarMult(d, G);
  return { privateKey: d, publicKey: Q };
}

function computeSharedSecret(privateKey, otherPublicKey) {
  return scalarMult(privateKey, otherPublicKey);
}

function plotCurvePoints(canvasId, highlight = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = 4;
  const offsetX = 20;
  const offsetY = canvas.height - 20;

  // Draw grid background (optional)
  ctx.fillStyle = "#f9f9f9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Plot all valid curve points
  for (let x = 0; x < p; x++) {
    const rhs = mod(x ** 3 + a * x + b, p);
    for (let y = 0; y < p; y++) {
      if (mod(y ** 2, p) === rhs) {
        const px = offsetX + x * scale;
        const py = offsetY - y * scale;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#888";
        ctx.fill();
      }
    }
  }

  // 🔵 Highlight base point G
  drawPoint(ctx, G, "blue", "G", scale, offsetX, offsetY);

  // 🟢 Highlight public key (if provided)
  if (highlight.publicKey) {
    drawPoint(ctx, highlight.publicKey, "green", "Q", scale, offsetX, offsetY);
  }

  // 🔴 Highlight shared secret (if provided)
  if (highlight.sharedSecret) {
    drawPoint(ctx, highlight.sharedSecret, "red", "S", scale, offsetX, offsetY);
  }
}

function drawPoint(ctx, point, color, label, scale, offsetX, offsetY) {
  const px = offsetX + point.x * scale;
  const py = offsetY - point.y * scale;
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.font = "12px monospace";
  ctx.fillText(label, px + 6, py - 6);
}

export {
  p,
  a,
  b,
  G,
  mod,
  generateKeys,
  computeSharedSecret,
  plotCurvePoints
};
