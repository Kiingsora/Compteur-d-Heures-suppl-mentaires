# Mon Compteur d'Heures

Une application simple et efficace pour gérer vos heures supplémentaires et vos heures de récupération. Le projet fonctionne à la fois comme une page web autonome et comme une extension de navigateur (Chrome, Edge, Firefox, Brave... voir branche extension_navigator).

## 🚀 Fonctionnalités

- **Suivi précis** : Ajoutez vos heures "faites" (+) ou "récupérées" (-).
- **Calcul automatique** : Le solde total se met à jour instantanément.
- **Sauvegarde locale** : Vos données sont enregistrées dans votre navigateur (LocalStorage), rien n'est envoyé sur un serveur.
- **Export CSV** : Téléchargez un récapitulatif compatible Excel de vos heures.
- **Design compact** : Interface optimisée pour une utilisation en petite fenêtre (popup d'extension).

## 📂 Structure du projet

Le projet est organisé de manière propre pour le développement et l'hébergement :

- `index.html` : La page principale (et popup de l'extension).
- `css/style.css` : Le style de l'application.
- `js/script.js` : La logique (calculs, sauvegarde, export).
- `manifest.json` : Le fichier de configuration pour l'extension de navigateur.

---

## 💻 Installation

### Option 1 : Utilisation Simple (Site Web)
Vous pouvez simplement ouvrir le fichier `index.html` dans n'importe quel navigateur web. L'application fonctionnera parfaitement.

---

## 🛠️ Développement
Si vous souhaitez modifier le code :
- Les fichiers sont éditables avec n'importe quel éditeur de texte (VS Code recommandé).
- En mode extension, n'oubliez pas de cliquer sur le bouton "Actualiser" de l'extension dans `chrome://extensions` après chaque modification du code.
