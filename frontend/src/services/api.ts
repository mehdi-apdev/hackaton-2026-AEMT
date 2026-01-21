import axios from "axios";

const triggerLogout = () => {
  localStorage.removeItem("username");
  window.dispatchEvent(new Event("auth:logout"));
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        triggerLogout();
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
      console.error("API Error Response:", error.response.data);
      return Promise.reject(
        new Error(`API Error: ${error.response.status} ${error.response.statusText}`)
      );
    }
    if (error.request) {
      console.error("API No Response:", error.request);
      return Promise.reject(
        new Error("Network Error: No response from server. Is the backend running?")
      );
    }
    console.error("API Request Setup Error:", error.message);
    return Promise.reject(new Error(`Request Error: ${error.message}`));
  }
);

export default api;
