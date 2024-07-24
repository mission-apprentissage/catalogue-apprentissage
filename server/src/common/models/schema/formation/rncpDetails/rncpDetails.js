const mongoose = require("mongoose");
const { partenaireSchema } = require("./partenaire");
const { certificateurSchema } = require("./certificateur");
const { romeSchema } = require("./rome");

const rncpDetailsSchema = new mongoose.Schema(
  {
    date_fin_validite_enregistrement: {
      type: Date,
      default: null,
      description: "Date de validité de la fiche",
    },
    active_inactive: {
      type: String,
      default: null,
      description: "fiche active ou non",
    },
    etat_fiche_rncp: {
      type: String,
      default: null,
      description: "état fiche ex: Publiée",
    },
    niveau_europe: {
      type: String,
      default: null,
      description: "Niveau européen ex: niveauu5",
    },
    code_type_certif: {
      type: String,
      default: null,
      description: "Code type de certification (ex: DE)",
    },
    type_certif: {
      type: String,
      default: null,
      description: "Type de certification (ex: diplôme d'état)",
    },
    ancienne_fiche: {
      type: [String],
      default: null,
      description: "Code rncp de l'ancienne fiche",
    },
    nouvelle_fiche: {
      type: [String],
      default: null,
      description: "Code rncp de la nouvelle fiche",
    },
    demande: {
      type: Number,
      default: 0,
      description: "Demande en cours de d'habilitation",
    },
    certificateurs: {
      type: [certificateurSchema],
      default: [],
      description: "Certificateurs",
    },
    nsf_code: {
      type: String,
      default: null,
      description: "Code NSF",
    },
    nsf_libelle: {
      type: String,
      default: null,
      description: "Libellé NSF",
    },
    romes: {
      type: [romeSchema],
      default: [],
      description: "Romes",
    },
    blocs_competences: {
      type: [Object],
      default: [],
      description: "Blocs de compétences",
    },
    voix_acces: {
      type: [Object],
      default: [],
      description: "Voix d'accès",
    },
    partenaires: {
      type: [partenaireSchema],
      default: [],
      description: "Partenaires",
    },
    rncp_outdated: {
      type: Boolean,
      default: false,
      description: "Code rncp périmé (date fin enregistrement avant le 31 aout de l'année courante)",
    },

    type_enregistrement: {
      type: String,
      default: null,
      description: "Type d'enregistrement (issue de FranceCompétences)",
    },
  },
  { _id: false }
);

module.exports = { rncpDetailsSchema };
