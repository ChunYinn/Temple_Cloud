/**
 * Taiwan Temple Online Prayer Application Form - Helper Functions
 * 台灣寺廟線上祈福申請表 - 輔助函式
 */

import {
  BirthInput,
  PrayerFormState,
  ComputedTotals,
  ServiceCode,
  Gender,
  CalendarType,
  YearType,
  AddressType,
  ShippingOption,
  DomesticAddress,
  OverseasAddress,
  TransactionItem,
  TransactionItemType,
  BlessingEntry
} from './types';

// ========================
// Date Conversion Helpers
// ========================

/**
 * Convert ROC year to AD year
 * 民國年轉西元年
 */
export const rocToAd = (year: number): number => {
  return year + 1911;
};

/**
 * Convert AD year to ROC year
 * 西元年轉民國年
 */
export const adToRoc = (year: number): number => {
  return year - 1911;
};

/**
 * Format birth date for display
 * 格式化生日顯示
 * @example "1130101(國)" or "1121215(農)"
 */
export const formatBirth = (birth: BirthInput): string => {
  const { calendarType, yearType, year, month, day } = birth;

  // Format year based on type
  let displayYear = year;
  if (yearType === YearType.ROC) {
    displayYear = year;
  } else if (yearType === YearType.AD) {
    // Convert to ROC for display
    displayYear = adToRoc(year);
  }

  // Pad month and day with zeros
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');

  // Calendar type suffix
  const suffix = calendarType === CalendarType.SOLAR ? '國' : '農';

  return `${displayYear}${monthStr}${dayStr}(${suffix})`;
};

/**
 * Format full birth date with both calendar types if different
 */
export const formatFullBirth = (birth: BirthInput): string => {
  const base = formatBirth(birth);

  // If user selected AD year, also show the AD year
  if (birth.yearType === YearType.AD) {
    const monthStr = String(birth.month).padStart(2, '0');
    const dayStr = String(birth.day).padStart(2, '0');
    return `${base}；西元${birth.year}/${monthStr}/${dayStr}`;
  }

  return base;
};

// ========================
// Address Formatting
// ========================

/**
 * Format domestic address for display
 */
export const formatDomesticAddress = (addr: DomesticAddress): string => {
  return `${addr.zip} ${addr.city}${addr.district}${addr.line1}`;
};

/**
 * Format overseas address for display
 */
export const formatOverseasAddress = (addr: OverseasAddress): string => {
  const parts = [
    addr.line1,
    addr.line2,
    addr.city,
    addr.state,
    addr.postalCode,
    addr.country
  ].filter(Boolean);

  return parts.join(', ');
};

/**
 * Format any address based on type
 */
export const formatAddress = (
  addressType: AddressType,
  domesticAddress?: DomesticAddress,
  overseasAddress?: OverseasAddress
): string => {
  if (addressType === AddressType.DOMESTIC && domesticAddress) {
    return formatDomesticAddress(domesticAddress);
  }
  if (addressType === AddressType.OVERSEAS && overseasAddress) {
    return formatOverseasAddress(overseasAddress);
  }
  return '';
};

// ========================
// Gender Display
// ========================

export const formatGender = (gender: Gender): string => {
  switch (gender) {
    case Gender.MALE:
      return '男';
    case Gender.FEMALE:
      return '女';
    case Gender.UNSPECIFIED:
      return '不指定';
    default:
      return '';
  }
};

// ========================
// Financial Calculations
// ========================

/**
 * Build transaction items from form state
 */
export const buildTransactionItems = (state: PrayerFormState): TransactionItem[] => {
  const items: TransactionItem[] = [];

  // Add service items
  state.serviceSelections.forEach(selection => {
    const qty = selection.entries.length;
    items.push({
      type: TransactionItemType.SERVICE,
      serviceCode: selection.serviceCode,
      unitPrice: selection.unitPrice,
      qty,
      subtotal: selection.unitPrice * qty
    });
  });

  // Add donation if present
  if (state.donation && state.donation.amount > 0) {
    items.push({
      type: TransactionItemType.DONATION,
      category: 'general',
      amount: state.donation.amount
    });
  }

  return items;
};

/**
 * Compute totals from form state
 */
export const computeTotals = (state: PrayerFormState): ComputedTotals => {
  let servicesTotal = 0;
  let donationTotal = 0;

  // Calculate services total
  state.serviceSelections.forEach(selection => {
    const qty = selection.entries.length;
    servicesTotal += selection.unitPrice * qty;
  });

  // Calculate donation total
  if (state.donation) {
    donationTotal = state.donation.amount;
  }

  // Shipping fee (currently 0, can be modified based on shipping option)
  const shippingFee = 0;

  // Grand total
  const grandTotal = servicesTotal + donationTotal + shippingFee;

  return {
    servicesTotal,
    donationTotal,
    shippingFee,
    grandTotal
  };
};

// ========================
// Review Page Formatting
// ========================

// Helper functions for building review lines sections
const buildApplicantSection = (applicant: PrayerFormState['applicant']): string[] => {
  const lines: string[] = [];
  lines.push(
    '【申請人資料】',
    `姓名：${applicant.name}`,
    `手機：${applicant.mobile}`
  );
  if (applicant.email) {
    lines.push(`電子郵件：${applicant.email}`);
  }
  lines.push('');
  return lines;
};

