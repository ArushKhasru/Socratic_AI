import axios from 'axios';

const FALLBACK_API_ORIGIN = 'http://localhost:5000';

const normalizeApiBaseUrl = (rawUrl?: string) => {
  const base = (rawUrl || FALLBACK_API_ORIGIN).trim().replace(/\/+$/, '');
  return /\/api$/i.test(base) ? base : `${base}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  withCredentials: true,
});

export default api;
