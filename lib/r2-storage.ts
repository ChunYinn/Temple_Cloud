import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

// Image size limits and dimensions
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  FAVICON_SIZE: 32, // 32x32 for favicon
  LOGO_MAX_WIDTH: 500, // Max width for logo
  LOGO_MAX_HEIGHT: 500, // Max height for logo
  ALLOWED_FORMATS: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ] as readonly string[],
  QUALITY: 85, // JPEG/WebP quality
};

// R2 configuration
const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.R2_BUCKET_NAME!,
  publicDomain: process.env.R2_PUBLIC_DOMAIN, // Optional custom domain
};

// Initialize S3 Client for R2
let s3Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!s3Client) {
    // Validate required env vars
    if (
      !R2_CONFIG.accountId ||
      !R2_CONFIG.accessKeyId ||
      !R2_CONFIG.secretAccessKey
    ) {
      throw new Error(
        "R2 configuration missing. Please check your environment variables."
      );
    }

    s3Client = new S3Client({
      region: "auto", // R2 uses auto region
      endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
      },
    });
  }
  return s3Client;
}

/**
 * Generate a unique key for temple assets
 */
export function generateAssetKey(
  templeId: string,
  type: "logo" | "favicon" | "gallery",
  filename: string
): string {
  const timestamp = Date.now();
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `temples/${templeId}/${type}/${timestamp}.${ext}`;
}

/**
 * Get public URL for an asset
 */
export function getPublicUrl(key: string): string {
  // Best practice: Use the public bucket URL from environment
  const publicBucketUrl = process.env.R2_PUBLIC_BUCKET_URL;
  if (publicBucketUrl) {
    return `${publicBucketUrl}/${key}`;
  }

  // Fallback: If custom domain is configured
  if (R2_CONFIG.publicDomain) {
    return `${R2_CONFIG.publicDomain}/${key}`;
  }

  // Last resort: Try to construct from account ID (may not work)
  console.warn('R2_PUBLIC_BUCKET_URL not configured. Please add it to .env');
  return `https://pub-${R2_CONFIG.accountId}.r2.dev/${key}`;
}

/**
 * Validate image file
 */
export function validateImage(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Check file size
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `檔案大小不能超過 ${IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!IMAGE_CONFIG.ALLOWED_FORMATS.includes(file.type)) {
    return {
      isValid: false,
      error: "只支援 JPG, PNG, WebP 或 SVG 格式",
    };
  }

  return { isValid: true };
}

/**
 * Process and optimize image for logo
 */
export async function processLogoImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(IMAGE_CONFIG.LOGO_MAX_WIDTH, IMAGE_CONFIG.LOGO_MAX_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: IMAGE_CONFIG.QUALITY, progressive: true })
    .toBuffer();
}

/**
 * Generate favicon from image
 */
export async function generateFavicon(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(IMAGE_CONFIG.FAVICON_SIZE, IMAGE_CONFIG.FAVICON_SIZE, {
      fit: "cover",
      position: "center",
    })
    .png() // PNG for better favicon quality
    .toBuffer();
}

/**
 * Upload image to R2
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string = "image/jpeg"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Add cache control for better performance
      CacheControl: "public, max-age=31536000, immutable",
      // Add metadata
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await client.send(command);

    const url = getPublicUrl(key);
    return { success: true, url };
  } catch (error) {
    console.error("R2 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "上傳失敗，請稍後再試",
    };
  }
}

/**
 * Delete image from R2
 */
export async function deleteFromR2(
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error("R2 delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "刪除失敗",
    };
  }
}

/**
 * Upload temple logo and generate favicon
 */
export async function uploadTempleLogo(
  templeId: string,
  file: File
): Promise<{
  success: boolean;
  logoUrl?: string;
  faviconUrl?: string;
  error?: string;
}> {
  try {
    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process logo image
    const logoBuffer = await processLogoImage(buffer);
    const logoKey = generateAssetKey(templeId, "logo", file.name);

    // Generate favicon
    const faviconBuffer = await generateFavicon(buffer);
    const faviconKey = generateAssetKey(templeId, "favicon", "favicon.png");

    // Upload both images
    const [logoResult, faviconResult] = await Promise.all([
      uploadToR2(logoKey, logoBuffer, "image/jpeg"),
      uploadToR2(faviconKey, faviconBuffer, "image/png"),
    ]);

    if (!logoResult.success || !faviconResult.success) {
      return {
        success: false,
        error: logoResult.error || faviconResult.error,
      };
    }

    return {
      success: true,
      logoUrl: logoResult.url,
      faviconUrl: faviconResult.url,
    };
  } catch (error) {
    console.error("Temple logo upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "處理圖片時發生錯誤",
    };
  }
}

/**
 * Get signed URL for private uploads (if needed)
 */
export async function getSignedUploadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
}
