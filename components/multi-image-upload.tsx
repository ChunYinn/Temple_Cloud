'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { UPLOAD_CONFIG, validateImage } from '@/lib/upload-validation';

interface MultiImageUploadProps {
  templeId: string;
  existingImages: string[];
  onImagesUpdate: (images: string[]) => void;
  maxImages?: number;
}

export function MultiImageUpload({
  templeId,
  existingImages,
  onImagesUpdate,
  maxImages = UPLOAD_CONFIG.GALLERY.MAX_COUNT,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrors([]);
    const newErrors: string[] = [];

    // Check total count
    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      newErrors.push(`最多還能上傳 ${remainingSlots} 張圖片`);
      return setErrors(newErrors);
    }

    // Upload files one by one
    for (const file of files) {
      // Validate file
      const validation = validateImage(file);
      if (!validation.isValid) {
        newErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Create preview
      const reader = new FileReader();
      const previewUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setUploading(previewUrl);

      try {
        // Upload to server
        const formData = new FormData();
        formData.append('file', file);
        formData.append('templeId', templeId);

        const response = await fetch('/api/upload/gallery', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          const newImages = [...images, result.photoUrl];
          setImages(newImages);
          onImagesUpdate(newImages);
        } else {
          newErrors.push(result.error || '上傳失敗');
        }
      } catch (error) {
        newErrors.push(`${file.name}: 上傳失敗`);
      } finally {
        setUploading(null);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      // Remove from UI immediately for better UX
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesUpdate(newImages);

      // Call API to remove from database
      const response = await fetch(
        `/api/upload/gallery?templeId=${templeId}&photoUrl=${encodeURIComponent(imageUrl)}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!result.success) {
        // Revert on failure
        setImages(images);
        onImagesUpdate(images);
        setErrors([result.error || '刪除失敗']);
      }
    } catch (error) {
      // Revert on error
      setImages(images);
      onImagesUpdate(images);
      setErrors(['刪除圖片時發生錯誤']);
    }
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-600">
          已上傳 {images.length} / {maxImages} 張圖片
        </p>
        {!canUploadMore && (
          <p className="text-sm text-amber-600">已達上傳上限</p>
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
            key={imageUrl}
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
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={() => handleRemoveImage(imageUrl, index)}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              title="刪除圖片"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </motion.div>
        ))}

        {/* Uploading Placeholder */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100"
          >
            <Image
              src={uploading}
              alt="上傳中"
              fill
              className="object-cover opacity-50"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Loader2 className="w-6 h-6 animate-spin text-stone-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Button */}
        {canUploadMore && !uploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/3]"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full border-2 border-dashed border-stone-300 rounded-xl hover:border-stone-400 transition-colors flex flex-col items-center justify-center gap-2 hover:bg-stone-50"
            >
              <Upload className="w-8 h-8 text-stone-400" />
              <span className="text-sm text-stone-600 font-medium">
                上傳圖片
              </span>
              <span className="text-xs text-stone-500">
                JPG, PNG, WebP
              </span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_CONFIG.ALLOWED_FORMATS.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-xs text-stone-500">
        每張圖片最大 5MB，建議尺寸 1200x800 像素以上
      </p>
    </div>
  );
}