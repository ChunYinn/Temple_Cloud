// =============================================
// APP CONFIGURATION CONSTANTS
// =============================================

// Branding
export const BRAND = {
  name: '廟務雲',
  url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  tagline: '寺廟數位管理平台',
  description: '為您的寺廟打造專屬數位門戶',
  copyright: (year: number) => `© ${year}, All Rights Reserved.`,
  poweredBy: '廟務雲'
} as const;

// Temple Default Values
export const TEMPLE_DEFAULTS = {
  avatar: '🏛️',
  hours: '每日 06:00 - 21:00',
  timezone: 'Asia/Taipei',
  coverImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=800&fit=crop',
  stats: {
    visitors: '10K+',
    followers: 1234
  }
} as const;

// Navigation Items
export const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: '首頁' },
  { id: 'services', icon: '🪔', label: '服務' },
  { id: 'events', icon: '📅', label: '活動' },
  { id: 'about', icon: 'ℹ️', label: '關於' }
] as const;

// Quick Actions
export const QUICK_ACTIONS = [
  { icon: '💰', label: '香油錢', color: 'from-amber-400 to-amber-500' },
  { icon: '🪔', label: '點燈', color: 'from-red-400 to-red-500' },
  { icon: '📅', label: '報名', color: 'from-blue-400 to-blue-500' },
  { icon: '📍', label: '導航', color: 'from-emerald-400 to-emerald-500' }
] as const;

// Social Media Icons (SVG paths)
export const SOCIAL_ICONS = {
  facebook: {
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
  },
  line: {
    label: 'LINE',
    color: 'bg-green-500 hover:bg-green-600',
    // LINE logo SVG path
    path: 'M12 2C6.48 2 2 6.48 2 12c0 4.95 3.66 9.04 8.4 9.68.31.07.73-.1.86-.23.11-.11.2-.27.2-.54l-.01-1.89c-3.5.76-4.24-1.51-4.24-1.51-.57-1.45-1.4-1.84-1.4-1.84-1.14-.78.09-.76.09-.76 1.26.09 1.93 1.29 1.93 1.29 1.12 1.93 2.95 1.37 3.67 1.05.11-.81.44-1.37.8-1.69-2.79-.31-5.73-1.4-5.73-6.2 0-1.37.49-2.49 1.29-3.37-.13-.32-.56-1.59.12-3.32 0 0 1.05-.34 3.44 1.28 1-.28 2.07-.42 3.13-.42 1.06 0 2.13.14 3.13.42 2.39-1.62 3.44-1.28 3.44-1.28.68 1.73.25 3 .12 3.32.8.88 1.29 2 1.29 3.37 0 4.81-2.94 5.88-5.74 6.19.45.39.85 1.16.85 2.34l-.01 3.47c0 .27.09.43.2.54.13.13.55.3.86.23C18.34 21.04 22 16.95 22 12c0-5.52-4.48-10-10-10z'
  },
  instagram: {
    label: 'Instagram',
    color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 hover:opacity-90',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z'
  }
} as const;

