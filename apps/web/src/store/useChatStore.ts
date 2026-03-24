import { create } from 'zustand';
import axios from 'axios';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  _id: string;
  userId: string;
  subject: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  startChat: (subject: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  fetchChat: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentChat: null,
  loading: false,
  error: null,
  startChat: async (subject: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/chat/start', { subject });
      if (response.data.success) {
        set({ currentChat: response.data.data, loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to start chat', loading: false });
    }
  },
  sendMessage: async (content: string) => {
    const { currentChat } = get();
    if (!currentChat) return;

    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    // Optimistically add user message
    const userMessage: Message = { role: 'user', content: trimmedContent, timestamp: new Date() };
    set({
      loading: true,
      error: null,
      currentChat: {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
      },
    });

    try {
      const response = await api.post('/chat/message', {
        chatId: currentChat._id,
        content: trimmedContent,
      });
      if (response.data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: response.data.data.content,
          timestamp: new Date(),
        };
        const updated = get().currentChat;
        if (updated) {
          set({
            currentChat: {
              ...updated,
              messages: [...updated.messages, aiMessage],
            },
            loading: false,
          });
        }
      }
    } catch (error) {
      const previousChat = get().currentChat;
      const rolledBackMessages =
        previousChat?.messages.filter((message, index, messages) => {
          const isLastMessage = index === messages.length - 1;
          return !(
            isLastMessage &&
            message.role === 'user' &&
            message.content === trimmedContent
          );
        }) ?? currentChat.messages;

      let errorMessage = 'Failed to send message';
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.details ||
          error.response?.data?.error ||
          error.message ||
          errorMessage;
      }

      set({
        error: errorMessage,
        loading: false,
        currentChat: {
          ...currentChat,
          messages: rolledBackMessages,
        },
      });
    }
  },
  fetchChat: async (chatId: string) => {
    set({ loading: true });
    try {
      const response = await api.get(`/chat/${chatId}`);
      if (response.data.success) {
        set({ currentChat: response.data.data, loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch chat', loading: false });
    }
  },
}));
