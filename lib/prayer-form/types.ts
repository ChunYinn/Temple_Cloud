/**
 * Taiwan Temple Online Prayer Application Form - Type Definitions
 * 台灣寺廟線上祈福申請表 - 型別定義
 */

// ========================
// Enums
// ========================

export enum ServiceCode {
  TAISUI = 'taisui',        // 安太歲
  GUANGMING = 'guangming',  // 光明燈
  WENCHANG = 'wenchang',    // 文昌燈
  BAIDOU = 'baidou',        // 拜斗
  YUELAO = 'yuelao'         // 月老姻緣簿
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNSPECIFIED = 'unspecified'
}

export enum CalendarType {
  SOLAR = 'solar',    // 國曆
  LUNAR = 'lunar'     // 農曆
}

export enum YearType {
  ROC = 'roc',       // 民國
  AD = 'ad'          // 西元
}

export enum AddressType {
  DOMESTIC = 'domestic',
  OVERSEAS = 'overseas'
}

export enum ShippingOption {
  DOMESTIC = 'domestic',
  OVERSEAS = 'overseas',
  NONE = 'none'
}

export enum TransactionItemType {
  SERVICE = 'service',
  DONATION = 'donation'
}

// ========================
// Core Interfaces
// ========================

export interface Applicant {
  name: string;
  mobile: string;          // Taiwan mobile only (09xxxxxxxx)
  email?: string;
}

export interface DomesticAddress {
  country: 'TW';
  city: string;            // dropdown selection
  district: string;        // dropdown selection
  zip: string;             // 3 or 5 digits
  line1: string;           // street address
}

export interface OverseasAddress {
  country: string;         // country code or free text
  city: string;
  state?: string;
  postalCode: string;
  line1: string;
  line2?: string;
}

export interface Shipping {
  option: ShippingOption;
  sameAsApplicant: boolean;
  recipientName?: string;
  recipientMobile?: string;
  addressType?: AddressType;
  domesticAddress?: DomesticAddress;
  overseasAddress?: OverseasAddress;
}

export interface BirthInput {
  calendarType: CalendarType;
  yearType: YearType;
  year: number;
  month: number;
  day: number;
  computedAdYear?: number;  // if yearType=ROC, store year+1911
}

export interface BlessingEntry {
  id?: string;              // for UI key tracking
  name: string;
  gender: Gender;
  birth: BirthInput;
  addressType: AddressType;
  domesticAddress?: DomesticAddress;
  overseasAddress?: OverseasAddress;
  note?: string;            // for 月老: can fill "有緣人"
}

export interface ServiceSelection {
  serviceCode: ServiceCode;
  unitPrice: number;
  giftLabel: string;
  entries: BlessingEntry[];
}

export interface Donation {
  category: 'general';      // fixed for now
  amount: number;
  donorName?: string;       // defaults to applicant.name
  note?: string;
  isAnonymous?: boolean;
}

// Transaction Items for review and payment
export type ServiceTransactionItem = {
  type: TransactionItemType.SERVICE;
  serviceCode: ServiceCode;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

export type DonationTransactionItem = {
  type: TransactionItemType.DONATION;
  category: 'general';
  amount: number;
}

export type TransactionItem = ServiceTransactionItem | DonationTransactionItem;

// ========================
// Form State
// ========================

export interface PrayerFormState {
  // Step 1: Service Selection
  selectedServices: ServiceCode[];

  // Step 2: Applicant Info
  applicant: Applicant;

  // Step 3: Shipping Info
  shipping: Shipping;

  // Step 4: Blessing Entries
  serviceSelections: ServiceSelection[];

  // Optional: Donation
  donation?: Donation;

  // Computed for review
  transactionItems: TransactionItem[];
}

// ========================
// Service Definition
// ========================

export interface ServiceDefinition {
  serviceCode: ServiceCode;
  displayName: string;
  shortGoal: string;
  audience: string;
  feeText: string;
  unitPrice: number;
  giftLabel: string;
  longDescription: string;
  specialNote?: string;
}

// ========================
// Computed Totals
// ========================

export interface ComputedTotals {
  servicesTotal: number;
  donationTotal: number;
  shippingFee: number;
  grandTotal: number;
}

// ========================
// Review Display
// ========================

export interface ReviewEntry {
  name: string;
  gender: string;
  birthText: string;
  address: string;
  service: string;
  amount: number;
  note?: string;
}

// ========================
// City/District Data (for Taiwan addresses)
// ========================

export interface District {
  name: string;
  zip: string;
}

export interface City {
  name: string;
  districts: District[];
}