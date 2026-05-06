import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export const getApiErrorMessage = (err) => {
  const detail = err?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || 'Invalid value').join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (typeof err?.response?.data?.message === 'string') {
    return err.response.data.message;
  }

  return 'Request failed';
};

export default api;