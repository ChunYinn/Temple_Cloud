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
  publicUrl: process.env.R2_PUBLIC_BUCKET_URL,
};

// Initialize S3 client (R2 compatible) - singleton pattern
let s3Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!s3Client) {
    // Validate required env vars
    if (!R2_CONFIG.accountId || !R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey) {
      throw new Error('R2 configuration missing. Please check your environment variables.');
    }

    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
      },
    });
  }
  return s3Client;
}

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
  if (R2_CONFIG.publicUrl) {
    return `${R2_CONFIG.publicUrl}/${key}`;
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

// Generate favicon from image with rounded corners
export async function generateFavicon(buffer: Buffer): Promise<Buffer> {
  const size = UPLOAD_CONFIG.FAVICON.SIZE;
  const cornerRadius = Math.round(size * 0.2); // 20% of size for nice rounded corners

  // Create a rounded rectangle mask
  const roundedCorners = Buffer.from(
    `<svg width="${size}" height="${size}">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/>
    </svg>`
  );

  // First resize the image
  const resized = await sharp(buffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .toBuffer();

  // Apply rounded corners using composite
  return sharp(resized)
    .composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
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
    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Add cache control for better performance
      CacheControl: 'public, max-age=31536000, immutable',
      // Add metadata
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('R2 upload error:', error);
    return false;
  }
}

// Delete from R2
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}

// Upload temple logo (and automatically generate favicon from it)
export async function uploadTempleLogo(
  templeId: string,
  file: File,
  oldLogoUrl?: string | null,
  oldFaviconUrl?: string | null
): Promise<{
  success: boolean;
  logoUrl?: string;
  faviconUrl?: string;
  error?: string;
}> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type.split('/')[1] || 'jpg';

    // Delete old logo if it exists
    if (oldLogoUrl && R2_CONFIG.publicUrl) {
      const oldLogoKey = oldLogoUrl.replace(`${R2_CONFIG.publicUrl}/`, '');
      await deleteFromR2(oldLogoKey);
    }

    // Delete old favicon if it exists
    if (oldFaviconUrl && R2_CONFIG.publicUrl) {
      const oldFaviconKey = oldFaviconUrl.replace(`${R2_CONFIG.publicUrl}/`, '');
      await deleteFromR2(oldFaviconKey);
    }

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

    // Also generate and upload favicon from the same image
    const favicon = await generateFavicon(buffer);
    const faviconKey = generateAssetKey('favicon', templeId, 'png');
    const faviconUploaded = await uploadToR2(faviconKey, favicon, 'image/png');

    return {
      success: true,
      logoUrl: getPublicUrl(logoKey),
      faviconUrl: faviconUploaded ? getPublicUrl(faviconKey) : undefined,
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

// Upload temple cover image
export async function uploadTempleCover(
  templeId: string,
  file: File,
  oldCoverUrl?: string | null
): Promise<{
  success: boolean;
  coverUrl?: string;
  error?: string;
}> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type.split('/')[1] || 'jpg';

    // Delete old cover if it exists
    if (oldCoverUrl && R2_CONFIG.publicUrl) {
      const oldCoverKey = oldCoverUrl.replace(`${R2_CONFIG.publicUrl}/`, '');
      await deleteFromR2(oldCoverKey);
    }

    // Process cover image
    const processedCover = await processImage(buffer, {
      maxWidth: UPLOAD_CONFIG.COVER.MAX_WIDTH,
      maxHeight: UPLOAD_CONFIG.COVER.MAX_HEIGHT,
      format: 'jpeg',
    });

    // Upload cover
    const coverKey = generateAssetKey('cover', templeId, extension);
    const uploaded = await uploadToR2(coverKey, processedCover, 'image/jpeg');

    if (!uploaded) {
      return { success: false, error: '封面圖片上傳失敗' };
    }

    return {
      success: true,
      coverUrl: getPublicUrl(coverKey),
    };
  } catch (error) {
    console.error('Cover upload error:', error);
    return { success: false, error: '處理封面圖片時發生錯誤' };
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