export const validateUsername = (username: string): string => {
  if (!username.trim()) return "Le nom d'utilisateur est requis.";
  if (username.length < 3) return "Le nom d'utilisateur doit contenir au moins 3 caractères.";
  if (username.length > 20) return "Le nom d'utilisateur ne peut pas dépasser 20 caractères.";
  return "";
};

export const validatePassword = (password: string): string => {
  if (!password) return "Le mot de passe est requis.";
  if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (password.length > 50) return "Le mot de passe ne peut pas dépasser 50 caractères.";
  return "";
};

export const validateConfirmPassword = (password: string, confirm: string): string => {
  if (!confirm) return "La confirmation du mot de passe est requise.";
  if (password !== confirm) return "Les mots de passe ne correspondent pas.";
  return "";
};
