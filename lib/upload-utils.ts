import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

import { UPLOAD_CONFIG } from './upload-validation';

// Re-export for server-side use
export { UPLOAD_CONFIG };

// R2 configuration
const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.R2_BUCKET_NAME || 'temple-assets',
};

// Initialize S3 client (R2 compatible)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

// Generate unique key for assets
export function generateAssetKey(type: 'logo' | 'favicon' | 'gallery' | 'cover', templeId: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  if (type === 'gallery') {
    return `temples/${templeId}/gallery/${timestamp}-${random}.${extension}`;
  }

  return `temples/${templeId}/${type}-${timestamp}.${extension}`;
}

// Get public URL for an asset
export function getPublicUrl(key: string): string {
  const publicBucketUrl = process.env.R2_PUBLIC_BUCKET_URL;
  if (publicBucketUrl) {
    return `${publicBucketUrl}/${key}`;
  }

  console.warn('R2_PUBLIC_BUCKET_URL not configured. Please add it to .env');
  return `https://pub-${R2_CONFIG.accountId}.r2.dev/${key}`;
}


// Process and resize image
export async function processImage(
  buffer: Buffer,
  options: {
    maxWidth: number;
    maxHeight: number;
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
  }
): Promise<Buffer> {
  const { maxWidth, maxHeight, format = 'jpeg', quality = UPLOAD_CONFIG.QUALITY } = options;

  return sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFormat(format, { quality })
    .toBuffer();
}

// Generate favicon from image
export async function generateFavicon(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(UPLOAD_CONFIG.FAVICON.SIZE, UPLOAD_CONFIG.FAVICON.SIZE, {
      fit: 'cover',
      position: 'center'
    })
    .png()
    .toBuffer();
}

// Upload to R2
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<boolean> {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 upload error:', error);
    return false;
  }
}

// Delete from R2
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}

// Upload temple logo
export async function uploadTempleLogo(
  templeId: string,
  file: File
): Promise<{
  success: boolean;
  logoUrl?: string;
  error?: string;
}> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type.split('/')[1] || 'jpg';

    // Process logo image
    const processedLogo = await processImage(buffer, {
      maxWidth: UPLOAD_CONFIG.LOGO.MAX_WIDTH,
      maxHeight: UPLOAD_CONFIG.LOGO.MAX_HEIGHT,
      format: 'jpeg',
    });

    // Upload logo
    const logoKey = generateAssetKey('logo', templeId, extension);
    const logoUploaded = await uploadToR2(logoKey, processedLogo, 'image/jpeg');

    if (!logoUploaded) {
      return { success: false, error: '標誌上傳失敗' };
    }

    return {
      success: true,
      logoUrl: getPublicUrl(logoKey),
    };
  } catch (error) {
    console.error('Logo upload error:', error);
    return { success: false, error: '處理圖片時發生錯誤' };
  }
}

// Upload temple favicon (separate from logo)
export async function uploadTempleFavicon(
  templeId: string,
  file: File
): Promise<{
  success: boolean;
  faviconUrl?: string;
  error?: string;
}> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate favicon
    const favicon = await generateFavicon(buffer);
    const faviconKey = generateAssetKey('favicon', templeId, 'png');
    const faviconUploaded = await uploadToR2(faviconKey, favicon, 'image/png');

    if (!faviconUploaded) {
      return { success: false, error: '圖標上傳失敗' };
    }

    return {
      success: true,
      faviconUrl: getPublicUrl(faviconKey),
    };
  } catch (error) {
    console.error('Favicon upload error:', error);
    return { success: false, error: '處理圖標時發生錯誤' };
  }
}

// Upload gallery photo
export async function uploadGalleryPhoto(
  templeId: string,
  file: File
): Promise<{
  success: boolean;
  photoUrl?: string;
  error?: string;
}> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type.split('/')[1] || 'jpg';

    // Process gallery image
    const processedImage = await processImage(buffer, {
      maxWidth: UPLOAD_CONFIG.GALLERY.MAX_WIDTH,
      maxHeight: UPLOAD_CONFIG.GALLERY.MAX_HEIGHT,
      format: 'jpeg',
    });

    // Upload image
    const photoKey = generateAssetKey('gallery', templeId, extension);
    const uploaded = await uploadToR2(photoKey, processedImage, 'image/jpeg');

    if (!uploaded) {
      return { success: false, error: '照片上傳失敗' };
    }

    return {
      success: true,
      photoUrl: getPublicUrl(photoKey),
    };
  } catch (error) {
    console.error('Gallery upload error:', error);
    return { success: false, error: '處理照片時發生錯誤' };
  }
}

// Delete image from R2 using URL
export async function deleteImageByUrl(imageUrl: string): Promise<boolean> {
  try {
    // Extract key from URL
    const publicUrl = process.env.R2_PUBLIC_BUCKET_URL;
    if (!publicUrl || !imageUrl.startsWith(publicUrl)) {
      console.error('Invalid image URL');
      return false;
    }

    const key = imageUrl.replace(`${publicUrl}/`, '');
    return await deleteFromR2(key);
  } catch (error) {
    console.error('Delete image error:', error);
    return false;
  }
}