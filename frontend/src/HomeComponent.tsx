import { faGhost, faSignOutAlt, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "./features/auth/context/AuthContext";
import { useModal } from "./shared/context/ModalContext";
import { useNavigate } from "react-router-dom";
import "./HomeComponent.css";

/**
 * HomeComponent - Dashboard landing page
 * Displays welcome message, user name, and quick action to create notes
 */
export function HomeComponent() {
  const { user, logout } = useAuth();
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

  return (
    <section className="home-container">
      <div className="home-card dashboard-card">
        
        {/* Header: Welcome message and decorative ghost icon */}
        <header className="dashboard-header">
          <div className="user-info">
            <h1 className="welcome-title">
              <span className="greeting">Bon retour parmi nous,</span>
              <span className="user-name">{user?.username || "Mortel"}</span>
            </h1>
          </div>
          <FontAwesomeIcon icon={faGhost} className="header-icon" />
        </header>

        {/* Main content: Subtitle and quick action cards */}
        <div className="dashboard-content">
          <p className="dashboard-subtitle">
            Que souhaitez-vous faire aujourd'hui ?
          </p>

          {/* Action cards: Quick note creation button */}
          <div className="action-grid">
            <button onClick={handleCreateQuickNote} className="action-card secondary">
              <FontAwesomeIcon icon={faPlusCircle} className="action-icon" />
              <h3>Note Rapide</h3>
            </button>
          </div>
        </div>

        {/* Footer: Logout button */}
        <footer className="dashboard-footer">
          <button onClick={logout} className="btn-text-logout">
            <FontAwesomeIcon icon={faSignOutAlt} /> Fuir les lieux
          </button>
        </footer>

      </div>
    </section>
  );
}
