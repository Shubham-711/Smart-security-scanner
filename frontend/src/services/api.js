import axios from 'axios';

// Uses VITE_API_URL in production (set in Vercel dashboard).
// Falls back to localhost for local dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const scanCode = async (code, language) => {
  const { data } = await api.post('/scan', { code, language });
  return data;
};

export const getScanStatus = async (scanId) => {
  const { data } = await api.get(`/scan/${scanId}`);
  return data;
};
