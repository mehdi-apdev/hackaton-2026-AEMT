import axios from "axios";

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.dispatchEvent(new Event("auth:logout"));
};

// Axios instance with base URL from env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Example: "http://localhost:8080/api"
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        clearAuthStorage();
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
      console.error("API Error Response:", error.response.data);
      return Promise.reject(
        new Error(`API Error: ${error.response.status} ${error.response.statusText}`)
      );
    } else if (error.request) {
      console.error("API No Response:", error.request);
      return Promise.reject(
        new Error("Network Error: No response from server. Is the backend running?")
      );
    } else {
      console.error("API Request Setup Error:", error.message);
      return Promise.reject(new Error(`Request Error: ${error.message}`));
    }
  }
);

export default api;
