/**
 * Client-side upload validation utilities
 * These can be safely used in browser components
 */

// Image configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as readonly string[],
  QUALITY: 85,
  LOGO: {
    MAX_WIDTH: 500,
    MAX_HEIGHT: 500,
  },
  FAVICON: {
    SIZE: 32,
  },
  GALLERY: {
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 800,
    MAX_COUNT: 6,
  },
  COVER: {
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
  }
};

// Validate image file (client-safe)
export function validateImage(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: '請選擇檔案' };
  }

  if (!UPLOAD_CONFIG.ALLOWED_FORMATS.includes(file.type)) {
    return { isValid: false, error: '檔案格式不支援，請上傳 JPG、PNG 或 WebP' };
  }

  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return { isValid: false, error: `檔案大小不可超過 ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)} MB` };
  }

  return { isValid: true };
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}