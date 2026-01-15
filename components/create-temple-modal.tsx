'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createTempleAction } from '@/app/actions';
import { rootDomain } from '@/lib/utils';
import { TimeRangePicker } from './time-range-picker';
import { Loader2, AlertCircle, Upload, X, Crop } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { ImageCropModalStandalone, ASPECT_RATIOS } from './image-crop-modal-standalone';

export function CreateTempleModal({ onClose }: { onClose: () => void }) {
  // We'll handle the form submission manually now to upload the logo first
  const [createState, setCreateState] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hours, setHours] = useState('06:00 - 21:00');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Cropping modal states
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
  const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null);

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
    facebook_url: '',
    line_id: '',
    instagram_url: '',
  });

  // Validation functions for each step
  const validateStep1 = (): string[] => {
    const errors: string[] = [];
    if (!formValues.name.trim()) errors.push('請輸入寺廟名稱');
    if (!formValues.slug.trim()) errors.push('請輸入網址名稱');
    if (formValues.slug && !/^[a-z0-9-]+$/.test(formValues.slug)) {
      errors.push('網址名稱只能包含小寫英文、數字和連字符');
    }
    if (!logoFile) errors.push('請上傳寺廟標誌');
    if (!formValues.intro.trim()) errors.push('請輸入寺廟簡介');
    return errors;
  };

  const validateStep2 = (): string[] => {
    const errors: string[] = [];
    if (!formValues.address.trim()) errors.push('請輸入地址');
    if (!formValues.phone.trim()) errors.push('請輸入電話');
    if (!formValues.email.trim()) errors.push('請輸入電子信箱');
    if (!formValues.hours.trim()) errors.push('請設定開放時間');
    return errors;
  };

  // Check if required fields are filled for each step
  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const errors = step === 1 ? validateStep1() : step === 2 ? validateStep2() : [];
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create temporary URL for cropping
      const url = URL.createObjectURL(file);
      setTempLogoUrl(url);
      setShowLogoCrop(true);
      setValidationErrors([]);
    }
  }, []);

  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create temporary URL for cropping
      const url = URL.createObjectURL(file);
      setTempCoverUrl(url);
      setShowCoverCrop(true);
      setValidationErrors([]);
    }
  }, []);

  // Handle logo crop completion
  const handleLogoCropComplete = useCallback((croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
    setLogoFile(file);
    const url = URL.createObjectURL(croppedBlob);
    setLogoPreview(url);

    if (tempLogoUrl) {
      URL.revokeObjectURL(tempLogoUrl);
      setTempLogoUrl(null);
    }
    setShowLogoCrop(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [tempLogoUrl]);

  // Handle cover crop completion
  const handleCoverCropComplete = useCallback((croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'cover.jpg', { type: 'image/jpeg' });
    setCoverFile(file);
    const url = URL.createObjectURL(croppedBlob);
    setCoverPreview(url);

    if (tempCoverUrl) {
      URL.revokeObjectURL(tempCoverUrl);
      setTempCoverUrl(null);
    }
    setShowCoverCrop(false);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }, [tempCoverUrl]);

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

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
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

      // Upload logo first (required)
      let logoUrl = '';
      let faviconUrl = '';
      const tempId = 'temp-' + Date.now();

      if (logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', logoFile);
        uploadFormData.append('templeId', tempId);

        const uploadRes = await fetch('/api/upload/logo', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadResult.success) {
          setCreateState({ error: uploadResult.error || '標誌上傳失敗' });
          setIsCreating(false);
          return;
        }

        logoUrl = uploadResult.logoUrl || '';
        // Also get favicon URL from the same upload
        faviconUrl = uploadResult.faviconUrl || '';
      }

      // Upload cover image if selected
      let coverUrl = '';
      if (coverFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', coverFile);
        uploadFormData.append('templeId', tempId);

        const uploadRes = await fetch('/api/upload/cover', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadResult.success) {
          setCreateState({ error: uploadResult.error || '封面圖片上傳失敗' });
          setIsCreating(false);
          return;
        }

        coverUrl = uploadResult.coverUrl || '';
      }

      // Add the URLs to form data
      if (logoUrl) formData.append('logo_url', logoUrl);
      if (faviconUrl) formData.append('favicon_url', faviconUrl);
      if (coverUrl) formData.append('cover_image_url', coverUrl);

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
    <>
      <Dialog open onOpenChange={() => {}}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200",
              "w-full max-w-lg mx-auto p-0 h-[100vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden"
            )}
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
        >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white z-10 border-b border-stone-200 px-4 sm:px-6 pt-6 pb-4">
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
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 min-h-0 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
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
                      pattern="[a-z0-9\-]+"
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

                {/* Temple Logo Upload - Required */}
                <div>
                  <Label className="text-sm font-medium">
                    寺廟標誌 (也會成為網站圖標) <span className="text-red-500">*</span>
                  </Label>
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
                          {logoFile && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                              <Crop className="w-3 h-3" />
                              已裁切
                            </div>
                          )}
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

                {/* Cover Image Upload - Optional */}
                <div>
                  <Label className="text-sm font-medium">封面圖片</Label>
                  <div className="mt-1.5">
                    {!coverPreview ? (
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center cursor-pointer hover:border-stone-400 transition-colors"
                      >
                        <Upload className="mx-auto h-8 w-8 text-stone-400" />
                        <p className="mt-1 text-sm text-stone-600">點擊上傳封面圖片</p>
                        <p className="text-xs text-stone-500 mt-1">建議尺寸 1920x1080 (16:9)</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative w-full h-32">
                          <Image
                            src={coverPreview}
                            alt="封面圖片預覽"
                            fill
                            className="object-cover rounded-lg"
                          />
                          {coverFile && (
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                              <Crop className="w-3 h-3" />
                              已裁切
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={removeCover}
                          size="sm"
                          variant="outline"
                          className="absolute top-1 right-1 p-1 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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

                {/* Social Media Links - Recommended */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">社群連結（建議填寫）</Label>
                    <p className="text-xs text-stone-500 mt-1">增加社群連結可讓信眾更方便聯繫您的寺廟</p>
                  </div>

                  <div>
                    <Input
                      id="facebook_url"
                      name="facebook_url"
                      type="url"
                      placeholder="Facebook 粉絲專頁網址（例：https://facebook.com/yourpage）"
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
                      placeholder="LINE 官方帳號 ID（例：@temple）"
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
                      placeholder="Instagram 網址（例：https://instagram.com/yourpage）"
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
        <div className="flex-shrink-0 bg-white border-t border-stone-200 px-4 sm:px-6 py-4">
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
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>

    {/* Crop Modals - Using standalone version to avoid Dialog conflicts */}
    {tempLogoUrl && (
      <ImageCropModalStandalone
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
      <ImageCropModalStandalone
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
  </>
  );
}