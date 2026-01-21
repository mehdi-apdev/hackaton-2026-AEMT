import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSkullCrossbones, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './NotFoundComponent.css';

const NotFoundComponent = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <FontAwesomeIcon icon={faSkullCrossbones} className="notfound-icon" />
        
        <h1 className="notfound-code">404</h1>
        
        <h2 className="notfound-title">Égaré dans la brume ?</h2>
        
        <p className="notfound-text">
          Cette tombe est vide... La page que vous cherchez a sans doute rejoint l'au-delà.
        </p>
        
        <Link to="/" className="btn-back-home">
          <FontAwesomeIcon icon={faArrowLeft} />
          Retourner au portail
        </Link>
      </div>
    </div>
  );
};

export default NotFoundComponent;