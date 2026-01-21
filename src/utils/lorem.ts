const WORD_POOL = [
  'latency',
  'budget',
  'token',
  'pipeline',
  'scheduler',
  'adapter',
  'memory',
  'queue',
  'throttle',
  'stream',
  'viewport',
  'thread',
  'worker',
  'cache',
  'render',
  'chunk',
  'batch',
  'update',
  'selector',
  'virtual',
  'measure',
  'buffer',
  'observer',
  'signal',
  'stable',
  'frame',
  'layout',
  'density',
  'profile',
  'budgeted',
  'priority',
  'reactive',
  'diff',
  'surface',
  'shape',
  'intentional',
  'gradient',
  'elastic',
  'cursor',
  'syntax',
  'highlight',
  'workerize',
  'encode',
  'decode',
  'enqueue',
  'coalesce',
  'microtask',
  'macro',
  'interleave',
  'merge',
  'partition',
  'balance',
  'flow',
  'observer',
  'signal',
  'throughput',
  'limit',
  'window',
  'timeline',
  'stagger',
  'aware',
  'trigger',
  'hydrate',
  'defer',
  'threadsafe',
  'batching',
  'priority',
  'elasticity',
  'sampling',
  'cursor',
  'flush',
  'baseline',
  'coherent',
  'balanced',
  'budgeted',
  'atomic',
  'predictive',
  'adaptive',
  'sustain',
];

const BOLD_SNIPPETS = [
  'Performance note: coalesce chunks before rendering',
  'Tip: virtualize long histories to keep DOM light',
  'Insight: parse markdown off the main thread',
  'Reminder: keep the UI responsive at 60 FPS',
];

const CODE_SNIPPETS = [
  `type Chunk = { id: string; payload: string };

const queue: Chunk[] = [];

export function pushChunk(chunk: Chunk) {
  queue.push(chunk);
}

export function drain() {
  return queue.splice(0, queue.length);
}`,
  `const schedule = (fn: () => void) => {
  const id = requestAnimationFrame(fn);
  return () => cancelAnimationFrame(id);
};

schedule(() => console.log('frame'));`,
  `function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2) + ' MB';
}`,
];

const sentencePunctuation = ['.', '.', '.', '...', '!', '?'];

export const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export const createChunkGenerator = () => {
  let index = 0;
  let boldIndex = 0;
  let codeIndex = 0;

  return () => {
    const wordCount = 16 + (index % 10);
    const words: string[] = [];

    for (let i = 0; i < wordCount; i += 1) {
      words.push(WORD_POOL[(index + i) % WORD_POOL.length]);
    }

    index += wordCount;
    const punctuation = sentencePunctuation[index % sentencePunctuation.length];
    let chunk = `${words.join(' ')}${punctuation} `;

    if (index % 80 < wordCount) {
      chunk += `\n\n**${BOLD_SNIPPETS[boldIndex % BOLD_SNIPPETS.length]}**\n\n`;
      boldIndex += 1;
    }

    if (index % 200 < wordCount) {
      const snippet = CODE_SNIPPETS[codeIndex % CODE_SNIPPETS.length];
      chunk += `\n\n\`\`\`ts\n${snippet}\n\`\`\`\n\n`;
      codeIndex += 1;
    }

    return chunk;
  };
};
