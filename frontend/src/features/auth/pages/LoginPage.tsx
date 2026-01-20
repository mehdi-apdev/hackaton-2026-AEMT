import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/AuthService";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    checkFormValidity();
  }, [inputs]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name; // "username" ou "password"
    const value = e.target.value;
    setInputs(values => ({ ...values, [name]: value }));
  }

  // Verify if the form is valid 
  function checkFormValidity() {
    // Simple validation : both fields must be non-empty
    setFormValid(!!inputs.username && !!inputs.password);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formValid) return;

    try {
      const response = await AuthService.login({
        username: inputs.username,
        password: inputs.password,
      });
      login(response.token, inputs.username);
    } catch (error) {
      console.error("Erreur login:", error);
      alert("Identifiants invalides.");
      return;
    }
    
    // Reset
    const form = e.target as HTMLFormElement;
    form.reset();
    setInputs({ username: "", password: "" });
    setFormValid(false);

    const state = location.state as { from?: { pathname?: string } } | null;
    const redirectTo = state?.from?.pathname || "/notes";
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Porte du Manoir</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Nom de la victime</label>
            <input 
                type="text" 
                id="username"
                name="username"
                className="form-input" 
                placeholder="Ex: Warrior 3000"
                onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input 
                type="password" 
                id="password"
                name="password"
                className="form-input" 
                placeholder="***********"
                onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-login" disabled={!formValid}>
            Entrer... si vous l'osez
          </button>
        </form>
      </div>
    </div>
  );
}
