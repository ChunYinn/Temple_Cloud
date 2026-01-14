import { useState, useCallback } from 'react';
import { createFilePreview, revokeFilePreview } from '@/lib/image-validation';

interface ImageCropState {
  showCrop: boolean;
  tempUrl: string | null;
  croppedFile: File | null;
  preview: string | null;
}

/**
 * Custom hook for image cropping functionality
 * @param aspectRatio - Aspect ratio for the crop (e.g., 1 for square, 16/9 for landscape)
 * @param onCropComplete - Optional callback when crop is completed
 * @returns Object with crop state and handler functions
 */
export function useImageCrop(
  aspectRatio: number = 1,
  onCropComplete?: (file: File) => void
) {
  const [state, setState] = useState<ImageCropState>({
    showCrop: false,
    tempUrl: null,
    croppedFile: null,
    preview: null,
  });

  // Handle file selection and open crop modal
  const handleFileSelect = useCallback((file: File) => {
    const url = createFilePreview(file);
    setState(prev => ({
      ...prev,
      showCrop: true,
      tempUrl: url,
    }));
  }, []);

  // Handle crop completion
  const handleCropComplete = useCallback(
    async (croppedImageUrl: string) => {
      try {
        // Convert cropped image URL to file
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

        setState(prev => {
          // Clean up old preview if exists
          if (prev.preview) {
            revokeFilePreview(prev.preview);
          }

          return {
            ...prev,
            showCrop: false,
            croppedFile: file,
            preview: croppedImageUrl,
          };
        });

        // Call the optional callback
        if (onCropComplete) {
          onCropComplete(file);
        }
      } catch (error) {
        console.error('Error processing cropped image:', error);
        handleCropClose();
      }
    },
    [onCropComplete]
  );

  // Handle crop modal close
  const handleCropClose = useCallback(() => {
    setState(prev => {
      // Clean up temporary URL
      if (prev.tempUrl) {
        revokeFilePreview(prev.tempUrl);
      }

      return {
        ...prev,
        showCrop: false,
        tempUrl: null,
      };
    });
  }, []);

  // Remove cropped file and preview
  const removeCroppedFile = useCallback(() => {
    setState(prev => {
      // Clean up preview URL
      if (prev.preview) {
        revokeFilePreview(prev.preview);
      }

      return {
        ...prev,
        croppedFile: null,
        preview: null,
      };
    });
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setState(prev => {
      // Clean up all URLs
      if (prev.tempUrl) {
        revokeFilePreview(prev.tempUrl);
      }
      if (prev.preview) {
        revokeFilePreview(prev.preview);
      }

      return {
        showCrop: false,
        tempUrl: null,
        croppedFile: null,
        preview: null,
      };
    });
  }, []);

  // Clean up on unmount
  const cleanup = useCallback(() => {
    if (state.tempUrl) {
      revokeFilePreview(state.tempUrl);
    }
    if (state.preview) {
      revokeFilePreview(state.preview);
    }
  }, [state.tempUrl, state.preview]);

  return {
    // State
    showCrop: state.showCrop,
    tempUrl: state.tempUrl,
    croppedFile: state.croppedFile,
    preview: state.preview,

    // Handlers
    handleFileSelect,
    handleCropComplete,
    handleCropClose,
    removeCroppedFile,
    reset,
    cleanup,

    // Config
    aspectRatio,
  };
}