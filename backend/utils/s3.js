/**
 * S3 File Storage Service
 * Replaces local file storage with AWS S3 uploads
 * Falls back to local storage if S3 is not configured
 */
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Check if S3 is configured
const isS3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

let s3Client = null;

if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('✅ S3 storage configured');
} else {
  console.log('⚠️ S3 not configured, falling back to local file storage');
}

// Local storage fallback
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Generate a unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
function generateUniqueFilename(originalName) {
  const safeName = path.basename(originalName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${crypto.randomUUID()}-${safeName}`;
}

/**
 * Upload a file buffer to S3 or local storage
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type
 * @param {string} [folder='uploads'] - S3 folder/prefix
 * @returns {Promise<{url: string, key: string}>} Upload result with URL and storage key
 */
async function uploadFile(buffer, originalName, mimeType, folder = 'uploads') {
  const uniqueFilename = generateUniqueFilename(originalName);

  if (isS3Configured && s3Client) {
    const key = `${folder}/${uniqueFilename}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return { url, key };
  }

  // Local fallback
  await fs.promises.writeFile(path.join(UPLOAD_DIR, uniqueFilename), buffer);
  const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/+$/, '');
  const url = `${baseUrl}/uploads/${uniqueFilename}`;

  return { url, key: uniqueFilename };
}

/**
 * Upload a resume PDF to S3 (dedicated folder)
 * @param {Buffer} buffer - PDF buffer
 * @param {string} originalName - Original filename
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadResume(buffer, originalName) {
  return uploadFile(buffer, originalName, 'application/pdf', 'resumes');
}

/**
 * Upload a profile photo or company logo
 * @param {Buffer} buffer - Image buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadImage(buffer, originalName, mimeType) {
  return uploadFile(buffer, originalName, mimeType, 'images');
}

/**
 * Delete a file from S3 or local storage
 * @param {string} key - Storage key
 */
async function deleteFile(key) {
  if (isS3Configured && s3Client) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      }));
    } catch (err) {
      console.error('S3 delete error:', err.message);
    }
    return;
  }

  // Local fallback
  const filePath = path.join(UPLOAD_DIR, key);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Local delete error:', err.message);
    }
  }
}

/**
 * Get a presigned URL for temporary access to a private S3 object
 * @param {string} key - S3 key
 * @param {number} [expiresIn=3600] - URL expiry in seconds
 * @returns {Promise<string>} Presigned URL
 */
async function getPresignedUrl(key, expiresIn = 3600) {
  if (!isS3Configured || !s3Client) {
    const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/+$/, '');
    return `${baseUrl}/uploads/${key}`;
  }

  return getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }), { expiresIn });
}

module.exports = {
  uploadFile,
  uploadResume,
  uploadImage,
  deleteFile,
  getPresignedUrl,
  isS3Configured,
};
