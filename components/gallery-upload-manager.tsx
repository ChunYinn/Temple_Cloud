'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  AlertCircle,
  Replace,
  Images,
  ImagePlus,
  RotateCcw
} from 'lucide-react';
import Image from 'next/image';
import { ImageCropModalStandalone as ImageCropModal, ASPECT_RATIOS } from './image-crop-modal-standalone';
import { validateImage } from '@/lib/upload-validation';

interface GalleryUploadManagerProps {
  templeId: string;
  initialImages: string[];
  onImagesChange: (images: string[], hasChanges: boolean) => void;
  maxImages?: number;
}

type ImageChange = {
  type: 'add' | 'remove' | 'replace';
  index?: number;
  oldUrl?: string;
  newFile?: File;
  newPreview?: string;
};

export function GalleryUploadManager({
  templeId,
  initialImages,
  onImagesChange,
  maxImages = 6,
}: Readonly<GalleryUploadManagerProps>) {
  // Current state (what user sees)
  const [currentImages, setCurrentImages] = useState<string[]>(initialImages);
  const [pendingChanges, setPendingChanges] = useState<ImageChange[]>([]);
  const [pendingFiles, setPendingFiles] = useState<Map<string, File>>(new Map());

  // UI states
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch' | null>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<{ file: File; tempUrl: string; index?: number } | null>(null);

  // Check if there are unsaved changes
  const hasChanges = pendingChanges.length > 0;

  // Notify parent of changes
  useEffect(() => {
    onImagesChange(currentImages, hasChanges);
  }, [currentImages, hasChanges, onImagesChange]);

  // Handle single file with cropping
  const handleSingleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.isValid) {
      setErrors([validation.error!]);
      if (singleInputRef.current) singleInputRef.current.value = '';
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    setCropImage({ file, tempUrl });
    setShowCropModal(true);

    if (singleInputRef.current) singleInputRef.current.value = '';
  }, []);

  // Handle batch upload without cropping
  const handleBatchUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setErrors([]);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check remaining slots
    const currentCount = currentImages.length;
    const remainingSlots = maxImages - currentCount;

    if (files.length > remainingSlots) {
      newErrors.push(`只能再上傳 ${remainingSlots} 張圖片（您選擇了 ${files.length} 張）`);
      if (batchInputRef.current) batchInputRef.current.value = '';
      setErrors(newErrors);
      return;
    }

    // Validate all files
    files.forEach(file => {
      const validation = validateImage(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      if (batchInputRef.current) batchInputRef.current.value = '';
      return;
    }

    // Add to pending changes
    const newChanges: ImageChange[] = [];
    const newPendingFiles = new Map(pendingFiles);
    const newCurrentImages = [...currentImages];

    validFiles.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      newChanges.push({
        type: 'add',
        newFile: file,
        newPreview: previewUrl
      });
      newPendingFiles.set(previewUrl, file);
      newCurrentImages.push(previewUrl);
    });

    setPendingChanges([...pendingChanges, ...newChanges]);
    setPendingFiles(newPendingFiles);
    setCurrentImages(newCurrentImages);
    setUploadMode(null);

    if (batchInputRef.current) batchInputRef.current.value = '';
  }, [currentImages, pendingChanges, pendingFiles, maxImages]);

  // Handle crop completion
  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    if (!cropImage) return;

    const file = new File([croppedBlob], 'gallery.jpg', { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(croppedBlob);

    if (cropImage.index !== undefined) {
      // Replacing existing image
      const newChanges = [...pendingChanges];

      // Remove any previous change for this index
      const existingChangeIndex = newChanges.findIndex(
        c => c.type === 'replace' && c.index === cropImage.index
      );
      if (existingChangeIndex >= 0) {
        newChanges.splice(existingChangeIndex, 1);
      }

      newChanges.push({
        type: 'replace',
        index: cropImage.index,
        oldUrl: initialImages[cropImage.index], // Use initial URL for deletion
        newFile: file,
        newPreview: previewUrl
      });

      const newImages = [...currentImages];
      newImages[cropImage.index] = previewUrl;

      const newPendingFiles = new Map(pendingFiles);
      newPendingFiles.set(previewUrl, file);

      setPendingChanges(newChanges);
      setPendingFiles(newPendingFiles);
      setCurrentImages(newImages);
    } else {
      // Adding new image
      const newChanges = [...pendingChanges, {
        type: 'add' as const,
        newFile: file,
        newPreview: previewUrl
      }];

      const newPendingFiles = new Map(pendingFiles);
      newPendingFiles.set(previewUrl, file);

      setPendingChanges(newChanges);
      setPendingFiles(newPendingFiles);
      setCurrentImages([...currentImages, previewUrl]);
    }

    // Cleanup
    URL.revokeObjectURL(cropImage.tempUrl);
    setCropImage(null);
    setShowCropModal(false);
    setReplacingIndex(null);
    setUploadMode(null);
  }, [cropImage, currentImages, pendingChanges, pendingFiles, initialImages]);

  // Handle replace
  const handleReplace = useCallback((index: number) => {
    setReplacingIndex(index);
    replaceInputRef.current?.click();
  }, []);

  const handleReplaceFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    const validation = validateImage(file);
    if (!validation.isValid) {
      setErrors([validation.error!]);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    setCropImage({ file, tempUrl, index: replacingIndex });
    setShowCropModal(true);

    if (replaceInputRef.current) replaceInputRef.current.value = '';
  }, [replacingIndex]);

  // Handle remove
  const handleRemove = useCallback((index: number) => {
    const imageUrl = currentImages[index];
    const isInitialImage = initialImages.includes(imageUrl);

    if (isInitialImage) {
      // Mark for deletion
      setPendingChanges([...pendingChanges, {
        type: 'remove',
        index,
        oldUrl: imageUrl
      }]);
    } else {
      // Just remove from pending additions
      const newChanges = pendingChanges.filter(
        c => !(c.type === 'add' && c.newPreview === imageUrl)
      );
      setPendingChanges(newChanges);

      // Clean up preview
      if (pendingFiles.has(imageUrl)) {
        URL.revokeObjectURL(imageUrl);
        const newPendingFiles = new Map(pendingFiles);
        newPendingFiles.delete(imageUrl);
        setPendingFiles(newPendingFiles);
      }
    }

    const newImages = currentImages.filter((_, i) => i !== index);
    setCurrentImages(newImages);
  }, [currentImages, initialImages, pendingChanges, pendingFiles]);

  // Reset all changes
  const handleReset = useCallback(() => {
    // Clean up preview URLs
    pendingFiles.forEach((_, previewUrl) => {
      if (!initialImages.includes(previewUrl)) {
        URL.revokeObjectURL(previewUrl);
      }
    });

    setCurrentImages(initialImages);
    setPendingChanges([]);
    setPendingFiles(new Map());
    setErrors([]);
  }, [initialImages, pendingFiles]);

  // Save changes (called by parent form)
  const saveChanges = useCallback(async () => {
    const changes = {
      toAdd: pendingChanges.filter(c => c.type === 'add').map(c => ({
        file: pendingFiles.get(c.newPreview!)!
      })),
      toRemove: pendingChanges.filter(c => c.type === 'remove').map(c => c.oldUrl),
      toReplace: pendingChanges.filter(c => c.type === 'replace').map(c => ({
        index: c.index,
        oldUrl: c.oldUrl,
        file: pendingFiles.get(c.newPreview!)!
      }))
    };

    // This will be handled by the parent form
    return changes;
  }, [pendingChanges, pendingFiles]);

  // Return save method for parent to use
  React.useEffect(() => {
    // Store save method on window temporarily for parent access
    (globalThis as any).__galleryUploadSave = saveChanges;
    return () => {
      delete (globalThis as any).__galleryUploadSave;
    };
  }, [saveChanges]);

  const canAddMore = currentImages.length < maxImages;
  const addedCount = pendingChanges.filter(c => c.type === 'add').length;
  const removedCount = pendingChanges.filter(c => c.type === 'remove').length;
  const replacedCount = pendingChanges.filter(c => c.type === 'replace').length;

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-stone-600">
            {currentImages.length} / {maxImages} 張圖片
          </p>
          {hasChanges && (
            <div className="flex items-center gap-2 text-xs">
              {addedCount > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  +{addedCount} 新增
                </span>
              )}
              {removedCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  -{removedCount} 刪除
                </span>
              )}
              {replacedCount > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {replacedCount} 替換
                </span>
              )}
            </div>
          )}
        </div>
        {hasChanges && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置變更
          </button>
        )}
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">錯誤</p>
                <ul className="mt-1 text-sm text-red-700 space-y-1">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
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
        {currentImages.map((imageUrl, index) => {
          const isNew = !initialImages.includes(imageUrl);
          const isMarkedForRemoval = pendingChanges.some(
            c => c.type === 'remove' && c.index === index
          );
          const isReplaced = pendingChanges.some(
            c => c.type === 'replace' && c.index === index
          );

          return (
            <motion.div
              key={`${index}-${imageUrl}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden group ${
                isMarkedForRemoval ? 'opacity-50' : ''
              }`}
            >
              <Image
                src={imageUrl}
                alt={`圖片 ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* Status badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {isNew && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                    新增
                  </span>
                )}
                {isReplaced && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                    替換
                  </span>
                )}
                {isMarkedForRemoval && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                    將刪除
                  </span>
                )}
              </div>

              {/* Actions */}
              {!isMarkedForRemoval && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleReplace(index)}
                    className="p-1.5 bg-white rounded-lg hover:bg-blue-50"
                    title="替換圖片"
                  >
                    <Replace className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1.5 bg-white rounded-lg hover:bg-red-50"
                    title="刪除圖片"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Add Button */}
        {canAddMore && !uploadMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/3]"
          >
            <div className="w-full h-full border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-3">
              <Upload className="w-8 h-8 text-stone-400" />
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('single')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm transition-colors"
                >
                  <Crop className="w-4 h-4" />
                  單張上傳（含裁切）
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('batch')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm transition-colors"
                >
                  <Images className="w-4 h-4" />
                  批量上傳
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Mode Active */}
        {uploadMode === 'single' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/3]"
          >
            <button
              type="button"
              onClick={() => singleInputRef.current?.click()}
              className="w-full h-full border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
            >
              <ImagePlus className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">選擇圖片裁切</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadMode(null);
                }}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                取消
              </button>
            </button>
          </motion.div>
        )}

        {uploadMode === 'batch' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/3]"
          >
            <button
              type="button"
              onClick={() => batchInputRef.current?.click()}
              className="w-full h-full border-2 border-dashed border-green-400 bg-green-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-green-100 transition-colors"
            >
              <Images className="w-8 h-8 text-green-500" />
              <span className="text-sm text-green-700 font-medium">
                選擇多張（最多 {maxImages - currentImages.length} 張）
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadMode(null);
                }}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                取消
              </button>
            </button>
          </motion.div>
        )}
      </div>

      {/* Hidden Inputs */}
      <input
        ref={singleInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleSingleUpload}
        className="hidden"
      />
      <input
        ref={batchInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleBatchUpload}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Help Text */}
      <div className="text-xs text-stone-500 space-y-1">
        <p>• 單張上傳：可裁切調整圖片，確保最佳顯示效果</p>
        <p>• 批量上傳：快速上傳多張，系統自動調整尺寸</p>
        <p>• 所有變更需點擊「儲存設定」才會生效</p>
      </div>

      {/* Crop Modal */}
      {cropImage && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => {
            URL.revokeObjectURL(cropImage.tempUrl);
            setCropImage(null);
            setShowCropModal(false);
            setReplacingIndex(null);
          }}
          imageUrl={cropImage.tempUrl}
          aspectRatio={ASPECT_RATIOS.LANDSCAPE}
          onCropComplete={handleCropComplete}
          title={cropImage.index === undefined ? "裁切圖片" : "替換圖片"}
          minWidth={800}
          minHeight={600}
        />
      )}
    </div>
  );
}

// Export ref type for parent component
export interface GalleryUploadManagerRef {
  saveChanges: () => Promise<any>;
  hasChanges: boolean;
}