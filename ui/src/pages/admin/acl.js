export default [
  {
    feature: "Voir la page Catalogue",
    ref: "page_catalogue",
    subFeatures: [
      {
        feature: "Voir les statuts de publication Parcoursup",
        ref: "page_catalogue/voir_status_publication_ps",
      },
      {
        feature: "Voir les statuts de publication Affelnet",
        ref: "page_catalogue/voir_status_publication_aff",
      },
      {
        feature: "Voir les filtres avancés Parcoursup",
        ref: "page_catalogue/voir_filtres_avances_ps",
      },
      {
        feature: "Voir les filtres avancés Affelnet",
        ref: "page_catalogue/voir_filtres_avances_aff",
      },
    ],
  },
  {
    feature: "Voir la page détails d'une formation",
    ref: "page_formation",
    subFeatures: [
      {
        feature: "Voir les statuts de publication Parcoursup",
        ref: "page_formation/voir_status_publication_ps",
      },
      {
        feature: "Voir les statuts de publication Affelnet",
        ref: "page_formation/voir_status_publication_aff",
      },
      {
        feature: "Gestion des publications",
        ref: "page_formation/gestion_publication",
      },
      {
        feature: "Modifier les UAI lieux",
        ref: "page_formation/modifier_informations",
      },
      {
        feature: "Forcer la publication Parcoursup",
        ref: "page_formation/envoi_parcoursup",
      },
      {
        feature: "Réinitialiser le statut de publication Parcoursup",
        ref: "page_formation/reinit_parcoursup",
      },
    ],
  },
  {
    feature: "Voir la page Organismes",
    ref: "page_organismes",
  },
  {
    feature: "Voir la page détails d'un organisme",
    ref: "page_organisme",
  },
  {
    feature: "Gestion des utilisateurs",
    ref: "page_gestion_utilisateurs",
  },
  {
    feature: "Gestion des rôles",
    ref: "page_gestion_roles",
  },
  {
    feature: "Upload de fichiers source",
    ref: "page_upload",
    subFeatures: [
      {
        feature: "Kit code diplome - rncp",
        ref: "page_upload/kit-apprentissage",
      },
      {
        feature: "Import Affelnet",
        ref: "page_upload/affelnet-formations",
      },
      {
        feature: "Liste de MEFs fiabilisés sur Parcoursup",
        ref: "page_upload/parcoursup-mefs",
      },
    ],
  },
  {
    feature: "Message de maintenance",
    ref: "page_message_maintenance",
  },
  {
    feature: "Consoles de pilotage",
    ref: "page_console",
    subFeatures: [
      {
        feature: "Affelnet",
        ref: "page_console/affelnet",
      },
      {
        feature: "Parcoursup",
        ref: "page_console/parcoursup",
      },
    ],
  },
  {
    feature: "Réglage des périmètres",
    ref: "page_perimetre",
    subFeatures: [
      {
        feature: "Affelnet",
        ref: "page_perimetre/affelnet",
      },
      {
        feature: "Parcoursup",
        ref: "page_perimetre/parcoursup",
      },
    ],
  },
];
