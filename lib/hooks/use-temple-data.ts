'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceCode } from '@/lib/prayer-form/types';

// Query Keys for cache management
export const templeQueryKeys = {
  all: ['temples'] as const,
  temple: (id: string) => ['temples', id] as const,
  prayerServices: (templeId: string) => ['temples', templeId, 'prayer-services'] as const,
  events: (templeId: string) => ['temples', templeId, 'events'] as const,
  orders: (templeId: string) => ['temples', templeId, 'orders'] as const,
  stats: (templeId: string) => ['temples', templeId, 'stats'] as const,
  settings: (templeId: string) => ['temples', templeId, 'settings'] as const,
};

// Types
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

// Hook for Prayer Services
export function usePrayerServices(templeId: string) {
  return useQuery({
    queryKey: templeQueryKeys.prayerServices(templeId),
    queryFn: async (): Promise<PrayerServicesData> => {
      const response = await fetch(`/api/temples/${templeId}/prayer-services`);
      if (!response.ok) {
        throw new Error('Failed to fetch prayer services');
      }
      return response.json();
    },
    // Cache for 5 minutes (services don't change frequently)
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for updating Prayer Services with optimistic updates
export function useUpdatePrayerServices(templeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { services: PrayerServiceSetting[]; donation: DonationSetting }) => {
      const response = await fetch(`/api/temples/${templeId}/prayer-services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update prayer services');
      }

      return response.json();
    },
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: templeQueryKeys.prayerServices(templeId) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(templeQueryKeys.prayerServices(templeId));

      // Optimistically update cache
      queryClient.setQueryData(templeQueryKeys.prayerServices(templeId), newData);

      // Return context with snapshot
      return { previousData };
    },
    // Rollback on error
    onError: (err, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(templeQueryKeys.prayerServices(templeId), context.previousData);
      }
    },
    // Ensure consistency after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: templeQueryKeys.prayerServices(templeId) });
    },
  });
}

// Hook for Events
export function useTempleEvents(templeId: string) {
  return useQuery({
    queryKey: templeQueryKeys.events(templeId),
    queryFn: async () => {
      const response = await fetch(`/api/temples/${templeId}/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      return data.events || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

// Hook for Orders with pagination
export function useTempleOrders(templeId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: [...templeQueryKeys.orders(templeId), { page, limit }],
    queryFn: async () => {
      const response = await fetch(
        `/api/temples/${templeId}/orders?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute (orders change frequently)
    gcTime: 5 * 60 * 1000,
  });
}

// Hook for Stats
export function useTempleStats(templeId: string) {
  return useQuery({
    queryKey: templeQueryKeys.stats(templeId),
    queryFn: async () => {
      const response = await fetch(`/api/temples/${templeId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds (stats update frequently)
    gcTime: 2 * 60 * 1000,
    // Refetch stats every minute in the background
    refetchInterval: 60 * 1000,
  });
}

// Hook for Temple Settings
export function useTempleSettings(templeId: string) {
  return useQuery({
    queryKey: templeQueryKeys.settings(templeId),
    queryFn: async () => {
      const response = await fetch(`/api/temples/${templeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch temple settings');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (settings rarely change)
    gcTime: 15 * 60 * 1000,
  });
}

// Hook to prefetch all temple data (useful for initial load)
export function usePrefetchTempleData(templeId: string) {
  const queryClient = useQueryClient();

  const prefetchAll = async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: templeQueryKeys.prayerServices(templeId),
        queryFn: async () => {
          const response = await fetch(`/api/temples/${templeId}/prayer-services`);
          return response.json();
        },
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: templeQueryKeys.events(templeId),
        queryFn: async () => {
          const response = await fetch(`/api/temples/${templeId}/events`);
          const data = await response.json();
          return data.events || [];
        },
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: templeQueryKeys.stats(templeId),
        queryFn: async () => {
          const response = await fetch(`/api/temples/${templeId}/stats`);
          return response.json();
        },
        staleTime: 30 * 1000,
      }),
    ]);
  };

  return { prefetchAll };
}