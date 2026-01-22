import api from "../../../services/api";

type LoginPayload = {
  username: string;
  password: string;
};

/**
 * The responses and payloads for authentication API calls.
 * Includes types for login and registration.
 */
type LoginResponse = string;

type RegisterPayload = {
  username: string;
  password: string;
};

type RegisterResponse = {
  id: number;
  username: string;
};

/**
 * Service for authentication-related API calls.
 * Includes methods for login, registration, and logout.
 */
const AuthService = {
  // Login an existing user
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },
  // Register a new user
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", payload);
    return response.data;
  },
  // Logout the current user
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};

export default AuthService;
