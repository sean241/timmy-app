# Plan de Remplacement de la Landing Page

L'utilisateur souhaite utiliser le contenu du fichier `landing-page.tsx` (qu'il a collé précédemment et qui se trouve maintenant dans le système de fichiers) pour remplacer la landing page actuelle `app/page.tsx`.

Ce nouveau design est très complet et interactif, comprenant :
*   Une modale de réservation (`BookingModal`).
*   Une simulation de téléphone avec notifications (`PhoneMockup`).
*   Un calculateur de ROI.
*   Des sections dynamiques (FAQ, Personas).

## Étapes d'Implémentation

1.  **Lecture du fichier source** : Le fichier `landing-page.tsx` contient déjà tout le code nécessaire. Je l'ai lu et il est complet.

2.  **Mise à jour de `app/page.tsx`** :
    *   Je vais copier le contenu de `landing-page.tsx` vers `app/page.tsx`.
    *   **Important** : J'ajouterai la directive `"use client";` tout en haut du fichier, car le code utilise des hooks React (`useState`, `useEffect`) et des événements fenêtre (`window.scrollY`), ce qui requiert un composant Client.

3.  **Nettoyage** :
    *   Une fois copié et vérifié, je pourrai supprimer le fichier temporaire `landing-page.tsx` pour ne pas polluer le projet, bien que ce ne soit pas strictement obligatoire. Pour l'instant, je vais me concentrer sur la mise à jour de la page principale.

4.  **Vérification** :
    *   Le serveur de dev tourne déjà. Je vérifierai que la page s'affiche correctement sans erreurs.

## Action Immédiate

Remplacer le contenu de `app/page.tsx` par celui de `landing-page.tsx`, en ajoutant `"use client";`.
