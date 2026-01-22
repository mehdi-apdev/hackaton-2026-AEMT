import { faGhost, faSignOutAlt, faPlusCircle, faBookSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "./features/auth/context/AuthContext";
import { useModal } from "./shared/context/ModalContext";
import { Link, useNavigate } from "react-router-dom";
import "./HomeComponent.css";

/**
 * HomeComponent - Dashboard landing page
 * Displays welcome message, user name, and quick action to create notes
 */
export function HomeComponent() {
  const { user, logout, login } = useAuth();
  const { openInputModal } = useModal();
  const navigate = useNavigate();
  /**
   * Opens a modal to create a quick note with a title
   * Then navigates to the notes page
   */
  const handleCreateQuickNote = () => {
    openInputModal(
      "Nouvelle Note Rapide",
      "Titre de votre pensée...",
      async (title) => {
        if (!title.trim()) return;
        navigate("/notes");
      }
    );
  };

  const redirectToLogin = () => {
    navigate("/login");
  };

  return (
    <section className="home-container">
      <div className="home-card dashboard-card">
        
        {/* Header: Welcome message and decorative ghost icon */}
        <header className="dashboard-header">
          <div className="user-info">
            <div className="welcome-title">
              <span className="greeting">Bienvenue, Mortel</span>
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

        {/* Footer: Logout button */}
        <footer className="dashboard-footer">
          <button onClick={logout} className="btn-text-logout">
            <FontAwesomeIcon icon={faSignOutAlt} /> Se déconnecter
          </button>
          <button onClick={redirectToLogin} className="btn-text-login">
            <FontAwesomeIcon icon={faSignOutAlt} /> Se connecter
          </button>
        </footer>

      </div>
    </section>
  );
}
