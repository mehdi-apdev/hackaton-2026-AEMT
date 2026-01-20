import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

// 1. Définition de l'objet User (Basé sur ce que le Back utilise : DbUser / UserDetails)
// Pour l'instant, on a surtout besoin du username pour l'affichage.
export interface User {
  username: string;
}

// 2. Définition de ce que le Contexte va fournir au reste de l'app
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | null>(null);

// 3. Le Provider : C'est lui qui gère la logique et l'état
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au chargement de l'app, on vérifie si on a déjà des infos stockées
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

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

  // Fonction appelée quand le Login ou le Register réussit
  const login = (newToken: string, newUsername: string) => {
    // Mise à jour de l'état React
    setToken(newToken);
    setUser({ username: newUsername });

    // Sauvegarde dans le navigateur (pour résister au F5)
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
  };

  // Fonction de déconnexion
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('auth:logout'));
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 4. Hook personnalisé pour utiliser le contexte plus facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
