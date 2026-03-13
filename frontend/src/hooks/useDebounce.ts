/**
 * hooks/useDebounce.ts
 *
 * WHAT: Delays updating a value until the user stops changing it.
 * WHERE USED: Search inputs, filter bars — prevents firing an API call
 *             on every keystroke.
 *
 * Example:
 *   const debouncedSearch = useDebounce(searchTerm, 400);
 *   useEffect(() => fetchResults(debouncedSearch), [debouncedSearch]);
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
