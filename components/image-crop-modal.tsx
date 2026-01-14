'use client';

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import ReactDOM from 'react-dom';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCw } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  aspectRatio: number; // e.g., 16/9 for cover, 1 for square logo
  onCropComplete: (croppedImageBlob: Blob) => void;
  title?: string;
  minWidth?: number;
  minHeight?: number;
}

// Memoized modal component to prevent unnecessary re-renders
export const ImageCropModal = memo(function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  aspectRatio,
  onCropComplete,
  title = '裁切圖片',
  minWidth = 200,
  minHeight = 200
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { width, height } = img;

    // Create centered crop with aspect ratio
    const percentCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90, // Start with 90% of image
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );

    setCrop(percentCrop);

    // Immediately calculate and set pixel crop
    const pixelCrop: PixelCrop = {
      unit: 'px',
      x: Math.round((percentCrop.x * width) / 100),
      y: Math.round((percentCrop.y * height) / 100),
      width: Math.round((percentCrop.width * width) / 100),
      height: Math.round((percentCrop.height * height) / 100)
    };

    setCompletedCrop(pixelCrop);
  }, [aspectRatio]);

  // Generate cropped image blob
  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imageRef.current || !canvasRef.current) {
      return null;
    }

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    // Get the actual displayed size and natural size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate pixel values from the crop
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;

    // Set canvas size to match the crop
    canvas.width = Math.floor(sourceWidth);
    canvas.height = Math.floor(sourceHeight);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set quality settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped area - ensure we're using integer values
    ctx.drawImage(
      image,
      Math.floor(sourceX),
      Math.floor(sourceY),
      Math.floor(sourceWidth),
      Math.floor(sourceHeight),
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.95 // High quality JPEG
      );
    });
  }, [completedCrop]);

  // Handle confirm button
  const handleConfirm = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing || !completedCrop) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
        // Small delay to ensure state updates properly
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  }, [getCroppedImage, onCropComplete, onClose, isProcessing, completedCrop]);

  // Reset crop to default
  const handleReset = useCallback(() => {
    if (imageRef.current) {
      const { width, height } = imageRef.current;
      const percentCrop = centerCrop(
        makeAspectCrop(
          { unit: '%', width: 90 },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      );
      setCrop(percentCrop);

      // Also reset the pixel crop
      if (percentCrop.unit === '%') {
        const pixelCrop = {
          unit: 'px' as const,
          x: (percentCrop.x * width) / 100,
          y: (percentCrop.y * height) / 100,
          width: (percentCrop.width * width) / 100,
          height: (percentCrop.height * height) / 100
        };
        setCompletedCrop(pixelCrop);
      }
    }
  }, [aspectRatio]);

  // Sync pixel crop whenever percentage crop changes and we have an image
  useEffect(() => {
    if (crop && crop.unit === '%' && imageRef.current) {
      const { width, height } = imageRef.current;
      const pixelCrop: PixelCrop = {
        unit: 'px',
        x: Math.round((crop.x * width) / 100),
        y: Math.round((crop.y * height) / 100),
        width: Math.round((crop.width * width) / 100),
        height: Math.round((crop.height * height) / 100)
      };
      setCompletedCrop(pixelCrop);
    }
  }, [crop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setCrop(undefined);
      setCompletedCrop(undefined);
    };
  }, []);

  // Check if we're on client side
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70"
        onClick={(e) => {
          // Only close if clicking the backdrop, not the modal content
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => {
            // Prevent any click inside the modal from bubbling up
            e.stopPropagation();
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <h3 className="text-lg font-bold text-stone-800">{title}</h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Crop Area */}
          <div className="p-4 overflow-auto max-h-[60vh] bg-stone-50">
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(newCrop, percentCrop) => {
                  setCrop(percentCrop);
                  // Also update pixel crop during dragging for real-time accuracy
                  if (imageRef.current) {
                    const { width, height } = imageRef.current;
                    const pixelCrop: PixelCrop = {
                      unit: 'px',
                      x: Math.round((percentCrop.x / 100) * width),
                      y: Math.round((percentCrop.y / 100) * height),
                      width: Math.round((percentCrop.width / 100) * width),
                      height: Math.round((percentCrop.height / 100) * height)
                    };
                    setCompletedCrop(pixelCrop);
                  }
                }}
                onComplete={(pixelCrop) => {
                  setCompletedCrop(pixelCrop);
                }}
                aspect={aspectRatio}
                minWidth={minWidth}
                minHeight={minHeight}
                keepSelection={true}
                className="max-w-full"
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full h-auto"
                  style={{
                    maxHeight: '50vh',
                    display: 'block' // Ensure no inline-block spacing issues
                  }}
                  crossOrigin="anonymous" // Ensure CORS is handled
                />
              </ReactCrop>
            </div>
          </div>

          {/* Instructions */}
          <div className="px-4 py-2 bg-stone-50 border-t border-stone-100">
            <p className="text-sm text-stone-600 text-center">
              拖動並調整框架來裁切圖片 {aspectRatio === 1 ? '(正方形)' : `(${aspectRatio > 1 ? '橫向' : '直向'})`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-stone-200 bg-white">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-2"
              disabled={isProcessing}
            >
              <RotateCw className="w-4 h-4" />
              重置
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing || !completedCrop}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    處理中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    確認裁切
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
});

// Preset aspect ratios for common use cases
export const ASPECT_RATIOS = {
  COVER: 16 / 9,    // Wide banner for cover images
  LOGO: 1,          // Square for logos
  PORTRAIT: 3 / 4,  // Portrait orientation
  LANDSCAPE: 4 / 3, // Landscape orientation
  WIDE: 21 / 9,     // Ultra-wide banner
} as const;