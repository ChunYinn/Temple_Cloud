'use client';

import { useState, useEffect } from 'react';
import { PRAYER_SERVICES, SERVICE_ICONS } from '@/lib/prayer-form/services';
import { ServiceCode } from '@/lib/prayer-form/types';
import { usePrayerServices, useUpdatePrayerServices } from '@/lib/hooks/use-temple-data-clean';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  Save,
  Settings,
  DollarSign,
  Users,
  Check,
  Sparkles,
  Info,
  Bold,
  Italic,
  List,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast-context';

interface PrayerServiceSetting {
  serviceCode: ServiceCode;
  isEnabled: boolean;
  customPrice?: number;
  maxQuantity?: number;
  annualLimit?: number;
  currentCount: number;
  description?: string;
  specialNote?: string;
}

interface DonationSetting {
  isEnabled: boolean;
  minAmount: number;
  suggestedAmounts: number[];
  allowCustomAmount: boolean;
  allowAnonymous: boolean;
  customMessage?: string;
  receiptEnabled?: boolean;
}

interface PrayerServicesManagementProps {
  templeId: string;
}

// Predefined amount options
const PRESET_AMOUNTS = [100, 300, 500, 1000, 2000, 3000, 5000, 10000];

export function PrayerServicesManagementClean({ templeId }: PrayerServicesManagementProps) {
  const { success, error: showError } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  // Use clean React Query hooks
  const { data, isLoading, error } = usePrayerServices(templeId);
  const updateMutation = useUpdatePrayerServices(templeId);

  // Local state for form editing
  const [serviceSettings, setServiceSettings] = useState<PrayerServiceSetting[]>([]);
  const [donationSettings, setDonationSettings] = useState<DonationSetting>({
    isEnabled: true,
    minAmount: 100,
    suggestedAmounts: [100, 300, 500, 1000, 3000, 5000],
    allowCustomAmount: true,
    allowAnonymous: true,
    customMessage: '感謝您的慈悲捐贈，功德無量',
    receiptEnabled: true
  });

  // Initialize form state from fetched data
  useEffect(() => {
    if (data) {
      const initialSettings: PrayerServiceSetting[] = Object.values(ServiceCode).map(code => {
        const service = PRAYER_SERVICES[code as ServiceCode];
        const fetchedService = data.services?.find(s => s.serviceCode === code);

        return {
          serviceCode: code as ServiceCode,
          isEnabled: fetchedService?.isEnabled || false,
          customPrice: fetchedService?.customPrice || service?.unitPrice || 800,
          maxQuantity: fetchedService?.maxQuantity || undefined,
          annualLimit: fetchedService?.annualLimit || undefined,
          currentCount: fetchedService?.currentCount || 0,
          description: fetchedService?.description || service?.longDescription || '',
          specialNote: fetchedService?.specialNote || service?.specialNote || ''
        };
      });

      setServiceSettings(initialSettings);

      if (data.donation) {
        setDonationSettings({
          ...data.donation,
          receiptEnabled: true
        });
      }
    }
  }, [data]);

  const handleServiceToggle = (serviceCode: ServiceCode, enabled: boolean) => {
    setServiceSettings(prev => prev.map(s =>
      s.serviceCode === serviceCode ? { ...s, isEnabled: enabled } : s
    ));
    setHasChanges(true);
  };

  const handleServicePriceChange = (serviceCode: ServiceCode, price: number) => {
    setServiceSettings(prev => prev.map(s =>
      s.serviceCode === serviceCode ? { ...s, customPrice: price } : s
    ));
    setHasChanges(true);
  };

  const handleServiceLimitChange = (
    serviceCode: ServiceCode,
    field: 'maxQuantity' | 'annualLimit',
    value: number | undefined
  ) => {
    setServiceSettings(prev => prev.map(s =>
      s.serviceCode === serviceCode ? { ...s, [field]: value } : s
    ));
    setHasChanges(true);
  };

  const handleServiceDescriptionChange = (
    serviceCode: ServiceCode,
    field: 'description' | 'specialNote',
    value: string
  ) => {
    setServiceSettings(prev => prev.map(s =>
      s.serviceCode === serviceCode ? { ...s, [field]: value } : s
    ));
    setHasChanges(true);
  };

  const handleDonationChange = (field: keyof DonationSetting, value: any) => {
    setDonationSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const dataToSave = {
      services: serviceSettings,
      donation: donationSettings
    };

    // Mutation already handles success/error toast via the hook
    await updateMutation.mutateAsync(dataToSave);
    setHasChanges(false);
  };

  // Insert markdown formatting helpers
  const insertMarkdown = (
    serviceCode: ServiceCode,
    field: 'description' | 'specialNote',
    format: 'bold' | 'italic' | 'list'
  ) => {
    const textarea = document.getElementById(`${field}-${serviceCode}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText = '';
    switch (format) {
      case 'bold':
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
        break;
      case 'italic':
        newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
        break;
      case 'list':
        newText = text ? text + '\n• ' : '• ';
        break;
    }

    handleServiceDescriptionChange(serviceCode, field, newText);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      if (format === 'list') {
        textarea.setSelectionRange(newText.length, newText.length);
      }
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-stone-600">載入中...</p>
        </div>
      </div>
    );
  }

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">祈福服務設定</h2>
          <p className="text-stone-600 mt-1">管理您寺廟提供的標準化祈福服務</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
          className={cn(
            "flex items-center gap-2",
            hasChanges ? "bg-green-600 hover:bg-green-700" : ""
          )}
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {updateMutation.isPending ? '儲存中...' : '儲存設定'}
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">您有未儲存的變更</p>
            <p>請記得點擊「儲存設定」按鈕以保存您的變更。</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            祈福服務
          </TabsTrigger>
          <TabsTrigger value="donation" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            功德金設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white shadow-md">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">設定祈福服務</CardTitle>
                  <CardDescription className="mt-1">
                    選擇並設定您的寺廟提供的祈福服務項目
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {serviceSettings.map((setting) => {
              const serviceInfo = PRAYER_SERVICES[setting.serviceCode];
              const icon = SERVICE_ICONS[setting.serviceCode];

              return (
                <Card
                  key={setting.serviceCode}
                  className={cn(
                    "transition-all overflow-hidden",
                    setting.isEnabled
                      ? "border-red-200 bg-gradient-to-br from-red-50/50 to-orange-50/30 shadow-sm"
                      : "hover:shadow-sm"
                  )}
                >
                  <CardHeader className={cn(
                    "transition-all",
                    setting.isEnabled && "bg-white/60"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "text-3xl mt-1 transition-all",
                          setting.isEnabled && "filter drop-shadow-md"
                        )}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            {serviceInfo.displayName}
                            {setting.currentCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-normal bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                <Users className="w-3 h-3" />
                                {setting.currentCount} 位
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm">
                            {serviceInfo.shortGoal}
                          </CardDescription>
                          <p className="text-sm text-stone-500 mt-2">
                            適用對象：{serviceInfo.audience}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.isEnabled}
                          onChange={(e) => handleServiceToggle(setting.serviceCode, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-red-600"></div>
                      </label>
                    </div>
                  </CardHeader>

                  {setting.isEnabled && (
                    <CardContent className="space-y-4 border-t pt-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`price-${setting.serviceCode}`} className="text-sm font-medium">
                            單價（新台幣）
                          </Label>
                          <Input
                            id={`price-${setting.serviceCode}`}
                            type="number"
                            min="1"
                            value={setting.customPrice || serviceInfo.unitPrice}
                            onChange={(e) => handleServicePriceChange(
                              setting.serviceCode,
                              Number.parseInt(e.target.value, 10) || serviceInfo.unitPrice
                            )}
                            className="mt-1 text-sm"
                          />
                          <p className="text-xs text-stone-500 mt-1">
                            預設價格：{serviceInfo.unitPrice} 元
                          </p>
                        </div>

                        <div>
                          <Label htmlFor={`max-qty-${setting.serviceCode}`} className="text-sm font-medium">
                            每單最大數量
                          </Label>
                          <Input
                            id={`max-qty-${setting.serviceCode}`}
                            type="number"
                            min="1"
                            placeholder="不限制"
                            value={setting.maxQuantity || ''}
                            onChange={(e) => handleServiceLimitChange(
                              setting.serviceCode,
                              'maxQuantity',
                              e.target.value ? Number.parseInt(e.target.value, 10) : undefined
                            )}
                            className="mt-1 text-sm"
                          />
                          <p className="text-xs text-stone-500 mt-1">
                            留空表示不限制
                          </p>
                        </div>

                        <div>
                          <Label htmlFor={`annual-limit-${setting.serviceCode}`} className="text-sm font-medium">
                            年度總量限制
                          </Label>
                          <Input
                            id={`annual-limit-${setting.serviceCode}`}
                            type="number"
                            min="1"
                            placeholder="不限制"
                            value={setting.annualLimit || ''}
                            onChange={(e) => handleServiceLimitChange(
                              setting.serviceCode,
                              'annualLimit',
                              e.target.value ? Number.parseInt(e.target.value, 10) : undefined
                            )}
                            className="mt-1 text-sm"
                          />
                          <p className="text-xs text-stone-500 mt-1">
                            {setting.annualLimit && setting.currentCount
                              ? `剩餘 ${setting.annualLimit - setting.currentCount} 個名額`
                              : '留空表示不限制'}
                          </p>
                        </div>
                      </div>

                      {/* Service Description Editor */}
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`description-${setting.serviceCode}`} className="text-sm font-medium">
                              服務說明
                            </Label>
                            <div className="flex gap-1 bg-white rounded-lg border p-1">
                              <button
                                type="button"
                                className="p-1.5 hover:bg-stone-100 rounded transition-colors"
                                title="粗體"
                                onClick={() => insertMarkdown(setting.serviceCode, 'description', 'bold')}
                              >
                                <Bold className="w-3.5 h-3.5 text-stone-600" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 hover:bg-stone-100 rounded transition-colors"
                                title="斜體"
                                onClick={() => insertMarkdown(setting.serviceCode, 'description', 'italic')}
                              >
                                <Italic className="w-3.5 h-3.5 text-stone-600" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 hover:bg-stone-100 rounded transition-colors"
                                title="項目符號"
                                onClick={() => insertMarkdown(setting.serviceCode, 'description', 'list')}
                              >
                                <List className="w-3.5 h-3.5 text-stone-600" />
                              </button>
                            </div>
                          </div>
                          <Textarea
                            id={`description-${setting.serviceCode}`}
                            value={setting.description || ''}
                            onChange={(e) => handleServiceDescriptionChange(setting.serviceCode, 'description', e.target.value)}
                            placeholder={serviceInfo.longDescription}
                            className="min-h-[120px] resize-y font-mono text-sm"
                          />
                          {!setting.description && (
                            <button
                              type="button"
                              onClick={() => handleServiceDescriptionChange(setting.serviceCode, 'description', serviceInfo.longDescription)}
                              className="text-xs text-amber-600 hover:text-amber-700 mt-1"
                            >
                              使用預設說明
                            </button>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`specialNote-${setting.serviceCode}`} className="text-base font-medium">
                            特別說明
                            <span className="text-sm font-normal text-stone-500 ml-2">（選填）</span>
                          </Label>
                          <Textarea
                            id={`specialNote-${setting.serviceCode}`}
                            value={setting.specialNote || ''}
                            onChange={(e) => handleServiceDescriptionChange(setting.serviceCode, 'specialNote', e.target.value)}
                            placeholder={serviceInfo.specialNote || '例如：可搭配光明燈一同安奉（依廟方作法）'}
                            className="mt-2 min-h-[60px] resize-y"
                          />
                          {!setting.specialNote && serviceInfo.specialNote && (
                            <button
                              type="button"
                              onClick={() => handleServiceDescriptionChange(setting.serviceCode, 'specialNote', serviceInfo.specialNote || '')}
                              className="text-xs text-amber-600 hover:text-amber-700 mt-1"
                            >
                              使用預設特別說明
                            </button>
                          )}
                        </div>

                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-700 flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              說明文字支援簡單 Markdown 格式：使用 **文字** 顯示粗體，*文字* 顯示斜體，• 開頭顯示項目符號
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {serviceSettings.filter(s => s.isEnabled).length === 0 && (
            <div className="text-center py-12 bg-stone-50 rounded-lg">
              <Settings className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <p className="text-stone-600">尚未啟用任何祈福服務</p>
              <p className="text-sm text-stone-500 mt-1">請開啟您想要提供的服務</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="donation" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">功德金／隨喜捐贈設定</CardTitle>
                    <CardDescription className="mt-1">
                      讓信眾透過線上方式護持道場
                    </CardDescription>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donationSettings.isEnabled}
                    onChange={(e) => handleDonationChange('isEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:to-amber-500"></div>
                  <span className="ml-3 text-sm font-medium text-stone-700">
                    {donationSettings.isEnabled ? '已啟用' : '已停用'}
                  </span>
                </label>
              </div>
            </CardHeader>

            {donationSettings.isEnabled && (
              <CardContent className="p-6 space-y-8">
                {/* Minimum Amount Section */}
                <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-xl p-6 border border-amber-200/30">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-md">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="min-donation-amount" className="text-lg font-semibold text-stone-800">
                          最低捐贈金額門檻
                        </Label>
                        <p className="text-sm text-stone-600 mt-1">
                          設定信眾捐贈的最低金額，信眾可自由輸入任何大於此金額的數目
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-11">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 font-medium">NT$</span>
                        <Input
                          id="min-donation-amount"
                          type="number"
                          min="1"
                          value={donationSettings.minAmount}
                          onChange={(e) => handleDonationChange('minAmount', Number.parseInt(e.target.value, 10) || 100)}
                          className="pl-14 pr-10 w-44 text-lg font-semibold border-2 border-amber-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600">元</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>建議設定 100 元以上</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Amount Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-lg font-semibold text-stone-800">
                        快速選擇金額按鈕
                      </Label>
                      <p className="text-sm text-stone-600 mt-1">提供常用金額按鈕，方便信眾快速選擇</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      已選 {donationSettings.suggestedAmounts.length} 個
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {PRESET_AMOUNTS.map((amount) => {
                      const isSelected = donationSettings.suggestedAmounts.includes(amount);
                      return (
                        <button
                          key={amount}
                          onClick={() => {
                            if (isSelected) {
                              handleDonationChange(
                                'suggestedAmounts',
                                donationSettings.suggestedAmounts.filter(a => a !== amount)
                              );
                            } else {
                              handleDonationChange(
                                'suggestedAmounts',
                                [...donationSettings.suggestedAmounts, amount].sort((a, b) => a - b)
                              );
                            }
                          }}
                          className={cn(
                            "relative px-4 py-3 rounded-xl border-2 font-semibold transition-all transform hover:scale-105",
                            isSelected
                              ? "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-400 text-amber-800 shadow-md"
                              : "bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-amber-50/30"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <span className="text-xs text-stone-500">NT$</span>
                          <div className="text-lg">{amount.toLocaleString()}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Info className="w-4 h-4" />
                    <span>信眾仍可自行輸入其他金額，不受限於以上選項</span>
                  </div>
                </div>

                {/* Thank You Message */}
                <div className="space-y-3">
                  <Label htmlFor="custom-message" className="text-base font-medium">
                    感謝詞
                    <span className="text-sm font-normal text-stone-500 ml-2">（選填）</span>
                  </Label>
                  <Textarea
                    id="custom-message"
                    value={donationSettings.customMessage || ''}
                    onChange={(e) => handleDonationChange('customMessage', e.target.value)}
                    placeholder="感謝您的慈悲捐贈，功德無量"
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-stone-500">將顯示在捐贈完成頁面</p>
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">系統提醒</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 所有捐贈記錄將自動保存於系統中</li>
                      <li>• 您可在「捐贈管理」頁面查看詳細統計</li>
                      <li>• 系統會自動發送感謝信給捐贈者</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}