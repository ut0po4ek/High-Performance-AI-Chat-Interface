import { useEffect, useRef } from 'react';
import type { WheelEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useChatStore } from '../store/chatStore';
import { useThrottledValue } from '../hooks/useThrottledValue';
import MessageItem from './MessageItem';

export default function ChatList() {
  const messageIds = useChatStore((state) => state.messageIds);
  const autoScroll = useChatStore((state) => state.autoScroll);
  const setAutoScroll = useChatStore((state) => state.setAutoScroll);
  const lastMessageLengthRaw = useChatStore((state) => {
    const lastId = state.messageIds[state.messageIds.length - 1];
    if (!lastId) return 0;
    return state.entities[lastId]?.text.length ?? 0;
  });
  const lastMessageLength = useThrottledValue(lastMessageLengthRaw, 120);

  const parentRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: messageIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 6,
  });

  useEffect(() => {
    if (!autoScroll || messageIds.length === 0) return;
    if (scrollRafRef.current !== null) return;

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      rowVirtualizer.scrollToIndex(messageIds.length - 1, { align: 'end' });
    });
  }, [autoScroll, messageIds.length, lastMessageLength, rowVirtualizer]);

  const handleScroll = () => {
    const container = parentRef.current;
    if (!container) return;
    const atBottom =
      container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

    if (autoScroll && !atBottom) {
      setAutoScroll(false);
    }

    if (!autoScroll && atBottom) {
      setAutoScroll(true);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.deltaY < 0 && autoScroll) {
      setAutoScroll(false);
    }
  };

  if (messageIds.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#1b2a2f2e] bg-white/50 text-sm text-[#3d4a4f]">
        Start by adding a message or generate a long response.
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      onWheel={handleWheel}
      className="scrollbar-thin flex-1 overflow-auto rounded-2xl border border-[#1b2a2f1f] bg-white/60"
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const id = messageIds[virtualRow.index];
          return (
            <div
              key={id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageItem id={id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
