/**
 * BaliBuddy Focus-Aware Query Hook
 * Prevents zombie queries by only fetching when screen is focused
 * Saves battery and network resources
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';

interface UseFocusAwareQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number; // Time in ms before data is considered stale
  cacheTime?: number; // Time in ms to keep data in cache
  refetchOnFocus?: boolean;
  refetchOnReconnect?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFocusAwareQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  refetch: () => Promise<void>;
  isStale: boolean;
}

// In-memory cache for query results
const queryCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Focus-aware query hook
 * Only fetches data when screen is focused and data is stale
 */
export function useFocusAwareQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  cacheTime = 10 * 60 * 1000, // 10 minutes default
  refetchOnFocus = true,
  refetchOnReconnect = true,
  onSuccess,
  onError,
}: UseFocusAwareQueryOptions<T>): UseFocusAwareQueryResult<T> {
  const isFocused = useIsFocused();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  const lastFetchTime = useRef<number>(0);
  const isMounted = useRef(true);

  // Check if data is stale
  const isStale = useCallback(() => {
    const cached = queryCache.get(queryKey);
    if (!cached) return true;
    return Date.now() - cached.timestamp > staleTime;
  }, [queryKey, staleTime]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check if we have fresh cached data
    const cached = queryCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setData(cached.data);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    setIsError(false);
    setError(null);

    try {
      const result = await queryFn();
      
      if (!isMounted.current) return;

      // Update cache
      queryCache.set(queryKey, { data: result, timestamp: Date.now() });
      
      setData(result);
      setIsLoading(false);
      setIsFetching(false);
      lastFetchTime.current = Date.now();
      
      onSuccess?.(result);
    } catch (err) {
      if (!isMounted.current) return;

      const error = err instanceof Error ? err : new Error('Query failed');
      setIsError(true);
      setError(error);
      setIsLoading(false);
      setIsFetching(false);
      
      onError?.(error);
    }
  }, [enabled, queryKey, queryFn, staleTime, onSuccess, onError]);

  // Refetch function
  const refetch = useCallback(async () => {
    // Clear cache for this query to force refetch
    queryCache.delete(queryKey);
    await fetchData();
  }, [queryKey, fetchData]);

  // Effect to fetch when focused and stale
  useEffect(() => {
    isMounted.current = true;

    if (isFocused && enabled && isStale()) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [isFocused, enabled, fetchData, isStale]);

  // Refetch on focus if enabled
  useEffect(() => {
    if (refetchOnFocus && isFocused && enabled && isStale()) {
      fetchData();
    }
  }, [isFocused, refetchOnFocus, enabled, fetchData, isStale]);

  // Cleanup old cache entries
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      for (const [key, value] of queryCache.entries()) {
        if (now - value.timestamp > cacheTime) {
          queryCache.delete(key);
        }
      }
    };

    const interval = setInterval(cleanup, 60 * 1000); // Cleanup every minute
    return () => clearInterval(interval);
  }, [cacheTime]);

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    isStale: isStale(),
  };
}

/**
 * Prefetch data for a query key
 */
export function prefetchQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>
): Promise<void> {
  return new Promise((resolve, reject) => {
    queryFn()
      .then((data) => {
        queryCache.set(queryKey, { data, timestamp: Date.now() });
        resolve();
      })
      .catch(reject);
  });
}

/**
 * Invalidate query cache
 */
export function invalidateQuery(queryKey: string): void {
  queryCache.delete(queryKey);
}

/**
 * Clear all query cache
 */
export function clearQueryCache(): void {
  queryCache.clear();
}

/**
 * Get cache stats
 */
export function getQueryCacheStats(): {
  size: number;
  keys: string[];
  oldestTimestamp: number | null;
} {
  const entries = Array.from(queryCache.entries());
  const oldestTimestamp = entries.length > 0
    ? Math.min(...entries.map(([_, value]) => value.timestamp))
    : null;

  return {
    size: queryCache.size,
    keys: Array.from(queryCache.keys()),
    oldestTimestamp,
  };
}

export default useFocusAwareQuery;