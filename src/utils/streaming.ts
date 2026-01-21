import { countWords, createChunkGenerator } from './lorem';

export type StreamController = {
  stop: () => void;
};

type StreamOptions = {
  targetWords: number;
  chunkIntervalMs: number;
  onChunk: (chunk: string) => void;
  onComplete?: (completed: boolean) => void;
};

export const startMockStream = ({
  targetWords,
  chunkIntervalMs,
  onChunk,
  onComplete,
}: StreamOptions): StreamController => {
  const nextChunk = createChunkGenerator();
  let producedWords = 0;
  let buffer = '';
  let rafId: number | null = null;
  let lastFlush = 0;
  const flushIntervalMs = 32;

  const flush = () => {
    if (!buffer) return;
    const payload = buffer;
    buffer = '';
    onChunk(payload);
  };

  const scheduleFlush = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame((timestamp) => {
      rafId = null;
      if (timestamp - lastFlush < flushIntervalMs) {
        scheduleFlush();
        return;
      }
      lastFlush = timestamp;
      flush();
    });
  };

  const intervalId = window.setInterval(() => {
    const chunk = nextChunk();
    buffer += chunk;
    producedWords += countWords(chunk);
    scheduleFlush();

    if (producedWords >= targetWords) {
      stopInternal(true);
    }
  }, chunkIntervalMs);

  const stopInternal = (completed: boolean) => {
    window.clearInterval(intervalId);
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    flush();
    if (onComplete) {
      onComplete(completed);
    }
  };

  return {
    stop: () => stopInternal(false),
  };
};
