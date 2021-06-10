export default [
  {
    feature: "Voir la page Catalogue formation",
    ref: "page_catalogue",
    subFeatures: [
      {
        feature: "Exporter les formations",
        ref: "page_catalogue/export_btn",
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
];
