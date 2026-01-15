/**
 * Taiwan Temple Online Prayer Application Form - Validation Schemas
 * 台灣寺廟線上祈福申請表 - 驗證架構
 */

import { z } from 'zod';
import {
  ServiceCode,
  Gender,
  CalendarType,
  YearType,
  AddressType,
  ShippingOption,
  TransactionItemType
} from './types';

// ========================
// Regular Expressions
// ========================

const TAIWAN_MOBILE_REGEX = /^09\d{8}$/;
const TAIWAN_ZIP_REGEX = /^\d{3}$|^\d{5}$/;

// ========================
// Error Messages (Traditional Chinese)
// ========================

const ErrorMessages = {
  required: '此欄位為必填',
  invalidMobile: '請輸入有效的台灣手機號碼 (09xxxxxxxx)',
  invalidEmail: '請輸入有效的電子郵件地址',
  nameTooShort: '姓名至少需要 2 個字',
  nameTooLong: '姓名不可超過 40 個字',
  invalidZip: '請輸入有效的郵遞區號 (3 或 5 碼)',
  invalidMonth: '月份必須在 1-12 之間',
  invalidDay: '日期必須在 1-31 之間',
  minAmount: '金額必須至少為 1 元',
  minDonation: '捐贈金額必須至少為 100 元'
};

// ========================
// Address Schemas
// ========================

export const DomesticAddressSchema = z.object({
  country: z.literal('TW'),
  city: z.string().min(1, ErrorMessages.required),
  district: z.string().min(1, ErrorMessages.required),
  zip: z.string().regex(TAIWAN_ZIP_REGEX, ErrorMessages.invalidZip),
  line1: z.string().min(1, ErrorMessages.required)
});

export const OverseasAddressSchema = z.object({
  country: z.string().min(1, ErrorMessages.required),
  city: z.string().min(1, ErrorMessages.required),
  state: z.string().optional(),
  postalCode: z.string().min(1, ErrorMessages.required),
  line1: z.string().min(1, ErrorMessages.required),
  line2: z.string().optional()
});

// ========================
// Core Schemas
// ========================

export const ApplicantSchema = z.object({
  name: z.string()
    .trim()
    .min(2, ErrorMessages.nameTooShort)
    .max(40, ErrorMessages.nameTooLong),
  mobile: z.string()
    .regex(TAIWAN_MOBILE_REGEX, ErrorMessages.invalidMobile),
  email: z.string()
    .email(ErrorMessages.invalidEmail)
    .optional()
    .or(z.literal(''))
});

export const BirthInputSchema = z.object({
  calendarType: z.nativeEnum(CalendarType),
  yearType: z.nativeEnum(YearType),
  year: z.number().min(1, '請輸入有效年份'),
  month: z.number().min(1).max(12, ErrorMessages.invalidMonth),
  day: z.number().min(1).max(31, ErrorMessages.invalidDay),
  computedAdYear: z.number().optional()
}).refine((data) => {
  // Auto-compute AD year if ROC is selected
  if (data.yearType === YearType.ROC) {
    data.computedAdYear = data.year + 1911;
  }
  return true;
});

export const BlessingEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, ErrorMessages.required),
  gender: z.nativeEnum(Gender),
  birth: BirthInputSchema,
  addressType: z.nativeEnum(AddressType),
  domesticAddress: DomesticAddressSchema.optional(),
  overseasAddress: OverseasAddressSchema.optional(),
  note: z.string().optional()
}).refine((data) => {
  // Validate address based on addressType
  if (data.addressType === AddressType.DOMESTIC) {
    return data.domesticAddress !== undefined;
  }
  if (data.addressType === AddressType.OVERSEAS) {
    return data.overseasAddress !== undefined;
  }
  return true;
}, {
  message: '請提供完整的地址資訊'
});

// ========================
// Shipping Schema with Conditional Logic
// ========================

