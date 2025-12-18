export type Language = 'fr' | 'en';

export const translations = {
    fr: {
        common: {
            back: "Retour",
            login: "Se connecter",
            signup: "S'inscrire",
            loading: "Chargement...",
            error: "Erreur",
            success: "Succès",
            continue: "Continuer",
            validate: "Valider",
            cancel: "Annuler",
            required: "Requis",
            optional: "Optionnel",
            email: "Email",
            password: "Mot de passe",
            confirmPassword: "Confirmer le mot de passe",
            firstName: "Prénom",
            lastName: "Nom",
            phone: "Téléphone",
            terms: "J'accepte les Conditions d'utilisation et la Politique de confidentialité.",
            copyright: "Timmy Solutions.",
        },
        sidebar: {
            nav: {
                dashboard: "Tableau de Bord",
                schedule: "Planning",
                timeEntries: "Pointages",
                team: "Équipe",
                kiosks: "Terminaux",
                sites: "Sites",
                payroll: "Paie",
                launchKiosk: "Lancer Kiosque",
                settings: "Paramètres",
                help: "FAQ & Aide",
                support: "Support",
                feedback: "Avis",
                refer: "Parrainer"
            },
            groups: {
                home: "Le Quotidien",
                people: "La Gestion",
                system: "Le Système",
                support: "Support & Expérience"
            },
            logout: "Se déconnecter",
            collapse: "Réduire la barre latérale",
            expand: "Agrandir la barre latérale"
        },
        days: {
            mon: { short: "Lun", full: "Lundi" },
            tue: { short: "Mar", full: "Mardi" },
            wed: { short: "Mer", full: "Mercredi" },
            thu: { short: "Jeu", full: "Jeudi" },
            fri: { short: "Ven", full: "Vendredi" },
            sat: { short: "Sam", full: "Samedi" },
            sun: { short: "Dim", full: "Dimanche" }
        },
        login: {
            title: "Connexion à votre compte",
            noAccount: "Pas encore de compte ?",
            rememberMe: "Se souvenir de moi",
            orLoginWith: "ou se connecter avec",
            forgotPassword: "Mot de passe oublié ?",
            heroTitle: "Simplifiez la gestion de vos équipes.",
            heroSubtitle: "Gérez vos employés, plannings, pointages, communications et rapports en temps réel.",
            errors: {
                default: "Erreur lors de la connexion",
                invalid_credentials: "Email ou mot de passe incorrect",
            }
        },
        signup: {
            welcome: "Bienvenue !",
            subtitle: "Pour commencer, dites-nous qui vous êtes.",
            manager: {
                title: "Vous êtes Manager",
                desc: "Je veux créer et gérer mon équipe.",
                createTitle: "Créer un compte Manager",
                trial: "✨ 21 jours d'essai gratuit",
                workEmail: "Email professionnel",
                verifyPhone: "Vérifier le numéro",
                startTrial: "Démarrer l'essai gratuit",
            },
            employee: {
                title: "Vous êtes Employé",
                desc: "Je veux rejoindre une équipe existante.",
                areaTitle: "Espace Employé",
                instruction: "Pour rejoindre Timmy, demandez à votre manager de vous envoyer une invitation ou votre code PIN personnel.",
                chooseOther: "Choisir un autre profil",
            },
            otp: {
                placeholder: "Code (6 chiffres)",
                sent: "Code envoyé !",
                verify: "Vérifier",
                error: "Code incorrect. Veuillez réessayer.",
                phoneRequired: "Veuillez entrer un numéro de téléphone valide.",
                verifyFirst: "Veuillez vérifier votre numéro de téléphone.",
            },
            errors: {
                passwordLength: "Le mot de passe doit contenir au moins 6 caractères.",
                passwordMatch: "Les mots de passe ne correspondent pas.",
                default: "Une erreur est survenue lors de l'inscription.",
            },
            success: {
                title: "Compte créé !",
                message: "Bienvenue sur Timmy",
                emailSent: "Un email de confirmation a été envoyé à",
                setup: "Configurer mon espace",
            },
            hero: {
                managerTitle: "Pilotez votre activité.",
                managerDesc: "Gérez vos plannings, suivez les heures et optimisez votre paie en toute simplicité.",
                employeeTitle: "Rejoignez votre équipe.",
                employeeDesc: "Accédez à vos plannings et pointez facilement.",
            }
        },
        forgotPassword: {
            title: "Mot de passe oublié ?",
            desc: "Entrez votre adresse courriel et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
            placeholder: "exemple@timmy.app",
            submit: "Envoyer le lien",
            successTitle: "Courriel envoyé !",
            successDesc: "Si un compte existe avec l'adresse",
            successDesc2: "vous recevrez un courriel avec les instructions pour réinitialiser votre mot de passe.",
            resend: "Renvoyer un courriel",
            heroTitle: "Récupération de compte",
            heroDesc: "Ne vous inquiétez pas, cela arrive aux meilleurs d'entre nous.",
        },
        onboarding: {
            step1: {
                title: "Votre Entreprise",
                desc: "Commençons par configurer votre espace de travail.",
                companyName: "Nom de l'entreprise",
                companyPlaceholder: "Ex: BTP Gabon Services",
                sector: "Secteur d'activité",
                sectorPlaceholder: "Rechercher un secteur...",
                country: "Pays",
                countryDesc: "Le pays définit votre devise et fuseau horaire.",
            },
            step2: {
                title: "Premier Lieu de Travail",
                desc: "Où vos équipes vont-elles pointer ?",
                siteName: "Nom du site / chantier",
                sitePlaceholder: "Ex: Chantier Oloumi",
                address: "Adresse",
                addressPlaceholder: "Pour la géolocalisation future",
            },
            step3: {
                title: "Votre Profil",
                desc: "Créez votre profil pour tester le pointage vous-même.",
                whatsapp: "Numéro WhatsApp",
                whatsappPlaceholder: "Pour recevoir vos notifications",
                whatsappNote: "Nous vous demanderons votre consentement plus tard.",
                pin: "Code PIN (Pour pointer)",
                submit: "Terminer la configuration",
            },

            sectors: [
                "BTP / Construction",
                "Restauration / Hôtellerie",
                "Santé / Médical",
                "Commerce / Retail",
                "Logistique / Transport",
                "Services à la personne",
                "Industrie",
                "Agriculture",
                "Éducation",
                "Technologie / IT",
                "Autre"
            ],
            noResult: "Aucun résultat"
        },
        feedback: {
            title: "Donnez votre avis",
            subtitle: "Aidez-nous à améliorer Timmy !",
            type: "Type de retour",
            types: {
                bug: "Bug 🐛",
                idea: "Idée 💡",
                other: "Autre ❤️"
            },
            message: "Votre message",
            placeholder: "Dites-nous ce que vous en pensez...",
            nps: "Recommanderiez-vous Timmy ?",
            submit: "Envoyer mon avis",
            success: "Merci pour votre retour !",
            cancel: "Annuler"
        },
        support: {
            title: "Contacter le Support",
            subtitle: "Une question ? Un problème ? Nous sommes là.",
            type: "Quel est le sujet ?",
            types: {
                technical: "Problème Technique / Bug",
                billing: "Facturation & Abonnement",
                feature: "Question Fonctionnalité",
                account: "Accès Compte & Connexion",
                other: "Autre demande"
            },
            subType: "Précision",
            subTypes: {
                technical: {
                    error: "Message d'erreur affiché",
                    crash: "Application bloquée / Crash",
                    slow: "Lenteur anormale",
                    mobile: "Problème sur mobile/tablette",
                    other: "Autre bug"
                },
                billing: {
                    inovice: "Erreur sur facture",
                    payment: "Échec paiement",
                    upgrade: "Changer de forfait",
                    cancel: "Résilier l'abonnement"
                },
                feature: {
                    howto: "Comment utiliser une fonction ?",
                    missing: "Fonctionnalité manquante",
                    improvement: "Suggestion d'amélioration"
                },
                account: {
                    login: "Impossible de se connecter",
                    password: "Mot de passe oublié",
                    invite: "Inviter un collègue",
                    mfa: "Problème Double Authentification"
                },
                other: {
                    partner: "Partenariat",
                    feedback: "Feedback général",
                    other: "Autre"
                }
            },
            priority: "Priorité",
            priorities: {
                low: "Basse (Info)",
                medium: "Moyenne (Besoin d'aide)",
                high: "Haute (Blocant)"
            },
            message: "Description du problème",
            placeholder: "Décrivez votre problème en détail...",
            submit: "Envoyer la demande",
            success: "Demande envoyée !",
            successDesc: "Notre équipe vous répondra par email sous 24h.",
            cancel: "Fermer"
        },
        help: {
            title: "Centre d'Aide & FAQ",
            subtitle: "Trouvez des réponses rapides à vos questions sur l'utilisation de Timmy.",
            searchPlaceholder: "Rechercher une question (ex: planning, facture...)",
            contactTitle: "Vous ne trouvez pas votre réponse ?",
            contactDesc: "Notre équipe de support est disponible pour vous aider.",
            contactBtn: "Contacter le Support",
            categories: {
                general: "Général & Compte",
                planning: "Planning & Shifts",
                tracking: "Pointages & Présence",
                employees: "Employés & Équipes",
                kiosks: "Terminaux & Tablettes",
                billing: "Facturation"
            },
            faq: {
                general: [
                    { q: "Comment changer mon mot de passe ?", a: "Allez dans Paramètres > Mon Profil. Vous trouverez une section 'Sécurité' pour mettre à jour votre mot de passe." },
                    { q: "Puis-je changer la langue de l'interface ?", a: "Oui, Timmy est disponible en Français et Anglais. Changez la langue via le sélecteur en bas à gauche de la barre latérale ou dans Paramètres > Mon Profil." },
                    { q: "Comment fonctionnent les rôles utilisateurs ?", a: "Le Propriétaire a tous les droits. Le Manager gère les équipes et plannings mais ne voit pas la facturation. Le Comptable a un accès lecture seule aux rapports." }
                ],
                planning: [
                    { q: "Comment publier un planning ?", a: "Une fois vos shifts créés, ils sont en mode 'Brouillon' (rayés). Cliquez sur le bouton 'Publier' en haut à droite pour les rendre visibles aux employés et envoyer les notifications." },
                    { q: "Puis-je copier une semaine type ?", a: "Absolument. Utilisez le bouton 'Copier' dans la barre d'outils du planning. Vous pouvez dupliquer la semaine en cours vers plusieurs semaines futures d'un coup." },
                    { q: "À quoi servent les modèles (templates) ?", a: "Les modèles permettent de créer des shifts récurrents (ex: 'Matin 8h-16h'). Glissez-déposez un modèle sur le calendrier pour créer un shift instantanément." }
                ],
                tracking: [
                    { q: "Qu'est-ce qu'une anomalie ?", a: "Une anomalie est détectée quand un employé a pointé l'entrée mais a oublié de pointer la sortie le jour précédent. Vous devez la corriger manuellement dans 'Suivi des heures'." },
                    { q: "Comment ajouter un pointage oublié ?", a: "Allez dans 'Pointages' > 'Journal', puis cliquez sur 'Pointage Manuel'. Sélectionnez l'employé, la date et les heures d'entrée/sortie." },
                    { q: "Comment valider les heures pour la paie ?", a: "Dans 'Pointages', utilisez le bouton 'Valider la période'. Cela verrouille les données pour empêcher toute modification ultérieure et garantit l'intégrité de la paie." }
                ],
                employees: [
                    { q: "Comment inviter un employé ?", a: "Allez dans 'Équipe' et cliquez sur 'Nouvel Employé'. Remplissez ses infos. S'il a un numéro WhatsApp, il recevra ses accès directement." },
                    { q: "À quoi sert le code PIN ?", a: "Le code PIN est unique à chaque employé. C'est ce code qu'il doit saisir sur la tablette (Kiosque) pour pointer ses arrivées et départs." },
                    { q: "Comment archiver un employé parti ?", a: "Dans la fiche de l'employé, cliquez sur 'Archiver'. Ses données historiques sont conservées, mais il ne pourra plus pointer et n'apparaîtra plus dans les filtres actifs." }
                ],
                kiosks: [
                    { q: "Le mode hors-ligne fonctionne-t-il ?", a: "Oui ! Les tablettes enregistrent les pointages même sans internet. Elles se synchroniseront automatiquement dès que la connexion sera rétablie." },
                    { q: "Comment jumeler une nouvelle tablette ?", a: "Installez l'app Kiosque sur la tablette. Elle affichera un code. Dans votre admin, allez dans 'Terminaux' > 'Nouveau Terminal' et entrez ce code." },
                    { q: "La photo est-elle obligatoire ?", a: "Vous pouvez configurer cette option par terminal. C'est utile pour éviter le 'buddy punching' (pointer pour un collègue)." }
                ],
                billing: [
                    { q: "Quels sont les moyens de paiement ?", a: "Nous acceptons les cartes bancaires et les paiements mobiles (Airtel Money, Moov Money) via notre partenaire de paiement." },
                    { q: "Où trouver mes factures ?", a: "Vos factures sont disponibles et téléchargeables au format PDF dans la section Paramètres > Abonnement." }
                ]
            }
        },
        updatePassword: {
            title: "Nouveau mot de passe",
            desc: "Entrez votre nouveau mot de passe sécurisé.",
            newPassword: "Nouveau mot de passe",
            confirmPassword: "Confirmer le mot de passe",
            submit: "Mettre à jour le mot de passe",
            successTitle: "Mot de passe mis à jour !",
            successDesc: "Vous allez être redirigé vers la page de connexion...",
            goToLogin: "Aller à la connexion",
            errors: {
                length: "Le mot de passe doit contenir au moins 6 caractères.",
                match: "Les mots de passe ne correspondent pas.",
                default: "Une erreur est survenue.",
            }
        },
        dashboard: {
            totalEmployees: "Total Employés",
            siteActivity: "Activité des Sites",
            title: "Suivi des Heures",
            subtitle: "Consultez, corrigez et validez les pointages de vos équipes.",
            filters: {
                searchPlaceholder: "Rechercher un employé...",
                date: {
                    today: "Aujourd'hui",
                    yesterday: "Hier",
                    week: "Cette Semaine",
                    lastWeek: "Semaine Dernière",
                    month: "Ce Mois",
                    custom: "Période Personnalisée"
                },
                allSites: "Tous les sites"
            },
            onSite: "Sur Site",
            activeToday: "Actifs Aujourd'hui",
            offlineSyncs: "Synchros Hors Ligne",
            anomaliesTitle: "Anomalies Détectées",
            anomaliesDesc: "Les employés suivants ont oublié de pointer la sortie.",
            fixBtn: "Corriger",
            absencesTitle: "Employés Absents",
            absencesDesc: "La journée a commencé. Ces employés n'ont pas encore pointé.",
            absentTag: "Absent",
            dayStartedAt: "Journée commencée à",
            view: {
                logs: "Journal (Détails)",
                timesheets: "Feuilles (Quotidien)",
                reports: "Synthèse (Cumul)"
            },
            report: {
                employee: "Employé",
                daysWorked: "Jours Travaillés",
                totalHours: "Heures Totales (Net)",
                totalOvertime: "Dont Heures Sup."
            },
            timesheet: {
                date: "Date",
                employee: "Employé",
                firstIn: "Début",
                lastOut: "Fin",
                total: "Total Travaillé",
                overtime: "Heures Sup.",
                status: "Statut"
            },
            exportExcel: "Export Excel",
            manualEntry: "Pointage Manuel",
            validatePeriod: "Valider la Période",
            periodLocked: "Période Validée",
            confirmLock: "Attention: Cette action va figer les données pour la période sélectionnée. Continuer ?"
        },
        systemLogs: {
            title: "Journaux système",
            desc: "Consultez l'historique des actions effectuées sur l'application.",
            table: {
                action: "Action",
                user: "Utilisateur",
                details: "Détails",
                date: "Date",
                level: "Niveau"
            },
            levels: {
                INFO: "Info",
                WARN: "Avertissement",
                ERROR: "Erreur"
            },
            empty: "Aucun log trouvé.",
            export: "Exporter en JSON",
            searchPlaceholder: "Rechercher par action, utilisateur...",
            viewDetails: "Voir les détails",
            hideDetails: "Masquer les détails"
        },
        settings: {
            title: "Paramètres",
            desc: "Gérez votre entreprise, votre équipe et vos préférences.",
            tabs: {
                general: "Général",
                team: "Équipe",
                notifications: "Notifications",
                billing: "Abonnement",
                integrations: "Intégrations",
                logs: "Journaux",
                profile: "Mon Profil"
            },
            general: {
                companyInfo: "Informations Entreprise",
                save: "Enregistrer",
                saving: "Enregistrement...",
                saved: "Enregistré !",
                logo: "Logo de l'entreprise",
                uploadLogo: "Télécharger le logo",
                logoDesc: "JPG, PNG ou SVG. Max 2Mo. Apparaîtra sur vos tablettes.",
                companyName: "Nom de l'entreprise",
                industry: "Secteur d'activité",
                currency: "Devise",
                timezone: "Fuseau horaire",
                payrollRules: "Règles de Paie",
                payrollCycle: "Cycle de Paie",
                exportFormat: "Format d'export par défaut",
                attendanceRules: "Règles de Présence (Anti-Conflit)",
                latenessTolerance: "Tolérance de retard",
                latenessDesc: "Seuil avant de marquer comme 'En retard'.",
                roundingRule: "Règle d'arrondi",
                roundingDesc: "Pour le calcul des heures supplémentaires.",
                autoLunch: "Pause déjeuner auto",
                autoLunchDesc: "Déduire automatiquement le temps de pause",
                ifDay: "si journée >",
                scheduleSettings: "Paramètres de Planning",
                stdDayDuration: "Durée standard d'une journée",
                hours: "heures",
                startOfWeek: "Début de la semaine",
                startTime: "Heure de début (Arrivée)",
                endTime: "Heure de fin (Départ)",
                workingDays: "Jours ouvrés de l'entreprise",
                workingDaysDesc: "Les jours décochés seront considérés comme des heures supplémentaires.",
                nightHours: "Heures de nuit (Majorées)",
                from: "De",
                to: "À",
                sector: {
                    btp: "BTP / Construction",
                    restauration: "Restauration / Hôtellerie",
                    retail: "Commerce / Retail",
                    health: "Santé / Médical",
                    logistics: "Logistique / Transport",
                    services: "Services",
                    other: "Autre"
                },
                payrollCycles: {
                    monthly: "1er au 30/31 (Mois Civil)",
                    midMonth: "15 au 15",
                    weekly: "Hebdomadaire",
                    biweekly: "Bi-hebdomadaire"
                },
                latenessTolerances: {
                    none: "Aucune (Strict)",
                    min5: "5 minutes",
                    min10: "10 minutes",
                    min15: "15 minutes"
                },
                roundingRules: {
                    exact: "Minute exacte",
                    quarter: "Quart d'heure (15 min)",
                    half: "Demi-heure (30 min)"
                },
                weekDays: {
                    monday: "Lundi",
                    sunday: "Dimanche"
                },
                shortWeekDays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
                lunchDuration: {
                    min30: "30 min",
                    min45: "45 min",
                    hour1: "1 heure",
                    min90: "1h30"
                },
                export: {
                    xlsx: "Excel (.xlsx)",
                    csv: "CSV (.csv)",
                    pdf: "PDF (.pdf)"
                },
                rounding: {
                    exact: "Minute exacte",
                    min5: "5 minutes",
                    min15: "15 minutes",
                    min30: "30 minutes"
                },
                break: {
                    min30: "30 min",
                    min45: "45 min",
                    min60: "1 heure",
                    min90: "1h30"
                },
                week: {
                    monday: "Lundi",
                    sunday: "Dimanche",
                    saturday: "Samedi"
                },
                alert: {
                    min15: "15 minutes",
                    min30: "30 minutes",
                    min60: "1 heure",
                    min120: "2 heures"
                }
            },
            team: {
                title: "Gestion des Utilisateurs",
                desc: "Gérez l'accès à votre tableau de bord Timmy.",
                invite: "Inviter un membre",
                table: {
                    user: "Utilisateur",
                    role: "Rôle",
                    status: "Statut",
                    actions: "Actions",
                    you: "Vous",
                    active: "Actif",
                    invited: "Invité",
                    pending: "En attente",
                    pendingUser: "Utilisateur en attente",
                    resendInvite: "Renvoyer l'invitation"
                },
                roles: {
                    owner: "Propriétaire",
                    manager: "Manager",
                    accountant: "Comptable",
                    infoTitle: "💡 À propos des rôles",
                    ownerDesc: "Accès complet, y compris facturation et suppression.",
                    managerDesc: "Gère les équipes et les plannings. Pas d'accès facturation.",
                    accountantDesc: "Accès lecture seule aux rapports de paie et exports."
                },
                inviteModal: {
                    title: "Inviter un membre",
                    email: "Adresse Email",
                    role: "Rôle",
                    cancel: "Annuler",
                    send: "Envoyer l'invitation",
                    sending: "Envoi...",
                    sent: "Envoyé !"
                }
            },
            notifications: {
                title: "Centre de Notifications",
                channels: "Canaux de Communication",
                emailDesc: "Pour les rapports et alertes admin",
                whatsappDesc: "Pour les alertes urgentes et les employés",
                operationalAlerts: "Alertes Opérationnelles (Urgences)",
                lateAlert: "Quand un employé est > 15 min en retard",
                absentAlert: "Quand un employé est absent > 30 min après le début",
                earlyAlert: "Quand un employé part avant la fin (Départ anticipé)",
                technicalAlerts: "Alertes Techniques & Système",
                critical: "Critique",
                syncAlert: "M'alerter si une pointeuse n'a pas synchronisé depuis plus d'1 heure",
                reports: "Rapports & Résumés",
                dailyReport: "Rapport quotidien par email à 08:00",
                weeklyReport: "Résumé hebdomadaire (Dimanche soir)",
                employeeAlerts: "Alertes Employés (Ce qu'ILS reçoivent)",
                scheduleAlert: "Recevoir mon planning le Dimanche soir (WhatsApp)",
                shiftReminder: "Rappel 1h avant mon shift",
                whatsappConsent: "Les messages WhatsApp ne sont envoyés qu'aux employés ayant consenti via leur profil."
            },
            billing: {
                title: "Abonnement & Facturation",
                active: "ACTIF",
                monthly: "Facturation mensuelle • Prochain paiement le 15 Jan",
                month: "/mois",
                employeeUsage: "Utilisation Employés",
                upgradePrompt: "Besoin de plus ?",
                upgradeLink: "Passez au plan Illimité",
                paymentMethod: "Moyen de Paiement",
                edit: "Modifier",
                expires: "Expire le",
                altPayment: "Paiement Alternatif",
                mobileMoneyBtn: "Payer via Mobile Money / Virement",
                billingDetails: "Détails de Facturation",
                invoiceHistory: "Historique des Factures",
                table: {
                    date: "Date",
                    amount: "Montant",
                    status: "Statut",
                    invoice: "Facture",
                    paid: "Payé"
                },
                mmModal: {
                    title: "Paiement Mobile Money",
                    instructions: "Instructions de paiement :",
                    sendTo: "Pour renouveler votre abonnement, envoyez",
                    number: "au numéro Airtel Money :",
                    name: "Nom : Timmy SAS",
                    proof: "Preuve de paiement",
                    refPlaceholder: "Référence Transaction (ex: ID 123456789)",
                    upload: "Télécharger une capture",
                    change: "Cliquer pour changer",
                    sendProof: "Envoyer la preuve"
                },
                upgradeModal: {
                    title: "Passez au niveau supérieur 🚀",
                    current: "ACTUEL",
                    activePlan: "Plan Actif",
                    recommended: "RECOMMANDÉ",
                    choose: "Choisir ce plan",
                    processing: "Traitement...",
                    sent: "Demande envoyée !"
                },
                editModal: {
                    title: "Modifier les détails de facturation",
                    company: "Nom de l'entreprise",
                    address: "Adresse complète",
                    email: "Email de facturation"
                }
            },
            integrations: {
                title: "Intégrations",
                connected: "Connecté",
                comingSoon: "Bientôt",
                whatsapp: {
                    title: "WhatsApp Business API",
                    desc: "Connecté via Meta Cloud API",
                    quota: "Quota Messages",
                    quality: "Qualité Ligne"
                },
                mobileMoney: {
                    title: "Exports Mobile Money",
                    desc: "Générez des fichiers de paiement de masse compatibles portails Airtel & Moov."
                },
                googleSheets: {
                    title: "Synchro Google Sheets",
                    desc: "Synchronisez vos pointages en temps réel vers une feuille Google Sheets.",
                    connect: "Connecter Google",
                    info: "Envoie automatiquement les heures validées vers votre feuille choisie chaque nuit à minuit."
                },
                calendar: {
                    title: "Calendrier",
                    desc: "Affichez les shifts de votre équipe directement dans votre calendrier personnel (Google/Outlook).",
                    connect: "Connecter"
                },
                sections: {
                    company: "Entreprise & Stratégie",
                    accounting: "Comptabilité & ERP",
                    access: "Contrôle d'Accès (IoT)",
                    bi: "Business Intelligence"
                },
                hiring: {
                    title: "Timmy Hiring",
                    powered: "Propulsé par Jaden",
                    desc: "Besoin de renforts ? Trouvez des profils qualifiés en 1 clic.",
                    discover: "Découvrir"
                },
                webhook: {
                    title: "Webhook",
                    desc: "Recevez des événements en temps réel (Pointages, etc.)",
                    url: "URL de Callback",
                    test: "Tester"
                }
            },
            profile: {
                title: "Mon Profil",
                firstName: "Prénom",
                lastName: "Nom",
                email: "Email",
                phone: "Téléphone",
                security: "Sécurité",
                newPassword: "Nouveau mot de passe",
                confirmPassword: "Confirmer le mot de passe",
                enable2FA: "Activer l'Authentification à Double Facteur (2FA)",
                preferences: "Préférences",
                language: "Langue"
            }
        },
        sites: {
            title: "Sites & Lieux",
            desc: "Gérez vos différents lieux d'activité.",
            newSite: "Nouveau Site",
            active: "Actifs",
            archived: "Archivés",
            noActive: "Aucun site actif",
            noArchived: "Aucun site archivé",
            startAdding: "Commencez par ajouter votre premier lieu d'activité.",
            archivedDesc: "Les sites archivés apparaîtront ici.",
            createSite: "Créer un site",
            createCard: "Créer un nouveau site",
            edit: "Modifier",
            archive: "Archiver",
            restore: "Restaurer",
            viewSchedule: "Voir le planning de ce site",
            offline: "Hors ligne",
            noAddress: "Aucune adresse fournie",
            modal: {
                newTitle: "Nouveau Site",
                editTitle: "Modifier le Site",
                name: "Nom du Site",
                namePlaceholder: "Ex: Siège, Chantier A...",
                city: "Ville",
                cityPlaceholder: "Ex: Libreville",
                address: "Adresse / Indications",
                addressPlaceholder: "Ex: Quartier Louis, portail bleu...",
                timezone: "Fuseau horaire",
                geofencing: "Géolocalisation",
                disabled: "Désactivé",
                soon: "BIENTÔT",
                cancel: "Annuler",
                create: "Créer le Site",
                update: "Mettre à jour",
                saving: "Enregistrement..."
            },
            confirm: {
                archiveTitle: "Archiver le Site",
                restoreTitle: "Restaurer le Site",
                archiveMsg: "Êtes-vous sûr de vouloir archiver \"{name}\" ? Il ne sera plus accessible pour les pointages.",
                restoreMsg: "Êtes-vous sûr de vouloir restaurer \"{name}\" ?",
                cancel: "Annuler",
                confirm: "Confirmer"
            },
            toast: {
                fetchError: "Échec de la récupération des sites",
                archiveSuccess: "Site archivé avec succès",
                restoreSuccess: "Site restauré avec succès",
                statusError: "Échec de la mise à jour du statut",
                updateSuccess: "Site mis à jour avec succès",
                createSuccess: "Site créé avec succès",
                saveError: "Échec de l'enregistrement du site"
            }
        },
        kiosks: {
            title: "Terminaux & Pointeuses",
            desc: "Gérez vos tablettes et bornes de pointage.",
            newKiosk: "Nouveau Terminal",
            noKiosks: "Aucun terminal configuré",
            startAdding: "Ajoutez votre première tablette pour commencer à pointer.",
            createKiosk: "Ajouter un terminal",
            status: {
                ONLINE: "En ligne",
                OFFLINE: "Hors ligne",
                PENDING: "En attente",
                REVOKED: "Révoqué"
            },
            sync: "Synchroniser",
            syncAll: "Tout synchroniser",
            table: {
                name: "Nom",
                site: "Site",
                status: "Statut",
                version: "Version",
                lastSync: "Dernière synchro",
                pairingCode: "Code de jumelage"
            },
            modal: {
                newTitle: "Nouveau Terminal",
                editTitle: "Modifier le Terminal",
                name: "Nom du terminal",
                namePlaceholder: "Ex: Tablette Entrée Principal",
                site: "Site de rattachement",
                sitePlaceholder: "Sélectionner un site",
                security: "Sécurité & Options",
                requirePhoto: "Photo obligatoire",
                requireBadge: "Scan de badge NFC",
                requireSignature: "Signature obligatoire",
                cancel: "Annuler",
                create: "Créer le terminal",
                update: "Mettre à jour",
                saving: "Enregistrement..."
            },
            toast: {
                fetchError: "Erreur lors du chargement des terminaux",
                createSuccess: "Terminal créé avec succès",
                updateSuccess: "Terminal mis à jour avec succès",
                deleteSuccess: "Terminal supprimé",
                error: "Une erreur est survenue"
            },
            confirm: {
                deleteTitle: "Supprimer le terminal",
                deleteMsg: "Êtes-vous sûr de vouloir supprimer ce terminal ? Cette action est irréversible.",
                cancel: "Annuler",
                confirm: "Supprimer"
            }
        },
        employees: {
            title: "Équipe",
            desc: "Gérez vos employés, journaliers et leurs accès.",
            import: "Importer Excel / CSV",
            newEmployee: "Nouvel Employé",
            searchPlaceholder: "Rechercher par nom ou poste...",
            allSites: "Tous les sites",
            active: "Actifs",
            archived: "Archivés",
            noEmployees: "Aucun employé trouvé",
            noEmployeesDesc: "Essayez de modifier vos filtres ou ajoutez un nouveau membre.",
            card: {
                archived: "Archivé",
                unassigned: "Non assigné",
                pinCode: "Code PIN",
                whatsapp: "WhatsApp",
                verified: "Vérifié",
                sendVerification: "Envoyer message de vérification",
                unverify: "Annuler la vérification",
                verifyManually: "Vérifier manuellement",
                noPhone: "Pas de numéro",
                edit: "Modifier",
                badge: "Badge PDF",
                archive: "Archiver",
                unarchive: "Restaurer"
            },
            form: {
                createTitle: "Créer un Employé",
                editTitle: "Modifier l'Employé",
                personalInfo: "Infos Personnelles",
                firstName: "Prénom",
                lastName: "Nom",
                jobTitle: "Poste / Rôle",
                jobPlaceholder: "Ex: Maçon, Serveur...",
                contact: "Contact",
                whatsapp: "WhatsApp",
                email: "Email (Optionnel)",
                access: "Accès & Sécurité",
                assignedSite: "Site Assigné",
                unassigned: "-- Non assigné --",
                pinCode: "Code PIN (Accès)",
                pinDesc: "Utilisé pour pointer sur la tablette.",
                cancel: "Annuler",
                save: "Enregistrer"
            },

            importModal: {
                title: "Importer des Employés",
                important: "Important",
                importantDesc: "Pour que l'import fonctionne correctement, veuillez utiliser notre modèle prédéfini.",
                downloadTemplate: "Télécharger le modèle Excel",
                templateDesc: "Format .xlsx - Prénom, Nom, Poste...",
                then: "Ensuite",
                dragDrop: "Glissez votre fichier ici",
                browse: "ou cliquez pour parcourir",
                mapColumns: "Mapper les Colonnes",
                mapDesc: "Veuillez faire correspondre les colonnes de votre fichier aux champs employés.",
                selectColumn: "-- Sélectionner Colonne --",
                back: "Retour",
                next: "Suivant",
                fileDetected: "Fichier détecté",
                analysis: "Résumé de l'analyse",
                linesDetected: "lignes détectées.",
                newEmployees: "Nouveaux employés",
                readyImport: "Prêts à importer",
                duplicates: "Doublons détectés",
                willIgnore: "Seront ignorés",
                hasPin: "ont déjà un code PIN.",
                autoPin: "recevront un code auto.",
                importBtn: "Importer {count} employés",
                successTitle: "Import Réussi !",
                successDesc: "employés ont été ajoutés à votre équipe.",
                close: "Fermer"
            },
            badge: {
                title: "Badge Employé",
                print: "Imprimer",
                cancel: "Annuler",
                role: "Employé",
                accessBadge: "Badge d'accès personnel"
            },
            toast: {
                archiveConfirm: "Archiver cet employé ? Il ne pourra plus pointer.",
                unarchiveConfirm: "Restaurer cet employé ?",
                archiveError: "Erreur lors de l'archivage",
                verifyError: "Erreur lors de la vérification",
                verified: "WhatsApp vérifié manuellement",
                unverified: "WhatsApp non vérifié",
                orgNotFound: "ID Organisation introuvable",
                updateError: "Erreur lors de la mise à jour",
                updateSuccess: "Employé mis à jour avec succès",
                createError: "Erreur lors de la création",
                createSuccess: "Employé créé avec succès",
                importError: "Erreur d'import pour la ligne",
                importFailed: "Échec de l'import",
                genericError: "Une erreur est survenue"
            }
        },
        planning: {
            title: "Planning Hebdomadaire",
            subtitle: "Gérez les quarts de travail de votre équipe.",
            publishBtn: "Publier",
            printBtn: "Imprimer",
            copyBtn: "Copier",
            today: "Aujourd'hui",
            employees: "Employés",
            unassigned: "À Pourvoir",
            dragHelp: "Glissez pour assigner",
            addShift: "Ajouter un shift",
            generatedOn: "Généré le",
            managerSig: "Signature Manager",
            siteManagerSig: "Signature Chef de Chantier",
            templates: "Modèles",
            templatesHint: "Glissez-déposez pour créer",
            headerTotal: "Total",
            filters: {
                search: "Rechercher un employé...",
                allSites: "Tous les sites",
            },
            tooltips: {
                quickFill: "Remplissage Auto (Lun-Ven 8h-17h)",
                addOpenShift: "Ajouter un créneau ouvert"
            },
            modal: {
                publishTitle: "Publier le Planning 🚀",
                confirmPublishTitle: "Confirmer la publication ?",
                confirmPublishDesc: "Vous allez publier",
                shiftsDraft: "shifts",
                currentlyDraft: "actuellement en brouillon.",
                willNotify: "Les employésconcernés seront notifiés.",
                channels: {
                    email: "Email",
                    emailDesc: "Envoyer les plannings par email",
                    whatsapp: "WhatsApp / SMS",
                    whatsappDesc: "Notification instantanée sur mobile"
                },
                cancel: "Annuler",
                confirm: "Publier",
                sending: "Envoi...",
                success: "Publié !",

                // Copy
                copyTitle: "Copier la Semaine",
                source: "Source",
                destination: "Destination(s)",
                currentWeek: "Semaine Actuelle",
                selectWeeks: "Sélectionnez les semaines où dupliquer ce planning.",
                copyAction: "Copier vers {count} semaines",
                copySimple: "Copier",
                copied: "Copié !",

                // Shift
                newShiftTitle: "Nouveau Shift ✨",
                editShiftTitle: "Modifier le Shift",
                start: "Début",
                end: "Fin",
                break: "Pause (minutes)",
                site: "Site / Chantier",
                sitePlaceholder: "Sélectionner un site...",
                note: "Note (Optionnel)",
                notePlaceholder: "Instructions, tâches à faire...",
                add: "Ajouter",
                create: "Créer le shift",
                update: "Mettre à jour",
                delete: "Supprimer",
                confirmDelete: "Êtes-vous sûr de vouloir supprimer ce shift ?"
            },
            toast: {
                publishSuccess: "Planning publié avec succès ! 🚀",
                publishError: "Échec de la publication.",
                addSuccess: "Shift ajouté !",
                addError: "Erreur lors de l'ajout.",
                updateSuccess: "Shift mis à jour",
                deleteSuccess: "Shift supprimé",
                deleteError: "Échec de la suppression",
                moveError: "Échec du déplacement.",
                copySuccess: "{count} shifts copiés avec succès",
                copyError: "Échec de la copie",
                magicFillSuccess: "Magique ! {count} shifts ajoutés ✨",
                magicFillEmpty: "Rien à remplir (Lun-Ven complet)",
                noSite: "Aucun site disponible",
                templateApplied: "Modèle appliqué ✨"
            }
        },
        referral: {
            title: "Parrainage",
            header: "Grandissez avec nous ❤️",
            heroTitle: "Offrez 1 mois, Recevez 1 mois.",
            heroDesc: "Invitez d'autres entreprises à rejoindre Timmy. Pour chaque entreprise qui s'inscrit via votre lien, vous gagnez tous les deux 1 mois d'abonnement gratuit (Plan Pro).",
            linkTitle: "Votre lien unique",
            copyLink: "Copier le lien",
            copied: "Copié !",
            shareTitle: "Partage rapide",
            shareLinkedin: "Partager sur LinkedIn",
            shareEmail: "Envoyer par Email",
            emailSubject: "Invitation à découvrir Timmy 🚀",
            emailBody: "Salut, j'utilise Timmy pour gérer mon équipe et mes plannings. C'est super simple et ça change la vie. Voici mon lien pour avoir 1 mois offert :",
            statsTitle: "Vos Recrutements",
            totalReferred: "Entreprises parrainées",
            pending: "En attente",
            earned: "Crédit gagné",
            emptyState: "Aucun parrainage pour le moment. Partagez votre lien !"
        }
    },
    en: {
        common: {
            back: "Back",
            login: "Login",
            signup: "Sign up",
            loading: "Loading...",
            error: "Error",
            success: "Success",
            continue: "Continue",
            validate: "Validate",
            cancel: "Cancel",
            required: "Required",
            optional: "Optional",
            email: "Email",
            password: "Password",
            confirmPassword: "Confirm Password",
            firstName: "First Name",
            lastName: "Last Name",
            phone: "Phone",
            terms: "I accept the Terms of Service and Privacy Policy.",
            copyright: "Timmy Solutions.",
        },
        sidebar: {
            nav: {
                dashboard: "Dashboard",
                schedule: "Schedule",
                timeEntries: "Time Entries",
                team: "Team",
                kiosks: "Kiosks",
                sites: "Sites",
                payroll: "Payroll",
                launchKiosk: "Launch Kiosk",
                settings: "Settings",
                help: "FAQ & Help",
                support: "Support",
                feedback: "Give Feedback",
                refer: "Refer a Friend"
            },
            groups: {
                home: "Home",
                people: "People",
                system: "System",
                support: "Support & Experience"
            },
            logout: "Sign Out",
            collapse: "Collapse sidebar",
            expand: "Expand sidebar"
        },
        dashboard: {
            totalEmployees: "Total Employees",
            siteActivity: "Site Activity",
            title: "Time Entries",
            subtitle: "Track, edit, and validate your team's attendance.",
            filters: {
                searchPlaceholder: "Search employee...",
                date: {
                    today: "Today",
                    yesterday: "Yesterday",
                    week: "This Week",
                    lastWeek: "Last Week",
                    month: "This Month",
                    custom: "Custom Range"
                },
                allSites: "All sites"
            },
            onSite: "Currently On Site",
            activeToday: "Active Today",
            offlineSyncs: "Offline Syncs",
            anomaliesTitle: "Anomalies Detected",
            anomaliesDesc: "The following employees forgot to clock out on previous days.",
            fixBtn: "Fix",
            absencesTitle: "Absent Employees",
            absencesDesc: "Work day has started. These employees have not clocked in yet.",
            absentTag: "Absent",
            dayStartedAt: "Day started at",
            view: {
                logs: "Activity Logs",
                timesheets: "Timesheets (Daily)",
                reports: "Reports (Summary)"
            },
            report: {
                employee: "Employee",
                daysWorked: "Days Worked",
                totalHours: "Total Hours (Net)",
                totalOvertime: "Total Overtime"
            },
            timesheet: {
                date: "Date",
                employee: "Employee",
                firstIn: "Start",
                lastOut: "End",
                total: "Total Worked",
                overtime: "Overtime",
                status: "Status"
            },
            exportExcel: "Export Excel",
            manualEntry: "Manual Entry",
            validatePeriod: "Validate Period",
            periodLocked: "Period Locked",
            confirmLock: "Warning: This will freeze data for the selected period. Continue?"
        },
        days: {
            mon: { short: "Mon", full: "Monday" },
            tue: { short: "Tue", full: "Tuesday" },
            wed: { short: "Wed", full: "Wednesday" },
            thu: { short: "Thu", full: "Thursday" },
            fri: { short: "Fri", full: "Friday" },
            sat: { short: "Sat", full: "Saturday" },
            sun: { short: "Sun", full: "Sunday" }
        },
        login: {
            title: "Login to your account",
            noAccount: "Don't have an account?",
            rememberMe: "Remember me",
            orLoginWith: "or login with",
            forgotPassword: "Forgot password?",
            heroTitle: "Simplify your team management.",
            heroSubtitle: "Manage your employees, schedules, attendance, communications, and reports in real-time.",
            errors: {
                default: "Error logging in",
                invalid_credentials: "Invalid email or password",
            }
        },
        signup: {
            welcome: "Welcome!",
            subtitle: "To start, tell us who you are.",
            manager: {
                title: "You are a Manager",
                desc: "I want to create and manage my team.",
                createTitle: "Create Manager Account",
                trial: "✨ 21-day free trial",
                workEmail: "Work Email",
                verifyPhone: "Verify Number",
                startTrial: "Start Free Trial",
            },
            employee: {
                title: "You are an Employee",
                desc: "I want to join an existing team.",
                areaTitle: "Employee Area",
                instruction: "To join Timmy, ask your manager to send you an invitation or your personal PIN code.",
                chooseOther: "Choose another profile",
            },
            otp: {
                placeholder: "Code (6 digits)",
                sent: "Code sent!",
                verify: "Verify",
                error: "Incorrect code. Please try again.",
                phoneRequired: "Please enter a valid phone number.",
                verifyFirst: "Please verify your phone number.",
            },
            errors: {
                passwordLength: "Password must be at least 6 characters.",
                passwordMatch: "Passwords do not match.",
                default: "An error occurred during signup.",
            },
            success: {
                title: "Account Created!",
                message: "Welcome to Timmy",
                emailSent: "A confirmation email has been sent to",
                setup: "Setup my workspace",
            },
            hero: {
                managerTitle: "Pilot your activity.",
                managerDesc: "Manage your schedules, track hours, and optimize your payroll with ease.",
                employeeTitle: "Join your team.",
                employeeDesc: "Access your schedules and clock in easily.",
            }
        },
        forgotPassword: {
            title: "Forgot password?",
            desc: "Enter your email address and we will send you a link to reset your password.",
            placeholder: "example@timmy.app",
            submit: "Send Link",
            successTitle: "Email sent!",
            successDesc: "If an account exists with the address",
            successDesc2: "you will receive an email with instructions to reset your password.",
            resend: "Resend email",
            heroTitle: "Account Recovery",
            heroDesc: "Don't worry, it happens to the best of us.",
        },
        onboarding: {
            step1: {
                title: "Your Company",
                desc: "Let's start by setting up your workspace.",
                companyName: "Company Name",
                companyPlaceholder: "Ex: BTP Gabon Services",
                sector: "Business Sector",
                sectorPlaceholder: "Search for a sector...",
                country: "Country",
                countryDesc: "The country defines your currency and timezone.",
            },
            step2: {
                title: "First Work Site",
                desc: "Where will your team clock in?",
                siteName: "Site / Project Name",
                sitePlaceholder: "Ex: Downtown Project",
                address: "Address",
                addressPlaceholder: "For future geofencing",
            },

            step3: {
                title: "Your Profile",
                desc: "Create your profile to test clocking in yourself.",
                whatsapp: "WhatsApp Number",
                whatsappPlaceholder: "To receive your notifications",
                whatsappNote: "We will ask for your consent later.",
                pin: "PIN Code (To clock in)",
                submit: "Finish Setup",
            },
            sectors: [
                "Construction",
                "Restaurant / Hotel",
                "Health / Medical",
                "Retail",
                "Logistics / Transport",
                "Personal Services",
                "Industry",
                "Agriculture",
                "Education",
                "Technology / IT",
                "Other"
            ],
            noResult: "No result"
        },
        feedback: {
            title: "Give Feedback",
            subtitle: "Help us improve Timmy!",
            type: "Feedback Type",
            types: {
                bug: "Bug 🐛",
                idea: "Idea 💡",
                other: "Other ❤️"
            },
            message: "Your Message",
            placeholder: "Tell us what you think...",
            nps: "Would you recommend Timmy?",
            submit: "Send Feedback",
            success: "Thanks for your feedback!",
            cancel: "Cancel"
        },
        support: {
            title: "Contact Support",
            subtitle: "A question? A problem? We're here.",
            type: "What is this about?",
            types: {
                technical: "Technical Issue",
                billing: "Billing & Subscription",
                feature: "Feature Question",
                account: "Account Access",
                other: "Other Request"
            },
            subType: "Details",
            subTypes: {
                technical: {
                    error: "Error message displayed",
                    crash: "App freeze / Crash",
                    slow: "Unusual slowness",
                    mobile: "Issue on mobile/tablet",
                    other: "Other bug"
                },
                billing: {
                    inovice: "Invoice error",
                    payment: "Payment failed",
                    upgrade: "Change plan",
                    cancel: "Cancel subscription"
                },
                feature: {
                    howto: "How to use?",
                    missing: "Missing feature",
                    improvement: "Improvement suggestion"
                },
                account: {
                    login: "Cannot login",
                    password: "Forgot password",
                    invite: "Invite verification",
                    mfa: "2FA Issue"
                },
                other: {
                    partner: "Partnership",
                    feedback: "General feedback",
                    other: "Other"
                }
            },
            priority: "Priority",
            priorities: {
                low: "Low (Info)",
                medium: "Medium (Need help)",
                high: "High (Blocking)"
            },
            message: "Problem Description",
            placeholder: "Describe your issue in detail...",
            submit: "Send Request",
            success: "Request Sent!",
            successDesc: "Our team will reply via email within 24h.",
            cancel: "Close"
        },
        help: {
            title: "Help Center & FAQ",
            subtitle: "Find quick answers to your questions about using Timmy.",
            searchPlaceholder: "Search a question (e.g. schedule, invoice...)",
            contactTitle: "Can't find your answer?",
            contactDesc: "Our support team is available to help you.",
            contactBtn: "Contact Support",
            categories: {
                general: "General & Account",
                planning: "Schedule & Shifts",
                tracking: "Time & Attendance",
                employees: "Employees & Teams",
                kiosks: "Kiosks & Tablets",
                billing: "Billing"
            },
            faq: {
                general: [
                    { q: "How do I change my password?", a: "Go to Settings > My Profile. You will find a 'Security' section to update your password." },
                    { q: "Can I change the language?", a: "Yes, Timmy is available in French and English. Change the language via the selector at the bottom left of the sidebar or in Settings > My Profile." },
                    { q: "How do user roles work?", a: "The Owner has all rights. The Manager manages teams and schedules but cannot see billing. The Accountant has read-only access to reports." }
                ],
                planning: [
                    { q: "How to publish a schedule?", a: "Once shifts are created, they are in 'Draft' mode (striped). Click the 'Publish' button top right to make them visible to employees and send notifications." },
                    { q: "Can I copy a typical week?", a: "Absolutely. Use the 'Copy' button in the planning toolbar. You can duplicate the current week to multiple future weeks at once." },
                    { q: "What are templates used for?", a: "Templates allow you to create recurring shifts (e.g., 'Morning 8am-4pm'). Drag and drop a template onto the calendar to create a shift instantly." }
                ],
                tracking: [
                    { q: "What is an anomaly?", a: "An anomaly is detected when an employee clocked in but forgot to clock out the previous day. You must manually fix it in 'Time Entries'." },
                    { q: "How to add a forgotten clock-in?", a: "Go to 'Time Entries' > 'Logs', then click 'Manual Entry'. Select the employee, date, and in/out times." },
                    { q: "How to validate hours for payroll?", a: "In 'Time Entries', use the 'Validate Period' button. This locks the data to prevent further modification and ensures payroll integrity." }
                ],
                employees: [
                    { q: "How to invite an employee?", a: "Go to 'Team' and click 'New Employee'. Fill in their info. If they have a WhatsApp number, they will receive their access directly." },
                    { q: "What is the PIN code for?", a: "The PIN code is unique to each employee. It is what they must enter on the tablet (Kiosk) to clock in and out." },
                    { q: "How to archive an employee?", a: "In the employee card, click 'Archive'. Historical data is kept, but they can no longer clock in and won't appear in active filters." }
                ],
                kiosks: [
                    { q: "Does offline mode work?", a: "Yes! Tablets record clock-ins even without internet. They will automatically sync as soon as the connection is restored." },
                    { q: "How to pair a new tablet?", a: "Install the Kiosk app on the tablet. It will show a code. In your admin, go to 'Terminals' > 'New Kiosk' and enter this code." },
                    { q: "Is the photo mandatory?", a: "You can configure this per terminal. It's useful to prevent 'buddy punching' (clocking in for a colleague)." }
                ],
                billing: [
                    { q: "What are the payment methods?", a: "We accept credit cards and mobile money (Airtel Money, Moov Money) via our payment partner." },
                    { q: "Where can I find my invoices?", a: "Your invoices are available and downloadable in PDF format in the Settings > Subscription section." }
                ]
            }
        },
        updatePassword: {
            title: "New Password",
            desc: "Enter your new secure password.",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            submit: "Update Password",
            successTitle: "Password Updated!",
            successDesc: "You will be redirected to the login page...",
            goToLogin: "Go to Login",
            errors: {
                length: "Password must be at least 6 characters.",
                match: "Passwords do not match.",
                default: "An error occurred.",
            }
        },
        systemLogs: {
            title: "System Logs",
            desc: "View the history of actions performed on the application.",
            table: {
                action: "Action",
                user: "User",
                details: "Details",
                date: "Date",
                level: "Level"
            },
            levels: {
                INFO: "Info",
                WARN: "Warning",
                ERROR: "Error"
            },
            empty: "No logs found.",
            export: "Export to JSON",
            searchPlaceholder: "Search by action, user...",
            viewDetails: "View Details",
            hideDetails: "Hide Details"
        },
        settings: {
            title: "Settings",
            desc: "Manage your company, team, and preferences.",
            tabs: {
                general: "General",
                team: "Team",
                notifications: "Notifications",
                billing: "Billing",
                integrations: "Integrations",
                logs: "System Logs",
                profile: "My Profile"
            },
            general: {
                companyInfo: "Company Information",
                save: "Save",
                saving: "Saving...",
                saved: "Saved!",
                logo: "Company Logo",
                uploadLogo: "Upload Logo",
                logoDesc: "JPG, PNG or SVG. Max 2MB. Will appear on your tablets.",
                companyName: "Company Name",
                industry: "Industry",
                currency: "Currency",
                timezone: "Timezone",
                payrollRules: "Payroll Rules",
                payrollCycle: "Payroll Cycle",
                exportFormat: "Default Export Format",
                attendanceRules: "Attendance Rules (Anti-Conflict)",
                latenessTolerance: "Lateness Tolerance",
                latenessDesc: "Threshold before marking as 'Late'.",
                roundingRule: "Rounding Rule",
                roundingDesc: "For overtime calculation.",
                autoLunch: "Auto Lunch Break",
                autoLunchDesc: "Automatically deduct break time",
                ifDay: "if day >",
                scheduleSettings: "Schedule Settings",
                stdDayDuration: "Standard Day Duration",
                hours: "hours",
                startOfWeek: "Start of Week",
                startTime: "Start Time (Arrival)",
                endTime: "End Time (Departure)",
                workingDays: "Company Working Days",
                workingDaysDesc: "Unchecked days will be considered as overtime.",
                nightHours: "Night Hours (Premium)",
                from: "From",
                to: "To",
                sector: {
                    btp: "Construction",
                    restauration: "Restaurant / Hotel",
                    retail: "Retail",
                    health: "Health / Medical",
                    logistics: "Logistics / Transport",
                    services: "Services",
                    other: "Other"
                },
                payrollCycles: {
                    monthly: "1st to 30/31 (Calendar Month)",
                    midMonth: "15th to 15th",
                    weekly: "Weekly",
                    biweekly: "Bi-weekly"
                },
                latenessTolerances: {
                    none: "None (Strict)",
                    min5: "5 minutes",
                    min10: "10 minutes",
                    min15: "15 minutes"
                },
                roundingRules: {
                    exact: "Exact minute",
                    quarter: "Quarter hour (15 min)",
                    half: "Half hour (30 min)"
                },
                weekDays: {
                    monday: "Monday",
                    sunday: "Sunday"
                },
                shortWeekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                lunchDuration: {
                    min30: "30 min",
                    min45: "45 min",

                    hour1: "1 hour",
                    min90: "1h30"
                },
                export: {
                    xlsx: "Excel (.xlsx)",
                    csv: "CSV (.csv)",
                    pdf: "PDF (.pdf)"
                },
                rounding: {
                    exact: "Exact minute",
                    min5: "5 minutes",
                    min15: "15 minutes",
                    min30: "30 minutes"
                },
                break: {
                    min30: "30 min",
                    min45: "45 min",
                    min60: "1 hour",
                    min90: "1h30"
                },
                week: {
                    monday: "Monday",
                    sunday: "Sunday",
                    saturday: "Saturday"
                },
                alert: {
                    min15: "15 minutes",
                    min30: "30 minutes",
                    min60: "1 hour",
                    min120: "2 hours"
                }
            },
            team: {
                title: "User Management",
                desc: "Manage access to your Timmy dashboard.",
                invite: "Invite Member",
                table: {
                    user: "User",
                    role: "Role",
                    status: "Status",
                    actions: "Actions",
                    you: "You",
                    active: "Active",
                    invited: "Invited"
                },
                roles: {
                    owner: "Owner",
                    manager: "Manager",
                    accountant: "Accountant",
                    infoTitle: "💡 About Roles",
                    ownerDesc: "Full access, including billing and deletion.",
                    managerDesc: "Manage teams and schedules. No billing access.",
                    accountantDesc: "Read-only access to payroll reports and exports."
                },
                inviteModal: {
                    title: "Invite Member",
                    email: "Email Address",
                    role: "Role",
                    cancel: "Cancel",
                    send: "Send Invitation",
                    sending: "Sending...",
                    sent: "Sent!"
                }
            },
            notifications: {
                title: "Notification Center",
                channels: "Communication Channels",
                emailDesc: "For reports and admin alerts",
                whatsappDesc: "For urgent alerts and employees",
                operationalAlerts: "Operational Alerts (Emergencies)",
                lateAlert: "When an employee is > 15 min late",
                absentAlert: "When an employee is absent > 30 min after shift start",
                earlyAlert: "When an employee leaves before shift end (Early Departure)",
                technicalAlerts: "Technical & System Alerts",
                critical: "Critical",
                syncAlert: "Alert me if a kiosk hasn't synced for more than 1 hour",
                reports: "Reports & Summaries",
                dailyReport: "Daily report by email at 08:00",
                weeklyReport: "Weekly Summary (Sunday evening)",
                employeeAlerts: "Employee Alerts (What THEY receive)",
                scheduleAlert: "Receive my schedule on Sunday evening (WhatsApp)",
                shiftReminder: "Reminder 1h before my shift",
                whatsappConsent: "WhatsApp messages are only sent to employees who have consented via their profile."
            },
            billing: {
                title: "Subscription & Billing",
                active: "ACTIVE",
                monthly: "Monthly billing • Next payment on Jan 15",
                month: "/month",
                employeeUsage: "Employee Usage",
                upgradePrompt: "Need more?",
                upgradeLink: "Upgrade to Unlimited Plan",
                paymentMethod: "Payment Method",
                edit: "Edit",
                expires: "Expires on",
                altPayment: "Alternative Payment",
                mobileMoneyBtn: "Pay via Mobile Money / Transfer",
                billingDetails: "Billing Details",
                invoiceHistory: "Invoice History",
                table: {
                    date: "Date",
                    amount: "Amount",
                    status: "Status",
                    invoice: "Invoice",
                    paid: "Paid"
                },
                mmModal: {
                    title: "Mobile Money Payment",
                    instructions: "Payment Instructions:",
                    sendTo: "To renew your subscription, send",
                    number: "to Airtel Money number:",
                    name: "Name: Timmy SAS",
                    proof: "Proof of Payment",
                    refPlaceholder: "Transaction Reference (e.g. ID 123456789)",
                    upload: "Upload a screenshot",
                    change: "Click to change",
                    sendProof: "Send Proof"
                },
                upgradeModal: {
                    title: "Upgrade to the next level 🚀",
                    current: "CURRENT",
                    activePlan: "Active Plan",
                    recommended: "RECOMMENDED",
                    choose: "Choose this plan",
                    processing: "Processing...",
                    sent: "Request Sent!"
                },
                editModal: {
                    title: "Edit Billing Details",
                    company: "Company Name",
                    address: "Full Address",
                    email: "Billing Email"
                }
            },
            integrations: {
                title: "Integrations",
                connected: "Connected",
                comingSoon: "Coming Soon",
                whatsapp: {
                    title: "WhatsApp Business API",
                    desc: "Connected via Meta Cloud API",
                    quota: "Message Quota",
                    quality: "Line Quality"
                },
                mobileMoney: {
                    title: "Mobile Money Exports",
                    desc: "Generate bulk payment files compatible with Airtel & Moov portals."
                },
                googleSheets: {
                    title: "Google Sheets Sync",
                    desc: "Sync your attendance logs in real-time to a Google Sheet.",
                    connect: "Connect Google",
                    info: "Automatically sends validated hours to your chosen sheet every night at midnight."
                },
                calendar: {
                    title: "Calendar",
                    desc: "Display your team's shifts directly in your personal calendar (Google/Outlook).",
                    connect: "Connect"
                },
                sections: {
                    company: "Company & Strategy",
                    accounting: "Accounting & ERP",
                    access: "Access Control (IoT)",
                    bi: "Business Intelligence"
                },
                hiring: {
                    title: "Timmy Hiring",
                    powered: "Powered by Jaden",
                    desc: "Need reinforcements? Find qualified profiles in 1 click.",
                    discover: "Discover"
                },
                webhook: {
                    title: "Webhook",
                    desc: "Receive real-time events (Clock-ins, etc.)",
                    url: "Callback URL",
                    test: "Test"
                }
            },
            profile: {
                title: "My Profile",
                firstName: "First Name",
                lastName: "Last Name",
                email: "Email",
                phone: "Phone Number",
                security: "Security",
                newPassword: "New Password",
                confirmPassword: "Confirm Password",
                enable2FA: "Enable Two-Factor Authentication (2FA)",
                preferences: "Preferences",
                language: "Language"
            }
        },
        sites: {
            title: "Sites & Locations",
            desc: "Manage your work locations and offices.",
            newSite: "New Site",
            active: "Active",
            archived: "Archived",
            noActive: "No active sites",
            noArchived: "No archived sites",
            startAdding: "Start by adding your first location.",
            archivedDesc: "Archived sites will appear here.",
            createSite: "Create a site",
            createCard: "Create a new site",
            edit: "Edit",
            archive: "Archive",
            restore: "Restore",
            viewSchedule: "View schedule for this site",
            offline: "Offline",
            noAddress: "No address provided",
            modal: {
                newTitle: "New Location",
                editTitle: "Edit Site",
                name: "Site Name",
                namePlaceholder: "Ex: Head Office, Site A...",
                city: "City",
                cityPlaceholder: "Ex: Libreville",
                address: "Address / Directions",
                addressPlaceholder: "Ex: Louis District, blue gate...",
                timezone: "Timezone",
                geofencing: "Geofencing",
                disabled: "Disabled",
                soon: "SOON",
                cancel: "Cancel",
                create: "Create Site",
                update: "Update",
                saving: "Saving..."
            },
            confirm: {
                archiveTitle: "Archive Site",
                restoreTitle: "Restore Site",
                archiveMsg: "Are you sure you want to archive \"{name}\"? It will no longer be accessible for clock-ins.",
                restoreMsg: "Are you sure you want to restore \"{name}\"?",
                cancel: "Cancel",
                confirm: "Confirm"
            },
            toast: {
                fetchError: "Failed to fetch sites",
                archiveSuccess: "Site archived successfully",
                restoreSuccess: "Site restored successfully",
                statusError: "Failed to update site status",
                updateSuccess: "Site updated successfully",
                createSuccess: "Site created successfully",
                saveError: "Failed to save site"
            }
        },
        kiosks: {
            title: "Kiosks & Terminals",
            desc: "Manage your tablets and clock-in stations.",
            newKiosk: "New Kiosk",
            noKiosks: "No kiosks configured",
            startAdding: "Add your first tablet to start clocking in.",
            createKiosk: "Add Kiosk",
            status: {
                ONLINE: "Online",
                OFFLINE: "Offline",
                PENDING: "Pending",
                REVOKED: "Revoked"
            },
            table: {
                name: "Name",
                site: "Site",
                status: "Status",
                version: "Version",
                lastSync: "Last Sync",
                pairingCode: "Pairing Code"
            },
            modal: {
                newTitle: "New Kiosk",
                editTitle: "Edit Kiosk",
                name: "Kiosk Name",
                namePlaceholder: "Ex: Main Entrance Tablet",
                site: "Assigned Site",
                sitePlaceholder: "Select a site",
                security: "Security & Options",
                requirePhoto: "Require Photo",
                requireBadge: "Require NFC Badge",
                requireSignature: "Require Signature",
                cancel: "Cancel",
                create: "Create Kiosk",
                update: "Update",
                saving: "Saving..."
            },
            toast: {
                fetchError: "Error loading kiosks",
                createSuccess: "Kiosk created successfully",
                updateSuccess: "Kiosk updated successfully",
                deleteSuccess: "Kiosk deleted",
                error: "An error occurred"
            },
            confirm: {
                deleteTitle: "Delete Kiosk",
                deleteMsg: "Are you sure you want to delete this kiosk? This action cannot be undone.",
                cancel: "Cancel",
                confirm: "Delete"
            }
        },
        employees: {
            title: "Team",
            desc: "Manage your employees, daily workers, and their access.",
            import: "Import Excel / CSV",
            newEmployee: "New Employee",
            searchPlaceholder: "Search employee by name or job title...",
            allSites: "All sites",
            active: "Active",
            archived: "Archived",
            noEmployees: "No employees found",
            noEmployeesDesc: "Try changing your filters or add a new member.",
            card: {
                archived: "Archived",
                unassigned: "Unassigned",
                pinCode: "PIN Code",
                whatsapp: "WhatsApp",
                verified: "Verified",
                sendVerification: "Send Verification Message",
                unverify: "Click to unverify",
                verifyManually: "Click to verify manually",
                noPhone: "No phone",
                edit: "Edit",
                badge: "Badge PDF",
                archive: "Archive",
                unarchive: "Unarchive"
            },
            form: {
                createTitle: "Create Employee",
                editTitle: "Edit Employee",
                personalInfo: "Personal Info",
                firstName: "First Name",
                lastName: "Last Name",
                jobTitle: "Job Title / Role",
                jobPlaceholder: "Ex: Mason, Server...",
                contact: "Contact",
                whatsapp: "WhatsApp",
                email: "Email (Optional)",
                access: "Access & Security",
                assignedSite: "Assigned Site",
                unassigned: "-- Unassigned --",
                pinCode: "PIN Code (Access)",
                pinDesc: "Used to clock in on the tablet.",
                cancel: "Cancel",
                save: "Save"
            },

            importModal: {
                title: "Import Employees",
                important: "Important",
                importantDesc: "For the import to work correctly, please use our predefined template.",
                downloadTemplate: "Download Excel Template",
                templateDesc: "Format .xlsx - First Name, Last Name, Job Title...",
                then: "Then",
                dragDrop: "Drag your file here",
                browse: "or click to browse",
                mapColumns: "Map Columns",
                mapDesc: "Please match the columns from your file to the employee fields.",
                selectColumn: "-- Select Column --",
                back: "Back",
                next: "Next",
                fileDetected: "File detected",
                analysis: "Analysis Summary",
                linesDetected: "lines detected.",
                newEmployees: "New employees",
                readyImport: "Ready to import",
                duplicates: "Duplicates detected",
                willIgnore: "Will be ignored",
                hasPin: "already have a PIN code.",
                autoPin: "will receive an automatic code.",
                importBtn: "Import {count} employees",
                successTitle: "Import Successful!",
                successDesc: "employees have been added to your team.",
                close: "Close"
            },
            badge: {
                title: "Employee Badge",
                print: "Print Badge",
                cancel: "Cancel",
                role: "Employee",
                accessBadge: "Personal Access Badge"
            },
            toast: {
                archiveConfirm: "Archive this employee? They will no longer be able to clock in.",
                unarchiveConfirm: "Unarchive this employee?",
                archiveError: "Error updating archive status",
                verifyError: "Error updating verification",
                verified: "WhatsApp verified manually",
                unverified: "WhatsApp unverified",
                orgNotFound: "Organization ID not found",
                updateError: "Error updating employee",
                updateSuccess: "Employee updated successfully",
                createError: "Error creating employee",
                createSuccess: "Employee created successfully",
                importError: "Import error for row",
                importFailed: "Import failed",
                genericError: "An error occurred"
            }
        },
        planning: {
            title: "Weekly Schedule",
            subtitle: "Manage your team's shifts.",
            publishBtn: "Publish",
            printBtn: "Print",
            copyBtn: "Copy",
            today: "Today",
            employees: "Employees",
            unassigned: "Open Shifts",
            dragHelp: "Drag to assign",
            addShift: "Add shift",
            generatedOn: "Generated on",
            managerSig: "Manager Signature",
            siteManagerSig: "Site Manager Signature",
            templates: "Templates",
            templatesHint: "Drag and drop to create",
            headerTotal: "Total",
            filters: {
                search: "Search employee...",
                allSites: "All sites",
            },
            tooltips: {
                quickFill: "Auto-Fill (Mon-Fri 8am-5pm)",
                addOpenShift: "Add Open Shift"
            },
            modal: {
                publishTitle: "Publish Schedule 🚀",
                confirmPublishTitle: "Confirm Publication?",
                confirmPublishDesc: "You are about to publish",
                shiftsDraft: "shifts",
                currentlyDraft: "currently in draft.",
                willNotify: "Affected employees will be notified.",
                channels: {
                    email: "Email",
                    emailDesc: "Send schedules via email",
                    whatsapp: "WhatsApp / SMS",
                    whatsappDesc: "Instant mobile notification"
                },
                cancel: "Cancel",
                confirm: "Publish",
                sending: "Sending...",
                success: "Published!",

                // Copy
                copyTitle: "Copy Week",
                source: "Source",
                destination: "Destination(s)",
                currentWeek: "Current Week",
                selectWeeks: "Select weeks to duplicate this schedule to.",
                copyAction: "Copy to {count} weeks",
                copySimple: "Copy",
                copied: "Copied!",

                // Shift
                newShiftTitle: "New Shift ✨",
                editShiftTitle: "Edit Shift",
                start: "Start",
                end: "End",
                break: "Break (minutes)",
                site: "Site",
                sitePlaceholder: "Select a site...",
                note: "Note (Optional)",
                notePlaceholder: "Instructions, tasks...",
                add: "Add",
                create: "Create Shift",
                update: "Update",
                delete: "Delete",
                confirmDelete: "Are you sure you want to delete this shift?"
            },
            toast: {
                publishSuccess: "Schedule published successfully! 🚀",
                publishError: "Publish failed.",
                addSuccess: "Shift added!",
                addError: "Error adding shift.",
                updateSuccess: "Shift updated",
                deleteSuccess: "Shift deleted",
                deleteError: "Delete failed",
                moveError: "Move failed.",
                copySuccess: "{count} shifts copied successfully",
                copyError: "Copy failed",
                magicFillSuccess: "Magic! Added {count} shifts ✨",
                magicFillEmpty: "Nothing to fill (Mon-Fri full)",
                noSite: "No sites available",
                templateApplied: "Template applied ✨"
            }
        },
        referral: {
            title: "Referral",
            header: "Grow with us ❤️",
            heroTitle: "Give 1 month, Get 1 month.",
            heroDesc: "Invite other companies to join Timmy. For every company that signs up with your link, you both get 1 month of free subscription (Pro Plan).",
            linkTitle: "Your unique link",
            copyLink: "Copy Link",
            copied: "Copied!",
            shareTitle: "Quick Share",
            shareLinkedin: "Share on LinkedIn",
            shareEmail: "Send via Email",
            emailSubject: "Invitation to discover Timmy 🚀",
            emailBody: "Hey, I use Timmy to manage my team and shifts. It's a game changer. Here is my link to get 1 month free:",
            statsTitle: "Your Referrals",
            totalReferred: "Referred Companies",
            pending: "Pending",
            earned: "Earned Credit",
            emptyState: "No referrals yet. Share your link!"
        }
    }
};
