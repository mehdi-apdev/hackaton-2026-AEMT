# **Hackathon Template \- HELHa**

Ce dépôt contient le squelette complet pour le Hackathon. Il est configuré en **Monorepo** regroupant le Backend (Spring Boot) et le Frontend (React).

## **Prérequis**

Avant de commencer, assurez-vous d'avoir installé :

* **Java JDK 17** (ou 21).  
* **Node.js** (Version LTS).  
* **Docker Desktop** (Obligatoire pour la BDD).  
* **IntelliJ IDEA** (Recommandé pour le Back).  
* **VS Code** (Recommandé pour le Front).

## **Base de Données & Docker (Bonus)**

Nous n'avons **pas** besoin d'installer MySQL manuellement. Tout est géré via Docker.

### **1\. Démarrer la Base de Données**

Ouvrez un terminal à la racine du projet (là où se trouve le fichier docker-compose.yml) et lancez :

docker compose up \-d

*Cette commande télécharge et lance MySQL \+ PhpMyAdmin en arrière-plan.*

### **2\. Accéder aux données (PhpMyAdmin)**

Une fois lancé, vous pouvez gérer la BDD graphiquement ici :

* **URL :** [http://localhost:8081](https://www.google.com/search?q=http://localhost:8081)  
* **Utilisateur :** root  
* **Mot de passe :** root

**Note :** La base de données hackathon\_db est créée automatiquement au démarrage. Le Backend est déjà configuré pour s'y connecter.

### **3\. Arrêter les services**

Pour éteindre proprement les conteneurs à la fin de la journée :

docker compose down

## **Installation & Démarrage**

### **1\. Backend (Spring Boot)**

1. Ouvrez le dossier racine dans **IntelliJ IDEA**.  
2. Laissez Maven télécharger les dépendances (regardez la barre de progression en bas).  
3. Vérifiez que le fichier src/main/resources/application.properties est bien configuré (il devrait l'être par défaut).  
4. Lancez la classe principale BackendApplication.java.  
5. Le serveur démarre sur : http://localhost:8080

### **2\. Frontend (React \+ Vite)**

1. Ouvrez un terminal et allez dans le dossier frontend :  
   cd frontend

2. Installez les dépendances (à faire une seule fois) :  
   npm install

3. Lancez le serveur de développement :  
   npm run dev

4. Le site est accessible sur l'URL indiquée (généralement http://localhost:5173).

## **Workflow Git & Collaboration**

Pour éviter les conflits à 4 personnes, respectons ces règles strictes :

### **Les Branches**

* main : Code de production (ce qu'on montre au jury). **Interdit de push dessus directement.**  
* develop : Branche d'intégration commune. Tout part de là et revient là.  
* feature/nom-de-la-tache : Vos branches de travail.

### **Comment travailler ?**

1. **Toujours** partir de develop à jour :  
   git checkout develop  
   git pull origin develop  
   git checkout \-b feature/ma-super-feature

2. **Commit** régulièrement en suivant la convention :  
   * feat: ajouter une fonctionalité 
   * fix: corriger un bug 
   * docs: mise à jour la doc
   * style: changement de style  
3. **Push** votre branche :  
   git push origin feature/ma-super-feature

4. Faire une **Pull Request (PR)** sur GitHub vers develop et demander à un collègue de valider.

## **📂 Architecture Backend (Rappel)**

Le projet respecte une architecture en couches stricte (CQRS) :

* controllers/ : Reçoit les requêtes HTTP. **Aucune logique métier ici.**  
* application/ : Contient les cas d'utilisation (Handlers). **C'est ici qu'est le métier.**  
  * command/ : Pour tout ce qui modifie les données (Create, Update, Delete).  
  * query/ : Pour tout ce qui lit les données (Get).  
* domain/ : Les objets métier purs.  
* infrastructure/ : La liaison avec la BDD (Repositories, Entités DB).