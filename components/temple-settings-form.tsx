'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TimeRangePicker } from './time-range-picker';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { FacebookIcon, InstagramIcon, LineIcon } from './social-icons';
import { rootDomain, protocol } from '@/lib/utils';

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
  temple: Temple;
  onSave?: (data: Partial<Temple>) => Promise<void>;
}

export function TempleSettingsForm({ temple, onSave }: TempleSettingsFormProps) {
  const [formData, setFormData] = useState<Partial<Temple>>(temple);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(temple.logo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof Temple, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value || null }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo_url: null, favicon_url: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    setIsSaving(true);
    try {
      let updatedData = { ...formData };

      // Upload logo if a new file was selected
      if (logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', logoFile);
        uploadFormData.append('templeId', temple.id);

        const uploadRes = await fetch('/api/upload/logo', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadRes.json();

        if (uploadResult.success) {
          updatedData.logo_url = uploadResult.logoUrl;
        } else {
          alert(uploadResult.error || '圖片上傳失敗');
          setIsSaving(false);
          return;
        }
      }

      await onSave(updatedData);
      setLogoFile(null); // Clear file after successful save
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    寺廟名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    網址名稱 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                      className="flex-1 px-4 py-3 rounded-l-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                      pattern="[a-z0-9-]+"
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
                  {!logoPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-stone-400 transition-colors"
                    >
                      <Upload className="mx-auto h-10 w-10 text-stone-400" />
                      <p className="mt-2 text-sm text-stone-600">點擊上傳寺廟標誌</p>
                      <p className="text-xs text-stone-500 mt-1">JPG, PNG 或 WebP (最大 5MB)</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative w-32 h-32">
                        <Image
                          src={logoPreview}
                          alt="寺廟標誌預覽"
                          fill
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

              {/* Intro */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  寺廟簡介
                </label>
                <textarea
                  value={formData.intro || ''}
                  onChange={(e) => handleInputChange('intro', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                  placeholder="簡短介紹您的寺廟..."
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  詳細介紹
                </label>
                <textarea
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
              <p className="text-sm text-stone-500 mt-1">設定寺廟的封面圖片</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  封面圖片網址
                </label>
                <input
                  type="url"
                  value={formData.cover_image_url || ''}
                  onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.cover_image_url && (
                  <div className="mt-4">
                    <img
                      src={formData.cover_image_url}
                      alt="封面預覽"
                      className="w-full h-48 object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
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
    </div>
  );
}