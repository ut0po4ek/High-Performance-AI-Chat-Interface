import { useEffect, useRef, useState } from 'react';

export const useThrottledValue = <T,>(value: T, delayMs = 250) => {
  const [throttled, setThrottled] = useState(value);
  const lastUpdatedRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdatedRef.current;

    if (elapsed >= delayMs) {
      lastUpdatedRef.current = now;
      setThrottled(value);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastUpdatedRef.current = Date.now();
      setThrottled(value);
    }, delayMs - elapsed);

    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return throttled;
};
