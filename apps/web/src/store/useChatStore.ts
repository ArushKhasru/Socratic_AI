import { create } from 'zustand';
import axios from 'axios';
import api from '@/lib/api';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  _id: string;
  userId: string;
  subject: string;
  topic?: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  collaborators?: { userId: string; access: 'read' | 'write' }[];
}

interface ChatState {
  currentChat: Chat | null;
  chats: Chat[];
  sharedChats: Chat[];
  loading: boolean;
  error: string | null;
  startChat: (subject: string, options?: { forceNew?: boolean }) => Promise<Chat | null>;
  sendMessage: (content: string) => Promise<void>;
  fetchSubjectChats: (subject: string) => Promise<void>;
  fetchSharedChats: () => Promise<void>;
  fetchChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateTopic: (chatId: string, topic: string) => Promise<void>;
  shareChat: (chatId: string, targetUserId: string) => Promise<void>;
  searchUsers: (name: string) => Promise<{ _id: string; name: string }[]>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentChat: null,
  chats: [],
  sharedChats: [],
  loading: false,
  error: null,
  fetchSubjectChats: async (subject: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/chat?subject=${subject}`);
      if (response.data.success) {
        set({ chats: response.data.data, loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch chats', loading: false });
    }
  },
  fetchSharedChats: async () => {
    try {
      const response = await api.get('/chat/shared');
      if (response.data.success) {
        set({ sharedChats: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch shared chats');
    }
  },
  startChat: async (subject: string, options?: { forceNew?: boolean }) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/chat/start', {
        subject,
        forceNew: options?.forceNew ?? false,
      });
      if (response.data.success) {
        set({ currentChat: response.data.data, loading: false });
        return response.data.data;
      }
    } catch (error) {
      set({ error: 'Failed to start chat', loading: false });
    }
    return null;
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
  deleteChat: async (chatId: string) => {
    set({ loading: true });
    try {
      const response = await api.delete(`/chat/${chatId}`);
      if (response.data.success) {
        const { currentChat, chats } = get();
        set({
          chats: chats.filter((c) => c._id !== chatId),
          currentChat: currentChat?._id === chatId ? null : currentChat,
          loading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to delete chat', loading: false });
    }
  },
  updateTopic: async (chatId: string, topic: string) => {
    set({ loading: true });
    try {
      const response = await api.patch(`/chat/${chatId}/topic`, { topic });
      if (response.data.success) {
        const { currentChat, chats } = get();
        const updatedChat = response.data.data;
        set({
          chats: chats.map((c) => (c._id === chatId ? updatedChat : c)),
          currentChat: currentChat?._id === chatId ? updatedChat : currentChat,
          loading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to update topic', loading: false });
    }
  },
  shareChat: async (chatId: string, targetUserId: string) => {
    set({ loading: true });
    try {
      await api.post(`/chat/${chatId}/share`, { targetUserId });
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to share chat', loading: false });
    }
  },
  searchUsers: async (name: string) => {
    try {
      const response = await api.get(`/user/search?name=${name}`);
      return response.data.data;
    } catch (error) {
      return [];
    }
  },
}));
