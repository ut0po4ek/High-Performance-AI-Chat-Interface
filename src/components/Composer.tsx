import { useState } from 'react';
import { useChatStore } from '../store/chatStore';

export default function Composer() {
  const [value, setValue] = useState('');
  const addMessage = useChatStore((state) => state.addMessage);
  const setAutoScroll = useChatStore((state) => state.setAutoScroll);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    addMessage('user', trimmed);
    setAutoScroll(true);
    setValue('');
  };

  return (
    <div className="rounded-2xl border border-[#1b2a2f1f] bg-white/80 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask something or add more context..."
          rows={3}
          className="min-h-[80px] flex-1 resize-none rounded-2xl border border-[#1b2a2f1f] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#1b2a2f52]"
        />
        <button
          type="button"
          onClick={handleSend}
          className="rounded-full bg-[#e07a5f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Send
        </button>
      </div>
      <p className="mt-3 text-xs text-[#3d4a4f]">
        Tip: use Shift + Enter for new lines. Streaming keeps running independently of the composer.
      </p>
    </div>
  );
}
