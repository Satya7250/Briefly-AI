const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const LOGO_PATH = path.join(__dirname, "../../public/log.png");
const PUBLIC_DIR = path.join(__dirname, "../../public");

const SIZES = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "favicon-48x48.png": 48,
  "favicon-64x64.png": 64,
  "apple-touch-icon.png": 180,
  "android-chrome-192x192.png": 192,
  "android-chrome-512x512.png": 512,
};

async function main() {
  console.log("Analyzing logo from path:", LOGO_PATH);

  if (!fs.existsSync(LOGO_PATH)) {
    console.error("Error: log.png not found at public/log.png");
    process.exit(1);
  }

  // Read base image and trim transparent margins
  const logo = sharp(LOGO_PATH);
  const trimmedBuffer = await logo.trim().toBuffer();

  const pngBuffers = {};

  // Generate each resized icon with 90% size occupancy centered inside standard bounds
  for (const [filename, size] of Object.entries(SIZES)) {
    const destPath = path.join(PUBLIC_DIR, filename);

    // Calculate inner content size (90% occupancy)
    const contentSize = Math.max(8, Math.round(size * 0.9));
    
    // Trim, resize to contentSize, then extend with transparent background to fill the full bounds
    const buffer = await sharp(trimmedBuffer)
      .resize(contentSize, contentSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: Math.floor((size - contentSize) / 2),
        bottom: Math.ceil((size - contentSize) / 2),
        left: Math.floor((size - contentSize) / 2),
        right: Math.ceil((size - contentSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    fs.writeFileSync(destPath, buffer);
    console.log(`Generated: ${filename} (${size}x${size})`);
    pngBuffers[size] = buffer;
  }

  // Compile standard multi-resolution favicon.ico containing 16x16, 32x32, 48x48, and 64x64 sizes
  const icoSizes = [16, 32, 48, 64];
  const icoBuffer = writeIco(icoSizes.map(size => ({ size, buffer: pngBuffers[size] })));
  
  const icoDestPath = path.join(PUBLIC_DIR, "favicon.ico");
  fs.writeFileSync(icoDestPath, icoBuffer);
  console.log("Generated: favicon.ico containing 16, 32, 48, 64px resolutions");
}

/**
 * Packs multiple PNG buffers into a single ICO binary buffer.
 */
function writeIco(images) {
  const count = images.length;
  
  // Header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type = Icon
  header.writeUInt16LE(count, 4); // Number of images

  const directories = [];
  const dataBuffers = [];
  
  let currentOffset = 6 + count * 16; // Start offset of first image data block

  for (let i = 0; i < count; i++) {
    const { size, buffer } = images[i];
    const dataSize = buffer.length;

    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    dir.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    dir.writeUInt8(0, 2); // Color count (0 = no palette)
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(dataSize, 8); // Size of image data
    dir.writeUInt32LE(currentOffset, 12); // Offset of image data

    directories.push(dir);
    dataBuffers.push(buffer);

    currentOffset += dataSize;
  }

  return Buffer.concat([header, ...directories, ...dataBuffers]);
}

main().catch(err => {
  console.error("Failed to generate favicons:", err);
  process.exit(1);
});
