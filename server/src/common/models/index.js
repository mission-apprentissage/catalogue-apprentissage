const schemas = require("./schema");
const { createModel } = require("./createModel");

module.exports = {
  User: createModel("user", schemas.get("user")),
  Role: createModel("role", schemas.get("role")),
  Formation: createModel("formation", schemas.get("formation"), {
    elastic: {
      index: "formation",
      filter: (doc) => {
        return !doc.published;
      },
    },
    diff: {
      omit: [
        "updates_history",
        "updated_at",
        "affelnet_statut_history",
        "parcoursup_statut_history",
        "lieu_formation_adresse_computed",
        "onisep_discipline",
        "onisep_domaine_sousdomaine",
        "onisep_intitule",
        "onisep_libelle_poursuite",
        "france_competence_infos",
        "onisep_lien_site_onisepfr",
        "onisep_url",
        "num_tel",
        "rome_codes",

        "objectif",
        "contenu",

        "rncp_details.demande",
        "rncp_details.nsf_code",
        "rncp_details.nsf_libelle",
        "rncp_details.romes",
        "rncp_details.blocs_competences",
        "rncp_details.voix_acces",
        "rncp_details.partenaires",

        "etablissement_siege_id",
        "etablissement_gestionnaire_id",
        "etablissement_formateur_id",

        "bcn_mefs_10_agregat",
        "parcoursup_mefs_10_agregat",
        "affelnet_mefs_10_agregat",

        // Champs rncp_details conservés
        // "rncp_details.niveau_europe",
        // "rncp_details.nouvelle_fiche",
        // "rncp_details.ancienne_fiche",
        // "rncp_details.etat_fiche_rncp",
        // "rncp_details.active_inactive",
        // "rncp_details.certificateurs",
        // "rncp_details.date_fin_validite_enregistrement",
        // "rncp_details.type_certif",
        // "rncp_details.code_type_certif",
        // "rncp_details.rncp_outdated",
      ],
    },
  }),
  Log: createModel("log", schemas.get("log")),
  AffelnetFormation: createModel("affelnetformation", schemas.get("affelnetFormation")),
  Etablissement: createModel("etablissement", schemas.get("etablissement"), {
    elastic: {
      index: "etablissements",
      filter: (doc) => {
        return !doc.published;
      },
    },
    diff: {
      omit: ["updates_history", "updated_at"],
    },
  }),
  ParcoursupFormation: createModel("parcoursupformations", schemas.get("parcoursupFormation")),
  ParcoursupFormationCheck: createModel("parcoursupformationchecks", schemas.get("parcoursupFormationCheck")),
  SandboxFormation: createModel("sandboxformation", schemas.get("formation")),
  Statistique: createModel("statistique", schemas.get("statistique")),
  Alert: createModel("alert", schemas.get("alert")),
  ReglePerimetre: createModel("regleperimetre", schemas.get("reglePerimetre")),
  Consumption: createModel("consumption", schemas.get("consumption")),
  DualControlEtablissement: createModel("dualcontroletablissement", schemas.get("dualControlEtablissement")),
  DualControlFormation: createModel("dualcontrolformation", schemas.get("dualControlFormation")),
  ConsoleStat: createModel("consolestat", schemas.get("consoleStat")),
  PreviousSeasonFormation: createModel("previousSeasonFormation", schemas.get("previousSeasonFormation")),
  PreviousSeasonFormationStat: createModel("previousSeasonFormationStat", schemas.get("previousSeasonFormationStat")),
  CampagneStart: createModel("campagneStart", schemas.get("campagneStart")),
};
