'use client';

import { useState, useEffect } from 'react';
import { PRAYER_SERVICES, SERVICE_ICONS, SERVICE_COLORS } from '@/lib/prayer-form/services';
import { ServiceCode } from '@/lib/prayer-form/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  ChevronDown,
  ChevronUp,
  Users,
  Gift,
  DollarSign,
  Heart,
  Sparkles,
  Info,
  ArrowRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface TempleService {
  serviceCode: ServiceCode;
  isEnabled: boolean;
  customPrice?: number;
  maxQuantity?: number;
  annualLimit?: number;
  currentCount?: number;
}

interface DonationSettings {
  isEnabled: boolean;
  minAmount: number;
  suggestedAmounts: number[];
  allowCustomAmount: boolean;
  allowAnonymous: boolean;
  customMessage?: string;
}

interface TempleServicesDisplayProps {
  readonly templeId: string;
  readonly templeSlug: string;
  readonly templeName: string;
}

export function TempleServicesDisplay({
  templeId,
  templeSlug,
  templeName
}: TempleServicesDisplayProps) {
  const router = useRouter();
  const [services, setServices] = useState<TempleService[]>([]);
  const [donationSettings, setDonationSettings] = useState<DonationSettings | null>(null);
  const [expandedServices, setExpandedServices] = useState<Set<ServiceCode>>(new Set());
  const [selectedServices, setSelectedServices] = useState<ServiceCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    loadTempleServices();
  }, [templeId]);

  const loadTempleServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/temples/${templeId}/prayer-services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();

      setServices(data.services || []);
      setDonationSettings(data.donation || null);
    } catch (error) {
      console.error('Failed to load temple services:', error);
      toast({
        title: '載入失敗',
        description: '無法載入服務資訊，請稍後再試',
        variant: 'destructive'
      });
      // Set empty data on error
      setServices([]);
      setDonationSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleServiceExpansion = (serviceCode: ServiceCode) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceCode)) {
      newExpanded.delete(serviceCode);
    } else {
      newExpanded.add(serviceCode);
    }
    setExpandedServices(newExpanded);
  };

  const handleServiceSelect = (serviceCode: ServiceCode) => {
    const service = services.find(s => s.serviceCode === serviceCode);

    if (!service?.isEnabled) {
      toast({
        title: '服務未開放',
        description: '此服務目前暫未開放，請選擇其他服務或聯繫廟方',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    if (selectedServices.includes(serviceCode)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceCode));
    } else {
      setSelectedServices([...selectedServices, serviceCode]);
    }
  };

  const handleProceedToForm = () => {
    if (selectedServices.length === 0) {
      toast({
        title: '請選擇服務',
        description: '請至少選擇一項祈福服務',
        variant: 'destructive'
      });
      return;
    }

    // Navigate to prayer form with selected services
    const params = new URLSearchParams({
      services: selectedServices.join(','),
      temple: templeId
    });

    router.push(`/temple/${templeSlug}/prayer-form?${params}`);
  };

  const handleDonationClick = () => {
    if (!donationSettings?.isEnabled) {
      toast({
        title: '功德金功能未開放',
        description: '此寺廟目前暫未開放線上功德金功能',
        variant: 'destructive'
      });
      return;
    }

    setShowDonationModal(true);
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

  const enabledServices = services.filter(s => s.isEnabled);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-stone-800">{templeName}</h1>
        <h2 className="text-xl text-stone-600">線上祈福服務</h2>
        {enabledServices.length > 0 ? (
          <p className="text-sm text-stone-500 max-w-2xl mx-auto">
            選擇您需要的祈福服務，點擊「了解更多」查看詳細說明，確認後進入申請流程
          </p>
        ) : (
          <p className="text-sm text-stone-500 max-w-2xl mx-auto">
            目前暫無開放線上祈福服務，請聯繫廟方了解更多資訊
          </p>
        )}
      </div>

      {/* Selected Services Badge */}
      {selectedServices.length > 0 && (
        <div className="sticky top-4 z-10 bg-white rounded-lg shadow-md p-4 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                已選擇 {selectedServices.length} 項服務
              </Badge>
              <div className="flex gap-2">
                {selectedServices.map(code => {
                  const service = PRAYER_SERVICES[code];
                  return (
                    <span key={code} className="text-sm text-stone-600 flex items-center gap-1">
                      <span>{SERVICE_ICONS[code]}</span>
                      <span>{service.displayName}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <Button
              onClick={handleProceedToForm}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              開始登記申請 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* No Services Available Message */}
      {enabledServices.length === 0 && !donationSettings?.isEnabled && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-amber-50 via-white to-red-50 rounded-2xl p-8 md:p-12 text-center border border-amber-100/50 shadow-lg">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-red-100 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-700 to-red-700 bg-clip-text text-transparent mb-3">
              線上祈福服務準備中
            </h3>
            <p className="text-stone-600 mb-8 text-base md:text-lg max-w-md mx-auto">
              本廟線上祈福與功德金服務正在建置中
            </p>

            <div className="bg-white/80 backdrop-blur rounded-xl p-6 space-y-4 border border-amber-100/30">
              <div className="flex items-center justify-center gap-3 text-stone-700">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-base md:text-lg">歡迎直接蒞臨本廟參拜</span>
              </div>

              <div className="flex items-center justify-center gap-3 text-stone-700">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-base md:text-lg">或來電洽詢服務詳情</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {(enabledServices.length > 0 || donationSettings?.isEnabled) && (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(ServiceCode).map(serviceCode => {
          const service = services.find(s => s.serviceCode === serviceCode);
          const serviceInfo = PRAYER_SERVICES[serviceCode];
          const icon = SERVICE_ICONS[serviceCode];
          const color = SERVICE_COLORS[serviceCode];
          const isEnabled = service?.isEnabled || false;
          const isExpanded = expandedServices.has(serviceCode);
          const isSelected = selectedServices.includes(serviceCode);

          return (
            <Card
              key={serviceCode}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isEnabled ? "hover:shadow-lg" : "opacity-60",
                isSelected && "ring-2 ring-red-500 ring-offset-2"
              )}
            >
              {/* Gradient Header */}
              <div className={cn(
                "h-2 bg-gradient-to-r",
                isEnabled ? color : "from-stone-300 to-stone-400"
              )} />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "text-3xl",
                      isEnabled && "filter drop-shadow"
                    )}>
                      {icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {serviceInfo.displayName}
                        {!isEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            暫未開放
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        {serviceInfo.shortGoal}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4 text-sm text-stone-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {service?.currentCount || 0} 位已登記
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      NT$ {service?.customPrice || serviceInfo.unitPrice}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      {serviceInfo.giftLabel}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    適用：{serviceInfo.audience}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Expand/Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleServiceExpansion(serviceCode)}
                  className="w-full justify-between"
                  disabled={!isEnabled}
                >
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    了解更多
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                {/* Expanded Description */}
                {isExpanded && (
                  <div className="p-4 bg-stone-50 rounded-lg space-y-3 animate-in slide-in-from-top-2">
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {serviceInfo.longDescription}
                    </p>
                    {serviceInfo.specialNote && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <p className="text-xs text-amber-800">{serviceInfo.specialNote}</p>
                      </div>
                    )}
                    <div className="text-sm text-stone-600">
                      <p>費用：{serviceInfo.feeText}</p>
                      <p>贈品：{serviceInfo.giftLabel}</p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handleServiceSelect(serviceCode)}
                  disabled={!isEnabled}
                  className={cn(
                    "w-full",
                    isSelected
                      ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      : isEnabled
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        : ""
                  )}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      已選擇
                    </>
                  ) : isEnabled ? (
                    '選擇此服務'
                  ) : (
                    '暫未開放'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {/* Donation Card - Always show even if disabled */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300",
          donationSettings?.isEnabled ? "hover:shadow-lg" : "opacity-60"
        )}>
          <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />

          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="text-3xl">
                <Heart className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  線上功德金
                  {!donationSettings?.isEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      暫未開放
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  隨喜捐贈，護持道場
                </CardDescription>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-stone-500">
                您的慈悲捐贈將用於寺廟維護與弘法利生
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {donationSettings?.isEnabled && donationSettings.suggestedAmounts && (
              <div className="flex flex-wrap gap-2">
                {donationSettings.suggestedAmounts.slice(0, 3).map(amount => (
                  <Badge key={amount} variant="outline" className="text-xs">
                    NT$ {amount.toLocaleString()}
                  </Badge>
                ))}
                {donationSettings.allowCustomAmount && (
                  <Badge variant="outline" className="text-xs">
                    自訂金額
                  </Badge>
                )}
              </div>
            )}

            <Button
              onClick={handleDonationClick}
              disabled={!donationSettings?.isEnabled}
              className={cn(
                "w-full",
                donationSettings?.isEnabled
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  : ""
              )}
            >
              {donationSettings?.isEnabled ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  我要捐贈
                </>
              ) : (
                '暫未開放'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Bottom CTA */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden">
          <Button
            onClick={handleProceedToForm}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            size="lg"
          >
            開始登記申請 ({selectedServices.length} 項服務)
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-stone-500 pb-20 md:pb-0">
        <p>如有任何問題，歡迎聯繫廟方服務人員</p>
        <p className="mt-1">或致電：(02) 1234-5678</p>
      </div>
    </div>
  );
}