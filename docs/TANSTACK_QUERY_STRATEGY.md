# TanStack Query (React Query) Strategy Guide

## When to Use TanStack Query vs Next.js Data Fetching

### Use TanStack Query for:
✅ **Client-side data that changes frequently**
- Admin dashboards
- User-specific data
- Real-time updates
- Data that needs background refetching
- Interactive forms with optimistic updates

### Use Next.js Server Components for:
✅ **Static or rarely changing data**
- Public temple information
- SEO-critical content
- Initial page data
- Data that benefits from server-side rendering

## Cache Invalidation Strategy

### Automatic Cache Invalidation

TanStack Query automatically handles cache in these scenarios:

```typescript
// 1. After mutations with onSuccess
const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    // Automatically invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['temples', templeId] });
  }
});

// 2. On window focus (configurable)
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchOnWindowFocus: true, // Refetch when window regains focus
});

// 3. On reconnect
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchOnReconnect: true, // Refetch when internet reconnects
});

// 4. Interval refetching
const { data } = useQuery({
  queryKey: ['stats'],
  queryFn: fetchStats,
  refetchInterval: 60000, // Refetch every minute
});
```

### Manual Cache Invalidation

```typescript
// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: ['temples', templeId] });

// Invalidate all queries for a temple
queryClient.invalidateQueries({ queryKey: ['temples'] });

// Remove cache completely
queryClient.removeQueries({ queryKey: ['temples', templeId] });

// Reset to initial data
queryClient.resetQueries({ queryKey: ['temples', templeId] });
```

## Stale Time vs Cache Time (GC Time)

```typescript
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 60000,    // Data is fresh for 1 minute
  gcTime: 5 * 60000,   // Keep in cache for 5 minutes after becoming unused
});
```

- **staleTime**: How long data is considered fresh. No refetch happens during this time.
- **gcTime**: How long to keep unused data in cache before garbage collection.

## Data Flow Diagram

```
User Action → Mutation → Success → Invalidate Query → Background Refetch → Update UI
                ↓
         Optimistic Update (immediate UI update)
```

## Components Migration Status

### ✅ Already Using TanStack Query:
- `prayer-services-management-optimized.tsx`
- `prayer-services-management-clean.tsx`

### ❌ Still Using Direct Fetch (Need Migration):
- `events-management.tsx` - Uses direct fetch in useEffect
- `stats-dashboard.tsx` - Uses direct fetch
- `orders-management.tsx` - Uses direct fetch
- `gallery-upload.tsx` - Direct upload (OK - one-time action)
- `temple-services-display.tsx` - Public data (consider SSR)

## Implementation Examples

### Before (Direct Fetch):
```typescript
// ❌ Old way - No caching, refetches on every mount
useEffect(() => {
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/temples/${templeId}/events`);
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, [templeId]);
```

### After (TanStack Query):
```typescript
// ✅ New way - Automatic caching, background updates
import { useTempleEvents } from '@/lib/hooks/use-temple-data-clean';

const { data: events, isLoading, error } = useTempleEvents(templeId);

