'use client';

import { cn } from '@/lib/utils';
import { ServiceCode } from '@/lib/prayer-form/types';
import { PRAYER_SERVICES } from '@/lib/prayer-form/services';

// Component for donation amount selection buttons
export function DonationAmountSelector({
  suggestedAmounts,
  currentAmount,
  onAmountSelect
}: {
  suggestedAmounts: number[];
  currentAmount?: number;
  onAmountSelect: (amount: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestedAmounts.map((amount) => (
        <button
          key={amount}
          onClick={() => onAmountSelect(amount)}
          className={cn(
            "px-3 py-1 text-sm rounded-full border transition-all",
            currentAmount === amount
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white border-stone-300 hover:border-amber-400"
          )}
        >
          NT$ {amount}
        </button>
      ))}
    </div>
  );
}

// Component for donation section
export function DonationSection({
  templeSettings,
  donation,
  onDonationChange
}: {
  templeSettings: any;
  donation?: any;
  onDonationChange: (donation: any) => void;
}) {
  const handleToggle = (checked: boolean) => {
    if (checked) {
      onDonationChange({
        amount: templeSettings.donation.minAmount || 100,
        isAnonymous: false,
        category: 'general'
      });
    } else {
      onDonationChange(undefined);
    }
  };

  const handleAmountSelect = (amount: number) => {
    if (donation) {
      onDonationChange({ ...donation, amount });
    }
  };

  if (!templeSettings?.donation?.isEnabled) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border border-amber-300 bg-amber-50 rounded-lg">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={!!donation}
          onChange={(e) => handleToggle(e.target.checked)}
          className="w-4 h-4 text-amber-600 rounded mt-0.5"
        />
        <div className="flex-1">
          <div className="font-medium text-stone-800">線上功德金</div>
          <p className="text-sm text-stone-600 mt-1">
            隨喜捐贈，護持道場（建議最低 NT$ {templeSettings?.donation?.minAmount || 100}）
          </p>
          {donation && (
            <DonationAmountSelector
              suggestedAmounts={templeSettings.donation.suggestedAmounts}
              currentAmount={donation.amount}
              onAmountSelect={handleAmountSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Component for service selection
export function ServiceSelection({
  templeSettings,
  selectedServices,
  onServiceToggle
}: {
  templeSettings: any;
  selectedServices: ServiceCode[];
  onServiceToggle: (serviceCode: ServiceCode) => void;
}) {
  if (!templeSettings?.services || Object.keys(templeSettings.services).length === 0) {
    return (
      <div className="text-center py-8 bg-stone-50 rounded-lg">
        <p className="text-stone-600">此寺廟尚未開放線上祈福服務</p>
        <p className="text-sm text-stone-500">請聯繫廟方了解更多資訊</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.values(ServiceCode).map(serviceCode => {
        const service = PRAYER_SERVICES[serviceCode];
        const templeService = templeSettings?.services?.[serviceCode];
        const isSelected = selectedServices.includes(serviceCode);

        if (!templeService?.isEnabled) {
          return null;
        }

        return (
          <ServiceItem
            key={serviceCode}
            service={service}
            templeService={templeService}
            isSelected={isSelected}
            onToggle={() => onServiceToggle(serviceCode)}
          />
        );
      })}
    </div>
  );
}

// ServiceItem component (moved from inline)
function ServiceItem({
  service,
  templeService,
  isSelected,
  onToggle
}: {
  service: any;
  templeService: any;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border-2 transition-all cursor-pointer",
        isSelected
          ? "border-red-500 bg-red-50"
          : "border-stone-200 hover:border-stone-300"
      )}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`選擇 ${service.displayName}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4 text-red-600 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="font-medium text-stone-800">{service.displayName}</span>
          </div>
          <p className="text-sm text-stone-600 mt-1 ml-6">{service.description}</p>
          {templeService?.customPrice && (
            <p className="text-sm font-medium text-red-600 mt-2 ml-6">
              NT$ {templeService.customPrice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}