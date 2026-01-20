import axios from "axios";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

type RegisterPayload = {
  username: string;
  password: string;
};

type RegisterResponse = {
  id: number;
  username: string;
};

const authBaseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const AuthService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${authBaseUrl}/auth/login`, payload);
    return response.data;
  },
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await axios.post<RegisterResponse>(`${authBaseUrl}/auth/register`, payload);
    return response.data;
  },
};

export default AuthService;
