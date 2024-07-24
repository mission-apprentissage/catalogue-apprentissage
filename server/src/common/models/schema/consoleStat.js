const consoleStatSchema = {
  plateforme: {
    type: String,
    enum: ["affelnet", "parcoursup"],
    description: "Plateforme de destination",
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
    description: "Date de la statistique",
    required: true,
  },
  academie: {
    type: String,
    default: null,
  },
  formations_publiees: {
    type: Number,
    default: 0,
  },
  formations_publiees_sans_session: {
    type: Number,
    default: 0,
  },
  formations_publiees_sans_session_avec_remplacement: {
    type: Number,
    default: 0,
  },
  formations_publiees_sans_session_sans_remplacement: {
    type: Number,
    default: 0,
  },

  formations_publiees_perte_qualiopi: {
    type: Number,
    default: 0,
  },
  formations_publiees_perte_rncp: {
    type: Number,
    default: 0,
  },
  formations_publiees_siret_inactif: {
    type: Number,
    default: 0,
  },
  formations_integrables: {
    type: Number,
    default: 0,
  },
  formations_perimetre: {
    type: Number,
    default: 0,
  },
  organismes_avec_formations_publiees: {
    type: Number,
    default: 0,
  },
  organismes_avec_formations_publiees_sans_session: {
    type: Number,
    default: 0,
  },
  organismes_avec_formations_integrables: {
    type: Number,
    default: 0,
  },
  organismes_avec_formations_perimetre: {
    type: Number,
    default: 0,
  },
  details: {
    type: Object,
    default: {},
  },
};

// keys.reduce(function (result, current) {
//   return Object.assign(result, { [current]: academieStatSchema });
// }, consoleStatSchema);

module.exports = consoleStatSchema;
