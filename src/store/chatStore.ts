import { create } from 'zustand';
import { startMockStream, type StreamController } from '../utils/streaming';
import { createChunkGenerator } from '../utils/lorem';

export type Role = 'user' | 'assistant';

export type Message = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
};

type ChatState = {
  messageIds: string[];
  entities: Record<string, Message>;
  isGenerating: boolean;
  streamingMessageId: string | null;
  autoScroll: boolean;
  isSeeding: boolean;
  totalChars: number;
  addMessage: (role: Role, text: string) => string;
  appendToMessage: (id: string, chunk: string) => void;
  setAutoScroll: (value: boolean) => void;
  startGeneration: () => void;
  stopGeneration: () => void;
  seedHistory: () => void;
  clearHistory: () => void;
};

let idSeq = 0;
const createId = () => `msg_${Date.now().toString(36)}_${(idSeq += 1).toString(36)}`;

let activeStream: StreamController | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  messageIds: [],
  entities: {},
  isGenerating: false,
  streamingMessageId: null,
  autoScroll: true,
  isSeeding: false,
  totalChars: 0,
  addMessage: (role, text) => {
    const id = createId();
    set((state) => ({
      messageIds: [...state.messageIds, id],
      entities: {
        ...state.entities,
        [id]: {
          id,
          role,
          text,
          createdAt: Date.now(),
        },
      },
      totalChars: state.totalChars + text.length,
    }));
    return id;
  },
  appendToMessage: (id, chunk) => {
    if (!chunk) return;
    set((state) => {
      const message = state.entities[id];
      if (!message) return state;
      state.entities[id] = { ...message, text: message.text + chunk };
      return {
        entities: state.entities,
        totalChars: state.totalChars + chunk.length,
      };
    });
  },
  setAutoScroll: (value) => set({ autoScroll: value }),
  startGeneration: () => {
    const { isGenerating, isSeeding } = get();
    if (isGenerating || isSeeding) return;

    const messageId = get().addMessage('assistant', '');
    set({ isGenerating: true, streamingMessageId: messageId, autoScroll: true });

    activeStream = startMockStream({
      targetWords: 10000,
      chunkIntervalMs: 15,
      onChunk: (chunk) => get().appendToMessage(messageId, chunk),
      onComplete: () => {
        set({ isGenerating: false, streamingMessageId: null });
        activeStream = null;
      },
    });
  },
  stopGeneration: () => {
    if (activeStream) {
      activeStream.stop();
      activeStream = null;
    }
    set({ isGenerating: false, streamingMessageId: null });
  },
  seedHistory: () => {
    if (get().isSeeding) return;
    if (activeStream) {
      activeStream.stop();
      activeStream = null;
    }

    const nextChunk = createChunkGenerator();
    const messageIds: string[] = [];
    let entities: Record<string, Message> = {};
    let totalChars = 0;
    let index = 0;

    const targetChars = 6 * 1024 * 1024;
    const assistantTargetChars = 52000;
    const userTargetChars = 18000;
    const messagesPerBatch = 2;
    const batchDelayMs = 16;

    const buildMessage = (targetLength: number) => {
      const chunks: string[] = [];
      let currentLength = 0;
      while (currentLength < targetLength) {
        const chunk = nextChunk();
        chunks.push(chunk);
        currentLength += chunk.length;
      }
      return chunks.join('');
    };

    set({
      messageIds: [],
      entities: {},
      totalChars: 0,
      isGenerating: false,
      streamingMessageId: null,
      autoScroll: true,
      isSeeding: true,
    });

    const seedBatch = () => {
      for (let i = 0; i < messagesPerBatch && totalChars < targetChars; i += 1) {
        const role: Role = index % 3 === 0 ? 'user' : 'assistant';
        const targetLength = role === 'user' ? userTargetChars : assistantTargetChars;
        const text = buildMessage(targetLength);
        const id = createId();
        messageIds.push(id);
        entities = {
          ...entities,
          [id]: {
            id,
            role,
            text,
            createdAt: Date.now() - (messageIds.length - 1) * 60000,
          },
        };
        totalChars += text.length;
        index += 1;
      }

      set({
        messageIds: [...messageIds],
        entities,
        totalChars,
        isSeeding: totalChars < targetChars,
        autoScroll: true,
      });

      if (totalChars < targetChars) {
        window.setTimeout(seedBatch, batchDelayMs);
      }
    };

    seedBatch();
  },
  clearHistory: () => {
    if (activeStream) {
      activeStream.stop();
      activeStream = null;
    }
    set({
      messageIds: [],
      entities: {},
      totalChars: 0,
      isGenerating: false,
      streamingMessageId: null,
      autoScroll: true,
      isSeeding: false,
    });
  },
}));
