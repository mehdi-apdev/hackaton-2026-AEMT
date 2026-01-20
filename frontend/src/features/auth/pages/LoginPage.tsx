import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  // 1. STATE : On stocke les valeurs des champs
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [formValid, setFormValid] = useState(false);

  // 2. EFFECT : On vérifie la validité du formulaire à chaque changement
  useEffect(() => {
    checkFormValidity();
  }, [inputs]);

  // Gestion générique des changements dans les inputs
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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formValid) return;

    // Simulation de l'appel Login
    console.log("Tentative d'intrusion...", inputs);
    alert(`Bienvenue dans le manoir, ${inputs.username} !`);
    
    // Reset
    const form = e.target as HTMLFormElement;
    form.reset();
    setInputs({ username: "", password: "" });
    setFormValid(false);
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
                name="username" // Important pour le handleChange
                className="form-input" 
                placeholder="Ex: John Doe"
                onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input 
                type="password" 
                id="password"
                name="password" // Important pour le handleChange
                className="form-input" 
                placeholder="******"
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
