import { useState, useEffect, useRef } from "react";

/**
 * Hook that persists state to localStorage
 * @param key - The localStorage key to use
 * @param defaultValue - The default value if nothing is stored
 * @param debounceMs - Debounce time in milliseconds for saving (default: 500)
 * @returns [state, setState, hasLoaded] - Similar to useState, but persisted. hasLoaded indicates if initial load from localStorage is complete.
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  debounceMs: number = 500,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // Initialize state with defaultValue (will be updated on mount if localStorage has a value)
  const [state, setState] = useState<T>(defaultValue);
  const [hasLoaded, setHasLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setHasLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored) as T;
        setState(parsed);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    } finally {
      setHasLoaded(true);
      isInitialMount.current = false;
    }
  }, [key]);

  // Save to localStorage whenever state changes (debounced)
  useEffect(() => {
    // Don't save on initial mount (we just loaded from localStorage)
    if (isInitialMount.current) return;
    if (typeof window === "undefined") return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce save
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }, debounceMs);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, key, debounceMs]);

  // Wrapper for setState that works with both direct values and updater functions
  const setPersistentState = (value: T | ((prev: T) => T)) => {
    setState(value);
  };

  return [state, setPersistentState, hasLoaded];
}

