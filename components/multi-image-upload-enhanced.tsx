'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, AlertCircle, Crop, Replace } from 'lucide-react';
import Image from 'next/image';
import { ImageCropModalStandalone as ImageCropModal, ASPECT_RATIOS } from './image-crop-modal-standalone';
import { UPLOAD_CONFIG, validateImage } from '@/lib/upload-validation';

interface MultiImageUploadEnhancedProps {
  templeId: string;
  existingImages: string[];
  onImagesUpdate: (images: string[]) => void;
  maxImages?: number;
}

interface ImageToProcess {
  file: File;
  tempUrl: string;
  index?: number; // For replacement
}

export function MultiImageUploadEnhanced({
  templeId,
  existingImages,
  onImagesUpdate,
  maxImages = UPLOAD_CONFIG.GALLERY.MAX_COUNT,
}: MultiImageUploadEnhancedProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imagesToProcess, setImagesToProcess] = useState<ImageToProcess[]>([]);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [processedImages, setProcessedImages] = useState<File[]>([]);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Handle file selection for new uploads
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrors([]);
    const newErrors: string[] = [];

    // Check total count
    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      newErrors.push(`最多還能上傳 ${remainingSlots} 張圖片，您選擇了 ${files.length} 張`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return setErrors(newErrors);
    }

    // Validate all files first
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateImage(file);
      if (!validation.isValid) {
        newErrors.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Create temp URLs for cropping
    const tempImages = validFiles.map(file => ({
      file,
      tempUrl: URL.createObjectURL(file)
    }));

    setImagesToProcess(tempImages);
    setCurrentProcessingIndex(0);
    setProcessedImages([]);
    setShowCropModal(true);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [images.length, maxImages]);

  // Handle file selection for replacement
  const handleReplaceImage = useCallback((index: number) => {
    setReplacingIndex(index);
    replaceInputRef.current?.click();
  }, []);

  const handleReplaceFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    setErrors([]);

    // Validate file
    const validation = validateImage(file);
    if (!validation.isValid) {
      setErrors([validation.error!]);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
      return;
    }

    // Create temp URL for cropping
    const tempImage = {
      file,
      tempUrl: URL.createObjectURL(file),
      index: replacingIndex
    };

    setImagesToProcess([tempImage]);
    setCurrentProcessingIndex(0);
    setProcessedImages([]);
    setShowCropModal(true);

    // Reset input
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  }, [replacingIndex]);

  // Handle crop completion for current image
  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    const currentImage = imagesToProcess[currentProcessingIndex];
    if (!currentImage) return;

    // Convert blob to File
    const file = new File(
      [croppedBlob],
      `gallery-${Date.now()}-${currentProcessingIndex}.jpg`,
      { type: 'image/jpeg' }
    );

    const newProcessedImages = [...processedImages, file];
    setProcessedImages(newProcessedImages);

    // Clean up temp URL
    URL.revokeObjectURL(currentImage.tempUrl);

    // Check if there are more images to process
    if (currentProcessingIndex < imagesToProcess.length - 1) {
      setCurrentProcessingIndex(currentProcessingIndex + 1);
    } else {
      // All images processed, now upload them
      setShowCropModal(false);
      uploadProcessedImages(newProcessedImages, currentImage.index);

      // Clean up
      setImagesToProcess([]);
      setCurrentProcessingIndex(0);
      setProcessedImages([]);
    }
  }, [currentProcessingIndex, imagesToProcess, processedImages]);

  // Upload all processed images
  const uploadProcessedImages = async (files: File[], replaceIndex?: number) => {
    setUploading(true);
    setErrors([]);
    const newErrors: string[] = [];
    const uploadedUrls: string[] = [];
    const oldImagesToDelete: string[] = [];

    try {
      // If replacing, store the old image URL for deletion
      if (replaceIndex !== undefined && images[replaceIndex]) {
        oldImagesToDelete.push(images[replaceIndex]);
      }

      // Upload all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('templeId', templeId);
        formData.append('type', 'gallery');

        const response = await fetch('/api/upload/gallery', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          uploadedUrls.push(result.photoUrl);
        } else {
          newErrors.push(`圖片 ${i + 1}: ${result.error || '上傳失敗'}`);
        }
      }

      if (uploadedUrls.length > 0) {
        let newImages: string[];

        if (replaceIndex !== undefined) {
          // Replace specific image
          newImages = [...images];
          newImages[replaceIndex] = uploadedUrls[0];
        } else {
          // Add new images
          newImages = [...images, ...uploadedUrls];
        }

        setImages(newImages);
        onImagesUpdate(newImages);

        // Delete old images after successful upload (last step)
        if (oldImagesToDelete.length > 0) {
          for (const oldUrl of oldImagesToDelete) {
            try {
              await fetch(
                `/api/upload/gallery?templeId=${templeId}&photoUrl=${encodeURIComponent(oldUrl)}`,
                { method: 'DELETE' }
              );
            } catch (err) {
              console.error('Failed to delete old image:', err);
            }
          }
        }
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }
    } catch (error) {
      setErrors(['上傳圖片時發生錯誤']);
    } finally {
      setUploading(false);
      setReplacingIndex(null);
    }
  };

  // Handle crop modal close
  const handleCropClose = useCallback(() => {
    // Clean up all temp URLs
    imagesToProcess.forEach(img => URL.revokeObjectURL(img.tempUrl));

    setShowCropModal(false);
    setImagesToProcess([]);
    setCurrentProcessingIndex(0);
    setProcessedImages([]);
    setReplacingIndex(null);
  }, [imagesToProcess]);

  // Remove image
  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      // Remove from UI immediately
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesUpdate(newImages);

      // Delete from storage (happens in background)
      fetch(
        `/api/upload/gallery?templeId=${templeId}&photoUrl=${encodeURIComponent(imageUrl)}`,
        { method: 'DELETE' }
      ).catch(err => console.error('Failed to delete image:', err));
    } catch (error) {
      setErrors(['刪除圖片時發生錯誤']);
    }
  };

  const canUploadMore = images.length < maxImages;
  const currentImage = imagesToProcess[currentProcessingIndex];

  return (
    <div className="space-y-4">
      {/* Upload Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-600">
          已上傳 {images.length} / {maxImages} 張圖片
        </p>
        {!canUploadMore && (
          <p className="text-sm text-amber-600">
            已達上傳上限，可替換現有圖片
          </p>
        )}
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">上傳錯誤</p>
                <ul className="mt-1 text-sm text-red-700 space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors([])}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing Images */}
        {images.map((imageUrl, index) => (
          <motion.div
            key={`${imageUrl}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden group"
          >
            <Image
              src={imageUrl}
              alt={`圖片 ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleReplaceImage(index)}
                className="p-1.5 bg-white rounded-lg hover:bg-blue-50"
                title="替換圖片"
                disabled={uploading}
              >
                <Replace className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => handleRemoveImage(imageUrl, index)}
                className="p-1.5 bg-white rounded-lg hover:bg-red-50"
                title="刪除圖片"
                disabled={uploading}
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>

            {/* Image number badge */}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              {index + 1} / {maxImages}
            </div>
          </motion.div>
        ))}

        {/* Upload Button */}
        {canUploadMore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/3]"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-full border-2 border-dashed border-stone-300 rounded-xl hover:border-stone-400 transition-colors flex flex-col items-center justify-center gap-2 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                  <span className="text-sm text-stone-600">上傳中...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-stone-400" />
                  <span className="text-sm text-stone-600 font-medium">
                    批量上傳圖片
                  </span>
                  <span className="text-xs text-stone-500">
                    可選擇多張 (最多 {maxImages - images.length} 張)
                  </span>
                  <span className="text-xs text-stone-400">
                    JPG, PNG, WebP
                  </span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_CONFIG.ALLOWED_FORMATS.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={UPLOAD_CONFIG.ALLOWED_FORMATS.join(',')}
        onChange={handleReplaceFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <div className="text-xs text-stone-500 space-y-1">
        <p>• 每張圖片最大 5MB，建議尺寸 1200x800 像素以上</p>
        <p>• 支援批量選擇多張圖片，自動裁切為 4:3 比例</p>
        {!canUploadMore && <p>• 點擊圖片上的替換按鈕可更換圖片</p>}
      </div>

      {/* Image Crop Modal */}
      {currentImage && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={handleCropClose}
          imageUrl={currentImage.tempUrl}
          aspectRatio={ASPECT_RATIOS.LANDSCAPE}
          onCropComplete={handleCropComplete}
          title={`裁切圖片 ${currentProcessingIndex + 1} / ${imagesToProcess.length}`}
          minWidth={800}
          minHeight={600}
        />
      )}
    </div>
  );
}