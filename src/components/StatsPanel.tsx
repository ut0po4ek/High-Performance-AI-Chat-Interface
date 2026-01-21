import { memo } from 'react';
import { useChatStore } from '../store/chatStore';
import { useThrottledValue } from '../hooks/useThrottledValue';

const formatSize = (chars: number) => {
  const mb = chars / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

const StatsPanel = () => {
  const totalChars = useChatStore((state) => state.totalChars);
  const messageCount = useChatStore((state) => state.messageIds.length);
  const throttledChars = useThrottledValue(totalChars, 300);

  return (
    <div className="flex flex-col items-end gap-1 text-sm text-[#3d4a4f]">
      <span className="rounded-full border border-[#1b2a2f1f] bg-white/70 px-3 py-1">
        {messageCount} messages
      </span>
      <span className="rounded-full border border-[#1b2a2f1f] bg-white/70 px-3 py-1">
        {formatSize(throttledChars)} history
      </span>
    </div>
  );
};

export default memo(StatsPanel);