const buildShippingSection = (shipping: PrayerFormState['shipping']): string[] => {
  const lines: string[] = [];
  if (shipping.option === 'none') return lines;

  lines.push('【收件資料】');
  if (shipping.sameAsApplicant) {
    lines.push('同申請人資料');
  } else {
    lines.push(`收件人：${shipping.recipientName}`);
    lines.push(`聯絡電話：${shipping.recipientMobile}`);
    let address = '';
    if (shipping.addressType && shipping.domesticAddress) {
      address = formatDomesticAddress(shipping.domesticAddress);
    } else if (shipping.addressType && shipping.overseasAddress) {
      address = formatOverseasAddress(shipping.overseasAddress);
    }
    if (address) lines.push(`地址：${address}`);
  }
  lines.push('');
  return lines;
};

const buildBlessingEntry = (entry: BlessingEntry, entryNumber: number, serviceName: string, unitPrice: number): string[] => {
  const lines: string[] = [];
  lines.push(
    `${entryNumber}. 祈福姓名：${entry.name}`,
    `   性別：${formatGender(entry.gender)}`,
    `   生日：${formatFullBirth(entry.birth)}`,
    `   居住地址：${formatAddress(entry.addressType, entry.domesticAddress, entry.overseasAddress)}`,
    `   服務：${serviceName}`,
    `   金額：${unitPrice} 元`
  );
  if (entry.note) {
    lines.push(`   備註：${entry.note}`);
  }
  lines.push('');
  return lines;
};

const buildDonationSection = (donation: PrayerFormState['donation'], applicantName: string): string[] => {
  const lines: string[] = [];
  if (donation && donation.amount > 0) {
    lines.push(
      '【功德金】',
      `金額：${donation.amount} 元`
    );
    const donorName = donation.isAnonymous
      ? '善心人士'
      : donation.donorName || applicantName;
    lines.push(`捐贈人：${donorName}`);
    if (donation.note) {
      lines.push(`備註：${donation.note}`);
    }
    lines.push('');
  }
  return lines;
};

const buildTotalsSection = (totals: ReturnType<typeof computeTotals>): string[] => {
  const lines: string[] = [];
  lines.push(
    '【費用明細】',
    `祈福服務費用：${totals.servicesTotal} 元`
  );
  if (totals.donationTotal > 0) {
    lines.push(`功德金：${totals.donationTotal} 元`);
  }
  if (totals.shippingFee > 0) {
    lines.push(`運費：${totals.shippingFee} 元`);
  }
  lines.push(`總計：${totals.grandTotal} 元`);
  lines.push('');
  return lines;
};

/**
 * Build review lines for printing/display
 */
export const buildReviewLines = (state: PrayerFormState): string[] => {
  const lines: string[] = [];
  let entryNumber = 1;

  // Header
  lines.push('========== 祈福申請單 ==========');
  lines.push('');

  // Add sections
  lines.push(...buildApplicantSection(state.applicant));
  lines.push(...buildShippingSection(state.shipping));

  // Blessing entries
  lines.push('【祈福項目】');
  state.serviceSelections.forEach(selection => {
    const serviceName = getServiceDisplayName(selection.serviceCode);
    selection.entries.forEach(entry => {
      lines.push(...buildBlessingEntry(entry, entryNumber, serviceName, selection.unitPrice));
      entryNumber++;
    });
  });

  // Add donation and totals
  lines.push(...buildDonationSection(state.donation, state.applicant.name));
  lines.push(...buildTotalsSection(computeTotals(state)));

  lines.push('========== 申請單結束 ==========');
  return lines;
};

/**
 * Get service display name helper
 */
export const getServiceDisplayName = (serviceCode: ServiceCode): string => {
  const names: Record<ServiceCode, string> = {
    [ServiceCode.TAISUI]: '安太歲',
    [ServiceCode.GUANGMING]: '光明燈',
    [ServiceCode.WENCHANG]: '文昌燈',
    [ServiceCode.BAIDOU]: '拜斗',
    [ServiceCode.YUELAO]: '月老姻緣簿'
  };
  return names[serviceCode] || serviceCode;
};

// ========================
// Form State Initialization
// ========================

/**
 * Create initial form state
 */
export const createInitialFormState = (): PrayerFormState => {
  return {
    selectedServices: [],
    applicant: {
      name: '',
      mobile: '',
      email: ''
    },
    shipping: {
      option: ShippingOption.NONE,
      sameAsApplicant: false
    },
    serviceSelections: [],
    donation: undefined,
    transactionItems: []
  };
};

/**
 * Create empty blessing entry
 */
export const createEmptyBlessingEntry = (): any => {
  return {
    name: '',
    gender: Gender.UNSPECIFIED,
    birth: {
      calendarType: CalendarType.SOLAR,
      yearType: YearType.ROC,
      year: new Date().getFullYear() - 1911, // Current ROC year
      month: 1,
      day: 1
    },
    addressType: AddressType.DOMESTIC,
    note: ''
  };
};

// ========================
// Validation Helpers
// ========================

/**
 * Check if a service requires special note handling
 */
export const hasSpecialNote = (serviceCode: ServiceCode): boolean => {
  return serviceCode === ServiceCode.YUELAO;
};

/**
 * Get special note placeholder text
 */
export const getSpecialNotePlaceholder = (serviceCode: ServiceCode): string => {
  if (serviceCode === ServiceCode.YUELAO) {
    return '可填寫有緣人姓名';
  }
  return '備註（選填）';
};

// ========================
// Order Number Generation
// ========================

/**
 * Generate order number
 * Format: ORDYYYYMMDDHHMMSS
 */
export const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `ORD${year}${month}${day}${hours}${minutes}${seconds}`;
};