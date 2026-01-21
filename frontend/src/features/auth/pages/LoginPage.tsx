import { useForm } from "react-hook-form";
import "./AuthPage.css";
import { Link } from "react-router-dom";
import { faLock, faSignature } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoginPage() {
  // register : connecte l'input à la librairie
  // handleSubmit : valide avant d'appeler ta fonction onSubmit
  // errors : contient les messages si la validation échoue
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log("Données envoyées :", data);
    alert(`Bienvenue, ${data.username} !`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Grille du cimetière</h1>
        <span className="subtitle">Identifiez-vous pour entrer</span>
        <div className="divider" />
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* USERNAME */}
          <div className="form-group">
            <label className="form-label">Nom de la victime</label>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faSignature} className="input-icon" />
              <input
                type="text"
                className={`form-input ${errors.username ? "input-error" : ""}`}
                placeholder="Ex: Warrior 3000"
                {...register("username", { 
                  required: "Le nom est requis",
                  minLength: { value: 4, message: "4 caractères minimum" }})}
              />
            </div>
            {errors.username && <span className="error-message">{errors.username.message as string}</span>}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="***********"
                {...register("password", { 
                  required: "Mot de passe requis",
                  minLength: { value: 6, message: "6 caractères minimum" },
                  maxLength: { value: 20, message: "20 caractères maximum" }
                })}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password.message as string}</span>}
          </div>

          <div className="divider" />
          <p className="auth-link">
            Nouveau ? <Link to="/register">Nous rejoindre</Link>
          </p>
          <button type="submit" className="btn-global">
            Entrer... si vous l'osez
          </button>
        </form>
      </div>
    </div>
  );
}
