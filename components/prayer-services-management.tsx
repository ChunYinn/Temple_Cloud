'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Star,
  GripVertical,
  Check
} from 'lucide-react';

interface Service {
  id: string;
  temple_id: string;
  icon: string;
  name: string;
  description?: string | null;
  price: number;
  unit: 'year' | 'month' | 'time' | 'piece';
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface ServiceFormData {
  icon: string;
  name: string;
  description: string;
  price: number;
  unit: 'year' | 'month' | 'time' | 'piece';
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

// Common service icons
const SERVICE_ICONS = [
  { icon: '🪔', name: '光明燈' },
  { icon: '🐲', name: '太歲燈' },
  { icon: '💰', name: '香油錢' },
  { icon: '📿', name: '平安符' },
  { icon: '🙏', name: '祈福' },
  { icon: '🎋', name: '文昌燈' },
  { icon: '💑', name: '姻緣燈' },
  { icon: '🏮', name: '財神燈' },
  { icon: '⭐', name: '功德' },
  { icon: '🎊', name: '法會' },
];

const UNIT_OPTIONS = [
  { value: 'year', label: '年', display: '/年' },
  { value: 'month', label: '月', display: '/月' },
  { value: 'time', label: '次', display: '/次' },
  { value: 'piece', label: '個', display: '/個' },
];

export function PrayerServicesManagement({ templeId }: { templeId: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('🪔');
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    icon: '🪔',
    name: '',
    description: '',
    price: 0,
    unit: 'year',
    is_popular: false,
    is_active: true,
    sort_order: 0
  });

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, [templeId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll show empty state since API isn't ready
      // Later this will fetch from /api/temples/${templeId}/services

      // Simulating API call
      setTimeout(() => {
        setServices([]); // Empty state
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('載入服務時發生錯誤');
      setServices([]);
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString('zh-TW')}`;
  };

  const getUnitDisplay = (unit: string) => {
    const unitOption = UNIT_OPTIONS.find(u => u.value === unit);
    return unitOption?.display || `/${unit}`;
  };

  const resetForm = () => {
    setFormData({
      icon: '🪔',
      name: '',
      description: '',
      price: 0,
      unit: 'year',
      is_popular: false,
      is_active: true,
      sort_order: 0
    });
    setSelectedIcon('🪔');
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // TODO: Implement API call
      // const url = `/api/temples/${templeId}/services`;
      // const method = editingService ? 'PATCH' : 'POST';

      // For now, just show success message
      alert(editingService ? '服務已更新' : '服務已新增');

      setShowNewServiceForm(false);
      resetForm();
      // await fetchServices(); // Refresh the list
    } catch (err) {
      setError('儲存服務時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('確定要刪除這個服務嗎？')) return;

    try {
      // TODO: Implement API call
      // await fetch(`/api/temples/${templeId}/services?serviceId=${serviceId}`, {
      //   method: 'DELETE'
      // });

      alert('服務已刪除');
      // await fetchServices(); // Refresh the list
    } catch (err) {
      alert('刪除服務時發生錯誤');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      icon: service.icon,
      name: service.name,
      description: service.description || '',
      price: service.price,
      unit: service.unit,
      is_popular: service.is_popular,
      is_active: service.is_active,
      sort_order: service.sort_order
    });
    setSelectedIcon(service.icon);
    setShowNewServiceForm(true);
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      // TODO: Implement API call to toggle status
      alert(`已${service.is_active ? '停用' : '啟用'}服務: ${service.name}`);
    } catch (err) {
      alert('更新狀態時發生錯誤');
    }
  };

  // Calculate stats
  const activeServices = services.filter(s => s.is_active);
  const popularServices = services.filter(s => s.is_popular);
  const totalRevenue = services.reduce((sum, s) => sum + (s.price * (s.unit === 'year' ? 12 : 1)), 0);

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
          <h2 className="text-xl font-bold text-stone-800">祈福服務管理</h2>
          <p className="text-stone-500 text-sm mt-1">管理寺廟提供的各項祈福服務</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowNewServiceForm(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增服務
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
              <p className="text-stone-500 text-sm">總服務數</p>
              <p className="text-2xl font-bold text-stone-800">{services.length}</p>
            </div>
            <Sparkles className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">啟用中</p>
              <p className="text-2xl font-bold text-green-600">{activeServices.length}</p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">熱門服務</p>
              <p className="text-2xl font-bold text-amber-600">{popularServices.length}</p>
            </div>
            <Star className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">預估年收</p>
              <p className="text-xl font-bold text-blue-600">{formatPrice(totalRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-semibold text-stone-800">所有服務</h3>
        </div>

        {services.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">尚無祈福服務</p>
            <p className="text-stone-500 text-sm mt-1">點擊「新增服務」來建立第一個祈福服務</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {services.sort((a, b) => a.sort_order - b.sort_order).map((service) => (
              <div key={service.id} className="p-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <button className="p-1 hover:bg-stone-200 rounded cursor-move">
                    <GripVertical className="w-5 h-5 text-stone-400" />
                  </button>

                  {/* Service Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center text-2xl">
                    {service.icon}
                  </div>

                  {/* Service Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-800">{service.name}</h4>
                      {service.is_popular && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
                          熱門
                        </span>
                      )}
                      {!service.is_active && (
                        <span className="px-2 py-0.5 bg-stone-200 text-stone-600 text-xs font-medium rounded-full">
                          已停用
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 mt-1">{service.description || '無描述'}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-amber-600">
                      {formatPrice(service.price)}
                    </p>
                    <p className="text-sm text-stone-500">{getUnitDisplay(service.unit)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleServiceStatus(service)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        service.is_active
                          ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {service.is_active ? '停用' : '啟用'}
                    </button>
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-stone-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New/Edit Service Form Modal */}
      <AnimatePresence>
        {showNewServiceForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-stone-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800">
                  {editingService ? '編輯服務' : '新增祈福服務'}
                </h2>
                <button
                  onClick={() => {
                    setShowNewServiceForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Icon Selection */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      服務圖示
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center text-3xl border-2 border-stone-200 hover:border-red-500 transition-colors"
                      >
                        {formData.icon}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm text-stone-600">點擊選擇圖示</p>
                        <p className="text-xs text-stone-400">選擇適合的服務圖示</p>
                      </div>
                    </div>

                    {/* Icon Picker */}
                    {showIconPicker && (
                      <div className="mt-3 p-3 bg-stone-50 rounded-lg">
                        <div className="grid grid-cols-5 gap-2">
                          {SERVICE_ICONS.map((item) => (
                            <button
                              key={item.icon}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, icon: item.icon });
                                setSelectedIcon(item.icon);
                                setShowIconPicker(false);
                              }}
                              className={`p-3 rounded-lg border-2 transition-all hover:border-red-500 hover:bg-white ${
                                formData.icon === item.icon
                                  ? 'border-red-500 bg-white shadow-md'
                                  : 'border-stone-200'
                              }`}
                              title={item.name}
                            >
                              <div className="text-2xl">{item.icon}</div>
                              <p className="text-xs text-stone-600 mt-1">{item.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      服務名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="例：光明燈"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      服務說明
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                      placeholder="簡短說明此服務的內容與功效..."
                    />
                  </div>

                  {/* Price and Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        價格 (NT$) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="500"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        計價單位 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        {UNIT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} ({option.display})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      排序順序
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-stone-500 mt-1">數字越小排序越前面</p>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_popular}
                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                        className="w-4 h-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-stone-700">標記為熱門服務</span>
                        <p className="text-xs text-stone-500">熱門服務會顯示特殊標記</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-stone-700">立即啟用</span>
                        <p className="text-xs text-stone-500">啟用後將在公開頁面顯示</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-stone-50 rounded-xl">
                  <p className="text-xs font-medium text-stone-500 mb-2">預覽</p>
                  <div className="bg-white rounded-lg p-3 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center text-xl">
                        {formData.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-stone-800">
                            {formData.name || '服務名稱'}
                          </p>
                          {formData.is_popular && (
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
                              熱門
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500">
                          {formData.description || '服務說明'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">
                          NT$ {formData.price || 0}
                        </p>
                        <p className="text-xs text-stone-500">
                          {getUnitDisplay(formData.unit)}
                        </p>
                      </div>
                    </div>
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
                      setShowNewServiceForm(false);
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
                    {editingService ? '更新服務' : '建立服務'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}