# On utilise une image Node.js simple
FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste du code
COPY . .

# On expose le port par défaut de Vite
EXPOSE 5173

# Lancement en mode développement, accessible hors du conteneur (--host)
CMD ["npm", "run", "dev", "--", "--host"]