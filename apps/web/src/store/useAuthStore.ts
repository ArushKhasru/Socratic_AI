import { create } from 'zustand';
import { User } from '@socratic-ai/types';
import axios from 'axios';
import api, { setAuthToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string }) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        set({ user: response.data.data, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setAuthToken(null);
      }
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setAuthToken(null);
      set({ user: null, loading: false });
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await api.put('/user/profile', data);
      if (response.data.success) {
        set({ user: response.data.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile failed', error);
      return false;
    }
  },
}));
