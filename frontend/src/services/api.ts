import axios from 'axios';

// 1. Création de l'instance Axios avec l'URL de base depuis les variables d'environnement
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Doit être "http://localhost:8080/api"
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Intercepteur de réponse pour la gestion globale des erreurs
api.interceptors.response.use(
    // Si la réponse est réussie (2xx), on la retourne directement
    (response) => response,
    
    // Si une erreur survient
    (error) => {
        if (error.response) {
            // Erreur renvoyée par le serveur (4xx, 5xx)
            console.error('API Error Response:', error.response.data);
            return Promise.reject(new Error(`API Error: ${error.response.status} ${error.response.statusText}`));
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('API No Response:', error.request);
            return Promise.reject(new Error('Network Error: No response from server. Is the backend running?'));
        } else {
            // Erreur lors de la configuration de la requête
            console.error('API Request Setup Error:', error.message);
            return Promise.reject(new Error(`Request Error: ${error.message}`));
        }
    }
);

export default api;
