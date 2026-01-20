import axios from "axios";
<<<<<<< Updated upstream

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.dispatchEvent(new Event("auth:logout"));
};

// Axios instance with base URL from env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Example: "http://localhost:8080/api"
=======

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.dispatchEvent(new Event("auth:logout"));
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
>>>>>>> Stashed changes
  headers: {
    "Content-Type": "application/json",
  },
});

<<<<<<< Updated upstream
// Request interceptor to inject token
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// Response interceptor for global error handling
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    } else if (error.request) {
=======
    }
    if (error.request) {
>>>>>>> Stashed changes
      console.error("API No Response:", error.request);
      return Promise.reject(
        new Error("Network Error: No response from server. Is the backend running?")
      );
<<<<<<< Updated upstream
    } else {
      console.error("API Request Setup Error:", error.message);
      return Promise.reject(new Error(`Request Error: ${error.message}`));
    }
=======
    }
    console.error("API Request Setup Error:", error.message);
    return Promise.reject(new Error(`Request Error: ${error.message}`));
>>>>>>> Stashed changes
  }
);

export default api;
