import { faSignOutAlt, faBookSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../auth/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./DashboardPage.css";

/**
 * DashboardPage - Dashboard landing page
 * Displays welcome message, user name, and quick action to create notes
 */
export default function DashboardPage() {
  const { user, logout} = useAuth();
  const navigate = useNavigate();
  const redirectToLogin = () => {
    navigate("/login");
  };

  return (
    <section className="home-container">
      <div className="home-card dashboard-card">
        
        {/* Welcome Section */}
        <header className="dashboard-header">
          <div className="user-info">
            <div className="welcome-title">
              <span className="greeting">Bienvenue,</span>
              <span className="user-name" data-text={user?.username || "Étranger"}>
                {user?.username || "Étranger"}
              </span>
            </div>
          </div>
        </header>
        {/* Main content: Subtitle and quick action cards */}
        <div className="dashboard-content">
          <p className="dashboard-subtitle">
            Que souhaitez-vous faire aujourd'hui ?
          </p>

          {/* Action cards: Quick note creation button */}
          <div className="action-grid">
            <Link to="/notes" className="action-card">
              <FontAwesomeIcon icon={faBookSkull} className="action-icon" />
              <h3>Entrer dans le Grimoire</h3>
              <p>Consultez vos notes interdites et sorts obscurs.</p>
            </Link>
          </div>
        </div>

        {/* Footer: Auth actions
        ------------------------
        If user is logged in, show logout button
        If no user, show login button
         */}
        <footer className="dashboard-footer">
          {user ? (
            <button onClick={logout} className="btn-text-logout">
              <FontAwesomeIcon icon={faSignOutAlt} /> Se déconnecter
            </button>
          ) : (
            <button onClick={redirectToLogin} className="btn-text-login">
              <FontAwesomeIcon icon={faSignOutAlt} /> Se connecter
            </button>
          )}
        </footer>

      </div>
    </section>
  );
}
