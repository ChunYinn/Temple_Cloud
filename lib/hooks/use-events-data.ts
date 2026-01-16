'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete, uploadFile } from '@/lib/utils/api-fetcher';
import { API_ENDPOINTS } from '@/lib/constants/routes';
import { useToast } from '@/lib/toast-context';

// ============================================
// Types
// ============================================

interface Event {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  event_date: Date | string;
  event_time: string;
  location: string;
  max_capacity?: number | null;
  current_registrations: number;
  registration_deadline?: Date | string | null;
  is_active: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  max_capacity: number | null;
  registration_deadline: string;
  is_active: boolean;
}

// ============================================
// Query Keys
// ============================================

export const eventQueryKeys = {
  all: (templeId: string) => ['temples', templeId, 'events'] as const,
  single: (templeId: string, eventId: string) => ['temples', templeId, 'events', eventId] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Hook to fetch all events for a temple
 */
export function useTempleEvents(templeId: string) {
  const { error: showError } = useToast();

  return useQuery({
    queryKey: eventQueryKeys.all(templeId),
    queryFn: async () => {
      const response = await apiGet(API_ENDPOINTS.TEMPLES.EVENTS(templeId));
      return response.events || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent(templeId: string) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (eventData: EventFormData) => {
      return apiPost(API_ENDPOINTS.TEMPLES.EVENTS(templeId), eventData);
    },
    onSuccess: (newEvent) => {
      // Add new event to cache
      queryClient.setQueryData(
        eventQueryKeys.all(templeId),
        (oldData: Event[] = []) => [...oldData, newEvent]
      );
      success('活動已成功創建');
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : '創建活動失敗');
    },
    onSettled: () => {
      // Ensure data is fresh
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.all(templeId)
      });
    }
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent(templeId: string) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: EventFormData }) => {
      return apiPatch(API_ENDPOINTS.TEMPLES.EVENTS(templeId), {
        ...data,
        eventId
      });
    },
    // Optimistic update
    onMutate: async ({ eventId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: eventQueryKeys.all(templeId)
      });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(eventQueryKeys.all(templeId));

      // Optimistically update
      queryClient.setQueryData(
        eventQueryKeys.all(templeId),
        (old: Event[] = []) => old.map(event =>
          event.id === eventId
            ? { ...event, ...data }
            : event
        )
      );

      return { previousEvents };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(
          eventQueryKeys.all(templeId),
          context.previousEvents
        );
      }
      showError(err instanceof Error ? err.message : '更新活動失敗');
    },
    onSuccess: () => {
      success('活動已成功更新');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.all(templeId)
      });
    }
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent(templeId: string) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (eventId: string) => {
      return apiDelete(`${API_ENDPOINTS.TEMPLES.EVENTS(templeId)}/${eventId}`);
    },
    // Optimistic update
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({
        queryKey: eventQueryKeys.all(templeId)
      });

      const previousEvents = queryClient.getQueryData(eventQueryKeys.all(templeId));

      // Remove from cache optimistically
      queryClient.setQueryData(
        eventQueryKeys.all(templeId),
        (old: Event[] = []) => old.filter(event => event.id !== eventId)
      );

      return { previousEvents };
    },
    onError: (err, eventId, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(
          eventQueryKeys.all(templeId),
          context.previousEvents
        );
      }
      showError(err instanceof Error ? err.message : '刪除活動失敗');
    },
    onSuccess: () => {
      success('活動已成功刪除');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: eventQueryKeys.all(templeId)
      });
    }
  });
}

/**
 * Hook to upload event image
 */
export function useUploadEventImage(templeId: string) {
  const { error: showError } = useToast();

  return useMutation({
    mutationFn: async ({
      file,
      oldImageUrl,
      onProgress
    }: {
      file: File;
      oldImageUrl?: string;
      onProgress?: (progress: number) => void;
    }) => {
      return uploadFile(
        '/api/upload/event-image',
        file,
        onProgress,
        {
          templeId,
          type: 'event',
          oldImageUrl
        }
      );
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : '圖片上傳失敗');
    }
  });
}

/**
 * Hook to prefetch event data
 */
export function usePrefetchEvents(templeId: string) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    return queryClient.prefetchQuery({
      queryKey: eventQueryKeys.all(templeId),
      queryFn: async () => {
        const response = await apiGet(API_ENDPOINTS.TEMPLES.EVENTS(templeId));
        return response.events || [];
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  return { prefetch };
}