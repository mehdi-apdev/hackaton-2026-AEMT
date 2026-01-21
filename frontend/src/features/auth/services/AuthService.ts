import api from "../../../services/api";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = string;

type RegisterPayload = {
  username: string;
  password: string;
};

type RegisterResponse = {
  id: number;
  username: string;
};

const AuthService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", payload);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};

export default AuthService;
