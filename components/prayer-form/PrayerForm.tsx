'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PrayerFormState, ServiceCode, ServiceSelection } from '@/lib/prayer-form/types';
import { createInitialFormState, computeTotals, buildTransactionItems } from '@/lib/prayer-form/helpers';
import { validateStep1, validateStep2, validateStep3, validateStep4, validateDonation } from '@/lib/prayer-form/validation';
import { PRAYER_SERVICES } from '@/lib/prayer-form/services';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Step Components (to be implemented separately)
// import { Step1ServiceSelection } from './steps/Step1ServiceSelection';
// import { Step2ApplicantInfo } from './steps/Step2ApplicantInfo';
// import { Step3ShippingInfo } from './steps/Step3ShippingInfo';
// import { Step4BlessingEntries } from './steps/Step4BlessingEntries';
// import { Step5Review } from './steps/Step5Review';

interface StepInfo {
  number: number;
  title: string;
  description: string;
}

const STEPS: StepInfo[] = [
  { number: 1, title: '選擇服務', description: '選擇您需要的祈福服務' },
  { number: 2, title: '申請人資料', description: '填寫申請人聯絡資訊' },
  { number: 3, title: '收件資訊', description: '選擇配送方式與地址' },
  { number: 4, title: '祈福資料', description: '填寫祈福人詳細資料' },
  { number: 5, title: '確認送出', description: '檢視並確認申請內容' }
];

interface PrayerFormProps {
  templeId?: string;
  templeSlug?: string;
}

