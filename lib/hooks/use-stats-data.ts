'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/lib/utils/api-fetcher';
import { API_ENDPOINTS } from '@/lib/constants/routes';
import { useToast } from '@/lib/toast-context';

// ============================================
// Types
// ============================================

interface TempleStats {
  totalViews: number;
  totalDonations: number;
  totalOrders: number;
  totalEvents: number;
  activeMembers: number;
  monthlyGrowth: number;
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    amount: number;
    created_at: string;
  }>;
  popularServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    orders: number;
    revenue: number;
  }>;
  yearlyComparison: {
    currentYear: number;
    previousYear: number;
    growth: number;
  };
}

interface DateRangeStats {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}

// ============================================
// Query Keys
// ============================================

export const statsQueryKeys = {
  overview: (templeId: string) => ['temples', templeId, 'stats', 'overview'] as const,
  dateRange: (templeId: string, startDate: string, endDate: string) =>
    ['temples', templeId, 'stats', 'range', { startDate, endDate }] as const,
  realtime: (templeId: string) => ['temples', templeId, 'stats', 'realtime'] as const,
  export: (templeId: string, format: string) =>
    ['temples', templeId, 'stats', 'export', format] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Hook to fetch temple statistics overview
 * Auto-refreshes every 30 seconds for real-time updates
 */
export function useTempleStats(templeId: string) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: statsQueryKeys.overview(templeId),
    queryFn: async (): Promise<TempleStats> => {
      const response = await apiGet(API_ENDPOINTS.TEMPLES.STATS(templeId));
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds - stats update frequently
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    refetchIntervalInBackground: true, // Continue refreshing in background
    retry: 1, // Only retry once for stats
  });
}

/**
 * Hook to fetch stats for a specific date range
 */
export function useDateRangeStats(
  templeId: string,
  startDate: string,
  endDate: string,
  enabled = true
) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: statsQueryKeys.dateRange(templeId, startDate, endDate),
    queryFn: async (): Promise<DateRangeStats> => {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      const response = await apiGet(
        `${API_ENDPOINTS.TEMPLES.STATS(templeId)}?${params}`
      );
      return response;
    },
    enabled: enabled && !!startDate && !!endDate, // Only fetch when dates are provided
    staleTime: 5 * 60 * 1000, // 5 minutes - date range stats don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

/**
 * Hook for real-time stats (websocket alternative using polling)
 */
export function useRealtimeStats(templeId: string, enabled = true) {
  return useQuery({
    queryKey: statsQueryKeys.realtime(templeId),
    queryFn: async () => {
      const response = await apiGet(`${API_ENDPOINTS.TEMPLES.STATS(templeId)}/realtime`);
      return response;
    },
    enabled,
    staleTime: 5 * 1000, // 5 seconds for real-time
    gcTime: 30 * 1000, // 30 seconds cache
    refetchInterval: 10 * 1000, // Refresh every 10 seconds
    refetchIntervalInBackground: false, // Stop when tab is not active
  });
}

/**
 * Hook to export stats data
 */
export function useExportStats(templeId: string) {
  const { success, error: showError } = useToast();

  const exportStats = async (format: 'csv' | 'pdf' | 'excel', dateRange?: { start: string; end: string }) => {
    try {
      const params = new URLSearchParams({ format });
      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }

      const response = await fetch(
        `${API_ENDPOINTS.TEMPLES.STATS(templeId)}/export?${params}`,
        {
          method: 'GET',
          headers: {
            'Accept': format === 'pdf' ? 'application/pdf' :
                     format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                     'text/csv'
          }
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `temple-stats-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success(`統計資料已匯出為 ${format.toUpperCase()} 格式`);
    } catch (error) {
      showError('匯出失敗，請稍後再試');
    }
  };

  return { exportStats };
}

/**
 * Hook to prefetch stats for better performance
 */
export function usePrefetchStats(templeId: string) {
  const queryClient = useQueryClient();

  const prefetchOverview = () => {
    return queryClient.prefetchQuery({
      queryKey: statsQueryKeys.overview(templeId),
      queryFn: async () => {
        const response = await apiGet(API_ENDPOINTS.TEMPLES.STATS(templeId));
        return response;
      },
      staleTime: 30 * 1000,
    });
  };

  const prefetchDateRange = (startDate: string, endDate: string) => {
    return queryClient.prefetchQuery({
      queryKey: statsQueryKeys.dateRange(templeId, startDate, endDate),
      queryFn: async () => {
        const params = new URLSearchParams({ startDate, endDate });
        const response = await apiGet(
          `${API_ENDPOINTS.TEMPLES.STATS(templeId)}?${params}`
        );
        return response;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchOverview, prefetchDateRange };
}

/**
 * Hook to invalidate all stats data
 * Useful after major updates that affect statistics
 */
export function useInvalidateStats(templeId: string) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    // Invalidate all stats queries for this temple
    queryClient.invalidateQueries({
      queryKey: ['temples', templeId, 'stats']
    });
  };

  const invalidateOverview = () => {
    queryClient.invalidateQueries({
      queryKey: statsQueryKeys.overview(templeId)
    });
  };

  return { invalidateAll, invalidateOverview };
}

/**
 * Custom hook for dashboard metrics with computed values
 */
export function useDashboardMetrics(templeId: string) {
  const { data: stats, isLoading, error } = useTempleStats(templeId);

  // Compute additional metrics
  const metrics = stats ? {
    ...stats,
    // Conversion rate
    conversionRate: stats.totalOrders > 0
      ? ((stats.totalOrders / stats.totalViews) * 100).toFixed(2)
      : '0',
    // Average donation
    avgDonation: stats.totalOrders > 0
      ? Math.round(stats.totalDonations / stats.totalOrders)
      : 0,
    // Growth trend (positive/negative/neutral)
    growthTrend: stats.monthlyGrowth > 5 ? 'positive' :
                 stats.monthlyGrowth < -5 ? 'negative' :
                 'neutral',
    // Peak hours (mock - would come from real data)
    peakHours: ['10:00', '14:00', '19:00'],
  } : null;

  return {
    metrics,
    isLoading,
    error
  };
}