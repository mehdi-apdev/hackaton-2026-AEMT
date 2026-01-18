import { Outlet, Link } from "react-router-dom";
import "./MainLayout.css";

const MainLayout = () => {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/ping" className="nav-link">Ping</Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;