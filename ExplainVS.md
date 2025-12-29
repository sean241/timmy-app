# Comprendre le Versionnage (Semantic Versioning)

Le versionnage permet de créer des points de repère dans l'histoire de ton projet. La convention standard est le format **MAJEUR.MINEUR.CORRECTIF** (x.y.z).

## 1. Le dernier chiffre : CORRECTIF (Patch)
**Exemple :** `1.0.8` ➔ `1.0.9`
*   **Quand ?** : Pour des corrections de bugs invisibles ou mineurs.
*   **Le mot d'ordre** : *"J'ai réparé un truc qui ne marchait pas, mais rien n'a changé en apparence."*
*   *Exemple* : Correction d'une faute d'orthographe.

## 2. Le chiffre du milieu : MINEUR (Minor)
**Exemple :** `1.0.9` ➔ `1.1.0` *(Le dernier chiffre retombe à 0)*
*   **Quand ?** : Pour l'ajout d'une **nouvelle fonctionnalité** (feature) rétro-compatible.
*   **Le mot d'ordre** : *"J'ai ajouté des fonctionnalités cool, mais je n'ai rien cassé."*
*   *Exemple* : Ajout d'une Landing Page.

## 3. Le premier chiffre : MAJEUR (Major)
**Exemple :** `1.1.0` ➔ `2.0.0` *(Tout le reste retombe à 0)*
*   **Quand ?** : Pour des changements **incompatibles** ou radicaux (Rupture / Breaking Change).
*   **Le mot d'ordre** : *"Attention, si vous faites la mise à jour, ça change tout et d'anciennes choses pourraient ne plus marcher."*
*   *Exemple* : Refonte totale du design ou changement de base de données.

## Commandes Utiles
*   `npm version patch` : Augmente le dernier chiffre (0.0.X)
*   `npm version minor` : Augmente le chiffre du milieu (0.X.0)
*   `npm version major` : Augmente le premier chiffre (X.0.0)
*   `npm version 0.9.0` : Définit une version spécifique.

Cette commande modifie automatiquement `package.json`, crée un commit git et un tag git.