export const ShippingSchema = z.object({
  option: z.nativeEnum(ShippingOption),
  sameAsApplicant: z.boolean(),
  recipientName: z.string().optional(),
  recipientMobile: z.string().optional(),
  addressType: z.nativeEnum(AddressType).optional(),
  domesticAddress: DomesticAddressSchema.optional(),
  overseasAddress: OverseasAddressSchema.optional()
}).superRefine((data, ctx) => {
  // If shipping option is NONE, no other fields required
  if (data.option === ShippingOption.NONE) {
    return;
  }

  // If shipping is needed and not same as applicant
  if (!data.sameAsApplicant) {
    // Recipient name required
    if (!data.recipientName || data.recipientName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '請輸入收件人姓名',
        path: ['recipientName']
      });
    }

    // Recipient mobile required
    if (!data.recipientMobile || !TAIWAN_MOBILE_REGEX.test(data.recipientMobile)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ErrorMessages.invalidMobile,
        path: ['recipientMobile']
      });
    }

    // Address type required
    if (!data.addressType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '請選擇地址類型',
        path: ['addressType']
      });
    }

    // Validate address based on type
    if (data.addressType === AddressType.DOMESTIC && !data.domesticAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '請提供國內地址',
        path: ['domesticAddress']
      });
    }

    if (data.addressType === AddressType.OVERSEAS && !data.overseasAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '請提供海外地址',
        path: ['overseasAddress']
      });
    }
  }
});

// ========================
// Service and Donation Schemas
// ========================

export const ServiceSelectionSchema = z.object({
  serviceCode: z.nativeEnum(ServiceCode),
  unitPrice: z.number().min(1, ErrorMessages.minAmount),
  giftLabel: z.string(),
  entries: z.array(BlessingEntrySchema).min(1, '至少需要一位祈福人')
});

export const DonationSchema = z.object({
  category: z.literal('general'),
  amount: z.number().min(100, ErrorMessages.minDonation),
  donorName: z.string().optional(),
  note: z.string().optional(),
  isAnonymous: z.boolean().optional()
});

// ========================
// Transaction Items
// ========================

export const ServiceTransactionItemSchema = z.object({
  type: z.literal(TransactionItemType.SERVICE),
  serviceCode: z.nativeEnum(ServiceCode),
  unitPrice: z.number(),
  qty: z.number(),
  subtotal: z.number()
});

export const DonationTransactionItemSchema = z.object({
  type: z.literal(TransactionItemType.DONATION),
  category: z.literal('general'),
  amount: z.number()
});

export const TransactionItemSchema = z.discriminatedUnion('type', [
  ServiceTransactionItemSchema,
  DonationTransactionItemSchema
]);

// ========================
// Complete Form Schema
// ========================

export const PrayerFormSchema = z.object({
  // Step 1: Service Selection
  selectedServices: z.array(z.nativeEnum(ServiceCode))
    .min(1, '請至少選擇一項服務'),

  // Step 2: Applicant Info
  applicant: ApplicantSchema,

  // Step 3: Shipping Info
  shipping: ShippingSchema,

  // Step 4: Blessing Entries
  serviceSelections: z.array(ServiceSelectionSchema),

  // Optional: Donation
  donation: DonationSchema.optional(),

  // Computed for review
  transactionItems: z.array(TransactionItemSchema)
});

// ========================
// Step-by-Step Validation
// ========================

export const validateStep1 = (selectedServices: ServiceCode[]) => {
  return z.array(z.nativeEnum(ServiceCode))
    .min(1, '請至少選擇一項服務')
    .safeParse(selectedServices);
};

export const validateStep2 = (applicant: any) => {
  return ApplicantSchema.safeParse(applicant);
};

export const validateStep3 = (shipping: any) => {
  return ShippingSchema.safeParse(shipping);
};

export const validateStep4 = (serviceSelections: any) => {
  return z.array(ServiceSelectionSchema).safeParse(serviceSelections);
};

export const validateDonation = (donation: any) => {
  if (!donation) return { success: true };
  return DonationSchema.safeParse(donation);
};

// Type exports for use in components
export type ApplicantInput = z.infer<typeof ApplicantSchema>;
export type ShippingInput = z.infer<typeof ShippingSchema>;
export type BlessingEntryInput = z.infer<typeof BlessingEntrySchema>;
export type ServiceSelectionInput = z.infer<typeof ServiceSelectionSchema>;
export type DonationInput = z.infer<typeof DonationSchema>;
export type PrayerFormInput = z.infer<typeof PrayerFormSchema>;