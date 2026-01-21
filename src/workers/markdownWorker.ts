/// <reference lib="webworker" />

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseInline = (input: string) => {
  const escaped = escapeHtml(input);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
};

const parseMarkdown = (input: string) => {
  const parts = input.split(/```/g);
  let html = '';

  for (let i = 0; i < parts.length; i += 1) {
    if (i % 2 === 0) {
      html += parseInline(parts[i]);
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

const ctx = self as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<{ id: number; text: string }>) => {
  const { id, text } = event.data;
  const html = parseMarkdown(text);
  ctx.postMessage({ id, html });
};

export {};
