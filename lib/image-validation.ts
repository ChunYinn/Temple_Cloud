import { UPLOAD_CONFIG } from '@/lib/upload-validation';
import { ERROR_MESSAGES } from '@/lib/error-messages';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file for upload
 * @param file - The file to validate
 * @param maxSize - Optional max size in bytes (default: 5MB)
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSize: number = UPLOAD_CONFIG.MAX_FILE_SIZE
): ValidationResult {
  if (!file) {
    return { valid: false, error: ERROR_MESSAGES.UPLOAD.NO_FILE };
  }

  if (!UPLOAD_CONFIG.ALLOWED_FORMATS.includes(file.type)) {
    return { valid: false, error: ERROR_MESSAGES.UPLOAD.INVALID_FORMAT };
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `圖片大小不可超過 ${maxSizeMB} MB`
    };
  }

  return { valid: true };
}

/**
 * Validate multiple image files
 * @param files - Array of files to validate
 * @param maxFiles - Maximum number of files allowed
 * @param maxSizePerFile - Maximum size per file in bytes
 * @returns Validation result with error message if invalid
 */
export function validateMultipleImageFiles(
  files: File[],
  maxFiles: number = 10,
  maxSizePerFile: number = UPLOAD_CONFIG.MAX_FILE_SIZE
): ValidationResult {
  if (!files || files.length === 0) {
    return { valid: false, error: ERROR_MESSAGES.UPLOAD.NO_FILE };
  }

  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `最多只能上傳 ${maxFiles} 張圖片`
    };
  }

  for (const file of files) {
    const result = validateImageFile(file, maxSizePerFile);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns The file extension without the dot
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.at(-1)?.toLowerCase() || '';
}

/**
 * Generate a unique filename for uploads
 * @param originalName - The original filename
 * @param prefix - Optional prefix for the filename
 * @returns A unique filename
 */
export function generateUniqueFilename(
  originalName: string,
  prefix: string = 'upload'
): string {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Convert file to base64 string
 * @param file - The file to convert
 * @returns Promise with base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(new Error(`Failed to read file: ${error}`));
  });
}

/**
 * Create object URL for file preview
 * @param file - The file to create preview for
 * @returns Object URL for preview
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up object URL to prevent memory leaks
 * @param url - The object URL to revoke
 */
export function revokeFilePreview(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}