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
        feature: "Modifier les informations",
        ref: "page_formation/modifier_informations",
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
    feature: "Voir la page détails d'un organisme",
    ref: "page_organisme",
    subFeatures: [
      {
        feature: "Modifier les informations",
        ref: "page_organisme/modifier_informations",
      },
      {
        feature: "Demander des corrections",
        ref: "page_organisme/demandes_corretions",
      },
    ],
  },
  // {
  //   feature: "Voir le journal des modifications",
  //   ref: "page_journal",
  // },
  {
    feature: "Rapports de conversion",
    ref: "rapports_conversion",
  },
  {
    feature: "Rapports d'importation",
    ref: "rapports_importation",
  },
  {
    feature: "Gestion des utilisateurs",
    ref: "page_gestion_utilisateurs",
  },
  {
    feature: "Gestion des Rôles",
    ref: "page_gestion_roles",
  },
  {
    feature: "Upload de fichiers source",
    ref: "page_upload",
  },
  {
    feature: "Message de maintenance",
    ref: "page_message_maintenance",
  },
];
