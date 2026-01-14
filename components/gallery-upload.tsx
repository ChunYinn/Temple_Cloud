'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { UPLOAD_CONFIG } from '@/lib/upload-utils';
import { useImageValidation } from '@/lib/hooks/useImageValidation';
import { ERROR_MESSAGES } from '@/lib/error-messages';
import { API_ENDPOINTS } from '@/lib/constants';

interface GalleryUploadProps {
  templeId: string;
  initialPhotos?: string[];
  onUpdate?: (photos: string[]) => void;
}

export function GalleryUpload({ templeId, initialPhotos = [], onUpdate }: GalleryUploadProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateFile } = useImageValidation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    // Check photo limit
    if (photos.length >= UPLOAD_CONFIG.GALLERY.MAX_COUNT) {
      setError(`相簿已達上限 (最多 ${UPLOAD_CONFIG.GALLERY.MAX_COUNT} 張照片)`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('templeId', templeId);

      const response = await fetch(API_ENDPOINTS.UPLOAD.GALLERY, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newPhotos = [...photos, result.photoUrl];
        setPhotos(newPhotos);
        onUpdate?.(newPhotos);
      } else {
        setError(result.error || ERROR_MESSAGES.UPLOAD.UPLOAD_FAILED);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.SERVER.GENERIC);
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/upload/gallery?templeId=${templeId}&photoUrl=${encodeURIComponent(photoUrl)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        const newPhotos = photos.filter(p => p !== photoUrl);
        setPhotos(newPhotos);
        onUpdate?.(newPhotos);
      } else {
        setError('刪除失敗');
      }
    } catch (err) {
      setError('刪除時發生錯誤');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-stone-700">
          相簿照片 ({photos.length}/{UPLOAD_CONFIG.GALLERY.MAX_COUNT})
        </label>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing Photos */}
        {photos.map((photoUrl, index) => (
          <div key={index} className="relative group aspect-[4/3]">
            <Image
              src={photoUrl}
              alt={`相簿照片 ${index + 1}`}
              fill
              className="object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => handleRemovePhoto(photoUrl)}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {photos.length < UPLOAD_CONFIG.GALLERY.MAX_COUNT && (
          <label className="relative aspect-[4/3] border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-stone-400 transition-colors flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-sm text-stone-600">上傳照片</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-stone-500">
        支援 JPG、PNG、WebP 格式，單張照片最大 5MB，相簿最多 {UPLOAD_CONFIG.GALLERY.MAX_COUNT} 張照片
      </p>
    </div>
  );
}