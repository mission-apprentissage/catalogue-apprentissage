import React from "react";
import { Link } from "@chakra-ui/react";

const changelog = {
  list: [
    {
      version: "4.6.0",
      date: "Prochainement",
      about: `<h4>À venir</h4>`,
      fixes: [],
      features: [],
      improvements: ["Travaux sur le flux retour vers les Carif-Oref et gestion des modifications"],
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
