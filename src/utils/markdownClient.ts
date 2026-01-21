type MarkdownRequest = {
  id: number;
  text: string;
};

type MarkdownResponse = {
  id: number;
  html: string;
};

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const fallbackParse = (input: string) => {
  const parts = input.split(/```/g);
  let html = '';

  for (let i = 0; i < parts.length; i += 1) {
    if (i % 2 === 0) {
      const escaped = escapeHtml(parts[i]);
      html += escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
    } else {
      let block = parts[i];
      const newlineIndex = block.indexOf('\n');
      if (newlineIndex !== -1) {
        const firstLine = block.slice(0, newlineIndex).trim();
        if (/^[a-zA-Z0-9_-]+$/.test(firstLine)) {
          block = block.slice(newlineIndex + 1);
        }
      }
      html += `<pre><code>${escapeHtml(block)}</code></pre>`;
    }
  }

  return html;
};

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, (html: string) => void>();

const ensureWorker = () => {
  if (worker || typeof Worker === 'undefined') return;
  worker = new Worker(new URL('../workers/markdownWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (event: MessageEvent<MarkdownResponse>) => {
    const { id, html } = event.data;
    const resolver = pending.get(id);
    if (resolver) {
      resolver(html);
      pending.delete(id);
    }
  };
};

export const renderMarkdown = (text: string) => {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(fallbackParse(text));
  }

  ensureWorker();

  return new Promise<string>((resolve) => {
    const id = (seq += 1);
    pending.set(id, resolve);
    worker?.postMessage({ id, text } satisfies MarkdownRequest);
  });
};
