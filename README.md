# **🏆 Hackathon Monorepo**

Ce dépôt contient le code complet pour le Hackathon. Il est configuré en **Monorepo** regroupant le Backend (Spring Boot) et le Frontend (React).

## **📋 Prérequis**

Avant de commencer, assurez-vous d'avoir installé :

* **Docker Desktop** (Obligatoire pour lancer le projet).  
* **Git** (Pour la gestion de version).  
* *(Optionnel)* **Java JDK 21 & Node.js** (Si vous souhaitez lancer les services hors Docker pour le développement).

## **🚀 Démarrage Rapide (Tout-en-un)**

Le projet est entièrement conteneurisé. Vous n'avez pas besoin d'installer Java, Node.js ou MySQL localement pour lancer l'application complète.

### **1\. Lancer l'application**

Ouvrez un terminal à la racine du projet et exécutez :

docker-compose up \--build

Cette commande va :

* Démarrer la base de données **MySQL**.  
* Compiler et lancer le **Backend** (Spring Boot) sur le port 8080.  
* Construire et lancer le **Frontend** (React) sur le port 5173.  
* Lancer **PhpMyAdmin** sur le port 8081.

### **2\. Accéder aux services**

Une fois que les logs indiquent que tout est démarré, accédez aux services suivants :

| Service | URL | Identifiants (si nécessaire) |
| :---- | :---- | :---- |
| **Frontend (Site Web)** | http://localhost:5173 | \- |
| **Backend (API)** | http://localhost:8080 | \- |
| **PhpMyAdmin (BDD)** | http://localhost:8081 | User: root / Pass: root |

### **3\. Arrêter l'application**

Pour tout éteindre proprement :

docker-compose down

## **🛠️ Développement Local (Optionnel)**

Si vous devez modifier le code et tester rapidement sans reconstruire les conteneurs Docker à chaque fois, vous pouvez lancer les services manuellement.

### **1\. Base de données (Toujours via Docker)**

Il est recommandé de laisser la BDD tourner via Docker même en développement local.

docker-compose up mysql phpmyadmin \-d

### **2\. Backend (Spring Boot)**

1. Ouvrez le dossier racine dans **IntelliJ IDEA**.  
2. Lancez la classe principale BackendApplication.java.  
3. L'API sera disponible sur http://localhost:8080.

### **3\. Frontend (React \+ Vite)**

1. Ouvrez un terminal dans le dossier frontend.  
2. Installez les dépendances :  
   npm install

3. Lancez le serveur de dev :  
   npm run dev

4. Le site sera accessible sur http://localhost:5173.

## **🔄 Workflow Git & Collaboration**

Pour éviter les conflits à 4 personnes, respectons ces règles strictes :

### **Les Branches**

* main : Code de production stable. **Interdit de push dessus directement.**  
* develop : Branche d'intégration commune. Tout part de là et revient là.  
* feature/nom-de-la-tache : Vos branches de travail individuelles.

### **Comment travailler ?**

1. **Toujours partir de develop à jour :**  
   git checkout develop  
   git pull origin develop  
   git checkout \-b feature/ma-super-feature

2. **Commit régulièrement en suivant la convention :**  
   * feat: ajouter une fonctionnalité  
   * fix: corriger un bug  
   * docs: mise à jour de la documentation  
   * style: changement de formatage (espaces, virgules...)  
3. **Push votre branche :**  
   git push origin feature/ma-super-feature

4. **Faire une Pull Request (PR)** sur GitHub vers develop et demander à un collègue de valider.

## **📂 Architecture Backend (Rappel)**

Le projet respecte une architecture en couches stricte (**CQRS**) :

* controllers/ : Reçoit les requêtes HTTP. Aucune logique métier ici.  
* application/ : Contient les cas d'utilisation (Handlers). C'est ici qu'est le métier.  
* command/ : Pour tout ce qui modifie les données (Create, Update, Delete).  
* query/ : Pour tout ce qui lit les données (Get).  
* domain/ : Les objets métier purs.  
* infrastructure/ : La liaison avec la BDD (Repositories, Entités DB).