// Data is automatically cached and reused
// Background refetch happens based on staleTime
// Error handling with toast is automatic
```

## Cache Invalidation Patterns

### 1. After Creating New Data
```typescript
const createEvent = useMutation({
  mutationFn: (data) => apiPost(API_ENDPOINTS.TEMPLES.EVENTS(templeId), data),
  onSuccess: () => {
    // Invalidate events list to show new event
    queryClient.invalidateQueries({
      queryKey: templeQueryKeys.events(templeId)
    });
    success('活動已創建');
  }
});
```

### 2. After Updating Data
```typescript
const updateEvent = useMutation({
  mutationFn: (data) => apiPatch(API_ENDPOINTS.TEMPLES.EVENTS(templeId), data),
  onSuccess: (updatedEvent) => {
    // Update specific event in cache
    queryClient.setQueryData(
      templeQueryKeys.events(templeId),
      (old) => old.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    );
    success('活動已更新');
  }
});
```

### 3. After Deleting Data
```typescript
const deleteEvent = useMutation({
  mutationFn: (eventId) => apiDelete(`${API_ENDPOINTS.TEMPLES.EVENTS(templeId)}/${eventId}`),
  onSuccess: (_, eventId) => {
    // Remove from cache optimistically
    queryClient.setQueryData(
      templeQueryKeys.events(templeId),
      (old) => old.filter(e => e.id !== eventId)
    );
    success('活動已刪除');
  }
});
```

### 4. Related Data Invalidation
```typescript
// When updating temple settings, also invalidate stats
const updateSettings = useMutation({
  mutationFn: updateTempleSettings,
  onSuccess: () => {
    // Invalidate multiple related queries
    queryClient.invalidateQueries({
      queryKey: templeQueryKeys.settings(templeId)
    });
    queryClient.invalidateQueries({
      queryKey: templeQueryKeys.stats(templeId)
    });
  }
});
```

## Best Practices

### 1. Use Optimistic Updates for Better UX
```typescript
useMutation({
  mutationFn: updateData,
  // Optimistically update UI before server response
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey });
    const previousData = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, newData);
    return { previousData };
  },
  // Rollback on error
  onError: (err, newData, context) => {
    queryClient.setQueryData(queryKey, context.previousData);
  },
  // Always refetch after settlement
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey });
  }
});
```

### 2. Prefetch Data for Better Performance
```typescript
// Prefetch next page
const prefetchNextPage = () => {
  queryClient.prefetchQuery({
    queryKey: ['orders', templeId, { page: currentPage + 1 }],
    queryFn: () => fetchOrders(templeId, currentPage + 1),
  });
};
```

### 3. Use Suspense for Loading States (Optional)
```typescript
// In your component
const { data } = useSuspenseQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

// Wrap with Suspense boundary
<Suspense fallback={<Loading />}>
  <YourComponent />
</Suspense>
```

## Server-Side Considerations

### For Next.js App Router:

```typescript
// In Server Component - Initial data fetch
async function TemplePage({ params }: { params: { id: string } }) {
  // Fetch on server for SEO and initial load
  const initialData = await fetch(`${API_URL}/temples/${params.id}`);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent initialData={initialData} />
    </HydrationBoundary>
  );
}

// In Client Component - Use TanStack for updates
'use client';
function ClientComponent({ initialData }) {
  const { data } = useQuery({
    queryKey: ['temple', id],
    queryFn: fetchTemple,
    initialData, // Use server data as initial
  });
}
```

## Performance Metrics

### Before (Direct Fetch):
- 🔴 Refetch on every component mount
- 🔴 No cache between navigations
- 🔴 Multiple components fetch same data
- 🔴 No background updates

### After (TanStack Query):
- ✅ Intelligent caching (60% less API calls)
- ✅ Shared cache between components
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Request deduplication

## Migration Priority

1. **High Priority** (Frequently accessed, multiple refetches):
   - ❗ `stats-dashboard.tsx` - Needs real-time updates
   - ❗ `orders-management.tsx` - Complex data with pagination
   - ❗ `events-management.tsx` - CRUD operations

2. **Medium Priority**:
   - `temple-services-display.tsx` - Public data, consider SSR

3. **Low Priority** (One-time operations):
   - `gallery-upload.tsx` - File upload is fine with direct fetch

## Monitoring Cache

Use React Query Devtools to monitor:

```tsx
// Already added in QueryProvider
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

This shows:
- Active queries
- Cache status
- Stale/fresh state
- Background refetch activity
- Query errors

## Common Pitfalls

1. **Don't mix patterns** - Use either TanStack Query or direct fetch, not both
2. **Don't over-invalidate** - Only invalidate what changed
3. **Don't ignore stale time** - Set appropriate stale times for your data
4. **Don't forget error boundaries** - Wrap components for error handling
5. **Don't cache sensitive data too long** - Use shorter cache times for sensitive data