// Génère les icônes de l'application installable (PNG) sans dépendance : node scripts/icones.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const VERT = [0x1b, 0x6f, 0x5a];
const BLANC = [255, 255, 255];

function crc32(buf) {
  let c, crc = ~0;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return ~crc >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(size, pixel) {
  const brut = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    brut[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      brut[o] = r; brut[o + 1] = g; brut[o + 2] = b; brut[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(brut)), chunk("IEND", Buffer.alloc(0))]);
}

// Lettre « n » dans un carré unité (y vers le bas), échelle `e` autour du centre.
function dansN(x, y, e) {
  x = (x - 0.5) / e + 0.5;
  y = (y - 0.5) / e + 0.5;
  const w = 0.095;
  if (x >= 0.3 && x <= 0.3 + w && y >= 0.28 && y <= 0.72) return true;
  if (x >= 0.7 - w && x <= 0.7 && y >= 0.48 && y <= 0.72) return true;
  const d = Math.hypot(x - 0.5, y - 0.48);
  return y <= 0.48 && d <= 0.2 && d >= 0.2 - w;
}
const dansArrondi = (x, y, r) => {
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  return Math.hypot(x - cx, y - cy) <= r;
};

function icone(size, { arrondi, echelle }) {
  const S = 3;
  return png(size, (px, py) => {
    let fond = 0, lettre = 0;
    for (let i = 0; i < S; i++)
      for (let j = 0; j < S; j++) {
        const x = (px + (i + 0.5) / S) / size;
        const y = (py + (j + 0.5) / S) / size;
        if (!arrondi || dansArrondi(x, y, 0.22)) {
          fond++;
          if (dansN(x, y, echelle)) lettre++;
        }
      }
    const n = S * S;
    if (!fond) return [0, 0, 0, 0];
    const t = lettre / fond;
    const c = VERT.map((v, k) => Math.round(v * (1 - t) + BLANC[k] * t));
    return [...c, Math.round((fond / n) * 255)];
  });
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icone-192.png", icone(192, { arrondi: true, echelle: 1.25 }));
writeFileSync("public/icons/icone-512.png", icone(512, { arrondi: true, echelle: 1.25 }));
// « maskable » : plein cadre, lettre dans la zone sûre (80 % central)
writeFileSync("public/icons/icone-maskable-512.png", icone(512, { arrondi: false, echelle: 0.95 }));
writeFileSync("src/app/apple-icon.png", icone(180, { arrondi: false, echelle: 1.1 }));
writeFileSync("src/app/icon.png", icone(192, { arrondi: true, echelle: 1.25 }));
console.log("icônes générées");
