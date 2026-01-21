import { useEffect, useRef, useState } from 'react';
import { renderMarkdown } from '../utils/markdownClient';

export const useMarkdown = (text: string, enabled = true, debounceMs = 120) => {
  const [html, setHtml] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setHtml('');
      return;
    }

    const requestId = (requestIdRef.current += 1);
    if (debounceMs <= 0) {
      renderMarkdown(text).then((result) => {
        if (requestIdRef.current !== requestId) return;
        setHtml(result);
      });
      return;
    }
    const timeoutId = window.setTimeout(() => {
      renderMarkdown(text).then((result) => {
        if (requestIdRef.current !== requestId) return;
        setHtml(result);
      });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [text, enabled, debounceMs]);

  return html;
};
