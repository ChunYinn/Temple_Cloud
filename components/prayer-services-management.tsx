'use client';

import { useState, useEffect } from 'react';
import { PRAYER_SERVICES, SERVICE_ICONS, DONATION_CONFIG } from '@/lib/prayer-form/services';
import { ServiceCode } from '@/lib/prayer-form/types';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Save, Settings, DollarSign, Users, Check, X, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface PrayerServiceSetting {
  serviceCode: ServiceCode;
  isEnabled: boolean;
  customPrice?: number;
  maxQuantity?: number;
  annualLimit?: number;
  currentCount: number;
}

interface DonationSetting {
  isEnabled: boolean;
  minAmount: number;
  suggestedAmounts: number[];
  allowCustomAmount: boolean;
  allowAnonymous: boolean;
  customMessage?: string;
  receiptEnabled: boolean;
}

interface PrayerServicesManagementProps {
  templeId: string;
  onSave?: (settings: {
    prayerServices: PrayerServiceSetting[];
    donation: DonationSetting;
  }) => Promise<void>;
}

export function PrayerServicesManagement({ templeId, onSave }: PrayerServicesManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Prayer services settings
  const [serviceSettings, setServiceSettings] = useState<PrayerServiceSetting[]>([]);

  // Donation settings
  const [donationSettings, setDonationSettings] = useState<DonationSetting>({
    isEnabled: true,
    minAmount: 100,
    suggestedAmounts: [100, 300, 500, 1000, 3000, 5000],
    allowCustomAmount: true,
    allowAnonymous: true,
    customMessage: '感謝您的慈悲捐贈，功德無量',
    receiptEnabled: true
  });

  // Predefined amount options for easy selection
  const PRESET_AMOUNTS = [100, 300, 500, 1000, 2000, 3000, 5000, 10000];

  // Initialize settings
  useEffect(() => {
    initializeSettings();
    loadExistingSettings();
  }, [templeId]);

  const initializeSettings = () => {
    // Initialize with all available services
    const initialSettings: PrayerServiceSetting[] = Object.values(ServiceCode).map(code => ({
      serviceCode: code as ServiceCode,
      isEnabled: false,
      customPrice: PRAYER_SERVICES[code as ServiceCode]?.unitPrice || 800,
      maxQuantity: undefined,
      annualLimit: undefined,
      currentCount: 0
    }));
    setServiceSettings(initialSettings);
  };

  const loadExistingSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Load existing settings from API
      // const response = await fetch(`/api/temples/${templeId}/prayer-services`);
      // const data = await response.json();
      // setServiceSettings(data.prayerServices);
      // setDonationSettings(data.donation);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleServiceLimitChange = (serviceCode: ServiceCode, field: 'maxQuantity' | 'annualLimit', value: number | undefined) => {
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
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave({
          prayerServices: serviceSettings,
          donation: donationSettings
        });
      }
      setHasChanges(false);
      // Show success message
      alert('設定已儲存');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-stone-600">載入中...</p>
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
          disabled={!hasChanges || isSaving}
          className={cn(
            "flex items-center gap-2",
            hasChanges ? "bg-green-600 hover:bg-green-700" : ""
          )}
        >
          <Save className="w-4 h-4" />
          {isSaving ? '儲存中...' : '儲存設定'}
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
          <div className="grid gap-4">
            {serviceSettings.map((setting) => {
              const serviceInfo = PRAYER_SERVICES[setting.serviceCode];
              const icon = SERVICE_ICONS[setting.serviceCode];

              return (
                <Card key={setting.serviceCode} className={cn(
                  "transition-all overflow-hidden",
                  setting.isEnabled ? "border-red-200 bg-gradient-to-br from-red-50/50 to-orange-50/30 shadow-sm" : "hover:shadow-sm"
                )}>
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
                          <CardTitle className="text-lg flex items-center gap-2">
                            {serviceInfo.displayName}
                            {setting.currentCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-normal bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                <Users className="w-3 h-3" />
                                {setting.currentCount} 位
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
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
                          <Label htmlFor={`price-${setting.serviceCode}`}>
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
                            className="mt-1"
                          />
                          <p className="text-xs text-stone-500 mt-1">
                            預設價格：{serviceInfo.unitPrice} 元
                          </p>
                        </div>

                        <div>
                          <Label htmlFor={`max-qty-${setting.serviceCode}`}>
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
                            className="mt-1"
                          />
                          <p className="text-xs text-stone-500 mt-1">
                            留空表示不限制
                          </p>
                        </div>

                        <div>
                          <Label htmlFor={`annual-limit-${setting.serviceCode}`}>
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
                            className="mt-1"
                          />
                          <p className="text-xs text-stone-500 mt-1">
                            {setting.annualLimit && setting.currentCount
                              ? `剩餘 ${setting.annualLimit - setting.currentCount} 個名額`
                              : '留空表示不限制'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-lg p-4">
                        <p className="text-sm text-stone-700 font-medium mb-2">服務說明：</p>
                        <p className="text-sm text-stone-600">{serviceInfo.longDescription}</p>
                        {serviceInfo.specialNote && (
                          <p className="text-sm text-amber-700 mt-2">
                            <span className="font-medium">特別說明：</span> {serviceInfo.specialNote}
                          </p>
                        )}
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
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    最低捐贈金額
                    <span className="text-xs font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded">建議最低 100 元</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">NT$</span>
                      <Input
                        type="number"
                        min="1"
                        value={donationSettings.minAmount}
                        onChange={(e) => handleDonationChange('minAmount', Number.parseInt(e.target.value, 10) || 100)}
                        className="pl-12 pr-8 w-32 font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">元</span>
                    </div>
                  </div>
                </div>

                {/* Quick Amount Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    常用功德金金額
                    <span className="text-sm font-normal text-stone-500 ml-2">（選填，信眾可快速選擇）</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
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
                            "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                            isSelected
                              ? "bg-amber-50 border-amber-400 text-amber-700"
                              : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                          )}
                        >
                          {isSelected && <Check className="inline w-3 h-3 mr-1" />}
                          NT$ {amount.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Options with Better Checkboxes */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">功能選項</Label>
                  <div className="space-y-3 bg-stone-50 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <Checkbox
                        checked={donationSettings.allowCustomAmount}
                        onCheckedChange={(checked) => handleDonationChange('allowCustomAmount', checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                          允許信眾自行輸入金額
                        </span>
                        <p className="text-xs text-stone-500 mt-0.5">信眾可輸入自訂金額，不限於快速選擇按鈕</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <Checkbox
                        checked={donationSettings.allowAnonymous}
                        onCheckedChange={(checked) => handleDonationChange('allowAnonymous', checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                          允許匿名捐贈
                        </span>
                        <p className="text-xs text-stone-500 mt-0.5">信眾可選擇不具名方式捐贈</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <Checkbox
                        checked={donationSettings.receiptEnabled}
                        onCheckedChange={(checked) => handleDonationChange('receiptEnabled', checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                          提供捐贈收據
                        </span>
                        <p className="text-xs text-stone-500 mt-0.5">系統將自動產生電子收據供信眾下載</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Thank You Message */}
                <div className="space-y-3">
                  <Label htmlFor="custom-message" className="text-base font-medium">
                    感謝詞
                    <span className="text-sm font-normal text-stone-500 ml-2">（選填）</span>
                  </Label>
                  <textarea
                    id="custom-message"
                    value={donationSettings.customMessage || ''}
                    onChange={(e) => handleDonationChange('customMessage', e.target.value)}
                    placeholder="感謝您的慈悲捐贈，功德無量"
                    className="w-full min-h-[80px] rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
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