export function PrayerForm({ templeId: propTempleId, templeSlug: propTempleSlug }: PrayerFormProps = {}) {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<PrayerFormState>(createInitialFormState());
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templeSettings, setTempleSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Parse URL parameters
  const templeId = propTempleId || searchParams.get('temple') || '';
  const templeSlug = propTempleSlug || '';
  const servicesParam = searchParams.get('services');

  // Initialize form with pre-selected services from URL
  useEffect(() => {
    if (servicesParam) {
      const selectedServiceCodes = servicesParam.split(',').filter(code =>
        Object.values(ServiceCode).includes(code as ServiceCode)
      ) as ServiceCode[];

      if (selectedServiceCodes.length > 0) {
        setFormState(prev => ({
          ...prev,
          selectedServices: selectedServiceCodes
        }));

        toast({
          title: '已預選服務',
          description: `已為您選擇 ${selectedServiceCodes.length} 項祈福服務`,
        });
      }
    }
  }, [servicesParam, toast]);

  // Load temple-specific settings
  useEffect(() => {
    if (templeId) {
      loadTempleSettings();
    }
  }, [templeId]);

  const loadTempleSettings = async () => {
    if (!templeId) return;

    setIsLoadingSettings(true);
    try {
      const response = await fetch(`/api/temples/${templeId}/prayer-services`);
      if (!response.ok) {
        throw new Error('Failed to fetch temple settings');
      }
      const data = await response.json();

      // Transform the API response to match our expected format
      const settings = {
        services: data.services.reduce((acc: any, service: any) => {
          acc[service.serviceCode] = {
            isEnabled: service.isEnabled,
            customPrice: service.customPrice,
            maxQuantity: service.maxQuantity,
            annualLimit: service.annualLimit,
            currentCount: service.currentCount
          };
          return acc;
        }, {}),
        donation: data.donation
      };

      setTempleSettings(settings);

      // Update form state with temple-specific pricing
      if (formState.serviceSelections.length > 0) {
        const updatedSelections = formState.serviceSelections.map(selection => {
          const serviceSettings = settings.services[selection.serviceCode];
          const customPrice = serviceSettings && 'customPrice' in serviceSettings
            ? serviceSettings.customPrice
            : undefined;
          return {
            ...selection,
            unitPrice: customPrice || selection.unitPrice
          };
        });
        setFormState(prev => ({ ...prev, serviceSelections: updatedSelections }));
      }
    } catch (error) {
      console.error('Failed to load temple settings:', error);
      toast({
        title: '載入失敗',
        description: '無法載入寺廟設定，將使用預設價格',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Validate current step before proceeding
  const validateCurrentStep = (): boolean => {
    let result;

    switch (currentStep) {
      case 1:
        result = validateStep1(formState.selectedServices);
        break;
      case 2:
        result = validateStep2(formState.applicant);
        break;
      case 3:
        result = validateStep3(formState.shipping);
        break;
      case 4:
        result = validateStep4(formState.serviceSelections);
        break;
      case 5:
        // Also validate donation if present
        const donationResult = validateDonation(formState.donation);
        if (!donationResult.success) {
          setValidationErrors({ donation: ['請檢查捐贈資料'] });
          return false;
        }
        return true;
      default:
        return true;
    }

    if (!result.success) {
      // Convert Zod errors to our error format
      const errors: Record<string, string[]> = {};
      if ('errors' in result.error) {
        (result.error as any).errors.forEach((err: any) => {
          const path = err.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });
      } else {
        errors.general = [result.error.message || 'Validation failed'];
      }
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      // Initialize service selections when moving from step 1 to step 2
      if (currentStep === 1 && formState.serviceSelections.length === 0) {
        const newSelections: ServiceSelection[] = formState.selectedServices.map(code => {
          const templePrice = templeSettings?.services[code]?.customPrice;
          return {
            serviceCode: code,
            unitPrice: templePrice || PRAYER_SERVICES[code].unitPrice,
            giftLabel: PRAYER_SERVICES[code].giftLabel,
            entries: [] // Will be filled in Step 4
          };
        });
        setFormState(prev => ({ ...prev, serviceSelections: newSelections }));
      }

      // Update transaction items when moving to review
      if (currentStep === 4) {
        const transactionItems = buildTransactionItems(formState);
        setFormState(prev => ({ ...prev, transactionItems }));
      }

      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      // TODO: Submit form data to API
      console.log('Submitting form:', formState);

      // Show success message
      alert('申請已送出！我們將盡快處理您的祈福申請。');

      // Reset form
      setFormState(createInitialFormState());
      setCurrentStep(1);
    } catch (error) {
      console.error('Submit error:', error);
      alert('送出失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute totals for display
  const totals = computeTotals(formState);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex-1 flex items-center">
              <div className="relative flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all",
                    currentStep > step.number
                      ? "bg-green-600 text-white"
                      : currentStep === step.number
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-stone-200 text-stone-600"
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <div className={cn(
                    "text-sm font-medium",
                    currentStep === step.number ? "text-stone-900" : "text-stone-500"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-all",
                    currentStep > step.number ? "bg-green-600" : "bg-stone-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile step info */}
        <div className="sm:hidden mt-4 text-center">
          <div className="text-lg font-medium text-stone-900">
            {STEPS[currentStep - 1].title}
          </div>
          <div className="text-sm text-stone-500">
            {STEPS[currentStep - 1].description}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        {/* Loading indicator */}
        {isLoadingSettings && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-stone-600">載入寺廟設定中...</p>
            </div>
          </div>
        )}

        {/* Render current step component */}
        {!isLoadingSettings && currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-800">選擇祈福服務</h2>
            <p className="text-stone-600">
              {formState.selectedServices.length > 0
                ? `已為您預選 ${formState.selectedServices.length} 項服務，您可以調整選擇`
                : '請選擇您需要的祈福服務項目（可複選）'}
            </p>

            {/* Check if any services are enabled */}
            {templeSettings && !Object.values(templeSettings.services).some((s: any) => s.isEnabled) ? (
              <div className="py-12 text-center bg-stone-50 rounded-lg">
                <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <p className="text-stone-600 font-medium mb-2">目前暫無開放線上祈福服務</p>
                <p className="text-sm text-stone-500">請聯繫廟方了解更多資訊</p>
              </div>
            ) : (
            /* Display pre-selected services */
            <div className="space-y-3">
              {Object.values(ServiceCode).map(serviceCode => {
                const service = PRAYER_SERVICES[serviceCode];
                const templeService = templeSettings?.services?.[serviceCode];
                // No fallback - only show if explicitly enabled
                const isEnabled = templeService?.isEnabled === true;
                const isSelected = formState.selectedServices.includes(serviceCode);
                const price = templeService?.customPrice || service.unitPrice;

                if (!isEnabled) return null;

                return (
                  <div
                    key={serviceCode}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all",
                      isSelected
                        ? "border-red-500 bg-red-50"
                        : "border-stone-200 hover:border-stone-300"
                    )}
                    onClick={() => {
                      setFormState(prev => ({
                        ...prev,
                        selectedServices: isSelected
                          ? prev.selectedServices.filter(s => s !== serviceCode)
                          : [...prev.selectedServices, serviceCode]
                      }));
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-red-600 rounded"
                          />
                          <span className="font-medium text-stone-800">{service.displayName}</span>
                          <span className="text-sm text-stone-500">NT$ {price}</span>
                        </div>
                        <p className="mt-1 ml-6 text-sm text-stone-600">{service.shortGoal}</p>
                        <p className="mt-1 ml-6 text-xs text-stone-500">贈品：{service.giftLabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Donation option */}
              {templeSettings?.donation?.isEnabled && (
                <div className="mt-4 p-4 border border-amber-300 bg-amber-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!formState.donation}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormState(prev => ({
                            ...prev,
                            donation: {
                              amount: templeSettings.donation.minAmount || 100,
                              isAnonymous: false,
                              category: 'general'
                            }
                          }));
                        } else {
                          setFormState(prev => ({
                            ...prev,
                            donation: undefined
                          }));
                        }
                      }}
                      className="w-4 h-4 text-amber-600 rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-stone-800">線上功德金</div>
                      <p className="text-sm text-stone-600 mt-1">
                        隨喜捐贈，護持道場（建議最低 NT$ {templeSettings?.donation?.minAmount || 100}）
                      </p>
                      {formState.donation && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {templeSettings.donation.suggestedAmounts.map((amount: number) => (
                            <button
                              key={amount}
                              onClick={() => setFormState(prev => ({
                                ...prev,
                                donation: prev.donation ? { ...prev.donation, amount } : undefined
                              }))}
                              className={cn(
                                "px-3 py-1 text-sm rounded-full border transition-all",
                                formState.donation?.amount === amount
                                  ? "bg-amber-500 text-white border-amber-500"
                                  : "bg-white border-stone-300 hover:border-amber-400"
                              )}
                            >
                              NT$ {amount}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}

            {formState.selectedServices.length === 0 && !formState.donation && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">請至少選擇一項祈福服務或功德金</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-800">申請人資料</h2>
            <p className="text-stone-600">請填寫申請人聯絡資訊，以便我們與您聯繫</p>
            {/* TODO: Implement Step2ApplicantInfo component */}
            <div className="text-center text-stone-400 py-12">
              Step 2: Applicant Info Component
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-800">收件資訊</h2>
            <p className="text-stone-600">請選擇您的收件方式與地址</p>
            {/* TODO: Implement Step3ShippingInfo component */}
            <div className="text-center text-stone-400 py-12">
              Step 3: Shipping Info Component
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-800">祈福人資料</h2>
            <p className="text-stone-600">請填寫每位祈福人的詳細資料</p>
            {/* TODO: Implement Step4BlessingEntries component */}
            <div className="text-center text-stone-400 py-12">
              Step 4: Blessing Entries Component
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-800">確認申請內容</h2>
            <p className="text-stone-600">請確認您的申請資料是否正確</p>
            {/* TODO: Implement Step5Review component */}
            <div className="text-center text-stone-400 py-12">
              Step 5: Review Component
              <div className="mt-4 p-4 bg-stone-50 rounded-lg">
                <div className="text-left text-sm text-stone-600">
                  <p>祈福服務費用：{totals.servicesTotal} 元</p>
                  <p>功德金：{totals.donationTotal} 元</p>
                  <p>運費：{totals.shippingFee} 元</p>
                  <p className="font-bold text-lg text-stone-900 mt-2">
                    總計：{totals.grandTotal} 元
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors Display */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">請修正以下錯誤：</p>
            <ul className="mt-2 list-disc list-inside text-sm text-red-600">
              {Object.entries(validationErrors).map(([field, errors]) => (
                errors.map((error, index) => (
                  <li key={`${field}-${index}`}>{error}</li>
                ))
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
            currentStep === 1
              ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          上一步
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            下一步
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all",
              isSubmitting
                ? "bg-stone-400 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                送出中...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                確認送出
              </>
            )}
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-stone-500">
        如有任何問題，請聯繫廟方服務人員
        <br />
        服務專線：(02) 1234-5678
      </div>
    </div>
  );
}