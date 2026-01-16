'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Create a QueryProvider component following Next.js App Router best practices
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Initialize QueryClient with optimized settings for Next.js
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data considered fresh for 1 minute (reduces unnecessary refetches)
            staleTime: 60 * 1000, // 60 seconds
            // Keep inactive data in cache for 5 minutes
            gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus by default (reduces server load)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect by default
            refetchOnReconnect: 'always',
            // Network mode - always attempt fetch regardless of network status
            networkMode: 'offlineFirst',
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
            // Network mode for mutations
            networkMode: 'offlineFirst',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}