export default [
  {
    feature: "Voir la page Catalogue formation",
    ref: "page_catalogue",
    subFeatures: [
      {
        feature: "Exporter les formations",
        ref: "page_catalogue/export_btn",
      },
      {
        feature: "Consulter le guide réglementaire",
        ref: "page_catalogue/guide_reglementaire",
      },
      {
        feature: "Demande d'ajout de formation",
        ref: "page_catalogue/demande_ajout",
      },
    ],
  },
  {
    feature: "Voir la page détails d'une formation",
    ref: "page_formation",
    subFeatures: [
      {
        feature: "Voir les statuts de publication",
        ref: "page_formation/voir_status_publication",
      },
      {
        feature: "Gestion des publications",
        ref: "page_formation/gestion_publication",
      },
      {
        feature: "Modifier les informations",
        ref: "page_formation/modifier_informations",
      },
      {
        feature: "Supprimer la formation",
        ref: "page_formation/supprimer_formation",
      },
    ],
  },
  {
    feature: "Voir la page des organismes",
    ref: "page_organismes",
    subFeatures: [
      {
        feature: "Exporter les organismes",
        ref: "page_organismes/export_btn",
      },
      {
        feature: "Consulter le guide réglementaire",
        ref: "page_organismes/guide_reglementaire",
      },
    ],
  },
  {
    feature: "Voir le journal des modifications",
    ref: "page_journal",
  },
  {
    feature: "Actions expertes",
    ref: "page_actions_expertes",
  },
];
