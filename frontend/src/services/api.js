import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

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
