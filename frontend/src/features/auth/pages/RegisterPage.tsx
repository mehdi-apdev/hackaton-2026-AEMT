import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import "./RegisterPage.css";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ username: "", password: "", confirmPassword: "" });
  const [formValid, setFormValid] = useState(false);
  const [showScaryFeedback, setShowScaryFeedback] = useState(false);

  useEffect(() => {
    checkFormValidity();
  }, [inputs]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  }

  function checkFormValidity() {
    setFormValid(
      !!inputs.username && !!inputs.password && inputs.password === inputs.confirmPassword
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formValid) return;

    try {
      await AuthService.register({
        username: inputs.username,
        password: inputs.password,
      });
      triggerScaryFeedback();
    } catch (error) {
      console.error("Erreur register:", error);
      alert("Impossible de creer le compte.");
    }
  }

  function triggerScaryFeedback() {
    setShowScaryFeedback(true);

    setTimeout(() => {
      setShowScaryFeedback(false);
      navigate("/login");
    }, 2000);
  }

  return (
    <div className="register-container">
      {showScaryFeedback && (
        <div className="scary-feedback">
          <h1 className="success-text">BIENVENUE...</h1>
        </div>
      )}

      <div className="register-card">
        <h1 className="register-title">Rejoignez l'au-dela</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Nom de la victime
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Futur fantome"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="******"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirmez...
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="******"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={!formValid}
            style={{ background: "#b30000", color: "white" }}
          >
            Signer le pacte
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Deja mort ? <Link to="/login" style={{ color: "#ff6600" }}>Retourner au caveau</Link>
        </p>
      </div>
    </div>
  );
}
