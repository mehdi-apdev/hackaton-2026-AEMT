import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faSignature } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import "./AuthPage.css";

type LoginForm = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await AuthService.login({
        username: data.username,
        password: data.password,
      });
      login(response.token, data.username);
      const state = location.state as { from?: { pathname?: string } } | null;
      const redirectTo = state?.from?.pathname || "/notes";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Erreur login:", error);
      alert("Identifiants invalides.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Grille du cimetiere</h1>
        <span className="subtitle">Identifiez-vous pour entrer</span>
        <div className="divider" />

        <form onSubmit={handleSubmit(onSubmit)}>
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
                  minLength: { value: 4, message: "4 caracteres minimum" },
                })}
              />
            </div>
            {errors.username ? (
              <span className="error-message">{errors.username.message}</span>
            ) : null}
          </div>

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
                  minLength: { value: 6, message: "6 caracteres minimum" },
                  maxLength: { value: 20, message: "20 caracteres maximum" },
                })}
              />
            </div>
            {errors.password ? (
              <span className="error-message">{errors.password.message}</span>
            ) : null}
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
