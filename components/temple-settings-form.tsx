'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TimeRangePicker } from './time-range-picker';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { FacebookIcon, InstagramIcon, LineIcon } from './social-icons';
import { rootDomain, protocol } from '@/lib/utils';
import { GalleryUploadManager } from './gallery-upload-manager';
import { ImageCropModalStandalone as ImageCropModal, ASPECT_RATIOS } from './image-crop-modal-standalone';

interface Temple {
  id: string;
  name: string;
  slug: string;
  intro?: string | null;
  full_description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  hours?: string | null;
  cover_image_url?: string | null;
  avatar_emoji?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  gallery_photos?: string[] | null;
  facebook_url?: string | null;
  line_id?: string | null;
  instagram_url?: string | null;
}

interface TempleSettingsFormProps {
  readonly temple: Temple;
  readonly onSave?: (data: Partial<Temple>) => Promise<void>;
}

export function TempleSettingsForm({ temple, onSave }: TempleSettingsFormProps) {
  // Only extract the fields that can be edited
  const [formData, setFormData] = useState<Partial<Temple>>({
    name: temple.name,
    slug: temple.slug,
    intro: temple.intro,
    full_description: temple.full_description,
    address: temple.address,
    phone: temple.phone,
    email: temple.email,
    hours: temple.hours,
    cover_image_url: temple.cover_image_url,
    avatar_emoji: temple.avatar_emoji,
    logo_url: temple.logo_url,
    favicon_url: temple.favicon_url,
    gallery_photos: temple.gallery_photos,
    facebook_url: temple.facebook_url,
    line_id: temple.line_id,
    instagram_url: temple.instagram_url,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(temple.logo_url || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(temple.cover_image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [galleryHasChanges, setGalleryHasChanges] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(temple.gallery_photos || []);

  // Cropping modal states
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
  const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null);

  const handleInputChange = (field: keyof Temple, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value || null }));
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('請選擇有效的圖片格式 (JPG, PNG, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不可超過 5MB');
        return;
      }

      // Create temporary URL for cropping
      const url = URL.createObjectURL(file);
      setTempLogoUrl(url);
      setShowLogoCrop(true);
    }
  }, []);

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo_url: null, favicon_url: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('請選擇有效的圖片格式 (JPG, PNG, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不可超過 5MB');
        return;
      }

      // Create temporary URL for cropping
      const url = URL.createObjectURL(file);
      setTempCoverUrl(url);
      setShowCoverCrop(true);
    }
  }, []);

  // Handle logo crop completion
  const handleLogoCropComplete = useCallback((croppedBlob: Blob) => {
    // Convert blob to File
    const file = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
    setLogoFile(file);

    // Create preview
    const url = URL.createObjectURL(croppedBlob);
    setLogoPreview(url);

    // Cleanup temp URL
    if (tempLogoUrl) {
      URL.revokeObjectURL(tempLogoUrl);
      setTempLogoUrl(null);
    }
    setShowLogoCrop(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [tempLogoUrl]);

  // Handle cover crop completion
  const handleCoverCropComplete = useCallback((croppedBlob: Blob) => {
    // Convert blob to File
    const file = new File([croppedBlob], 'cover.jpg', { type: 'image/jpeg' });
    setCoverFile(file);

    // Create preview
    const url = URL.createObjectURL(croppedBlob);
    setCoverPreview(url);

    // Cleanup temp URL
    if (tempCoverUrl) {
      URL.revokeObjectURL(tempCoverUrl);
      setTempCoverUrl(null);
    }
    setShowCoverCrop(false);

    // Reset file input
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }, [tempCoverUrl]);

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setFormData(prev => ({ ...prev, cover_image_url: null }));
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  // Handle crop modal close
  const handleLogoCropClose = useCallback(() => {
    setShowLogoCrop(false);
    if (tempLogoUrl) {
      URL.revokeObjectURL(tempLogoUrl);
      setTempLogoUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [tempLogoUrl]);

  const handleCoverCropClose = useCallback(() => {
    setShowCoverCrop(false);
    if (tempCoverUrl) {
      URL.revokeObjectURL(tempCoverUrl);
      setTempCoverUrl(null);
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }, [tempCoverUrl]);

  // Helper function to upload logo
  const uploadLogo = async (file: File, templeId: string, oldLogoUrl?: string, oldFaviconUrl?: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('templeId', templeId);

    if (oldLogoUrl) uploadFormData.append('oldLogoUrl', oldLogoUrl);
    if (oldFaviconUrl) uploadFormData.append('oldFaviconUrl', oldFaviconUrl);

    const uploadRes = await fetch('/api/upload/logo', {
      method: 'POST',
      body: uploadFormData,
    });

    return uploadRes.json();
  };

  // Helper function to upload cover
  const uploadCover = async (file: File, templeId: string, oldCoverUrl?: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('templeId', templeId);

    if (oldCoverUrl) uploadFormData.append('oldCoverUrl', oldCoverUrl);

    const uploadRes = await fetch('/api/upload/cover', {
      method: 'POST',
      body: uploadFormData,
    });

    return uploadRes.json();
  };

  // Helper function to upload gallery image
  const uploadGalleryImage = async (file: File, templeId: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('templeId', templeId);

    const uploadRes = await fetch('/api/upload/gallery', {
      method: 'POST',
      body: uploadFormData,
    });

    return uploadRes.json();
  };

  // Helper function to delete gallery image
  const deleteGalleryImage = async (url: string, templeId: string) => {
    try {
      await fetch(
        `/api/upload/gallery?templeId=${templeId}&photoUrl=${encodeURIComponent(url)}`,
        { method: 'DELETE' }
      );
    } catch (err) {
      console.error('Failed to delete old image:', err);
    }
  };

  // Helper function to process gallery additions
  const processGalleryAdditions = async (additions: any[], templeId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const addition of additions) {
      const result = await uploadGalleryImage(addition.file, templeId);
      if (result.success) {
        urls.push(result.photoUrl);
      }
    }
    return urls;
  };

  // Helper function to process gallery replacements
  const processGalleryReplacements = async (
    replacements: any[],
    templeId: string,
    currentUrls: string[]
  ): Promise<string[]> => {
    const updatedUrls = [...currentUrls];

    for (const replacement of replacements) {
      const result = await uploadGalleryImage(replacement.file, templeId);
      if (result.success) {
        const index = updatedUrls.findIndex(url => url === replacement.oldUrl);
        if (index !== -1) {
          updatedUrls[index] = result.photoUrl;
        }
      }
    }

    return updatedUrls;
  };

  // Helper function to process gallery changes
  const processGalleryChanges = async (templeId: string): Promise<string[] | null> => {
    if (!galleryHasChanges || !(globalThis as any).__galleryUploadSave) {
      return null;
    }

    const galleryChanges = await (globalThis as any).__galleryUploadSave();

    // Start with existing non-blob URLs
    let uploadedUrls: string[] = galleryImages.filter(url => !url.startsWith('blob:'));

    // Process additions
    const newUrls = await processGalleryAdditions(galleryChanges.toAdd, templeId);
    uploadedUrls = [...uploadedUrls, ...newUrls];

    // Process replacements
    uploadedUrls = await processGalleryReplacements(
      galleryChanges.toReplace,
      templeId,
      uploadedUrls
    );

    // Remove deleted images from array
    const finalUrls = uploadedUrls.filter(url => !galleryChanges.toRemove.includes(url));

    return finalUrls;
  };

  // Helper function to cleanup deleted gallery images
  const cleanupGalleryImages = async (templeId: string): Promise<void> => {
    if (!galleryHasChanges || !(globalThis as any).__galleryUploadSave) {
      return;
    }

    const galleryChanges = await (globalThis as any).__galleryUploadSave();
    const toDelete = [
      ...galleryChanges.toRemove,
      ...galleryChanges.toReplace.map((r: any) => r.oldUrl)
    ];

    for (const url of toDelete) {
      await deleteGalleryImage(url, templeId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    setIsSaving(true);
    try {
      let updatedData = { ...formData };

      // Upload logo if needed
      if (logoFile) {
        const result = await uploadLogo(logoFile, temple.id, temple.logo_url || undefined, temple.favicon_url || undefined);

        if (!result.success) {
          alert(result.error || '圖片上傳失敗');
          setIsSaving(false);
          return;
        }

        updatedData.logo_url = result.logoUrl;
        if (result.faviconUrl) {
          updatedData.favicon_url = result.faviconUrl;
        }
      }

      // Upload cover if needed
      if (coverFile) {
        const result = await uploadCover(coverFile, temple.id, temple.cover_image_url || undefined);

        if (!result.success) {
          alert(result.error || '封面圖片上傳失敗');
          setIsSaving(false);
          return;
        }

        updatedData.cover_image_url = result.coverUrl;
      }

      // Process gallery changes
      const galleryUrls = await processGalleryChanges(temple.id);
      if (galleryUrls) {
        updatedData.gallery_photos = galleryUrls as any;
      }

      await onSave(updatedData);
      setLogoFile(null);
      setCoverFile(null);

      // Cleanup deleted gallery images
      await cleanupGalleryImages(temple.id);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'basic', label: '基本資訊', icon: '📝' },
    { id: 'contact', label: '聯絡資訊', icon: '📞' },
    { id: 'media', label: '圖片媒體', icon: '🖼️' },
    { id: 'social', label: '社群連結', icon: '🔗' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        {activeSection === 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
              <h3 className="font-bold text-lg text-stone-800 flex items-center">
                <span className="mr-2 text-xl">📝</span>
                基本資訊
              </h3>
              <p className="text-sm text-stone-500 mt-1">設定寺廟的基本資料</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Temple Name & Slug */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="temple-name" className="block text-sm font-medium text-stone-700 mb-2">
                    寺廟名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="temple-name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="temple-slug" className="block text-sm font-medium text-stone-700 mb-2">
                    網址名稱 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <input
                      id="temple-slug"
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                      className="flex-1 px-4 py-3 rounded-l-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                      pattern="[a-z0-9\-]+"
                      required
                    />
                    <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-stone-300 bg-stone-100 text-stone-600 text-sm whitespace-nowrap">
                      .{rootDomain}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">預覽網址：{protocol}://{formData.slug || 'your-temple'}.{rootDomain}</p>
                </div>
              </div>

              {/* Temple Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  寺廟標誌
                </label>
                <div className="mt-1.5">
                  {logoPreview ? (
                    <div className="relative">
                      <div className="relative w-32 h-32">
                        <Image
                          src={logoPreview}
                          alt="寺廟標誌預覽"
                          fill
                          sizes="128px"
                          className="object-cover rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-0 right-0 p-1 bg-white border border-stone-200 rounded-lg hover:bg-stone-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-stone-600 mt-2">
                        將自動生成網站圖標
                      </p>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-stone-400 transition-colors"
                    >
                      <Upload className="mx-auto h-10 w-10 text-stone-400" />
                      <p className="mt-2 text-sm text-stone-600">點擊上傳寺廟標誌</p>
                      <p className="text-xs text-stone-500 mt-1">JPG, PNG 或 WebP (最大 5MB)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Temple Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  封面圖片
                </label>
                <div className="mt-1.5">
                  {coverPreview ? (
                    <div className="relative">
                      <div className="relative w-full h-48">
                        <Image
                          src={coverPreview}
                          alt="封面圖片預覽"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeCover}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          coverInputRef.current?.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-stone-400 transition-colors"
                    >
                      <Upload className="mx-auto h-10 w-10 text-stone-400" />
                      <p className="mt-2 text-sm text-stone-600">點擊上傳封面圖片</p>
                      <p className="text-xs text-stone-500 mt-1">JPG, PNG 或 WebP (最大 5MB)</p>
                    </div>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Intro */}
              <div>
                <label htmlFor="temple-intro" className="block text-sm font-medium text-stone-700 mb-2">
                  寺廟簡介
                </label>
                <textarea
                  id="temple-intro"
                  value={formData.intro || ''}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                  placeholder="簡短介紹您的寺廟..."
                />
              </div>

              {/* Full Description */}
              <div>
                <label htmlFor="temple-description" className="block text-sm font-medium text-stone-700 mb-2">
                  詳細介紹
                </label>
                <textarea
                  id="temple-description"
                  value={formData.full_description || ''}
                  onChange={(e) => handleInputChange('full_description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                  placeholder="寺廟的歷史、文化、特色..."
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Contact Info Section */}
        {activeSection === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
              <h3 className="font-bold text-lg text-stone-800 flex items-center">
                <span className="mr-2 text-xl">📞</span>
                聯絡資訊
              </h3>
              <p className="text-sm text-stone-500 mt-1">設定聯絡方式與位置資訊</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  <span className="mr-1">📍</span> 地址
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  placeholder="台北市大安區..."
                />
              </div>

              {/* Phone & Email */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <span className="mr-1">📞</span> 電話
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    placeholder="02-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <span className="mr-1">📧</span> 電子信箱
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    placeholder="temple@example.com"
                  />
                </div>
              </div>

              {/* Hours */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  <span className="mr-1">⏰</span> 開放時間
                </label>
                <TimeRangePicker
                  value={formData.hours || '每日 06:00 - 21:00'}
                  onChange={(value) => handleInputChange('hours', value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Media Section */}
        {activeSection === 'media' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
              <h3 className="font-bold text-lg text-stone-800 flex items-center">
                <span className="mr-2 text-xl">🖼️</span>
                圖片媒體
              </h3>
              <p className="text-sm text-stone-500 mt-1">管理寺廟的相簿照片</p>
            </div>

            <div className="p-6">
              {/* Gallery Photos */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  寺廟相簿
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  上傳寺廟的環境、活動照片，最多 6 張
                </p>
                <GalleryUploadManager
                  templeId={temple.id}
                  initialImages={formData.gallery_photos || []}
                  onImagesChange={(images, hasChanges) => {
                    setGalleryImages(images);
                    setGalleryHasChanges(hasChanges);
                  }}
                  maxImages={6}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Social Links Section */}
        {activeSection === 'social' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
              <h3 className="font-bold text-lg text-stone-800 flex items-center">
                <span className="mr-2 text-xl">🔗</span>
                社群連結
              </h3>
              <p className="text-sm text-stone-500 mt-1">設定社群媒體連結</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Facebook */}
              <div>
                <label className="flex items-center text-sm font-medium text-stone-700 mb-2">
                  <FacebookIcon className="w-5 h-5 mr-2" />
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebook_url || ''}
                  onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  placeholder="https://facebook.com/..."
                />
              </div>

              {/* LINE */}
              <div>
                <label className="flex items-center text-sm font-medium text-stone-700 mb-2">
                  <LineIcon className="w-5 h-5 mr-2" />
                  LINE ID
                </label>
                <input
                  type="text"
                  value={formData.line_id || ''}
                  onChange={(e) => handleInputChange('line_id', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  placeholder="@temple_line"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="flex items-center text-sm font-medium text-stone-700 mb-2">
                  <InstagramIcon className="w-5 h-5 mr-2" />
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagram_url || ''}
                  onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {isSaving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                儲存中...
              </span>
            ) : '儲存設定'}
          </button>
        </div>
      </form>

      {/* Crop Modals */}
      {tempLogoUrl && (
        <ImageCropModal
          isOpen={showLogoCrop}
          onClose={handleLogoCropClose}
          imageUrl={tempLogoUrl}
          aspectRatio={ASPECT_RATIOS.LOGO}
          onCropComplete={handleLogoCropComplete}
          title="裁切寺廟標誌"
          minWidth={200}
          minHeight={200}
        />
      )}

      {tempCoverUrl && (
        <ImageCropModal
          isOpen={showCoverCrop}
          onClose={handleCoverCropClose}
          imageUrl={tempCoverUrl}
          aspectRatio={ASPECT_RATIOS.COVER}
          onCropComplete={handleCoverCropComplete}
          title="裁切封面圖片"
          minWidth={640}
          minHeight={360}
        />
      )}
    </div>
  );
}