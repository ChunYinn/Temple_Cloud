'use client';

import { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { createTempleAction } from '@/app/actions';
import { rootDomain } from '@/lib/utils';
import { TimeRangePicker } from './time-range-picker';
import { Loader2, AlertCircle, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

export function CreateTempleModal({ onClose }: { onClose: () => void }) {
  // We'll handle the form submission manually now to upload the logo first
  const [createState, setCreateState] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hours, setHours] = useState('06:00 - 21:00');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form values for validation
  const [formValues, setFormValues] = useState({
    name: '',
    slug: '',
    intro: '',
    full_description: '',
    address: '',
    phone: '',
    email: '',
    hours: '每日 06:00 - 21:00',
    cover_image_url: '',
    facebook_url: '',
    line_id: '',
    instagram_url: '',
  });

  // Check if required fields are filled for each step
  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (step === 1) {
      if (!formValues.name.trim()) errors.push('請輸入寺廟名稱');
      if (!formValues.slug.trim()) errors.push('請輸入網址名稱');
      if (formValues.slug && !/^[a-z0-9-]+$/.test(formValues.slug)) {
        errors.push('網址名稱只能包含小寫英文、數字和連字符');
      }
      if (!formValues.intro.trim()) errors.push('請輸入寺廟簡介');
    } else if (step === 2) {
      if (!formValues.address.trim()) errors.push('請輸入地址');
      if (!formValues.phone.trim()) errors.push('請輸入電話');
      if (!formValues.email.trim()) errors.push('請輸入電子信箱');
      if (!formValues.hours.trim()) errors.push('請設定開放時間');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleNextStep = () => {
    const validation = validateStep(currentStep);
    if (validation.isValid) {
      setValidationErrors([]);
      setCurrentStep(2);
    } else {
      setValidationErrors(validation.errors);
    }
  };

  const handleInputChange = (field: keyof typeof formValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  useEffect(() => {
    setFormValues(prev => ({ ...prev, hours }));
  }, [hours]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setValidationErrors(['請選擇有效的圖片格式 (JPG, PNG, WebP)']);
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(['圖片大小不可超過 5MB']);
        return;
      }

      setLogoFile(file);
      setValidationErrors([]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateStep(2);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsCreating(true);
    setCreateState({});

    try {
      const formData = new FormData(e.currentTarget);

      // Upload logo first if selected
      let logoUrl = '';
      let faviconUrl = '';

      if (logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', logoFile);
        uploadFormData.append('templeId', 'temp-' + Date.now()); // Temporary ID for upload

        const uploadRes = await fetch('/api/upload/logo', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadResult.success) {
          setCreateState({ error: uploadResult.error || '圖片上傳失敗' });
          setIsCreating(false);
          return;
        }

        logoUrl = uploadResult.logoUrl || '';
      }

      // Add the URL to form data
      if (logoUrl) formData.append('logo_url', logoUrl);

      // Call the server action
      const result = await createTempleAction(null, formData);

      if (result.error) {
        setCreateState({ error: result.error });
      } else {
        // Success - the action should handle redirect
        onClose();
      }
    } catch (error) {
      setCreateState({ error: '建立寺廟時發生錯誤' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg mx-auto p-0 max-h-[90vh] overflow-hidden">
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-white z-10 border-b border-stone-200 px-4 sm:px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">建立新寺廟</DialogTitle>
            <DialogDescription className="text-sm">
              為您的寺廟建立專屬數位門戶
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator - Mobile Optimized */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            <button
              type="button"
              onClick={() => currentStep >= 1 && setCurrentStep(1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                currentStep >= 1
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              1
            </button>
            <div className={`h-0.5 flex-1 max-w-[60px] transition-all ${
              currentStep >= 2 ? 'bg-red-600' : 'bg-stone-200'
            }`} />
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) {
                  handleNextStep();
                } else {
                  setCurrentStep(2);
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                currentStep >= 2
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              2
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
          <form onSubmit={handleSubmit} id="temple-form" className="space-y-4">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Temple Name */}
                <div>
                  <Label htmlFor="temple-name" className="text-sm font-medium">
                    寺廟名稱 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="temple-name"
                    name="name"
                    type="text"
                    placeholder="例：天壇宮"
                    className="mt-1.5 w-full"
                    value={formValues.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <Label htmlFor="subdomain" className="text-sm font-medium">
                    網址名稱 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="subdomain"
                      name="slug"
                      type="text"
                      placeholder="tiantan"
                      className="rounded-r-none"
                      pattern="[a-z0-9-]+"
                      value={formValues.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                      required
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-stone-300 bg-stone-100 text-stone-600 text-sm whitespace-nowrap">
                      .{rootDomain}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">僅可使用小寫英文字母、數字和連字符</p>
                </div>

                {/* Temple Logo Upload */}
                <div>
                  <Label className="text-sm font-medium">寺廟標誌</Label>
                  <div className="mt-1.5">
                    {!logoPreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center cursor-pointer hover:border-stone-400 transition-colors"
                      >
                        <Upload className="mx-auto h-10 w-10 text-stone-400" />
                        <p className="mt-2 text-sm text-stone-600">點擊上傳寺廟標誌</p>
                        <p className="text-xs text-stone-500 mt-1">JPG, PNG 或 WebP (最大 5MB)</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative w-32 h-32 mx-auto">
                          <Image
                            src={logoPreview}
                            alt="寺廟標誌預覽"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={removeLogo}
                          size="sm"
                          variant="outline"
                          className="absolute top-0 right-0 p-1 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs text-stone-600 text-center mt-2">
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
                    {/* Hidden input to pass the file with the form */}
                    {logoFile && (
                      <input type="hidden" name="logo_file_name" value={logoFile.name} />
                    )}
                  </div>
                </div>


                {/* Intro */}
                <div>
                  <Label htmlFor="intro" className="text-sm font-medium">
                    寺廟簡介 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="intro"
                    name="intro"
                    placeholder="簡短介紹您的寺廟，將顯示在公開頁面"
                    rows={3}
                    className="mt-1.5 w-full resize-none"
                    value={formValues.intro}
                    onChange={(e) => handleInputChange('intro', e.target.value)}
                    required
                  />
                </div>

                {/* Full Description */}
                <div>
                  <Label htmlFor="full_description" className="text-sm font-medium">
                    詳細介紹
                  </Label>
                  <Textarea
                    id="full_description"
                    name="full_description"
                    placeholder="寺廟的歷史、文化、特色等詳細說明（選填）"
                    rows={4}
                    className="mt-1.5 w-full resize-none"
                    value={formValues.full_description}
                    onChange={(e) => handleInputChange('full_description', e.target.value)}
                  />
                </div>

                {/* Cover Image URL */}
                <div>
                  <Label htmlFor="cover_image_url" className="text-sm font-medium">
                    封面圖片網址
                  </Label>
                  <Input
                    id="cover_image_url"
                    name="cover_image_url"
                    type="url"
                    placeholder="https://example.com/temple-cover.jpg"
                    className="mt-1.5 w-full"
                    value={formValues.cover_image_url}
                    onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                  />
                  <p className="text-xs text-stone-500 mt-1">可稍後在設定中上傳</p>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    <span className="mr-1">📍</span> 地址 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="台北市中正區..."
                    className="mt-1.5 w-full"
                    value={formValues.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                {/* Phone & Email - Mobile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      <span className="mr-1">📞</span> 電話 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="02-1234-5678"
                      className="mt-1.5"
                      value={formValues.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      <span className="mr-1">📧</span> 電子信箱 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="temple@example.com"
                      className="mt-1.5"
                      value={formValues.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Hours with Time Picker */}
                <div>
                  <Label className="text-sm font-medium">
                    <span className="mr-1">⏰</span> 開放時間 <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1.5">
                    <TimeRangePicker
                      value={hours}
                      onChange={setHours}
                      required={true}
                    />
                  </div>
                  <input type="hidden" name="hours" value={hours} />
                </div>

                {/* Social Media Links - Optional */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">社群連結（選填）</Label>

                  <div>
                    <Input
                      id="facebook_url"
                      name="facebook_url"
                      type="url"
                      placeholder="Facebook 粉絲專頁網址"
                      className="w-full"
                      value={formValues.facebook_url}
                      onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      id="line_id"
                      name="line_id"
                      type="text"
                      placeholder="LINE 官方帳號 ID (例：@temple)"
                      className="w-full"
                      value={formValues.line_id}
                      onChange={(e) => handleInputChange('line_id', e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      id="instagram_url"
                      name="instagram_url"
                      type="url"
                      placeholder="Instagram 網址"
                      className="w-full"
                      value={formValues.instagram_url}
                      onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">請完成以下必填項目：</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message from Server */}
            {createState.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                {createState.error}
              </div>
            )}
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 px-4 sm:px-6 py-4">
          <div className="flex gap-2">
            {/* Back Button - Only on Step 2 */}
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setValidationErrors([]);
                }}
                className="flex-1 h-11"
              >
                上一步
              </Button>
            )}

            {/* Cancel Button */}
            <Button
              type="button"
              variant="outline"
              className={`${currentStep === 1 ? 'flex-1' : 'w-24'} h-11`}
              onClick={onClose}
            >
              取消
            </Button>

            {/* Next/Submit Button */}
            {currentStep < 2 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                下一步
              </Button>
            ) : (
              <Button
                form="temple-form"
                type="submit"
                disabled={isCreating || !validateStep(2).isValid}
                className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  const validation = validateStep(2);
                  if (!validation.isValid) {
                    e.preventDefault();
                    setValidationErrors(validation.errors);
                  }
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    建立中...
                  </>
                ) : (
                  '建立寺廟'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}