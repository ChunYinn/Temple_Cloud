/**
 * Taiwan Temple Online Prayer Application Form - Service Definitions
 * 台灣寺廟線上祈福申請表 - 服務定義
 */

import { ServiceCode, ServiceDefinition } from './types';

/**
 * Complete service definitions with content
 * 完整的服務定義與內容
 */
export const PRAYER_SERVICES: Record<ServiceCode, ServiceDefinition> = {
  [ServiceCode.TAISUI]: {
    serviceCode: ServiceCode.TAISUI,
    displayName: '安太歲',
    shortGoal: '祈求流年平安、諸事順遂',
    audience: '肖馬、鼠、兔、雞之犯太歲民眾（可依廟方每年公告調整）',
    unitPrice: 800,
    feeText: '每盞燈新台幣 800 元整',
    giftLabel: '香火袋',
    longDescription: '太歲星君俗稱太歲或歲君，負責掌管人間的吉凶禍福。俗諺云：太歲當頭坐，無喜必有禍。太歲出現來，無病恐破財。為趨吉避凶，必須「安太歲」，以祈求來年平安，諸事順遂。',
    specialNote: '可搭配光明燈一同安奉（依廟方作法）'
  },

  [ServiceCode.GUANGMING]: {
    serviceCode: ServiceCode.GUANGMING,
    displayName: '光明燈',
    shortGoal: '祈求元辰光彩、補運助氣',
    audience: '欲求平安順遂、諸事大吉之民眾',
    unitPrice: 800,
    feeText: '每盞燈新台幣 800 元整',
    giftLabel: '香火袋',
    longDescription: '燈是元神的象徵，點光明燈即是將姓名、生辰、住址書寫於燈上，拜請神明保佑，以點亮光明來增添元辰光采，期許為個人補運助氣、增福益壽，避免運途不順、官災、小人等。光明燈又名消災燈，適用於本命年非犯太歲者；而犯太歲者除了安太歲之外，也可以點光明燈，以祈求身體健康，前程光明。',
    specialNote: undefined
  },

  [ServiceCode.WENCHANG]: {
    serviceCode: ServiceCode.WENCHANG,
    displayName: '文昌燈',
    shortGoal: '祈求金榜題名、工作升遷',
    audience: '學生、領薪水之上班族',
    unitPrice: 800,
    feeText: '每盞燈新台幣 800 元整',
    giftLabel: '香火袋',
    longDescription: '文昌帝君是掌管功名之神，主宰士子的功名利祿。點文昌燈旨在於祈求文昌帝君的加持庇佑，期許個人在求學路上或求職路上能智慧大開、步步高昇。文昌燈不僅適用於讀書人也適用於一般的上班族。讀書人祈求金榜題名、學業成就；上班族祈求工作升遷、仕途如意。',
    specialNote: undefined
  },

  [ServiceCode.BAIDOU]: {
    serviceCode: ServiceCode.BAIDOU,
    displayName: '拜斗',
    shortGoal: '祈求消災解厄、延壽增福、補運轉運',
    audience: '欲補運、消災、祈福延壽之善信',
    unitPrice: 800,
    feeText: '每份新台幣 800 元整（依廟方規定調整）',
    giftLabel: '香火袋（或依廟方）',
    longDescription: '拜斗為道教重要科儀之一，藉由禮斗上達星曹，祈請北斗星君與諸星曜護佑，以達消災解厄、補運轉運、增福延壽之意。廟方將擇良辰吉日舉行儀式，代為呈疏禮斗，祈願信眾流年平安順利、諸事吉祥。',
    specialNote: undefined
  },

  [ServiceCode.YUELAO]: {
    serviceCode: ServiceCode.YUELAO,
    displayName: '月老姻緣簿',
    shortGoal: '祈求姻緣順利、婚姻美滿',
    audience: '未婚或已婚男女，祈求姻緣順利者',
    unitPrice: 800,
    feeText: '每份新台幣 800 元整',
    giftLabel: '天賜良緣御守',
    longDescription: '月下老人簡稱月老，專司姻緣。廟務人員會為其填寫姻緣疏文上奏月老星君，擇良辰吉日於月老廳舉行儀式，完成姻緣簿登記，為信眾祈賜良緣。',
    specialNote: '備註欄可登記「有緣人」姓名'
  }
};

/**
 * Get service by code
 */
export const getServiceDefinition = (serviceCode: ServiceCode): ServiceDefinition => {
  return PRAYER_SERVICES[serviceCode];
};

/**
 * Get all services as array
 */
export const getAllServices = (): ServiceDefinition[] => {
  return Object.values(PRAYER_SERVICES);
};

/**
 * Service icons for UI display
 */
export const SERVICE_ICONS: Record<ServiceCode, string> = {
  [ServiceCode.TAISUI]: '⭐',
  [ServiceCode.GUANGMING]: '🪔',
  [ServiceCode.WENCHANG]: '📚',
  [ServiceCode.BAIDOU]: '✨',
  [ServiceCode.YUELAO]: '💝'
};

/**
 * Service colors for UI theming
 */
export const SERVICE_COLORS: Record<ServiceCode, string> = {
  [ServiceCode.TAISUI]: 'from-amber-500 to-amber-600',
  [ServiceCode.GUANGMING]: 'from-red-500 to-red-600',
  [ServiceCode.WENCHANG]: 'from-blue-500 to-blue-600',
  [ServiceCode.BAIDOU]: 'from-purple-500 to-purple-600',
  [ServiceCode.YUELAO]: 'from-pink-500 to-pink-600'
};

/**
 * Donation configuration
 */
export const DONATION_CONFIG = {
  category: 'general' as const,
  displayName: '功德金／隨喜捐贈',
  minAmount: 100,
  defaultAmounts: [100, 300, 500, 1000, 3000, 5000],
  placeholder: '請輸入捐贈金額',
  anonymousLabel: '不具名捐贈',
  noteLabel: '捐贈備註',
  notePlaceholder: '您的祝福或迴向文（選填）'
};

/**
 * Shipping fee configuration
 */
export const SHIPPING_CONFIG = {
  domestic: {
    fee: 0,  // Currently free
    label: '國內配送',
    estimatedDays: '3-5 個工作天'
  },
  overseas: {
    fee: 0,  // Currently free, can be updated
    label: '海外配送',
    estimatedDays: '7-14 個工作天'
  },
  none: {
    fee: 0,
    label: '不需配送',
    description: '自行至廟方領取'
  }
};