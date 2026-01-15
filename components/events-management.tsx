'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/lib/toast-context';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Image,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  Upload,
  Crop
} from 'lucide-react';
import { ImageCropModalStandalone as ImageCropModal, ASPECT_RATIOS } from './image-crop-modal-standalone';

interface Event {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  event_date: Date | string;
  event_time: string;
  location: string;
  max_capacity?: number | null;
  current_registrations: number;
  registration_deadline?: Date | string | null;
  is_active: boolean;
}

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

export function EventsManagement({ templeId }: { templeId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

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
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [templeId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/temples/${templeId}/events`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.error || '無法載入活動');
      }
    } catch (err) {
      setError('載入活動時發生錯誤');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

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
      setTempImageUrl(url);
      setShowImageCrop(true);
    }
  }, []);

  // Handle image crop completion
  const handleImageCropComplete = useCallback((croppedBlob: Blob) => {
    // Convert blob to File
    const file = new File([croppedBlob], 'event-image.jpg', { type: 'image/jpeg' });
    setImageFile(file);

    // Create preview
    const url = URL.createObjectURL(croppedBlob);
    setImagePreview(url);

    // Clear the old image_url from formData since we have a new file
    setFormData(prev => ({ ...prev, image_url: '' }));

    // Cleanup temp URL
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    setShowImageCrop(false);

    // Reset file input
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
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let finalImageUrl = formData.image_url;

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        uploadFormData.append('templeId', templeId);
        uploadFormData.append('type', 'event');

        // If editing and there's an old image, pass it for deletion
        if (editingEvent && editingEvent.image_url) {
          uploadFormData.append('oldImageUrl', editingEvent.image_url);
        }

        const uploadRes = await fetch('/api/upload/event-image', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadRes.json();

        if (uploadResult.success) {
          finalImageUrl = uploadResult.imageUrl;
        } else {
          alert(uploadResult.error || '圖片上傳失敗');
          setSaving(false);
          return;
        }
      }

      const url = `/api/temples/${templeId}/events`;
      const method = editingEvent ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        image_url: finalImageUrl,
        max_capacity: formData.max_capacity ? Number(formData.max_capacity) : null,
        ...(editingEvent && { eventId: editingEvent.id })
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents(); // Refresh the list
        setShowNewEventForm(false);
        resetForm();
        success(editingEvent ? '活動更新成功' : '活動建立成功');
      } else {
        setError(data.error || '儲存失敗');
        showError(data.error || '儲存失敗');
      }
    } catch (err) {
      setError('儲存活動時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('確定要刪除這個活動嗎？')) return;

    try {
      const response = await fetch(`/api/temples/${templeId}/events?eventId=${eventId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents(); // Refresh the list
        success('活動已刪除');
      } else {
        showError(data.error || '刪除失敗');
      }
    } catch (err) {
      showError('刪除活動時發生錯誤');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: formatDateForInput(event.event_date),
      event_time: event.event_time,
      location: event.location,
      image_url: event.image_url || '',
      max_capacity: event.max_capacity ?? null,
      registration_deadline: event.registration_deadline ? formatDateForInput(event.registration_deadline) : '',
      is_active: event.is_active
    });
    // Set existing image as preview if exists
    if (event.image_url) {
      setImagePreview(event.image_url);
    }
    setShowNewEventForm(true);
  };

  // Calculate stats
  const activeEvents = events.filter(e => e.is_active);
  const totalRegistrations = events.reduce((sum, e) => sum + e.current_registrations, 0);
  const eventsWithRegistration = events.filter(e => e.max_capacity !== null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-stone-800">活動管理</h2>
          <p className="text-stone-500 text-sm mt-1">管理寺廟的所有法會活動</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowNewEventForm(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增活動
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">錯誤</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">總活動數</p>
              <p className="text-2xl font-bold text-stone-800">{events.length}</p>
            </div>
            <CalendarDays className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">進行中</p>
              <p className="text-2xl font-bold text-green-600">{activeEvents.length}</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">總報名人數</p>
              <p className="text-2xl font-bold text-blue-600">{totalRegistrations}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">需報名活動</p>
              <p className="text-2xl font-bold text-amber-600">{eventsWithRegistration.length}</p>
            </div>
            <ChevronDown className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-semibold text-stone-800">所有活動</h3>
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">尚無活動</p>
            <p className="text-stone-500 text-sm mt-1">點擊「新增活動」來建立第一個活動</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    活動
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    日期時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    地點
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    報名狀況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center">
                            <Image className="w-6 h-6 text-stone-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-800">{event.title}</p>
                          <p className="text-sm text-stone-500 truncate max-w-xs">
                            {event.description || '無描述'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-stone-800">{formatDate(event.event_date)}</p>
                        <p className="text-stone-500">{event.event_time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-stone-600">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {event.max_capacity ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-800">
                              {event.current_registrations}/{event.max_capacity}
                            </span>
                            {event.current_registrations >= event.max_capacity && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                已額滿
                              </span>
                            )}
                          </div>
                          <div className="w-24 bg-stone-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-red-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((event.current_registrations / event.max_capacity) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-stone-500">自由參加</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {event.is_active ? '已發布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-stone-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New/Edit Event Form Modal */}
      {showNewEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-stone-800">
                {editingEvent ? '編輯活動' : '新增活動'}
              </h2>
              <button
                onClick={() => {
                  setShowNewEventForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    活動名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="例：觀音誕辰祈福法會"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      時間 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    地點 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="例：大雄寶殿"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    活動圖片
                  </label>
                  <div className="mt-1.5">
                    {!imagePreview ? (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-stone-400 transition-colors"
                      >
                        <Upload className="mx-auto h-10 w-10 text-stone-400" />
                        <p className="mt-2 text-sm text-stone-600">點擊上傳活動圖片</p>
                        <p className="text-xs text-stone-500 mt-1">建議尺寸 16:9 (1920x1080)</p>
                        <p className="text-xs text-stone-500">JPG, PNG 或 WebP (最大 5MB)</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative w-full h-48">
                          <img
                            src={imagePreview}
                            alt="活動圖片預覽"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 shadow-sm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="absolute bottom-2 right-2 px-3 py-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 shadow-sm flex items-center gap-1.5 text-sm"
                        >
                          <Crop className="h-3.5 w-3.5" />
                          更換圖片
                        </button>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    活動描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={4}
                    placeholder="活動的詳細介紹..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      人數限制
                    </label>
                    <input
                      type="number"
                      value={formData.max_capacity || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        max_capacity: e.target.value ? Number(e.target.value) : null
                      })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="不限制請留空"
                      min="1"
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
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-stone-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-stone-700">立即發布</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewEventForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingEvent ? '更新活動' : '建立活動'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {tempImageUrl && (
        <ImageCropModal
          isOpen={showImageCrop}
          onClose={handleImageCropClose}
          imageUrl={tempImageUrl}
          aspectRatio={ASPECT_RATIOS.COVER}
          onCropComplete={handleImageCropComplete}
          title="裁切活動圖片"
          minWidth={640}
          minHeight={360}
        />
      )}
    </div>
  );
}