import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced API calls with loading state
 * @param fn - The async function to call
 * @param delay - The delay in milliseconds
 * @returns { trigger, loading, data, error, reset }
 */
export function useDebouncedCallback<T, P extends any[]>(
  fn: (...args: P) => Promise<T>,
  delay: number
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const debouncedFn = useCallback(
    (...args: P) => {
      const handler = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);
          const result = await fn(...args);
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setData(null);
        } finally {
          setLoading(false);
        }
      }, delay);

      return () => clearTimeout(handler);
    },
    [fn, delay]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setData(null);
    setError(null);
  }, []);

  return {
    trigger: debouncedFn,
    loading,
    data,
    error,
    reset
  };
} 