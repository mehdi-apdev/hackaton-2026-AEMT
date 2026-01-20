import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUser({ username: storedUsername });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token" && !event.newValue) {
        handleLogout();
      }
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

<<<<<<< Updated upstream
  // Fonction appelée quand le Login ou le Register réussit
=======
>>>>>>> Stashed changes
  const login = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUser({ username: newUsername });
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
<<<<<<< Updated upstream
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('auth:logout'));
=======
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.dispatchEvent(new Event("auth:logout"));
>>>>>>> Stashed changes
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit etre utilise a l'interieur d'un AuthProvider");
  }
  return context;
};
