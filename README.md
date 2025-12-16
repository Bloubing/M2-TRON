# Projet Jeu TRON

## 1. Présentation du projet

Ce projet est un jeu multijoueur inspiré de Tron, jouable à la fois dans le navigateur et sur mobile grâce à Cordova. L’application présente une architecture client–serveur et une communication via Websockets. Elle permet une authentification simple, la création de lobbies, la possibilité de jouer plusieurs parties en parallèle et le stockage de statistiques dans MongoDB.

**Fonctionnalités :**

- Authentification simple (identifiant + mot de passe) avec stockage local temporaire dans le navigateur
- Choix de couleur du joueur et affichage du pseudo du joueur connecté
- Création de lobbies (nom, 2 à 4 joueurs), liste paginée, recherche instantanée, possibilité de rejoindre et dequitter un lobby
- Système d’état des joueurs (“Prêt” ou non), compte à rebours avant le lancement d'une partie, expulsion en cas de plus de 30 secondes d'inactivité
- Partie en temps réel : envoi des déplacements, rendu du trail sur SVG, synchronisation des positions via WebSocket
- Contrôles sur clavier (flèches) et boutons tactiles sur l'interface pour les téléphones
- Fin de partie avec un message gagnant/perdant et possibilité de relancer ou de rejoindre une partie relancée par un autre joueur
- Classement des joueurs (victoires/défaites, top 5)

## 2. Fichiers et dossiers importants

- Le rapport (`Rapport.pdf`)
- La spécification des paquets (`specification_paquets.md`)
- Le projet côté serveur (`serveur/`)
- Le projet côté client (`client/`)
- La base de données (`mongo-data/`)

## 3. Architecture du système

| Couche                   | Rôle                                                       | Fichiers clés                                                                                                                  |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Client Cordova           | UI, contrôles clavier/tactile, rendu des trails            | `client/www/index.html`, `client/www/css/tron.css`, `client/www/js/*`                                                          |
| Communication temps réel | Messages JSON sur WebSocket                                | `client/www/js/init.js`, `client/www/js/WebsocketClient.js`                                                                    |
| Serveur Node.js          | Gestion des connexions, lobbies, boucle de jeu, collisions | `serveur/WebsocketServer.js`, `serveur/GameHandler.js`, `serveur/Game.js`, `serveur/Player.js`                                 |
| Base de données          | Stockage des joueurs et des parties                        | MongoDB (URL par défaut `mongodb://127.0.0.1:27017/mongo-data` dans `serveur/db.js`), schémas Mongoose dans `serveur/models/*` |

## 4. Serveur (dossier `serveur/`)

- **Point d’entrée (`WebsocketServer.js`)** : expose le serveur WebSocket sur le port 9898 et route les messages (`connectionPlayer`, `getAllLobbies`, `createGame`, `joinGame`, `leaveLobby`, `playerReady`, `playerMovement`, `restartGame`, `getLeaderboard`, etc.).
- **Handler (`GameHandler.js`)** : gère les connexions actives, les lobbies, le compte à rebours, la diffusion des états de jeu et le stockage en base de données.
- **Modèle de partie (`Game.js`)** : gère la grille, l'intervalle de jeu, la détection de collisions, etc.
- **Modèle de joueur (`Player.js`)** : stocke la position, la direction courante, la couleur, l'état `alive/ready` et empêche les demi-tours.
- **Lobbies** : permet la création avec un nom et une capacité (2 à 4), comprend un système de recherche et l'attente que tous les joueurs soient prêts (compte à rebours, expulsion lorsque le délai est dépassé).
- **MongoDB** : collections `players` (identifiant, mot de passe en clair, victoires/défaites) et `games` (historique des parties, gagnant). Connexion par défaut dans `db.js`.

## 5. Client (dosser `client/`)

- **Écrans** : connexion, accueil (choix couleur), lobby (création/recherche/pagination), partie, fin de partie, leaderboard.
- **Communication WebSocket** : initialisée dans `www/js/init.js` (`global.ws = new WebSocket("ws://localhost:9898/");`) puis centralisée dans `www/js/WebsocketClient.js` qui distribue les paquets vers les handlers.
- **Handlers** :
  - `ConnectionHandler.js` : connexion utilisateur, stockage temporaire du mot de passe (5 min) via `localStorage`, navigation vers l’accueil.
  - `LobbyHandler.js` : récupération/affichage des lobbies, bouton “Prêt ?”, compte à rebours, rejoindre et quitter un lobby, pagination (2 lobbies par page) et recherche.
  - `GameHandler.js` : démarrage de partie, affichage du trail via SVG, réception des mouvements (`updateAllPlayerMovements`), fin/restart de partie.
  - `ControlHandler.js` : envoi des déplacements (touches fléchées ou boutons tactiles), blocage des directions impossibles (demi-tour).
  - `LeaderboardHandler.js` : affichage du classement (victoires/défaites).
