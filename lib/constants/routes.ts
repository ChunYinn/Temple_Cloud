/**
 * Centralized route constants for the application
 * All routes and API endpoints should be defined here
 */

// ============================================
// Application Routes
// ============================================

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Admin routes
  ADMIN: {
    ROOT: '/admin',
    TEMPLE: (id: string) => `/admin/temple/${id}` as const,
    TEMPLE_EVENTS: (id: string) => `/admin/temple/${id}/events` as const,
    SETTINGS: '/admin/settings',
    PROFILE: '/admin/profile',
  },

  // Temple public routes
  TEMPLE: {
    HOME: (slug: string) => `https://${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` as const,
    PRAYER: (slug: string) => `https://${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/prayer` as const,
    EVENTS: (slug: string) => `https://${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/events` as const,
    ABOUT: (slug: string) => `https://${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/about` as const,
  }
} as const;

// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  // Temple endpoints
  TEMPLES: {
    BASE: '/api/temples',
    BY_ID: (id: string) => `/api/temples/${id}` as const,
    PRAYER_SERVICES: (id: string) => `/api/temples/${id}/prayer-services` as const,
    EVENTS: (id: string) => `/api/temples/${id}/events` as const,
    ORDERS: (id: string) => `/api/temples/${id}/orders` as const,
    ORDERS_OPTIMIZED: (id: string) => `/api/temples/${id}/orders/optimized` as const,
    ORDER_BY_ID: (templeId: string, orderId: string) => `/api/temples/${templeId}/orders/${orderId}` as const,
    STATS: (id: string) => `/api/temples/${id}/stats` as const,
  },

  // Upload endpoints
  UPLOAD: {
    LOGO: '/api/upload/logo',
    COVER: '/api/upload/cover',
    FAVICON: '/api/upload/favicon',
    GALLERY: '/api/upload/gallery',
  },

  // Auth endpoints (if needed for custom auth flows)
  AUTH: {
    SESSION: '/api/auth/session',
    LOGOUT: '/api/auth/logout',
  }
} as const;

// ============================================
// External URLs
// ============================================

export const EXTERNAL_URLS = {
  GITHUB_ISSUES: 'https://github.com/anthropics/claude-code/issues',
  DOCUMENTATION: 'https://docs.claude.com',
  SUPPORT: 'https://support.example.com',
} as const;

// ============================================
// Query Parameters
// ============================================

export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search',
  STATUS: 'status',
  TYPE: 'type',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  SORT: 'sort',
  ORDER: 'order',
} as const;

// ============================================
// Default Values
// ============================================

export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100,
  },
  CACHE: {
    STALE_TIME: 60 * 1000, // 1 minute
    GC_TIME: 5 * 60 * 1000, // 5 minutes
  }
} as const;

// Type exports for TypeScript support
export type RouteParams = {
  templeId: string;
  orderId?: string;
  slug?: string;
};

export type ApiEndpoint = typeof API_ENDPOINTS;
export type Routes = typeof ROUTES;