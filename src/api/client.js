import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { getToken, clearSession } from "../utils/storage";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearSession();
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
