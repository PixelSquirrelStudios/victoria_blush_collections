import { useEffect, useRef, useCallback } from 'react';

// A generic, dependency-free hook for debouncing callbacks.
export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay: number,
) {
  const callbackRef = useRef(callback);

  // --- THIS IS THE FIX ---
  // The useRef hook requires an initial value. We provide `undefined`.
  // The type is also updated to reflect that it can be `undefined`.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Always use the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    // The return function from useEffect is used for cleanup.
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this runs only on mount and unmount.

  return useCallback(
    (...args: A) => {
      // If there's a pending timeout, clear it.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout.
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
