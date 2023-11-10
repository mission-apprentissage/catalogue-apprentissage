import React from "react";
import { Link } from "@chakra-ui/react";

const changelog = {
  list: [
    {
      version: "6.11.0",
      date: "Prochainement",
      about: `<h4>À venir</h4>`,
      fixes: [],
      features: [],
      improvements: [],
    },

    {
      version: "6.10.0",
      date: "Octobre 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [],
      features: [],
      improvements: [
        `Migration du serveur de production vers un serveur temporaire en attendant la mise à disposition d’une machine par la DNE`,
        `Définition des sous-schémas des formations afin que les outils de génération de documentation puissent les afficher`,
        `Utilisation du logger lors de la vérification des conditions de la conversion des formations et des établissements`,
      ],
    },

    {
      version: "6.9.0",
      date: "Septembre 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `Pas de rapprochement pour les formations hors périmètre Affelnet`,
        `Correction des jeux de tests pour script de couverture Affelnet`,
        `Correction des tests pour les modifications liés aux partenaires`,
        `Correction d’un problème lors de la conversion des formations provenant du flux RCO`,
        `Correction du calcul de distance_lieu_formation_etablissement_formateur lié à une différence de format entre les coordonnées`,
        `Obligation d’avoir un UAI renseigné pour les publications vers Affelnet`,
        `API — Amélioration des outils de génération de documentation OpenApi`,
        `Correction d’un problème de format de log envoyé à slack concernant les appels http`,
        `Correction d'un problème lors du calcul de distance_lieu_formation_etablissement_formateur lié à une différence de format entre les coordonnées`,
        `Mise en place de l'obligation d'avoir un uai renseigné pour les publications vers Affelnet`,
        `Correction de la colonne 'Raison sociale du formateur' dans l'export CSV qui n'affichait pas la bonne valeur`,
        `API — Resolution d'une faille de sécurité dans l'ORM utilisé`,
      ],
      features: [
        `Affichage d’un message de warning lorsque les codes MEF se terminent par 99`,
        `Suppression du champs rome_codes de l’historique`,
        `Ajout de la colonne ‘Distance entre lieu de formation et organisme formateur’ dans l’export csv`,
        `Ajout de la colonne 'Raison sociale de l'organisme responsable' dans l'export csv des formations`,
        `Ajout de la colonne 'Distance entre lieu de formation et organisme formateur' dans l'export csv des formations`,
      ],
      improvements: [
        `Modification des règles d’affichages du warning RNCP / CFD outdated`,
        `Modification du niveau des logs envoyés à Slack`,
        `Amélioration des logs liés à la synchronisation ElasticSearch`,
        `Amélioration des logs lors des interactions avec l’API Parcoursup`,
        `Modification des règles d’affichage du lien vers LaBonneAlternance`,
        `Suppression du bloc ‘Autres informations’ obsolète sur les fiches des formations`,
        `Modification des paramètres d’historisation des modifications apportées aux formations`,
        `Modification de la date de fin de campagne au 18 septembre`,
        `Suppression du bloc 'Autres informations' obsolète sur les fiches des formations`,
      ],
    },

    {
      version: "6.8.0",
      date: "Aout 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `Correction du nombre de formations correspondantes affiché sur la modale d'édition des règles de périmètre `,
        `Correction du script de rapprochement des bases Affelnet et catalogue en ignorant les formations hors périmètre Affelnet`,
        `Correction d'un problème lors de la conversion des formations provenant du flux RCO`,
      ],
      features: [
        `Affichage d'un encadré d'avertissement lorsque le code MEF se termine par 99`,
        `Modification des règles d'affichage de l'encadré d'avertissement lorsque les codes RNCP ou CFD sont dépassés`,
      ],
      improvements: [
        `Exploitation - Refonte du système de gestion des logs`,
        `Modification des paramètres d'historisation des modifications apportées aux formations`,
      ],
    },

    {
      version: "6.7.0",
      date: "Juillet 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `API – Correction d’un problème empêchant la synchronisation de certaines informations avec le flux RCO`,
        `Utilisateurs connectés – Correction d’un filtre sur la recherche des formations non fonctionnel`,
      ],
      features: [],
      improvements: [
        `API – Activation de la compression gzip sur les réponses de l’API`,
        `API – Ajout des paramètres sort et skip pour parcourir et trier les réponses d’API sur les routes en .json et .csv`,
      ],
    },

    {
      version: "6.6.0",
      date: "Juin 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [],
      features: [`Infrastructure – Changement de serveur NAS pour la sauvegarde des données`],
      improvements: [],
    },

    {
      version: "6.5.0",
      date: "Avril - Mai 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [`Infrastructure – Interventions correctives liées à l’optimisation de l’espace de stockage`],
      features: [],
      improvements: [],
    },

    {
      version: "6.4.0",
      date: "Mars 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `Administrateur – Correction d’un problème empêchant l’affichage des messages d’alertes sur la partie d’administration lorsqu’aucun message n’était activé`,
        `Utilisateurs connectés – Correction d’un problème prévenant la mise à jour des codes MEFS_10 à destination d’Affelnet`,
        `Utilisateurs connectés – Correction d’un problème de page blanche dû à une erreur lors de la génération d’un lien vers geoportail en cas de géo-coordonnées manquantes`,
        `Utilisateurs connectés – Correction du problème de droit pour l'upload de fichier des offres Affelnet`,
      ],
      features: [],
      improvements: [
        `Utilisateurs connectés – Mise en cohérence des intitulés de filtre sur la recherche`,
        `Utilisateurs connectés – Ajout des colonnes affelnet aux exports csv`,
        `Global – Mise à jour des dépendances applicatives`,
      ],
    },

    {
      version: "6.3.0",
      date: "Février 2023",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `API – Correction d’un problème de mise à jour des données de la BCN`,
        `API – Optimisation et correction des scripts de synchro aux flux RCO`,
      ],
      features: [
        `Utilisateurs connectés – Prise en compte des dates de campagne pour les compteurs affichés sur le module de périmètre`,
        `Utilisateurs connectés – Ajout d’un warning à destination des instructeurs pour les bac pro en 3 ans accessibles en 2eme année`,
        `Utilisateurs connectés – Ajout d’un menu spécifique pour les consoles de pilotage, et définition du droit de consultation associé`,
        `Utilisateurs connectés – Ajout d’un droit fin pour l’upload des fichiers`,
        `Utilisateurs connectés – Ajout des filtres de statut de publication sur la liste des formations non réglementaires, pour repérage des formations publiées Parcoursup qui ont basculé en non réglementaire`,
        `Utilisateurs connectés – Apparition dans l'historique des modifications effectuées par import Parcoursup et mise 'en attente' des formations avec clé ajoutée chez eux`,
      ],
      improvements: [
        `Utilisateurs connectés – Ajout d’une colonne “Dates de formation” sur les exports csv des formations`,
        `Utilisateurs connectés – Ajout d’une colonne “Intitulé Carif-Oref” sur les exports csv des formations`,
        `Utilisateurs connectés – Mise en place d’un persistance des actions de non publication pour les cas où les formations disparaissent momentanément du flux RCO`,
        `API – Débogage et optimisation de la sauvegarde de l’historique des modifications`,
        `API – Amélioration des informations loguées en base lors de l’exécution de différents scripts`,
      ],
    },

    {
      version: "6.2.0",
      date: "Janvier 2023",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `API – Correction d’un problème empêchant le recalcul de l’adresse calculée à partir des coordonnées transmises par RCO`,
        `API – Correction d’un problème empêchant le recalcul des coordonnées calculées à partir de l’adresse transmise par RCO`,
        `Global – Mise à niveau de la stack technique`,
        `Global – Mises à jour de sécurité des dépendances applicatives`,
      ],
      features: [
        `Administrateur – Ajout d’un historique global des modifications pour formations et établissements pour suivi des évolutions de la donnée`,
        `Modification du script de périmètre AFFELNET pour prise en compte des dates de la nouvelle campagne et développement du script de réinitialisation des statuts en début de campagne`,
        `Utilisateurs connectés – Autorisation de la dépublication des formations publiées sur Affelnet`,
        `Utilisateurs connectés – Ajout des rejets de publication dans l’historique des statuts Parcoursup`,
        `Parcoursup – Gestion des retours du webservice pour actions`,
      ],
      improvements: [
        `Utilisateurs connectés – Modification des conditions d’affichage des badges et warning liés à l’habilitation RNCP`,
        `Utilisateurs connectés – Améliorations et mise à jour des consoles de pilotages`,
        `Utilisateurs connectés – Mise en place d’un rechargement automatique des données lors d’une action de mise à jour des informations d’une formation depuis la page détail d’une formation`,
        `API – Application du même principe de fonctionnement pour la synchronisation avec le flux RCO des établissements que pour les formations`,
        `API – Ajout des timestamps pour les entités sauvegardées en base et mise à jour des outils de génération de schémas (typescript et doc swagger)`,
        `API – Suppression du champ obsolète idea_geo_coordonnees_etablissement`,
      ],
    },

    {
      version: "6.1.0",
      date: "Décembre 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [`Correction d’un problème sur la recherche avancée.`],
      features: [
        `Utilisateurs connectés – Ajout d’information autour de l’obtention et modification des règles d’édition des UAIs lieu de formation.`,
        `Utilisateurs connectés – Affichage des dates de sessions et tri par ordre de date de début croissant.`,
      ],
      improvements: [
        `Global – Diverses mises à jour de sécurité concernant les dépendances applicatives du projet.`,
        `Utilisateurs connectés – Actualisation des consoles de pilotage.`,
        `Utilisateurs connectés – Modification des règles permettant la demande de publication, consolidation des scripts d’application des règles de périmètre et d’envoi vers les plateformes éducatives.`,
        `API – Amélioration du script de synchro au flux RCO.`,
        `API – Gestion des nouvelles erreurs métiers retournées par Parcoursup.`,
        `Global – Suppression de code obsolète.`,
      ],
    },

    {
      version: "6.0.0",
      date: "Novembre 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version voit la séparation des catalogues publique géré par le Réseau des CARIF-OREF et de celui à destination des ministères éducatifs ainsi que quelques améliorations et fonctionnalités décrites ci après.`,

      fixes: [],
      features: [
        `Global – Séparation des catalogue publique géré par le Réseau des CARIF-OREF et de celui à destination des ministères éducatifs.`,
        `Utilisateurs connectés – Ajout d’informations pour identifier les UAI lieux édités par les services académiques.`,
        `Global – Mise en place de tableaux metabase pour analyse de l’état des liaisons catalogue/Parcoursup.`,
        `API – Développement des scripts pour nettoyage des correspondances entre les bases catalogue et Parcoursup`,
        `Global – Réinitialisation des étiquettes de publication Parcoursup en amont de la phase de paramétrage des formations 2023`,
        `Global – Suppression de la fonctionnalité de rapprochement des formations Parcoursup (fonctionnalité à l’usage des services académiques, rendue caduque du fait des opérations de nettoyage massifs).`,
        `Utilisateurs connectés – Ajout des identifiants Parcoursup et Affelnet sur les fiches formation.`,
      ],
      improvements: [
        `Utilisateurs connectés Corrections diverses sur les consoles de pilotage Parcoursup et Affelnet.`,
        `Global – Prise en compte des nouveaux champs envoyés par RCO dans le flux des formations (dates de début, de fin, etc..)`,
      ],
    },

    {
      version: "5.21.0",
      date: "Octobre 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [],
      features: [`Développement des nouveaux champs pour la campagne Affelnet 2023.`],
      improvements: [
        `Utilisateurs connectés – UAI lieux : ajout d’informations (front et exports CSV), pour permettre de distinguer les UAI lieux édités par les services académiques et les UAI non édités.`,
        `API – Correction du fonctionnement et de la documentation de l’API pour utilisation par Omogen API pour intégration par Affelnet`,
      ],
    },

    // Sept 22 / CSF

    // [passation RCO] Support à RCO pour les aspects d’infrastructure et de déploiement du projet. Mise en place de leur serveur de recette.
    // [passation RCO] Modification sur les indicateurs d’écarts sur les périmètres Parcoursup et Affelnet, contrôles de qualité
    // [passation RCO] Mise en place d’indicateurs de suivi sur les écarts champs par champs dans le cadre de la consommation de l’API catalogue par La bonne alternance.
    // [passation RCO] Assistance RCO pour le suivi de la double commande : contrôle d’écarts non liés à des champs pivots, exclusion d’écarts liés aux passage à Lhéo 2.3 sur le flux de production mais pas sur le flux de test

    // Août 22 / CSF

    // Double commande Catalogue/RCO :  dans l’outil de suivi de l’impact Parcoursup et Affelnet, ajout de tableaux détaillés de comparaison, par formation.

    // Juillet 22 / CSF

    // Double commande Catalogue/RCO : implémentation du système de suivi de l’impact Parcoursup et Affelnet
    // Double commande Catalogue/RCO : divers correctifs sur le système de suivi des écarts
    // Double commande Catalogue/RCO : modification des paramètres de suivi du champ RNCP_detail
    // Double commande Catalogue/RCO : correctif pour le suivi des champs issus de la BCN, dans le cas de la disparition d’IDs de la table BCN
    // Exclusion des RNCP inactifs lorsqu’on a plusieurs RNCP pour un même CFD

    {
      version: "5.20.0",
      date: "Juillet - Septembre 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `Réparation de la page de réinitialisation de mot de passe qui n’était plus fonctionnelle (page blanche)`,
      ],
      features: [],
      improvements: [
        `Infrastructure – Augmentation de la capacité du serveur de production`,
        `API – Exclusion des RNCP inactifs lorsqu’on a plusieurs RNCP pour un même CFD`,
      ],
    },

    {
      version: "5.19.0",
      date: "Le 3 Juin 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [],
      features: [`Utilisateurs connectés — début d’implémentation des consoles de pilotage Dgesco et Dgsip`],
      improvements: [
        `API – Mise à jour de la librairie de table de correspondance pour récupérer l’information sur la certification qualité`,
        `Dans la recherche avancée, ajout d’une possibilité de recherche par nom de certificateur`,
      ],
    },

    {
      version: "5.18.0",
      date: "Le 5 Mai 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `Administrateurs — Rétablissement de certaines données dans les fichiers échangés avec le service à compétence nationale Parcoursup.`,
        `Utilisateurs connectés — Gestion des formations retournées en échec par le webservice Parcoursup : l’attribution du statut “ne pas publier” n’était pas prise en compte.`,
        `Utilisateurs connectés — Gestion des formations retournées en échec par le webservice Parcoursup : l’annulation de prise en charge ne fonctionnait pas dans certains cas.`,
        `Utilisateurs connectés — Depuis le module de périmètre, le lien vers les listes de formations correspondant à chaque type de certification ne remontait aucun résultat.`,
        `Utilisateurs connectés — Rétablissement du MEF10 dans les exports csv.`,
        `Utilisateurs connectés — Mise à jour des informations de publication Affelnet pour mise à jour des étiquettes à l’usage des services académiques.`,
      ],
      features: [],
      improvements: [
        `Dans l’onglet “Liste des organismes”, dépublication des établissements qui ne sont associés à aucune formation (ni directement, ni en tant que responsable d’organismes formateurs). Automatisation hebdomadaire de ces règles de dépublication. À l’inverse, la republication est instantanée si une offre de formation réapparaît.`,
        `Utilisateurs connectés — Gestion des formations retournées en échec par le webservice Parcoursup : intégration du motif d’échec dans les exports csv.`,
        `Sur les fiches formation, masquage de l’étiquette non certifié qualité sur le formateur lorsque l’établissement responsable est certifié qualité.`,
        `L’affichage du message automatique de maintenance lors de l’exécution des scripts nocturnes n’était pas toujours justifié. Il est maintenant  limité à certaines opérations de réindexation.`,
        `Administrateurs — Mise en place d’un script pour récupérer les données éditées sur le site de production vers la recette (règles de périmètres et UAI).`,
      ],
    },

    {
      version: "5.17.0",
      date: "Le 20 Avril 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        `Utilisateurs connectés — Correction d’une erreur sur des compteurs de formation dans les modules de périmètre Parcoursup et Affelnet.`,
      ],
      features: [
        `Utilisateurs connectés — Gestion des formations renvoyés en échec par le webservice Parcoursup : intégration d’un statut spécifique (« rejet de publication »), avec possibilité de prise en charge par les services académiques pour nouvelle tentative de publication.`,
      ],
      improvements: [
        `API – Rétablissement d’un opérateur $regex pour l’un des consommateurs de l’API catalogue.`,
        `Global – Correction de failles de sécurité`,
      ],
    },
    {
      version: "5.16.0",
      date: "Le 13 Avril 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        "Dans l’onglet des formations non réglementaires, suppression du lien « Voir sur la bonne alternance » (les formations non réglementaires n’y figurant pas).",
      ],
      features: [],
      improvements: [
        "Global – Interventions diverses de sécurité",
        "Utilisateurs connectés — Ajout des motifs de non publication par les services académiques sur les pages formation, et dans les exports csv.",
        "Utilisateurs connectés — Diverses améliorations sur les interfaces publiques : clarification de certaines formulations (libellés de certains filtres)",
        "Utilisateurs connectés — Diverses améliorations des interface pour les utilisateurs connectés : placement des étiquettes mieux adapté au contexte (vues listes dans le catalogue général, clarification de certains filtres.",
        "Utilisateurs connectés — Ajout d’informations dans les exports .csv : état de la fiche RNCP (active / inactive), ID Parcoursup",
        "API – Décalage de l’heure de traitement quotidien de la liste publique des OF (fichier du ministère du Travail, permettant de récupérer les informations sur les certifications qualité), suite à plusieurs retraits de fichiers incomplets",
      ],
    },
    {
      version: "5.15.1",
      date: "Le 7 Avril 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        "Un message « Aucune habilitation sur la fiche pour ce Siret » apparaissait par erreur dans certains cas, alors que le formateur disposait bien de l’habilitation RNCP à former sur le titre. Cet affichage erroné était sans incidence sur les publications Parcoursup, Affelnet et autres.",
        "Utilisateurs connectés — Correction d’une erreur qui provoquait dans certains cas des exports de données non sollicités.",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.15.0",
      date: "Le 5 Avril 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [],
      features: [],
      improvements: [
        "Suite à l’échéance du 31 mars 2022 définie par décret pour obtenir les certifications qualité, les formations pour lesquelles le responsable n’est pas certifié qualité ont été basculées dans l’onglet « non réglementaire ». Cet onglet inclut les formations non habilitées pour l’apprentissage, les formations pour lesquelles le formateur n’a pas d’habilitation RNCP, et les formations pour lesquelles l’organisme responsable n’est pas certifié qualité.",
        "Utilisateurs connectés — Mise en évidence des incohérences entre les durées de formation collectées et les durées issues des codes MEF, pour faciliter les expertises par les services académiques.",
      ],
    },
    {
      version: "5.14.4",
      date: "Le 25 Mars 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,

      fixes: [
        "Mise à jour des données pour certains établissements qui étaient marqués fermés dans le catalogue suite à une indisponibilité de l’API entreprise",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.14.3",
      date: "Le 24 Mars 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: ["Utilisateurs connectés - Affichage de l'historique des changements de statut de publication"],
      improvements: [],
    },
    {
      version: "5.14.2",
      date: "Le 23 Mars 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: [
        'Utilisateurs connectés - Réinitialisation des étiquettes "en attente de publication" à la clôture Affelnet en septembre de chaque année.',
      ],
    },
    {
      version: "5.14.1",
      date: "Le 23 Mars 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Utilisateurs connectés - Correction du mécanisme des étiquettes lorsque des règles avancées sont définies, pour bien appliquer l’étiquette “hors périmètre” pour les formations dont le gestionnaire n’a pas la certification Qualiopi",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.14.0",
      date: "Le 22 Mars 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Page de recherche, filtres fermés par défaut"],
      features: [
        "Gestion des changements de sites lors de l’import des données des Carif-Oref (un site devient plusieurs sites et vice-versa)",
      ],
      improvements: [
        "Ajout du libellé Carif-Oref sur les fiches formation",
        "Utilisateurs connectés - Ajout des certificateurs dans les exports des formations",
        " Utilisateurs connectés - Ajout des liens vers les pages catalogue dans les exports (formations et établissement)",
        "Pour les Titres et Titre professionnels, utilisation de la date d’échéance RNCP plutôt que la date d’échéance du Code formation diplôme",
      ],
    },
    {
      version: "5.13.0",
      date: "Le 17 mars 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Les adresses calculées depuis la géolocalisation transmise par les Carif-Oref n’étaient pas toujours affichées",
      ],
      features: [
        "Page d'erreur spécifique en cas de formation / établissement non trouvé",
        "Affichage de l’intitulé RCO des formations, en plus de l’intitulé extrait de la base centrale des nomenclatures",
        "Utilisateurs connectés : recherche par date de dernière modification du statut",
        "Utilisateurs connectés : historique des statuts de publication Affelnet et Parcoursup",
      ],
      improvements: [
        "Modification du placement du badge Qualiopi pour éviter qu’ils soient associés aux badges d’années (ceux-ci correspondent aux périodes de formation)",
        "Modification de l'url GéoPortail en un lien OpenStreetMap depuis les géolocalisation et adresses calculées",
        "Amélioration de l’accessibilité du menu utilisateur pour les lecteurs d’écran",
        "Utilisateurs connectés : amélioration des filtres par date, pour permettre de faire des recherche à partir d’une date donnée (sans limite de fin) ou avant une date donnée (sans limite de début)",
      ],
    },

    {
      version: "5.12.0",
      date: "Le 8 Mars 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Utilisateurs connectés : le filtre par niveau de formation n’était pas trié par niveau",
        "Utilisateurs connectés Affelnet : récupération des statuts de publication Affelnet pour affichage sur le catalogue, via des imports ponctuels (deux fois par campagne)",
      ],
      features: [
        "Gestion du flux retour Affelnet pour les étiquettes “publié”",
        "Administrateurs : dans le module de gestion des utilisateurs, la liste est maintenant triée par nom",
        "Super administrateurs : création d’un tableau de bord de suivi des écarts de distance entre les géolocalisation et les adresses postales transmises par le réseau des Carif-Oref",
      ],
      improvements: ["Message d'erreur spécifique si l'API entreprise est indisponible"],
    },
    {
      version: "5.11.0",
      date: "Le 24 Février 2022",
      about: `<h4>À propos de cette version</h4>
  Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Pagination en français"],
      features: [],
      improvements: [],
    },
    {
      version: "5.10.0",
      date: "Le 21 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "Affichage et filtrage de la date de publication sur les plateformes",
        "Affichage des erreurs de publication vers Parcoursup sur la fiche formation",
      ],
      improvements: [],
    },
    {
      version: "5.9.1",
      date: "Le 17 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: ["Suivi de la consommation de l'API du catalogue"],
      improvements: [],
    },
    {
      version: "5.9.0",
      date: "Le 16 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: ["Amélioration des performances de l’api via le nettoyage de données"],
    },
    {
      version: "5.8.1",
      date: "Le 14 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Corrections sur l’export des établissements et formations avec des UAIs invalides"],
      features: [],
      improvements: [],
    },
    {
      version: "5.8.0",
      date: "Le 14 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Export des établissements et formations avec des UAIs invalides, et mise en évidence sur les pages"],
      features: [],
      improvements: [
        "Amélioration des performances de l’api “/formations” via le nettoyage d’un grand volume de données (archives / historiques)",
      ],
    },
    {
      version: "5.7.0",
      date: "Le 9 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Suppression de champs obsolètes liés au conventionnement (fiche formation, exports, api…)",
        "Le clic sur un élément de liste n’ouvre pas de nouvel onglet",
      ],
      features: ["Intégration des formations Affelnet 2021"],
      improvements: ["Ajout de la colonne “a des formations de niveau 3” dans l'export des organismes"],
    },
    {
      version: "5.6.2",
      date: "Le 9 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Application des étiquettes Affelnet même en cas d’UAI invalide sur la formation"],
      features: [],
      improvements: [],
    },
    {
      version: "5.6.1",
      date: "Le 8 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Fusion des formations lors de la collecte de l’année dans le flux RCO"],
      features: [],
      improvements: [],
    },
    {
      version: "5.6.0",
      date: "Le 7 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Suppression des espaces dans les UAIs et ajout du contrôle lors de la saisie",
        "Rapprochement Parcoursup : enregistrement de l’id Parcoursup sur les matchs validés",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.5.0",
      date: "Le 2 Février 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Mise à jour des années sur les organismes"],
      features: ["Filtrage des formations par période pour les utilisateurs connectés"],
      improvements: [],
    },
    {
      version: "5.4.14",
      date: "Le 31 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Fiche formation lien vers la bonne alternance"],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.13",
      date: "Le 31 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Module de périmètre : correction de la gestion des permissions"],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.12",
      date: "Le 21 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Module de rapprochement des formations Catalogue et Parcoursup, à l'usage des services académiques : correction d’une erreur qui n’enlevait pas l’étiquette “publié” lors de l’annulation d’un rapprochement",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.11",
      date: "Le 19 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Récupération des informations Qualiopi par siret depuis la liste des OFs"],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.10",
      date: "Le 19 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: ["Bouton d’envoi manuel des formations “en attente de publication” vers Parcoursup"],
      improvements: [],
    },
    {
      version: "5.4.9",
      date: "Le 18 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Gestion des périodes fusionnées suite au nouveau flux RCO"],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.8",
      date: "Le 17 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Modification des règles d’intégration, pour exclure les codes diplômes qui expirent avant le 31 août de l’année scolaire en cours quelle que soit la durée de la formation",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.7",
      date: "Le 13 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Remplissage des académies sur les fiches formations, pour permettre l’édition des UAIs"],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.6",
      date: "Le 13 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: [
        "Données d’historisation des établissements : suppression des données de mise à jour automatiques, et ajout des données de mise à jour manuelles (uai)",
      ],
    },
    {
      version: "5.4.5",
      date: "Le 12 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: [
        "Module de périmètre - interface de création de règles pour prendre en compte le code RNCP et intégration des diplômes d’état dans le périmètre Parcoursup",
      ],
    },
    {
      version: "5.4.4",
      date: "Le 11 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Affichage des codes mefs dans les exports csv"],
      features: [],
      improvements: [],
    },
    {
      version: "5.4.3",
      date: "Le 11 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: [
        "Module de périmètre - interface de création de règles pour prendre en compte les années d’entrée en apprentissage et durée non collectées, et intégration des BTS de durée non collectée dans le périmètre Parcoursup",
      ],
    },
    {
      version: "5.4.2",
      date: "Le 10 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: ["Envoi des formations “en attente de publication” au web service Parcoursup"],
    },
    {
      version: "5.4.1",
      date: "Le 7 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: [
        "Amélioration des performances des rapports",
        "Amélioration des temps de chargement du module de périmètre",
      ],
    },
    {
      version: "5.4.0",
      date: "Le 5 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        'Interfaces à l’usage des services académiques – Restauration des étiquettes "Parcoursup - publié" lorsqu’une formation passe du catalogue non-éligible au catalogue général',
      ],
      features: [
        <span>
          Intégration provisoire (jusqu’au 31 mars 2022) des formations dont le gestionnaire n’est pas certifié Qualiopi
          dans le catalogue général (suite au décret{" "}
          <Link
            href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044591539"
            textDecoration={"underline"}
            isExternal
          >
            https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044591539
          </Link>{" "}
          et arrêté{" "}
          <Link
            href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044792191"
            textDecoration={"underline"}
            isExternal
          >
            https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044792191
          </Link>
          ). Ces formations étaient précédemment placées dans la catégorie “non éligibles”. La catégorie “non éligibles”
          a dans le même temps été renommée “Non habilités RNCP”.
        </span>,
      ],
      improvements: [],
    },
    {
      version: "5.3.2",
      date: "Le 3 Janvier 2022",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Pages de recherche : correction des compteurs de nombre de formations qui étaient incorrects pour certaines recherches ou filtrages",
      ],
      features: [],
      improvements: [
        "Fiche organisme: amélioration de la rapidité d’affichage du nombre de formations associées à un organisme",
        "Interfaces à l’usage des services académiques – Les menus de filtrage sur les codes RNCP et CFD ont été supprimés pour améliorer la rapidité de chargement des pages. Ces mêmes codes peuvent maintenant être recherchés via le champ de recherche libre",
      ],
    },
    {
      version: "5.3.1",
      date: "Le 28 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Restauration de 671 uais édités sur les fiches formations, qui avaient été supprimés par erreur lors d’une précédente évolution du catalogue",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.3.0",
      date: "Le 28 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "Module de publication à l’usage des services académiques — Prise en compte des formations dont l’année d’entrée en apprentissage n’est pas collectée par le réseau des Carif-Oref : les services académiques peuvent repérer les formations concernées, et demander leur publication sur Parcoursup s’ils confirment la possibilité d’accès post-bac en apprentissage.",
      ],
      improvements: ["Amélioration des performances et de la stabilité des traitements nocturnes"],
    },
    {
      version: "5.2.1",
      date: "Le 23 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Module de rapprochement des formations Catalogue et Parcoursup, à l'usage des services académiques : correction d'une erreur qui ne mettait pas à jour les correspondances après une annulation de rapprochement rejeté ou validé (avec pour effet de diriger sur des pages introuvables).",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.2.0",
      date: "Le 22 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Module de rapprochement des formations Catalogue et Parcoursup, à l'usage des services académiques : les évolutions de correspondances entre fiches (d'une correspondance faible à nulle par exemple) ne se mettaient pas à jour. Avec pour conséquence des rapprochements qui ne devaient plus être exposés, et des liens vers des pages inconnues (404) ",
        "Module de rapprochement des formations Catalogue et Parcoursup, à l'usage des services académiques : les formations 2022 étaient filtrées par erreur dans le module de rapprochement. Le filtre a été supprimé, avec pour conséquence 184 formations supplémentaires à rapprocher, et une baisse des formations inconnues (passant de 895 à 709)",
        "Paramétrage d'un code formation diplôme (01025409) qui était sans correspondance de niveau de sortie (4-EU)",
      ],
      features: [
        "Flux de données du catalogue vers Parcoursup : affectation des codes MEF 10 uniquement pour certains types de formation (BTS, BTSA, MC de niveau 4, CSA de niveau 4). Ces codes MEF étant fiabilisés dans la base centrale des nomenclatures. Pour les autres types de formation, c'est le RNCP qui est utilisé. Et en l'absence de RNCP, c'est le CFD qui est utilisé.",
      ],
      improvements: ["Amélioration de performances d'affichage du catalogue"],
    },
    {
      version: "5.1.9",
      date: "Le 21 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Liste des formations — Correction d'une erreur sur les compteurs de nombre de formations, qui étaient plafonnés à 10000 dans certains cas.",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.1.7",
      date: "Le 16 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Liste des organismes / Fiches établissement : correction d'une anomalie d'affichage de la date de création de l'établissement.",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.1.6",
      date: "Le 15 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Fiches formation — Correction d'une erreur qui permettait d'accéder, via l'URL, à des formations archivées. Les liens pointent maintenant vers des pages introuvables (404)",
      ],
      features: [],
      improvements: [
        "Module de rapprochement des formations Catalogue et Parcoursup, à l'usage des services académiques — Ajout d'un critère permettant d'établir plus de rapprochements entre les formations enregistrées dans Parcoursup et celles du catalogue : (CFD ou RNCP) et UAI ; (CFD ou RNCP) et Siret",
      ],
    },
    {
      version: "5.1.5",
      date: "Le 15 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Fiches établissement / Qualiopi — Correction d'une erreur qui empêchait de mettre à jour les informations Qualiopi sur les établissements sans offre de formation associée sur le catalogue.",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "5.1.3",
      date: "Le 14 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Module de rapprochement des formations Catalogue et Parcoursup, à l'usage des services académiques — Correction d'erreurs isolées sur des formations étiquetées à publiées, ni figurant pas dans Parcoursup",
        "Module de rapprochement des formations Catalogue et Parcoursup, à l'usage des services académiques — Correction d'une erreur qui empêchait les actions de rapprochements lorsqu'une formation Parcoursup était mise en correspondance avec plusieurs formations catalogue (l'action effectuée ne s'appliquait que sur la première formation catalogue remontée, mais pas sur les suivantes)",
      ],
      features: [],
      improvements: [
        'Données, interfaces, exports — Remplacement des précédent "ID_RCO" (identifiants de formations utilisés par le réseau des Carif-Oref) par la nouvelle "Clé ministères éducatifs", à divers endroits : fiches formations, rapports automatisés, exports de fichiers csv, module de rapprochement, etc.',
      ],
    },
    {
      version: "5.1.0",
      date: "Le 9 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "Automatisation de l’intégration des certifications Qualiopi (et équivalents) depuis les données déclarées par les certificateurs qualité auprès du ministère du travail. Seules les formations dont le gestionnaire est certifié Qualiopi apparaissent dans le “catalogue général” (éligibilité à l’affichage Parcoursup ou Affelnet, sous réserve de publication par les instructeurs en académies)",
      ],
      improvements: [],
    },
    {
      version: "5.0.0",
      date: "Le 6 Décembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "Intégration du nouveau flux de données du réseau des Carif-Oref, contenant toutes les formations sans limite de date et, pour chaque formation, un identifiant stable d’une année sur l’autre",
      ],
      improvements: [],
    },
    {
      version: "4.11.0",
      date: "Le 30 Novembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "[Page formation] L’académie de rattachement est déterminée depuis le lieu de formation (et non plus depuis l’établissement formateur)",
      ],
      features: [
        '[Admin] Nouvelle étiquette "à publier  (sous condition habilitation)" dans le module de périmètre pour les formations éligibles à Parcoursup',
      ],
      improvements: [],
    },
    {
      version: "4.10.0",
      date: "Le 4 Novembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "[Page formation] Prise en compte de la certification qualité EDUFORM",
        "[Rapprochement Parcoursup] Divers correctifs et améliorations suite aux retours utilisateurs",
      ],
      features: [],
      improvements: ["Migration technique des organismes"],
    },
    {
      version: "4.9.1",
      date: "Le 03 Novembre 2021",
      about: `<h4>À propos de cette version</h4>
      Correctif édition uai lieu de formation`,
      fixes: ["[Fiche formation] correctif édition de l'uai du lieu de formation"],
      features: [],
      improvements: [],
    },
    {
      version: "4.9.0",
      date: "Le 27 Octobre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Les formations pour lesquelles les organismes sont certifiés Qualiopi, Eduform, ou QualiFormAgri, sont éligibles à Parcoursup et Affelnet, même sans référencement Datadock",
        "Correction du contrôle et du message d'erreur de changement de mot de passe (les espaces ne sont pas acceptés)",
        "[Page formation] L’académie de rattachement est déterminée depuis l’établissement formateur (et non le lieu de formation, celui-ci pouvant être situé en dehors de l’académie de rattachement)",
      ],
      features: [],
      improvements: [
        "[Rapprochement Parcoursup] Améliorations d’interface du module de rapprochement des formations Parcoursup et Catalogue à l’usage des académies : le cas des rapprochements entre une formation Parcoursup et plusieurs formations Catalogue a été simplifié",
      ],
    },
    {
      version: "4.8.1",
      date: "Le 19 Octobre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: ["[Rapprochement Parcoursup] Pré lancement campagne"],
    },
    {
      version: "4.8.0",
      date: "Le 19 Octobre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: ["Migration technique des formations"],
    },
    {
      version: "4.7.0",
      date: "Le 14 Octobre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: ["[Admin] Ajout de la recherche dans le module de périmètre"],
      improvements: [
        "[Admin] Améliorations de l'interface du module de rapprochement",
        "[Page formation] Amélioration du contrôle des habilitations RNCP",
      ],
    },
    {
      version: "4.6.0",
      date: "Le 22 Septembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Correction de l'affichage des académies sur les organismes en Corse",
        "Correction des mises à jour hebdomadaires des certifications sur les organismes",
      ],
      features: [],
      improvements: [
        "[Page formation] Affichage de l'adresse collectée par le réseau des Carif-Oref et de l'adresse calculée à partir de la géolocalisation collectée",
        "Ajout des dates d'expiration BCN et RNCP dans les exports des formations",
      ],
    },
    {
      version: "4.5.0",
      date: "Le 8 Septembre 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: ["[Admin] Rapprochements ParcourSup et Base Carif Oref nouvelle version"],
    },
    {
      version: "4.4.0",
      date: "Le 26 Août 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Code postal et académie des établissements à partir des données de l'API Entreprise"],
      features: ["[Admin] Module de gestion des règles d'intégration dans les plateformes Parcoursup et Affelnet"],
      improvements: [
        "Mise à jour de la page de statistiques, avec des nouvelles métriques : raisons de non éligibilité, couverture de réconciliation, graphique d'évolution de la collecte, classement des erreurs...",
        "Chaînage et optimisation des rapports d'import et d'enrichissement des formations",
      ],
    },
    {
      version: "4.3.0",
      date: "Le 20 Juillet 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Meilleure gestion de la mémoire lors de l'exécution des scripts nocturnes"],
      features: [],
      improvements: [
        "Mise à jour de la page de statistiques (diplômes, titres, statuts Affelnet et Parcoursup, etc.)",
        "Amélioration de la géolocalisation et des adresses des formations",
        "Lien direct pour la page de guide réglementaire",
      ],
    },
    {
      version: "4.2.0",
      date: "Le 29 Juin 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "Module de rapprochement des bases Carif-Oref et Parcoursup",
        "Page mes actions expertes qui permet aux instructeurs en académie d'accéder aux modules de rapprochement des bases Carif-Oref et Parcoursup",
        "[Admin] Module gestion des rôles",
      ],
      improvements: [],
    },
    {
      version: "4.1.0",
      date: "Le 15 Juin 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "[Admin] possibilité de télécharger des fichiers pour la mise à jour des UAI, des données RNCP ou réaliser des importations Affelnet",
        "Ajout de l'identifiant formation Carif Oref, de l'identifiant actions Carif Oref et du Code Certif Info sur la page formation, possibilité de faire une recherche sur ces informations",
      ],
      improvements: [
        "Recherche avancée plus ergonomique",
        "Message utilisateur affiché pour indiquer quand une maintenance est en cours (s'affiche quand la maintenance est en cours - bandeau rose)",
        "Retrait du périmètre Affelnet des formations dont la date de validité ne permet pas une inscription en première année sur 2021: principalement des CAP (environ 130) et BAC pro (environ 100)",
      ],
    },
    {
      version: "4.0.0",
      date: "Le 02 Juin 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [],
      improvements: [
        "Nouvelle interface utilisateur (respect de la charte graphique Etat)",
        "Lien vers la carte LBA depuis la fiche formation",
        "Affichage durée et année si un seul code MEF est retourné par la BCN, sinon faute d'informations transmises via la collecte ces champs restent vides",
      ],
    },
    {
      version: "3.5.0",
      date: "Le 12 Mai 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "Modification des règles de récupération des communes des lieux de formation, pour prendre en compte le code commune insee plus précis en cas de pluri municipalités sur un seul code postal (2 984 fiches formations corrigées)",
      ],
      features: [],
      improvements: [
        <span>
          Script de réconciliation Affelnet mis en production avec les données transmises par la DNE au 11/05/2021.
          Total de 5008 formations publiées, et de 1 040 formations en attente de publication (certainement dû à un UAI
          manquant - à transmettre à la mission :{" "}
          <Link href="mailto:catalogue@apprentissage.beta.gouv.fr" textDecoration={"underline"}>
            catalogue@apprentissage.beta.gouv.fr
          </Link>
          , en indiquant SIRET - UAI)
        </span>,
      ],
    },
    {
      version: "3.4.0",
      date: "Le 4 Mai 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["export des données établissements"],
      features: [
        "Recherche avancée sur la commune du lieu de formation",
        "Lien vers les formations 2021 sur la fiche établissement",
        "Commentaire de dépublication",
        "Infobulles sur les fiches formations & établissements",
      ],
      improvements: ["Mise à jour des étiquettes des niveaux 5 et 6"],
    },
    {
      version: "3.3.0",
      date: "Le 19 Avril 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "[Catalogue] Contrôle de niveau avant ajout des étiquettes publication pour Affelnet",
        "[Catalogue] Passage de MEF affectation a des MEF valides pour Affelnet",
        "[Catalogue] Retrait des étiquettes 'publiées' pour les formations n'ayant pas une réconciliation unique avec la base Affelnet 2020",
        "[Catalogue] Modifications des caractères spéciaux sur les exports",
      ],
      features: [],
      improvements: [],
    },
    {
      version: "3.2.0",
      date: "Le 12 Avril 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["[Catalogue] Contrôle des habilitations RNCP"],
      features: [
        "[Catalogue] Remontée des codes Mef pour Affelnet",
        "[Catalogue] Édition de l'information de l'offre de formation Affelnet dans le module de publication",
        "[Catalogue] Recherche avancée par expressions régulières",
      ],
      improvements: ["Améliorations de performance des traitements nocturnes"],
    },
    {
      version: "2.6.0",
      date: "Le 03 Mars 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["Correction du niveau des MC"],
      features: [
        "[Catalogue] Fonctionnalité de dépublication des formations",
        "[Catalogue] Ajout de l'adresse du site de formation",
      ],
      improvements: [
        "Modifications des filtres pour le périmètre Parcoursup",
        "Ajustement des périmètres Affelnet et Parcoursup",
      ],
    },
    {
      version: "2.5.0",
      date: "Le 22 Février 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: ["[Catalogue] Formulaire complémentaire pour publication des formations dans catalogue Affelnet"],
      improvements: [
        "[Catalogue] Réconciliation des formations existantes Affelnet (sur base des éléments publiés dans Affenet en 2020)",
        "[Catalogue] Réconciliation des formations existantes Parcoursup (sur base des éléments publiés dans Parcoursup en 2021)",
      ],
    },
    {
      version: "2.4.0",
      date: "Le 31 Janvier 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "[Catalogue] Module de publication des formations en mode connecté au sein des bases Parcoursup et Affelnet",
        "[Page] Ajout du guide des signalements",
      ],
      improvements: [],
    },
    {
      version: "2.3.0",
      date: "Le 06 Janvier 2021",
      about: `<h4>À propos de cette version</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["[Catalogue] Corrections des doublons de formations 2021 RCO"],
      features: [
        "[Catalogue] Ajout de la fonctionnalité de modification du catalogue par les instructeurs",
        "[Catalogue] Ajout de la fonctionnalité d'export des données en mode connecté",
        "[Catalogue] Affichage des tag 2020 ou 2021 sur les établissements",
        "[Page] Ajout du guide réglementaire 2021 (hors connexion)",
      ],
      improvements: [
        "[Catalogue] mise à jour des scripts d'éligibilité des établissements et des formations (info datadock à jour)",
      ],
    },
    {
      version: "2.2.0",
      date: "Le 15 Décembre 2020",
      about: `<h4>À propos de cette version :</h4>
      <ul>
        <li>
          A l’attention des services académiques : L’indication « A charger dans Parcoursup » sera
          développée de façon plus précise en fonction de chaque type de formation dans la prochaine version
          du catalogue 2021. Pour analyser les demandes d’intégration, il faut tenir compte de
          <a
            href="https://drive.google.com/file/d/1xL3urYVOJBNkm4HO-iZcTPhieRWpQ7Sk/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            la note de cadrage MESRI des conditions de référencement
          </a>
          . L’indication « à charger dans parcoursup » de la version 2020 ne correspond pas à une validation
          automatique, elle doit être entendue comme « sous réserve des conditions de référencement ».
        </li>
      </ul>`,
      fixes: [],
      features: [],
      improvements: [],
    },
    {
      version: "2.1.0",
      date: "Le 01 Décembre 2020",
      about: `<h4>A propos de cette version :</h4>
      <ul>
        <li>Le catalogue 2021 est issu de la collecte de l'offre de formation en apprentissage réalisée par les Carif-Oref.</li>
        <li>Les formations déclarées sur des nouveaux établissements ne sont pas encore affichées, elles ne seront à compter du 7/12/2021 (une info sera disponible sur l'écran d'accueil quand la fonctionnalité sera opérationnelle)</li>
        <li>Les établissements présents en 2020 sont actuellement visibles, les nouveaux établissements 2021 seront intégrés dans les prochains jours.</li>
        <li>Les scripts éligibilités utilisés, sont actuellement ceux de 2020, les scripts 2021 seront mis en place d'ici la fin du mois de décembre.</li>
        <li>Le référencement Parcoursup et Affelnet pour 2021 sera déployé avec le module de validation au 06/01/2021.</li>
      </ul>`,
      fixes: [],
      features: ["[Catalogue] Ajout des formations 2021 RCO"],
      improvements: [],
    },
    {
      version: "2.0.0",
      date: "Le 17 Juin 2020",
      about: `<h4>A propos de cette version :</h4>
      <ul>
        <li>Changement d'interface majeur</li>
      </ul>`,
      fixes: [],
      features: [
        "[Catalogue] Ajout de filtres et d'un module de recherche",
        "[Catalogue] Mise en place d'un module de recherche avancée",
        "[Catalogue] Ajout de la fonctionnalité suppression",
        "[Catalogue] Ajout de la fonctionnalité ajout",
      ],
      improvements: ["[Catalogue] Pagination en Français"],
    },
    {
      version: "1.3.4",
      date: "Le 26 Mai 2020",
      about: `<h4>A propos de cette version :</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: ["[Catalogue] Suppression de 780 formations doublons"],
      features: [],
      improvements: [
        "[Catalogue] Ajout des colonnes Modalités de formation.",
        "[Catalogue] Ajout des colonnes relatives à ParcourSup (Déjà référencée et à charger)",
      ],
    },
    {
      version: "1.3.3",
      date: "Le 19 Mai 2020",
      about: `<h4>A propos de cette version :</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: ["[Page] Ajout des guides utilisateurs en mode connecté"],
      improvements: ["[Catalogue] Nettoyage des données établissements"],
    },
    {
      version: "1.3.2",
      date: "Le 4 Mai 2020",
      about: `<h4>A propos de cette version :</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [],
      features: [
        "[Page] Extraction des données possible en format CSV",
        "La prise en compte des habilitations RNCP : vérification que la formation peut être délivrée en apprentissage et que l’organisme de formation est bien habilité par le certificateur à délivrer cette certification",
      ],
      improvements: [
        "[Catalogue] Ajout des codes et des libellé RNCP",
        "[Catalogue] Ajout des codes ROMES associés",
        "[Catalogue] Affichage des intitulés court et long d'une formation",
        "[Catalogue] Ajout URL description formation Onisep",
        "[Catalogue] Possibilité de filtrer sur les données vides sur certaines colonnes",
      ],
    },
    {
      version: "1.3",
      date: "Le 24 Avril 2020",
      about: `<h4>A propos de cette version :</h4>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "[Catalogue] Correction des niveaux de diplômes erronés pour les Mentions Complémentaires",
        "[Catalogue] Correction des niveaux de diplômes erronés sur 9 caractères contenant le code spécialité",
        "[Page] Correction des problèmes de connexions (modification du mot de passe, mot de passe oublié, caractéristiques obligatoires du mot de passe)",
        "[Catalogue] Ajout UAI 0541516E et des 13 formations manquantes au sein du catalogue",
        "[Page] Correction du problème de connexion lors d'une saisie de mauvais mot de passe",
        "[Page] Autorisation de modification uniquement sur les contenus non générés et non valident",
      ],
      features: ["[Page] Ajout mot de passe oublié"],
      improvements: [
        "[Catalogue] Descriptif détaillé sur les champs longs",
        "[Catalogue] Nettoyage des données UAI sur base des données de la DEPP",
        "[Catalogue] Ajout d'un filtre multi-critères sur les niveaux de formation",
        //'[Catalogue] Ajout d\'une catégorie (Vides) dans l\'onglet formation sur les champs "Uai Responsable" et sur "Uai formateur" et dans l\'onglet établissements sur le champ "Uai"',
      ],
    },
    {
      version: "1.2",
      date: "Le 1er Avril 2020",
      about: `<h4>A propos de cette version :</h4>
      <ul>
        <li>
          l’harmonisation de certaines informations :
          <ul>
            <li>code diplôme/formation (seuls les diplômes en cours de validité seront affichés)</li>
            <li>niveau de formation (la nouvelle nomenclature européenne sera utilisée)</li>
            <li>
              intitulés (tous les intitulés diplôme, formation, seront normalisés sur la base des informations de
              la BCN)
            </li>
          </ul>
        </li>
      </ul>`,
      fixes: [
        "[page] Réparation du filtre des formations non éligible",
        "[page] Réparation du filtre conventionnement établissement",
        "[Catalogue] Ajout des formations académiques manquantes",
        "[Catalogue] Nettoyage des code uai des établissements",
        "[Catalogue] Nettoyage des codes postaux formations",
      ],
      features: ["[page] Ajout du journal des modifications"],
      improvements: ["[page] page d'accueil"],
    },
    {
      version: "1.1",
      date: "Le 20 Mars 2020",
      about: `<h4>A propos de cette version :</h4>
      <ul>
        <li>les données sont compilées et à jour du 20/03/2020,</li>
        <li>
          l’onglet établissement a été modifié afin d’identifier les informations de conventionnement et de
          déclaration en préfecture,
        </li>
        <li>
          les vérifications sur l'éligibilité d'un établissement ont été automatisées :
          <ul>
            <li>s’agit -il d’un CFA conventionné ? </li>
            <li>l’organisme est-il déclaré en préfecture ? </li>
            <li>est ce qu’il porte la certification 2015 (datadock) ? </li>
          </ul>
        </li>
        <li>les données sont normalisées et conformes à ce qui existe sous Infogreffe, </li>
        <li>
          nous avons corrigé une fonctionnalité qui empêchait certains fichiers chargés sous Démarches Simplifiées
          d’être visibles au sein du catalogue.
        </li>
      </ul>`,
      fixes: ["Changement de l'ordre des resultats page formations"],
      features: ["Ajout de compte utilisateur", "Edition des formation disponible pour les utilisateurs"],
      improvements: ["Ajout de filtres sur les pages formations et établissement"],
    },
    {
      version: "1.0",
      date: "Le 13 Mars 2020",
      about: `<h4>A propos de cette version :</h4>
      <ul>
        <li>Mise en ligne</li>
      </ul>`,
      fixes: [],
      features: ["Ajout de la page formations", "Ajout de la page établissement"],
      improvements: [],
    },
  ],
};

export default changelog;
