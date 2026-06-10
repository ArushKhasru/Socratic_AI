import axios from 'axios';

const FALLBACK_API_ORIGIN = 'http://localhost:5000';
const AUTH_TOKEN_STORAGE_KEY = 'socratic-auth-token';

let inMemoryAuthToken: string | null = null;

const readStoredAuthToken = () => {
  if (inMemoryAuthToken) return inMemoryAuthToken;
  if (typeof window === 'undefined') return null;

  try {
    inMemoryAuthToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    inMemoryAuthToken = null;
  }

  return inMemoryAuthToken;
};

export const setAuthToken = (token: string | null) => {
  inMemoryAuthToken = token;
  if (typeof window === 'undefined') return;

  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // The in-memory token still supports the current browser session.
  }
};

const consumeAuthTokenFragment = () => {
  if (typeof window === 'undefined' || !window.location.hash) return;

  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const token = fragment.get('auth_token');
  if (!token) return;

  setAuthToken(token);
  fragment.delete('auth_token');

  const remainingFragment = fragment.toString();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${remainingFragment ? `#${remainingFragment}` : ''}`
  );
};

const normalizeApiBaseUrl = (rawUrl?: string) => {
  const base = (rawUrl || FALLBACK_API_ORIGIN).trim().replace(/\/+$/, '');
  return /\/api$/i.test(base) ? base : `${base}/api`;
};

export const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

consumeAuthTokenFragment();

api.interceptors.request.use((config) => {
  const token = readStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
