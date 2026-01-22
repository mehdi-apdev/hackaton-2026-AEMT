import { useForm } from "react-hook-form";
import "./AuthPage.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { faLock, faLockOpen, faSignature } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/AuthService";

type RegisterForm = {
  username: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    try {
      await AuthService.register({
        username: data.username,
        password: data.password,
      });
      await AuthService.login({
        username: data.username,
        password: data.password,
      });
      login(data.username);
      const state = location.state as { from?: { pathname?: string } } | null;
      const redirectTo = state?.from?.pathname || "/notes";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Erreur register:", error);
      alert("Impossible de créer le compte.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Bienvenue...</h1>
        <span className="subtitle">Enregistrez votre identité</span>
        <div className="divider" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nom de la victime</label>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faSignature} className="input-icon" />
              <input
                type="text"
                className={`form-input ${errors.username ? "input-error" : ""}`}
                placeholder="Warrior 3000"
                {...register("username", { required: "Le nom est requis" })}
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
                placeholder="******"
                {...register("password", {
                  required: "Mot de passe requis",
                  minLength: { value: 6, message: "6 caractères minimum" },
                })}
              />
            </div>
            {errors.password ? (
              <span className="error-message">{errors.password.message}</span>
            ) : null}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmez le mot de passe</label>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLockOpen} className="input-icon" />
              <input
                type="password"
                className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="******"
                {...register("confirmPassword", {
                  required: "Confirmez le mot de passe",
                  validate: (value) =>
                    value === password || "Les mots de passe ne correspondent pas",
                })}
              />
            </div>
            {errors.confirmPassword ? (
              <span className="error-message">{errors.confirmPassword.message}</span>
            ) : null}
          </div>

          <div className="divider" />
          <p className="auth-link">
            Déjà parmi nous ? <Link to="/login">Connectez-vous</Link>
          </p>
          <button className="btn-global" type="submit">
            Signer le pacte
          </button>
        </form>
      </div>
    </div>
  );
}
