import { useMemo } from 'react';
import { useChatStore } from '../store/chatStore';
import { useMarkdown } from '../hooks/useMarkdown';

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

export default function MessageItem({ id }: { id: string }) {
  const message = useChatStore((state) => state.entities[id]);
  const streamingMessageId = useChatStore((state) => state.streamingMessageId);
  const isStreaming = streamingMessageId === id;

  const createdAt = message?.createdAt ?? 0;
  const shouldParse = !isStreaming;
  const html = useMarkdown(message?.text ?? '', shouldParse, isStreaming ? 0 : 160);
  const timeLabel = useMemo(() => (createdAt ? formatTime(createdAt) : ''), [createdAt]);

  if (!message) return null;

  const alignClass = message.role === 'user' ? 'justify-end' : 'justify-start';
  const bubbleClass =
    message.role === 'user'
      ? 'bg-[#1b2a2f] text-white border-transparent'
      : 'bg-white border border-[#1b2a2f1f]';
  const animationClass = isStreaming ? '' : 'animate-fadeUp';

  return (
    <div className={`flex ${alignClass} px-4 py-3`}>
      <div
        className={`w-full max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${bubbleClass} ${animationClass}`}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] opacity-70">
          <span>{message.role === 'user' ? 'You' : 'Assistant'}</span>
          <div className="flex items-center gap-2 text-[10px]">
            {isStreaming ? <span className="text-[#e07a5f]">Streaming</span> : null}
            <span>{timeLabel}</span>
          </div>
        </div>
        <div className="mt-3">
          {html ? (
            <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="markdown whitespace-pre-wrap">
              {message.text || (isStreaming ? '...' : '')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
