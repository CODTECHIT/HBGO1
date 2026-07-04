import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token using the httpOnly cookie
        await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