- **Styles** : `www/css/tron.css` pour obtenir un thème néon et l'affichage des contrôles pour téléphone.

## 6. Base de données MongoDB

Pour notamment tester la fonctionnalité de classement, nous avons fourni une base de données pré-remplie.

Voici les 5 joueurs de la base de données :
`xebec`, `bilbo`, `zack`, `imu` et `c#`.

Tous les joueurs ont le même mot de passe : `a`.

Vous pouvez évidemment créer de nouveaux utilisateurs, en fournissant un pseudo qui n'est pas un des 5 pseudos cités ci-dessus.

## 7. Documentation de déploiement

### Pré-requis

| Outil               | Version conseillée | Rôle                                                          |
| ------------------- | ------------------ | ------------------------------------------------------------- |
| Environnement conda | (optionnel)        | Activer l’environnement MongoDB : Ex : `conda activate mongo` |
| Node.js + npm       | ≥ 18               | Dépendances et serveur WebSocket                              |
| Cordova             | Version NPM        | Build/run client web et mobile                                |
| MongoDB             | ≥ 6                | Stockage joueurs / parties                                    |

### Installation

### 7.1 Lancer MongoDB

Commencez par lancer MongoDB :

```sh
conda activate mongo # si MongoDB est dans un environnement conda (cf. installation Moodle)

# Depuis le terminal du dossier principal
mongod --dbpath ./mongo-data
```

### 7.2 Lancer le serveur Node.js

```sh
# Depuis un nouveau terminal et le dossier serveur
cd serveur
npm install
# Lancer le serveur dans le même terminal
node WebsocketServer.js
```

> Assurez-vous d'avoir bien lancé MongoDB ! Vérifiez votre configuration dans `serveur/db.js`.

### 7.3 Lancer le client Cordova (navigateur)

- Si besoin, dans `client/www/js/init.js`, remplacez `localhost` par l'adresse IP Websocket pour celle du serveur sur votre réseau :

```js
global.ws = new WebSocket("ws://localhost:9898/");
```

- Après avoir lancé le serveur (voir étape précédente), il faut désormais lancer un client :

```sh
# Depuis le dossier client
cd client
# Activer l'environnement conda DevWeb pour avoir cordova (cf. Moodle pour la mise en place de cet environnement)
conda activate DevWeb
npm install
# S'il n'est pas déjà ajouté :
cordova platform add browser
# Lancer l’application dans le navigateur
cordova run browser
```

### 7.4 Lancer le client sur Android

- Si besoin, dans `client/www/js/init.js`, remplacez `localhost` par l'adresse IP Websocket pour celle du serveur sur votre réseau :

```js
global.ws = new WebSocket("ws://localhost:9898/");
```

- S'assurer de bien avoir lancé le serveur (voir étape 6.2).

- Pour lancer le client sur Android, vous aurez besoin d'[Android Studio](https://developer.android.com/studio?hl=fr).

- Dans la partie client du projet, activez l'environnement Conda DevWeb :

```sh
# Depuis le dossier client
cd client
# Activer l'environnement conda DevWeb pour avoir cordova (cf. Moodle pour la mise en place de cet environnement)
conda activate DevWeb

```

- Ajoutez la plateforme Android :

```sh
cordova platform add android

cordova build android # Si le build échoue, assurez-vous d'avoir bien exporté ANDROID_HOME (cf. LaunchCordova.sh sur Moodle)
```

- Option 1 : Lancez un émulateur sur Android Studio (ou connectez votre téléphone à votre ordinateur, [voir la procédure ici](https://developer.android.com/codelabs/basic-android-kotlin-compose-connect-device?hl=fr)) sur le même réseau. Ensuite, lancez la commande :

```sh
cordova run android
```

- Option 2 : Téléchargez sur votre téléphone l'APK créé après le build, dans (`client/platforms/android/app/build/outputs/apk/debug/`)
