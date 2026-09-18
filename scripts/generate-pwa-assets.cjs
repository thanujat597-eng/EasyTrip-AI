const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
    <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>
  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  
  <!-- Subtle inner circle rings for travel compass motif -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="3" stroke-dasharray="8 8" />
  <circle cx="256" cy="256" r="130" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2" />
  
  <!-- Stylized supersonic travel plane icon -->
  <g filter="url(#shadow)" transform="translate(256, 256) rotate(-25) translate(-256, -256)">
    <path d="M256 96 L290 220 L400 280 L290 300 L270 410 L256 360 L242 410 L222 300 L112 280 L222 220 Z" fill="url(#planeGrad)" />
    <!-- Center cabin accent -->
    <path d="M256 120 L270 215 L256 225 L242 215 Z" fill="#38bdf8" />
  </g>

  <!-- Glowing star sparkle -->
  <circle cx="390" cy="130" r="12" fill="#38bdf8" />
  <circle cx="120" cy="380" r="8" fill="#a855f7" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

// PNG Builder Helper
function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPng(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

// Pixel shader for EasyTrip icon
function getEasyTripPixel(x, y, size, isMaskable = false) {
  const u = x / size;
  const v = y / size;
  
  // Background gradient: Sky blue (0.0, 132, 199) -> Indigo (79, 70, 229) -> Purple (147, 51, 234)
  const t = (u + v) * 0.5;
  let bgR = Math.round(2 + t * (147 - 2));
  let bgG = Math.round(132 + t * (51 - 132));
  let bgB = Math.round(199 + t * (234 - 199));

  // If not maskable, round corners
  if (!isMaskable) {
    const radius = 0.22;
    const dx = Math.max(Math.abs(u - 0.5) - (0.5 - radius), 0);
    const dy = Math.max(Math.abs(v - 0.5) - (0.5 - radius), 0);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      return [0, 0, 0, 0]; // Transparent outside rounded rect
    }
  }

  // Centered motif (plane / navigation chevron)
  // Translate to center (-0.5 to 0.5)
  const cx = u - 0.5;
  const cy = v - 0.5;

  // Scale according to maskable safe zone: maskable needs 15% padding
  const scale = isMaskable ? 0.65 : 0.85;
  const nx = cx / scale;
  const ny = cy / scale;

  // Rotate -25 degrees
  const angle = -25 * Math.PI / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const rx = nx * cosA - ny * sinA;
  const ry = nx * sinA + ny * cosA;

  // Plane shape test in rotated space:
  // Nose at (0, -0.32), wingtips at (-0.28, 0.12) and (0.28, 0.12), tail at (0, 0.28)
  const inFuselage = Math.abs(rx) < 0.05 && ry >= -0.32 && ry <= 0.25;
  const inMainWings = ry >= 0.02 && ry <= 0.14 && Math.abs(rx) <= (0.3 - (ry - 0.02) * 1.5);
  const inTailWings = ry >= 0.18 && ry <= 0.26 && Math.abs(rx) <= (0.16 - (ry - 0.18) * 1.2);
  const inNose = ry >= -0.32 && ry <= -0.15 && Math.abs(rx) <= (0.05 * (ry + 0.32) / 0.17);

  if (inFuselage || inMainWings || inTailWings || inNose) {
    // Cabin highlight
    if (Math.abs(rx) < 0.025 && ry >= -0.22 && ry <= -0.05) {
      return [56, 189, 248, 255]; // Sky blue cabin stripe
    }
    return [255, 255, 255, 255]; // Crisp white plane
  }

  // Compass ring accent
  const rDist = Math.sqrt(nx * nx + ny * ny);
  if (Math.abs(rDist - 0.38) < 0.012) {
    return [255, 255, 255, 60];
  }

  return [bgR, bgG, bgB, 255];
}

console.log('Writing public PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, s) => getEasyTripPixel(x, y, s, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, s) => getEasyTripPixel(x, y, s, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, s) => getEasyTripPixel(x, y, s, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, s) => getEasyTripPixel(x, y, s, false)));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, (x, y, s) => getEasyTripPixel(x, y, s, false)));

console.log('Successfully generated all PWA icons in /public!');
