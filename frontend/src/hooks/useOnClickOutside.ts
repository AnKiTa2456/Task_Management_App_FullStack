/**
 * hooks/useOnClickOutside.ts
 *
 * WHAT: Calls a callback when a click is detected outside a given ref element.
 * WHERE USED: Dropdowns, notification panels, context menus.
 *
 * Example:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useOnClickOutside(ref, () => setOpen(false));
 */

import { useEffect, type RefObject } from 'react';

export function useOnClickOutside<T extends HTMLElement>(
  ref:      RefObject<T>,
  handler:  (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };

    document.addEventListener('mousedown',  listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown',  listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
