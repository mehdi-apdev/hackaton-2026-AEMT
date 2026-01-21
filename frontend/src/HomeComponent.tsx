import { faGhost, faSignOutAlt, faBookDead } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "./features/auth/context/AuthContext";
import "./HomeComponent.css";
import { Link } from "react-router-dom";

export function HomeComponent() {
  const { user, logout } = useAuth();

  return (
    <section className="home-container">
      {/* Effet de Brouillard */}
      <div className="fog-container">
        <div className="fog-img"></div>
        <div className="fog-img fog-img-2"></div>
      </div>

      <div className="home-card">
        
        <FontAwesomeIcon icon={faGhost} className="giant-icon" />

        <h1 className="welcome-title">
          Bienvenue <br/>
          <span className="user-name">{user?.username || "Mortel"}</span>
        </h1>

        <p className="welcome-subtitle">
          Le cimetière est calme ce soir... <br/>
          Prêt à consigner vos pensées les plus sombres ?
        </p>

        <div className="home-actions">
          {/* Quick link to notes (if you have a default /notes route or just for example purposes) */}
          <Link to="/notes" className="btn-ghost btn-primary-ghost">
            <FontAwesomeIcon icon={faBookDead} />
            Mes Grimoires
          </Link>

          <button onClick={logout} className="btn-ghost btn-logout">
            <FontAwesomeIcon icon={faSignOutAlt} />
            Fuir (Déconnexion)
          </button>
        </div>

      </div>
    </section>
  );
}