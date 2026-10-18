const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Created on require so the directory exists before the first upload.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Same signature as the previous S3 helper so call sites stay unchanged.
// `mimetype` is unused locally: Express sets Content-Type from the extension
// when serving /uploads, but the parameter is kept for call-site compatibility.
async function saveFileLocally(buffer, originalname, mimetype) {
  const safeName = path.basename(originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `${crypto.randomUUID()}-${safeName}`;

  await fs.promises.writeFile(path.join(UPLOAD_DIR, uniqueFilename), buffer);

  // Absolute URL, matching the shape the S3 helper returned, so the frontend
  // can use the value directly in src/href without knowing the API host.
  const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`)
    .replace(/\/+$/, '');

  return `${baseUrl}/uploads/${uniqueFilename}`;
}

module.exports = saveFileLocally;
