import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
   // If not logged in, redirect to /login
// "state={{ from: location }}" returns to the requested page after logging in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

// If connected, we display the child routes (Outlet)
  return <Outlet />;
};

export default RequireAuth;