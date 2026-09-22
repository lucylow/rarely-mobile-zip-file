import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const OUTPUT_DIR = path.resolve(process.env.RARELY_ASSET_OUTPUT_DIR ?? "assets/images");
const FORCE = process.argv.includes("--force");

const PALETTE = {
  cream: [251, 248, 243, 255],
  plum: [43, 29, 47, 255],
  coral: [233, 111, 97, 255],
  white: [255, 255, 255, 255],
  transparent: [0, 0, 0, 0],
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  const chunkBytes = Buffer.concat([typeBuffer, data]);
  crcBuffer.writeUInt32BE(crc32(chunkBytes), 0);

  return Buffer.concat([lengthBuffer, chunkBytes, crcBuffer]);
}

function encodePng(width, height, pixelAt) {
  const rows = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    rows[rowStart] = 0;

    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = pixelAt(x, y, width, height);
      const pixelStart = rowStart + 1 + x * 4;
      rows[pixelStart] = r;
      rows[pixelStart + 1] = g;
      rows[pixelStart + 2] = b;
      rows[pixelStart + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(rows, { level: 9 });
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function brandMarkPixel(x, y, width, height, options) {
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const unit = Math.min(width, height);

  const {
    background = PALETTE.plum,
    outer = PALETTE.coral,
    inner = PALETTE.cream,
    sparkle = PALETTE.white,
    transparentBackground = false,
  } = options;

  const outerRadius = unit * 0.34;
  const innerRadius = unit * 0.19;
  const sparkleRadius = unit * 0.06;

  const sparkleX = centerX + unit * 0.2;
  const sparkleY = centerY - unit * 0.2;
  const sparkleDistance = Math.sqrt(
    (x - sparkleX) * (x - sparkleX) + (y - sparkleY) * (y - sparkleY),
  );

  if (sparkleDistance <= sparkleRadius) {
    return sparkle;
  }

  if (distance <= innerRadius) {
    return inner;
  }

  if (distance <= outerRadius) {
    return outer;
  }

  return transparentBackground ? PALETTE.transparent : background;
}

function writeAsset(filename, width, height, pixelAt) {
  const outPath = path.join(OUTPUT_DIR, filename);

  if (!FORCE && fs.existsSync(outPath)) {
    console.log(`skip ${filename} (already exists)`);
    return;
  }

  const png = encodePng(width, height, pixelAt);
  fs.writeFileSync(outPath, png);
  console.log(`write ${filename} (${width}x${height})`);
}

function verifyPngAsset(filename, expectedWidth, expectedHeight) {
  const outPath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(outPath)) throw new Error(`Missing required asset: ${filename}`);
  const buffer = fs.readFileSync(outPath);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) throw new Error(`Invalid PNG asset: ${filename}`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== expectedWidth || height !== expectedHeight) throw new Error(`Unexpected dimensions for ${filename}: ${width}x${height}`);
}

function verifyAssets() {
  verifyPngAsset("icon.png", 1024, 1024);
  verifyPngAsset("android-icon-background.png", 512, 512);
  verifyPngAsset("android-icon-foreground.png", 512, 512);
  verifyPngAsset("android-icon-monochrome.png", 432, 432);
  verifyPngAsset("favicon.png", 48, 48);
  verifyPngAsset("splash-icon.png", 1024, 1024);
}

function ensureAssets() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  writeAsset("icon.png", 1024, 1024, (x, y, w, h) =>
    brandMarkPixel(x, y, w, h, {
      background: PALETTE.plum,
      outer: PALETTE.coral,
      inner: PALETTE.cream,
    }),
  );

  writeAsset("android-icon-background.png", 512, 512, () => PALETTE.plum);

  writeAsset("android-icon-foreground.png", 512, 512, (x, y, w, h) =>
    brandMarkPixel(x, y, w, h, {
      transparentBackground: true,
      outer: PALETTE.coral,
      inner: PALETTE.cream,
    }),
  );

  writeAsset("android-icon-monochrome.png", 432, 432, (x, y, w, h) =>
    brandMarkPixel(x, y, w, h, {
      transparentBackground: true,
      outer: PALETTE.white,
      inner: PALETTE.white,
      sparkle: PALETTE.white,
    }),
  );

  writeAsset("favicon.png", 48, 48, (x, y, w, h) =>
    brandMarkPixel(x, y, w, h, {
      background: PALETTE.plum,
      outer: PALETTE.coral,
      inner: PALETTE.cream,
    }),
  );

  writeAsset("splash-icon.png", 1024, 1024, (x, y, w, h) =>
    brandMarkPixel(x, y, w, h, {
      background: PALETTE.transparent,
      outer: PALETTE.coral,
      inner: PALETTE.plum,
      sparkle: PALETTE.cream,
      transparentBackground: true,
    }),
  );
}

ensureAssets();
verifyAssets();
