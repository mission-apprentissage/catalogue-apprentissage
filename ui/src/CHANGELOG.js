import React from "react";
import { Link } from "@chakra-ui/react";

const changelog = {
  list: [
    {
      version: "5.5.0",
      date: "Prochainement",
      about: `<h4>À venir</h4>`,
      fixes: [],
      features: [],
      improvements: [],
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
