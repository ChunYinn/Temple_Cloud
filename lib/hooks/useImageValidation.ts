import { useCallback } from 'react';
import { validateImageFile, ValidationResult } from '@/lib/image-validation';
import { UPLOAD_CONFIG } from '@/lib/upload-validation';

/**
 * Custom hook for image file validation
 * @param maxSize - Optional max size in bytes (default: 5MB)
 * @returns Object with validation function and helper methods
 */
export function useImageValidation(maxSize: number = UPLOAD_CONFIG.MAX_FILE_SIZE) {
  const validateFile = useCallback(
    (file: File): ValidationResult => {
      return validateImageFile(file, maxSize);
    },
    [maxSize]
  );

  const validateAndAlert = useCallback(
    (file: File): boolean => {
      const result = validateFile(file);
      if (!result.valid) {
        alert(result.error);
        return false;
      }
      return true;
    },
    [validateFile]
  );

  const validateMultiple = useCallback(
    (files: File[], maxFiles: number = 10): ValidationResult => {
      if (!files || files.length === 0) {
        return { valid: false, error: '請選擇圖片檔案' };
      }

      if (files.length > maxFiles) {
        return {
          valid: false,
          error: `最多只能上傳 ${maxFiles} 張圖片`
        };
      }

      for (const file of files) {
        const result = validateFile(file);
        if (!result.valid) {
          return result;
        }
      }

      return { valid: true };
    },
    [validateFile]
  );

  return {
    validateFile,
    validateAndAlert,
    validateMultiple,
    maxSize,
    allowedFormats: UPLOAD_CONFIG.ALLOWED_FORMATS,
  };
}