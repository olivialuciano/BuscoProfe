import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { getToken, clearSession } from "../utils/storage";

const api = axios.create({
  baseURL: API_BASE_URL,
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function isLoginRequest(config) {
  const url = config?.url?.toLowerCase() || "";

  return (
    url.includes("/auth/login") ||
    url.includes("/login") ||
    url.endsWith("login")
  );
}

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isUnauthorized = status === 401;
    const comesFromLogin = isLoginRequest(error?.config);

    if (isUnauthorized && !comesFromLogin) {
      clearSession();

      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
