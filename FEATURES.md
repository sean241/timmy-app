# Fonctionnalités de l'Application Timmy
Date et heure : 29 Décembre 2025 à 10:35

### 📱 Mode Kiosk (Tablette de Pointage)
C'est l'interface utilisée par les employés sur le terrain.
*   **Pointage Simple & Rapide** : Interface épurée conçue pour les tablettes tactiles.
*   **Authentification par Code PIN** : Chaque employé dispose d'un code unique pour pointer.
*   **Preuve par Photo** : Prise de photo automatique à chaque pointage (Check-in/Check-out) pour vérifier l'identité.
*   **Mode Hors Ligne (Offline First)** : Fonctionne parfaitement sans internet. Les données sont sauvegardées localement et synchronisées dès que la connexion revient.
*   **Synchronisation Automatique** : Remontée des données vers le portail administrateur en temps réel (si connecté).

### 💻 Portail Administrateur (Dashboard)
C'est le centre de contrôle pour les gestionnaires.
*   **Tableau de Bord en Temps Réel** :
    *   Vue instantanée des présents, absents et retards.
    *   Flux d'activité en direct (Live Feed) des derniers pointages.
    *   Statistiques d'affluence par site.

*   **👥 Gestion des Employés & RH** :
    *   **Profils Complets** : Centralisez toutes les infos (Nom, Titre, Site, Photo, Contacts).
    *   **Codes PIN Sécurisés** : Génération automatique et gestion des codes d'accès individuels.
    *   **Trombinoscope Avancé** : Vue grille avec recherche instantanée, filtres par site ou statut (Actif/Archivé).
    *   **Import Excel Intelligent** : Assistant d'importation en 4 étapes (Upload, Mapping, Détection de doublons, Validation) pour intégrer vos équipes en masse sans erreur.
    *   **Intégration WhatsApp** : Vérification des numéros et envoi de messages (plannings, infos) directement depuis la fiche employé.
    *   **Badges & Photos** : Prise de photo via webcam intégrée ou upload, et génération de badges imprimables.

*   **🏗️ Gestion Multi-Sites** :
    *   **Cartographie de vos Opérations** : Créez et gérez un nombre illimité de sites ou chantiers (Nom, Ville, Adresse).
    *   **Indicateurs de Santé** : Visualisez pour chaque site le nombre d'employés affectés et l'état de connexion des pointeuses (En ligne/Hors ligne).
    *   **Archivage** : Masquez les chantiers terminés pour garder une vue claire, tout en conservant l'historique des données.
    *   **Geofencing (Prêt)** : Structure de données prête pour la future activation de la géolocalisation et des périmètres de sécurité.

*   **📱 Gestion de Flotte (Terminaux/Kiosques)** :
    *   **Appairage Simplifié** : Connectez une nouvelle tablette en quelques secondes grâce à un code unique à 6 caractères, sans configuration technique complexe.
    *   **Sécurité Modulaire** : Configurez le niveau de preuve requis pour chaque appareil :
        *   📸 **Photo** : Obligatoire ou non.
        *   🆔 **Badge** : Scan QR Code / NFC.
        *   ✍️ **Signature** : Signature tactile à l'écran.
    *   **Monitoring Live** : Surveillez l'état de votre parc (Online/Offline) et la date de dernière synchronisation (Heartbeat) pour détecter les pannes instantanément.
    *   **Contrôle à Distance** : Forcez la synchronisation, mettez à jour les configurations ou révoquez un accès à distance en cas de vol.

*   **⏱️ Suivi des Temps & Paie (Time Entries)** :
    *   **3 Vues Complètes** : Basculez instantanément entre le **Journal** (logs bruts), les **Feuilles de Temps** (calculs journaliers) et la **Synthèse** (totaux par période).
    *   **Calcul Automatique** : Le système reconstitue les journées de travail en associant les entrées et sorties (First-IN / Last-OUT) pour déterminer la durée effective travaillée.
    *   **Gestion Intelligente des Heures Sup** : Calcul automatique des heures supplémentaires au-delà du seuil quotidien défini (ex: >8h).
    *   **Déduction Automatique des Pauses** : Application automatique des règles de pause (ex: -30min si >6h de travail) pour simplifier la paie.
    *   **Correction & Anomalies** : Détection proactive des erreurs (oubli de dépointage la veille, retards) et outil de "Quick Fix" pour régulariser en un clic.
    *   **Édition Manuelle** : Possibilité pour les managers d'ajouter ou de corriger des pointages manuellement avec motif justificatif.
    *   **Validation & Verrouillage (Paie)** : Clôturez une période (semaine/mois) pour "Geler" les données et empêcher toute modification ultérieure, garantissant l'intégrité pour l'export paie.
    *   **Exports Excel** : Générez des rapports `.xlsx` détaillés et formatés (Timesheets, Synthèse RH) prêts à être transmis à votre comptable ou logiciel de paie.
    *   **Transparence & Preuve** : Chaque ligne de log conserve la photo prise au moment du pointage et indique si la donnée a été synchronisée en différé (Offline Sync).

*   **📅 Planification Avancée (Smart Planning)** :
    *   **Gestion Multi-Sites & Code Couleur** : Visualisez l'ensemble de vos opérations en un coup d'œil grâce à l'attribution de couleurs distinctes pour chaque site. Identifiez immédiatement qui travaille où.
    *   **Interface Glisser-Déposer (Drag & Drop)** : Une expérience utilisateur fluide permettant d'assigner ou de déplacer des shifts d'un simple geste, rendant la modification des horaires rapide et intuitive.
    *   **Duplication Puissante** : Gagnez un temps précieux en copiant des shifts, des journées ou même des semaines entières. Propagez un planning type sur plusieurs semaines ou mois futurs en quelques clics.
    *   **Bibliothèque de Templates** : Créez et sauvegardez des modèles de shifts ou de rotations récurrentes pour remplir vos grilles encore plus vite, sans avoir à recréer manuellement les mêmes horaires.
    *   **Baguette Magique (Auto-Fill)** : Laissez l'intelligence artificielle combler les vides. L'outil propose automatiquement les meilleurs candidats pour les créneaux ouverts en fonction des compétences et disponibilités.
    *   **Règles de Gestion & Anti-Conflits** : Le système veille au grain. Il détecte et signale automatiquement les incohérences : chevauchements d'horaires, non-respect des temps de repos, ou indisponibilités déclarées, garantissant un planning sans erreur avant même la publication.
    *   **Publication & Notifications Multi-Canaux** : Ne laissez personne dans l'incertitude. Lors de la publication des plannings, les employés concernés reçoivent instantanément une notification détaillée par **Email** ou directement sur **WhatsApp**, assurant une réception optimale de l'information.

### ⚙️ Aspects Techniques & Sécurité
*   **Sécurisé** : Données cryptées et hébergées (Supabase).
*   **Moderne** : Application Web Progressive (PWA), rapide et responsive.
*   **Multi-langues** : Support du Français et de l'Anglais (traduction dynamique).
