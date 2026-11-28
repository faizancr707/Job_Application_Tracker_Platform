/**
 * AWS S3 Storage Service
 * Enterprise document management for resumes, cover letters, and profile assets.
 * 
 * Features:
 * - Private S3 bucket configuration with least-privilege access
 * - Server-Side Encryption (AES-256 / aws:kms)
 * - Time-limited Pre-Signed URLs for secure private document access
 * - Pre-signed PUT URLs for direct browser-to-S3 uploads
 * - Upload validation (MIME allowlist, file size enforcement)
 * - Automatic fallback to local storage for offline development
 */

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_USE_IAM_ROLE = process.env.AWS_USE_IAM_ROLE === 'true' || process.env.NODE_ENV === 'production';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || ''; // e.g. https://d1234.cloudfront.net

const hasExplicitKeys = Boolean(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);
const isS3Configured = Boolean(AWS_S3_BUCKET && (hasExplicitKeys || AWS_USE_IAM_ROLE));

let s3Client = null;

if (isS3Configured) {
  const clientConfig = { region: AWS_REGION };
  if (hasExplicitKeys) {
    clientConfig.credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };
  }
  // On EC2/ECS, omitting credentials delegates to IMDSv2 IAM Instance Profile
  s3Client = new S3Client(clientConfig);
  console.log(`[AWS S3] Initialized client for bucket: ${AWS_S3_BUCKET} (${AWS_REGION}, auth: ${hasExplicitKeys ? 'keys' : 'IAM Role'})`);
} else {
  console.log('[AWS S3] Bucket/credentials not detected. Operating in local filesystem fallback mode.');
}

// Local fallback directory
const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// File validation rules
const ALLOWED_MIME_TYPES = {
  resume: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  document: [
    'application/pdf',
    'text/plain',
  ],
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

/**
 * Validate file upload parameters
 * @param {string} mimeType
 * @param {number} sizeBytes
 * @param {'resume' | 'image' | 'document'} category
 */
function validateUpload(mimeType, sizeBytes, category = 'resume') {
  const allowed = ALLOWED_MIME_TYPES[category] || ALLOWED_MIME_TYPES.resume;
  if (!allowed.includes(mimeType)) {
    throw new Error(`Invalid file type "${mimeType}". Allowed types: ${allowed.join(', ')}`);
  }
  if (sizeBytes && sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${Math.round(sizeBytes / 1024 / 1024)}MB) exceeds maximum limit of 10MB.`);
  }
}

/**
 * Generate unique, sanitized storage key
 * @param {string} originalName
 * @param {string} prefix
 * @returns {string}
 */
function generateKey(originalName, prefix = 'resumes') {
  const safeName = path.basename(originalName || 'file.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const uuid = crypto.randomUUID();
  return `${prefix}/${uuid}-${safeName}`;
}

/**
 * Upload a document buffer to S3 (with encryption and metadata)
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @param {Object} options
 * @returns {Promise<{ key: string, url: string, location: string, isPrivate: boolean }>}
 */
async function uploadDocument(buffer, originalName, mimeType, options = {}) {
  const category = options.category || 'resume';
  const folder = options.folder || (category === 'image' ? 'images' : 'resumes');
  const isPrivate = options.isPrivate !== undefined ? options.isPrivate : true;

  validateUpload(mimeType, buffer.length, category);

  const key = generateKey(originalName, folder);

  if (isS3Configured && s3Client) {
    const putParams = {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        'original-filename': encodeURIComponent(originalName || ''),
        'uploaded-at': new Date().toISOString(),
        'category': category,
      },
    };

    await s3Client.send(new PutObjectCommand(putParams));

    // For public files (e.g. company logos) CloudFront or S3 URL is returned
    // For private files (resumes), pre-signed URL is generated
    let accessUrl;
    if (isPrivate) {
      accessUrl = await getPresignedDownloadUrl(key, 3600);
    } else if (CLOUDFRONT_DOMAIN) {
      accessUrl = `${CLOUDFRONT_DOMAIN.replace(/\/+$/, '')}/${key}`;
    } else {
      accessUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    }

    return {
      key,
      url: accessUrl,
      location: `s3://${AWS_S3_BUCKET}/${key}`,
      isPrivate,
    };
  }

  // Local filesystem fallback
  const localFileName = path.basename(key);
  const targetPath = path.join(LOCAL_UPLOAD_DIR, localFileName);
  await fs.promises.writeFile(targetPath, buffer);

  const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/+$/, '');
  const url = `${baseUrl}/uploads/${localFileName}`;

  return {
    key: localFileName,
    url,
    location: targetPath,
    isPrivate: false,
  };
}

/**
 * Generate a pre-signed GET URL for temporary, secure download/viewing of private files
 * @param {string} key - S3 object key
 * @param {number} expiresInSeconds - Expiration time in seconds (default: 3600s / 1 hour)
 * @returns {Promise<string>}
 */
async function getPresignedDownloadUrl(key, expiresInSeconds = 3600) {
  if (!isS3Configured || !s3Client) {
    const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/+$/, '');
    return `${baseUrl}/uploads/${path.basename(key)}`;
  }

  const command = new GetObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a pre-signed PUT URL allowing frontend clients to upload directly to S3
 * This offloads high-bandwidth uploads from the Express server.
 * @param {string} fileName
 * @param {string} mimeType
 * @param {string} folder
 * @param {number} expiresInSeconds
 * @returns {Promise<{ uploadUrl: string, key: string, publicUrl: string }>}
 */
async function getPresignedUploadUrl(fileName, mimeType, folder = 'resumes', expiresInSeconds = 900) {
  const category = mimeType.startsWith('image/') ? 'image' : 'resume';
  validateUpload(mimeType, 0, category);

  const key = generateKey(fileName, folder);

  if (!isS3Configured || !s3Client) {
    return {
      uploadUrl: `/api/v1/user/upload-local`,
      key,
      fallback: true,
    };
  }

  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    ContentType: mimeType,
    ServerSideEncryption: 'AES256',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  const publicUrl = CLOUDFRONT_DOMAIN
    ? `${CLOUDFRONT_DOMAIN.replace(/\/+$/, '')}/${key}`
    : `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    publicUrl,
  };
}

/**
 * Delete a document from S3 or local storage
 * @param {string} key
 */
async function deleteDocument(key) {
  if (isS3Configured && s3Client) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: key,
      }));
      return true;
    } catch (err) {
      console.error(`[AWS S3] Delete failed for ${key}:`, err.message);
      return false;
    }
  }

  // Local fallback
  try {
    const filePath = path.join(LOCAL_UPLOAD_DIR, path.basename(key));
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
    return true;
  } catch (err) {
    console.error(`[Local Storage] Delete failed for ${key}:`, err.message);
    return false;
  }
}

module.exports = {
  isS3Configured,
  uploadDocument,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  deleteDocument,
  validateUpload,
};