// Mock Events Data with enhanced fields
export const MOCK_EVENTS = [
  {
    id: 1,
    title: '觀音誕辰祈福法會',
    date: '2024/03/24',
    time: '09:00',
    location: '大雄寶殿',
    desc: '恭祝觀世音菩薩聖誕，誦經祈福，消災延壽。',
    fullDescription: `
      <h3>法會流程</h3>
      <ul>
        <li>08:30 - 09:00 報到</li>
        <li>09:00 - 10:00 誦經祈福</li>
        <li>10:00 - 11:00 觀音菩薩開示</li>
        <li>11:00 - 11:30 點燈儀式</li>
        <li>11:30 - 12:00 午齋</li>
      </ul>
      <h3>注意事項</h3>
      <p>請穿著端莊，攜帶供品。歡迎隨喜贊助香油錢。</p>
    `,
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=400&fit=crop',
    registrationRequired: true,
    registrationLimit: 200,
    currentRegistrations: 156,
    status: 'published'
  },
  {
    id: 2,
    title: '清明超薦法會',
    date: '2024/04/04',
    time: '08:00',
    location: '大雄寶殿',
    desc: '清明慎終追遠，超薦先人，功德迴向。',
    fullDescription: `
      <h3>法會內容</h3>
      <p>清明時節，慎終追遠。本寺特舉辦超薦法會，為先人誦經祈福，功德迴向。</p>
      <h3>超薦項目</h3>
      <ul>
        <li>祖先牌位登記</li>
        <li>地藏經誦讀</li>
        <li>焰口施食</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1574236170878-f66e35f83207?w=600&h=400&fit=crop',
    registrationRequired: true,
    registrationLimit: 150,
    currentRegistrations: 89,
    status: 'published'
  },
  {
    id: 3,
    title: '媽祖聖誕遶境',
    date: '2024/04/23',
    time: '06:00',
    location: '廟埕集合',
    desc: '恭迎媽祖聖駕出巡，祈求國泰民安。',
    fullDescription: `
      <h3>遶境路線</h3>
      <p>從本宮出發，經過市區主要街道，全程約8公里。</p>
      <h3>參與方式</h3>
      <ul>
        <li>05:30 開始集合</li>
        <li>06:00 起駕出發</li>
        <li>12:00 回鑾安座</li>
      </ul>
      <p><strong>歡迎信眾隨香參拜，共沐神恩。</strong></p>
    `,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop',
    registrationRequired: false,
    registrationLimit: null,
    currentRegistrations: 0,
    status: 'published'
  },
  {
    id: 4,
    title: '中元普渡法會',
    date: '2024/08/15',
    time: '14:00',
    location: '廣場',
    desc: '普渡眾生，超薦亡靈，積累功德。',
    fullDescription: '',
    image: null,
    registrationRequired: true,
    registrationLimit: 100,
    currentRegistrations: 45,
    status: 'published'
  }
] as const;

// Mock Services Data
export const MOCK_SERVICES = [
  { id: 1, icon: '🪔', name: '光明燈', price: '500', unit: '年', desc: '點燈祈福，光明吉祥，照亮前程', popular: true },
  { id: 2, icon: '🐲', name: '太歲燈', price: '800', unit: '年', desc: '安太歲，消災解厄，保佑平安', popular: false },
  { id: 3, icon: '📿', name: '平安符', price: '100', unit: '個', desc: '隨身攜帶，趨吉避凶', popular: false },
  { id: 4, icon: '🙏', name: '祈福法會', price: '1,000', unit: '場', desc: '消災解厄，祈求平安', popular: false },
  { id: 5, icon: '🕯️', name: '藥師燈', price: '600', unit: '年', desc: '消災延壽，身體健康', popular: false },
  { id: 6, icon: '💫', name: '文昌燈', price: '500', unit: '年', desc: '金榜題名，學業進步', popular: false }
] as const;

// Mock Gallery Data
export const MOCK_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop', caption: '廟宇正殿' },
  { url: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=600&fit=crop', caption: '神明聖像' },
  { url: 'https://images.unsplash.com/photo-1574236170878-f66e35f83207?w=800&h=600&fit=crop', caption: '法會活動' },
  { url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop', caption: '建築細節' },
  { url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop', caption: '夜間燈火' },
  { url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop', caption: '慶典活動' }
] as const;

// Color Schemes
export const COLORS = {
  primary: {
    gradient: 'from-red-600 to-red-700',
    hover: 'from-red-700 to-red-800',
    bg: 'bg-red-600',
    text: 'text-red-600'
  },
  secondary: {
    gradient: 'from-amber-400 to-amber-500',
    hover: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-500',
    text: 'text-amber-500'
  },
  header: {
    mobile: 'bg-gradient-to-r from-red-800 to-red-900',
    desktop: 'bg-white'
  }
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  mobile: 640,   // sm
  tablet: 768,   // md
  desktop: 1024  // lg
} as const;

// Image Dimensions
export const IMAGE_SIZES = {
  hero: {
    mobile: 'h-48',
    tablet: 'h-[400px]',
    desktop: 'h-[500px]'
  },
  gallery: {
    featured: 'h-64',
    thumbnail: 'h-[120px]',
    mobile: 'h-32'
  }
} as const;

// API Endpoints (if needed in future)
export const API_ENDPOINTS = {
  donation: '/api/donation',
  events: '/api/events',
  services: '/api/services'
} as const;

// Form Validation Rules
export const VALIDATION = {
  templeName: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/
  },
  slug: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-z0-9-]+$/
  },
  phone: {
    pattern: /^[0-9-()+ ]+$/
  }
} as const;