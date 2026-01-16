/**
 * Central export file for all TanStack Query hooks
 * Import all hooks from this file for consistency
 */

// Temple data hooks
export {
  templeQueryKeys,
  usePrayerServices,
  useUpdatePrayerServices,
  useTempleEvents,
  useTempleOrders,
  useTempleStats,
  useTempleSettings,
  useUpdateTempleSettings,
  usePrefetchTempleData,
  useInvalidateTempleData
} from './use-temple-data-clean';

// Event management hooks
export {
  eventQueryKeys,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventImage,
  usePrefetchEvents
} from './use-events-data';

// Stats dashboard hooks
export {
  statsQueryKeys,
  useDateRangeStats,
  useRealtimeStats,
  useExportStats,
  usePrefetchStats,
  useInvalidateStats,
  useDashboardMetrics
} from './use-stats-data';

// Re-export types
export type {
  // Add any shared types here
} from './use-temple-data-clean';