'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '@/lib/toast-context';
import {
  useTempleEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventImage
} from '@/lib/hooks';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Image,
  X,
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react';
import { ImageCropModalStandalone as ImageCropModal, ASPECT_RATIOS } from './image-crop-modal-standalone';

interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  max_capacity: number | null;
  registration_deadline: string;
  is_active: boolean;
}

export function EventsManagementTanStack({ templeId }: { templeId: string }) {
  // TanStack Query hooks
  const { data: events = [], isLoading, error } = useTempleEvents(templeId);
  const createMutation = useCreateEvent(templeId);
  const updateMutation = useUpdateEvent(templeId);
  const deleteMutation = useDeleteEvent(templeId);
  const uploadImageMutation = useUploadEventImage(templeId);

  const { success, error: showError } = useToast();

  // UI state
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    image_url: '',
    max_capacity: null,
    registration_deadline: '',
    is_active: true
  });

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Helper functions
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      image_url: '',
      max_capacity: null,
      registration_deadline: '',
      is_active: true
    });
    setEditingEvent(null);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Handle image file selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        showError('請選擇有效的圖片格式 (JPG, PNG, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('圖片大小不可超過 5MB');
        return;
      }

      // Create temporary URL for cropping
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
      setShowImageCrop(true);
    }
  }, [showError]);

  // Handle image crop completion
  const handleImageCropComplete = useCallback((croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'event-image.jpg', { type: 'image/jpeg' });
    setImageFile(file);

    const url = URL.createObjectURL(croppedBlob);
    setImagePreview(url);

    setFormData(prev => ({ ...prev, image_url: '' }));

    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    setShowImageCrop(false);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [tempImageUrl]);

  // Handle crop modal close
  const handleImageCropClose = useCallback(() => {
    setShowImageCrop(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [tempImageUrl]);

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    setUploadProgress(0);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Handle form submission with TanStack Query
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalImageUrl = formData.image_url;

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadResult = await uploadImageMutation.mutateAsync({
          file: imageFile,
          oldImageUrl: editingEvent?.image_url,
          onProgress: setUploadProgress
        });

        if (uploadResult.success) {
          finalImageUrl = uploadResult.imageUrl;
        } else {
          return; // Error is handled by mutation hook
        }
      }

      const eventData = {
        ...formData,
        image_url: finalImageUrl,
        max_capacity: formData.max_capacity ? Number(formData.max_capacity) : null,
      };

      if (editingEvent) {
        // Update existing event
        await updateMutation.mutateAsync({
          eventId: editingEvent.id,
          data: eventData
        });
      } else {
        // Create new event
        await createMutation.mutateAsync(eventData);
      }

      // Reset form and close modal
      resetForm();
      setShowNewEventForm(false);
    } catch (error) {
      // Error is handled by mutation hooks
      console.error('Form submission error:', error);
    }
  };

  // Handle delete with TanStack Query
  const handleDelete = async (eventId: string) => {
    if (confirm('確定要刪除此活動嗎？此操作無法復原。')) {
      await deleteMutation.mutateAsync(eventId);
    }
  };

  // Handle edit
  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: formatDateForInput(event.event_date),
      event_time: event.event_time,
      location: event.location,
      image_url: event.image_url || '',
      max_capacity: event.max_capacity,
      registration_deadline: event.registration_deadline ? formatDateForInput(event.registration_deadline) : '',
      is_active: event.is_active
    });
    setShowNewEventForm(true);
  };

  // Check if any mutation is in progress
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    uploadImageMutation.isPending;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-stone-600">載入活動中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-stone-800 font-medium">載入失敗</p>
          <p className="text-sm text-stone-600 mt-1">請重新整理頁面或稍後再試</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">活動管理</h2>
          <p className="text-stone-600 mt-1">管理寺廟的活動和法會</p>
        </div>
        <button
          onClick={() => setShowNewEventForm(true)}
          disabled={isMutating}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          新增活動
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {event.image_url && (
              <div className="h-48 bg-stone-100">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-stone-800">{event.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  event.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {event.is_active ? '開放報名' : '已關閉'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-stone-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.event_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                {event.max_capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.current_registrations} / {event.max_capacity} 人
                    </span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-sm text-stone-600 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => handleEdit(event)}
                  disabled={isMutating}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                  編輯
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={isMutating}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  刪除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="text-center py-12 bg-stone-50 rounded-lg">
          <CalendarDays className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600 font-medium">尚無活動</p>
          <p className="text-sm text-stone-500 mt-1">點擊「新增活動」來創建第一個活動</p>
        </div>
      )}

      {/* Event Form Modal */}
      {showNewEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {editingEvent ? '編輯活動' : '新增活動'}
              </h3>
              <button
                onClick={() => {
                  setShowNewEventForm(false);
                  resetForm();
                }}
                disabled={isMutating}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Form fields */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  活動名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    活動日期 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    活動時間 *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  地點 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  活動說明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    人數上限
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_capacity || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      max_capacity: e.target.value ? parseInt(e.target.value) : null
                    })}
                    placeholder="不限制"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    報名截止日期
                  </label>
                  <input
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  活動圖片
                </label>

                {(imagePreview || formData.image_url) ? (
                  <div className="relative">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-md hover:bg-stone-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-stone-400 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                    <p className="text-sm text-stone-600">點擊上傳圖片</p>
                    <p className="text-xs text-stone-500 mt-1">支援 JPG, PNG, WebP (最大 5MB)</p>
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-600 mt-1">上傳中... {uploadProgress}%</p>
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-stone-700">
                  開放報名
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewEventForm(false);
                    resetForm();
                  }}
                  disabled={isMutating}
                  className="flex-1 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingEvent ? '更新活動' : '創建活動'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showImageCrop && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          aspectRatio={ASPECT_RATIOS.BANNER}
          onCropComplete={handleImageCropComplete}
          onClose={handleImageCropClose}
        />
      )}
    </div>
  );
}