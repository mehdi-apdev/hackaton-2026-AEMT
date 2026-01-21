import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AuthService from "../services/AuthService";

export interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUser({ username: storedUsername });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "username" && !event.newValue) {
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

  const login = (username: string) => {
    setUser({ username });
    localStorage.setItem("username", username);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("username");
    void AuthService.logout();
    window.dispatchEvent(new Event("auth:logout"));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
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
