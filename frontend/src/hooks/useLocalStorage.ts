/**
 * hooks/useLocalStorage.ts
 *
 * WHAT: useState that persists its value in localStorage.
 * WHERE USED: User preferences (sidebar state, theme, last-visited board).
 *
 * Example:
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 */

import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`useLocalStorage: could not write key "${key}"`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
