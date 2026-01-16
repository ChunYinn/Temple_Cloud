'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPrayerServices,
  updatePrayerServices,
  fetchTempleEvents,
  fetchTempleOrders,
  fetchTempleStats,
  updateTempleSettings,
  apiGet,
  ApiError
} from '@/lib/utils/api-fetcher';
import { API_ENDPOINTS, DEFAULTS } from '@/lib/constants/routes';
import { ServiceCode } from '@/lib/prayer-form/types';
import { useToast } from '@/lib/toast-context';

// ============================================
// Query Keys
// ============================================

export const templeQueryKeys = {
  all: ['temples'] as const,
  temple: (id: string) => ['temples', id] as const,
  prayerServices: (templeId: string) => ['temples', templeId, 'prayer-services'] as const,
  events: (templeId: string) => ['temples', templeId, 'events'] as const,
  orders: (templeId: string, params?: any) => ['temples', templeId, 'orders', params] as const,
  stats: (templeId: string) => ['temples', templeId, 'stats'] as const,
  settings: (templeId: string) => ['temples', templeId, 'settings'] as const,
};

// ============================================
// Types
// ============================================

interface PrayerServiceSetting {
  serviceCode: ServiceCode;
  isEnabled: boolean;
  customPrice?: number;
  maxQuantity?: number;
  annualLimit?: number;
  currentCount: number;
  description?: string;
  specialNote?: string;
}

interface DonationSetting {
  isEnabled: boolean;
  minAmount: number;
  suggestedAmounts: number[];
  allowCustomAmount: boolean;
  allowAnonymous: boolean;
  customMessage?: string;
}

interface PrayerServicesData {
  services: PrayerServiceSetting[];
  donation: DonationSetting;
}

// ============================================
// Hooks with Error Handling
// ============================================

/**
 * Hook for Prayer Services with toast notifications
 */
export function usePrayerServices(templeId: string) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: templeQueryKeys.prayerServices(templeId),
    queryFn: () => fetchPrayerServices(templeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: (error) => {
      if (error instanceof ApiError) {
        showError(error.message || '載入祈福服務失敗');
      }
      return false;
    }
  });
}

/**
 * Hook for updating Prayer Services with optimistic updates
 */
export function useUpdatePrayerServices(templeId: string) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: { services: PrayerServiceSetting[]; donation: DonationSetting }) =>
      updatePrayerServices(templeId, data),

    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: templeQueryKeys.prayerServices(templeId)
      });

      const previousData = queryClient.getQueryData(
        templeQueryKeys.prayerServices(templeId)
      );

      queryClient.setQueryData(
        templeQueryKeys.prayerServices(templeId),
        newData
      );

      return { previousData };
    },

    // Rollback on error
    onError: (error, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          templeQueryKeys.prayerServices(templeId),
          context.previousData
        );
      }

      const message = error instanceof ApiError
        ? error.message
        : '儲存失敗，請稍後再試';
      showError(message);
    },

    // Show success message
    onSuccess: () => {
      success('設定已儲存');
    },

    // Ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: templeQueryKeys.prayerServices(templeId)
      });
    },
  });
}

/**
 * Hook for Temple Events
 */
export function useTempleEvents(templeId: string) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: templeQueryKeys.events(templeId),
    queryFn: () => fetchTempleEvents(templeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    throwOnError: (error) => {
      if (error instanceof ApiError) {
        showError(error.message || '載入活動失敗');
      }
      return false;
    }
  });
}

/**
 * Hook for Temple Orders with pagination
 */
export function useTempleOrders(
  templeId: string,
  page = 1,
  limit = DEFAULTS.PAGINATION.LIMIT,
  filters?: {
    status?: string;
    search?: string;
    type?: string;
  }
) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: templeQueryKeys.orders(templeId, { page, limit, ...filters }),
    queryFn: () => fetchTempleOrders(templeId, { page, limit, ...filters }),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    keepPreviousData: true, // Keep previous data while fetching new page
    throwOnError: (error) => {
      if (error instanceof ApiError) {
        showError(error.message || '載入訂單失敗');
      }
      return false;
    }
  });
}

/**
 * Hook for Temple Statistics
 */
export function useTempleStats(templeId: string) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: templeQueryKeys.stats(templeId),
    queryFn: () => fetchTempleStats(templeId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    throwOnError: (error) => {
      if (error instanceof ApiError) {
        showError(error.message || '載入統計資料失敗');
      }
      return false;
    }
  });
}

/**
 * Hook for Temple Settings
 */
export function useTempleSettings(templeId: string) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: templeQueryKeys.settings(templeId),
    queryFn: () => apiGet(API_ENDPOINTS.TEMPLES.BY_ID(templeId)),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
    throwOnError: (error) => {
      if (error instanceof ApiError) {
        showError(error.message || '載入寺廟設定失敗');
      }
      return false;
    }
  });
}

/**
 * Hook for updating Temple Settings
 */
export function useUpdateTempleSettings(templeId: string) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: any) => updateTempleSettings(templeId, data),

    onSuccess: () => {
      success('設定已更新');
      queryClient.invalidateQueries({
        queryKey: templeQueryKeys.settings(templeId)
      });
    },

    onError: (error) => {
      const message = error instanceof ApiError
        ? error.message
        : '更新失敗，請稍後再試';
      showError(message);
    }
  });
}

/**
 * Hook to prefetch all temple data
 */
export function usePrefetchTempleData(templeId: string) {
  const queryClient = useQueryClient();

  const prefetchAll = async () => {
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: templeQueryKeys.prayerServices(templeId),
        queryFn: () => fetchPrayerServices(templeId),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: templeQueryKeys.events(templeId),
        queryFn: () => fetchTempleEvents(templeId),
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: templeQueryKeys.stats(templeId),
        queryFn: () => fetchTempleStats(templeId),
        staleTime: 30 * 1000,
      }),
    ]);
  };

  return { prefetchAll };
}

/**
 * Hook to invalidate all temple data
 */
export function useInvalidateTempleData(templeId: string) {
  const queryClient = useQueryClient();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: templeQueryKeys.temple(templeId)
    });
  };

  return { invalidateAll };
}