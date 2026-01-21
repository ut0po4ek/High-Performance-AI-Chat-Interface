import { useChatStore } from '../store/chatStore';

export default function ControlBar() {
  const isGenerating = useChatStore((state) => state.isGenerating);
  const isSeeding = useChatStore((state) => state.isSeeding);
  const autoScroll = useChatStore((state) => state.autoScroll);
  const seedHistory = useChatStore((state) => state.seedHistory);
  const clearHistory = useChatStore((state) => state.clearHistory);
  const startGeneration = useChatStore((state) => state.startGeneration);
  const stopGeneration = useChatStore((state) => state.stopGeneration);
  const setAutoScroll = useChatStore((state) => state.setAutoScroll);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1b2a2f1f] bg-white/70 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={seedHistory}
          disabled={isSeeding}
          className="rounded-full border border-[#1b2a2f26] px-4 py-2 text-sm transition hover:border-[#1b2a2f52] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSeeding ? 'Seeding…' : 'Seed history'}
        </button>
        <button
          type="button"
          onClick={clearHistory}
          disabled={isSeeding}
          className="rounded-full border border-[#1b2a2f26] px-4 py-2 text-sm transition hover:border-[#1b2a2f52] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startGeneration}
          disabled={isGenerating || isSeeding}
          className="rounded-full bg-[#1b2a2f] px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-[#1b2a2f66]"
        >
          Generate
        </button>
        <button
          type="button"
          onClick={stopGeneration}
          disabled={!isGenerating}
          className="rounded-full border border-[#1b2a2f26] px-4 py-2 text-sm font-medium text-[#1b2a2f] transition hover:border-[#1b2a2f52] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Stop generating
        </button>
        <button
          type="button"
          onClick={() => setAutoScroll(!autoScroll)}
          className="rounded-full border border-[#1b2a2f26] px-4 py-2 text-sm transition hover:border-[#1b2a2f52]"
        >
          Auto-scroll: {autoScroll ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
}
