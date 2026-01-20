import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Si pas connecté, on redirige vers /login
    // "state={{ from: location }}" permet de revenir à la page demandée après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si connecté, on affiche les routes enfants (Outlet)
  return <Outlet />;
};

export default RequireAuth;