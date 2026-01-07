const { uaiFormat, siretFormat, emailFormat, urlFormat } = require("../format");

const candidatureRelationSchema = {
  academie_responsable: {
    index: true,
    type: String,
    default: null,
    description: "Académie de l'établissement responsable",
    validate: {
      validator: (value) => !!value && !!value.length,
      message: (props) => `${props.value} n'est pas une académie valide.`,
    },
  },
  siret_responsable: {
    index: true,
    type: String,
    default: null,
    description: "SIRET de l'établissement responsable",
    validate: {
      validator: (value) => !value || siretFormat.test(value),
      message: (props) => `${props.value} n'est pas un code SIRET valide.`,
    },
  },
  uai_responsable: {
    index: true,
    type: String,
    default: null,
    description: "UAI de l'établissement responsable",
    validate: {
      validator: (value) => !value || uaiFormat.test(value),
      message: (props) => `${props.value} n'est pas un code UAI valide.`,
    },
  },
  url_responsable: {
    index: true,
    type: String,
    default: null,
    description: "SIRET de l'établissement responsable",
    validate: {
      validator: (value) => !!value && !!value.length && urlFormat.test(value),
      message: (props) => `${props.value} n'est pas une URL valide.`,
    },
  },

  raison_sociale_responsable: {
    index: true,
    type: String,
    default: null,
    description: "UAI de l'établissement responsable",
    validate: {
      validator: (value) => !!value && !!value.length,
      message: (props) => `${props.value} n'est pas une raison sociale valide.`,
    },
  },
  localite_responsable: {
    index: true,
    type: String,
    default: null,
    description: "UAI de l'établissement responsable",
    validate: {
      validator: (value) => !!value && !!value.length,
      message: (props) => `${props.value} n'est pas une localité valide.`,
    },
  },
  email_responsable: {
    index: true,
    type: String,
    default: null,
    description: "Email de l'établissement responsable",
    validate: {
      validator: (value) => !!value && !!value.length && emailFormat.test(value),
      message: (props) => `${props.value} n'est pas une adresse courriel valide.`,
    },
  },

  academie_formateur: {
    index: true,
    type: String,
    default: null,
    description: "Académie de l'établissement formateur",
    validate: {
      validator: (value) => !!value && !!value.length,
      message: (props) => `${props.value} n'est pas une académie valide.`,
    },
  },
  siret_formateur: {
    index: true,
    type: String,
    default: null,
    description: "SIRET de l'établissement formateur",
    validate: {
      validator: (value) => !value || siretFormat.test(value),
      message: (props) => `${props.value} n'est pas un code SIRET valide.`,
    },
  },
  uai_formateur: {
    index: true,
    type: String,
    default: null,
    description: "UAI de l'établissement formateur",
    validate: {
      validator: (value) => !value || uaiFormat.test(value),
      message: (props) => `${props.value} n'est pas un code UAI valide.`,
    },
  },

  raison_sociale_formateur: {
    index: true,
    type: String,
    default: null,
    description: "Raison sociale de l'établissement formateur",
    validate: {
      validator: (value) => !!value && !!value.length,
      message: (props) => `${props.value} n'est pas une raison sociale valide.`,
    },
  },

  localites_formation: {
    index: false,
    type: [String],
    default: [],
    description: "Localités des établissements d'accueil",
    // validate: {
    //   validator: (value) => !!value && !!value.length,
    //   message: (props) => `${props.value} n'est pas une raison sociale valide.`,
    // },
  },

  uais_formation: {
    index: false,
    type: [String],
    default: [],
    description: "UAIs des établissements d'accueil",
    // validate: {
    //   validator: (value) => !!value && !!value.length,
    //   message: (props) => `${props.value} n'est pas une raison sociale valide.`,
    // },
  },
  codes_formation: {
    index: false,
    type: [String],
    default: [],
    description: "Offres associées",
  },

  active_delegue: {
    index: true,
    type: Boolean,
    default: false,
    description: "Délégation autorisée",
  },
  email_delegue: {
    index: true,
    type: String,
    default: null,
    description: "Email du délégué",
    validate: {
      validator: (value) => !value || emailFormat.test(value),
      message: (props) => `${props.value} n'est pas une adresse courriel valide.`,
    },
  },
  statut_creation: {
    index: true,
    type: String,
    default: null,
    description: "Statut de création du compte",
  },
  statut_diffusion: {
    index: true,
    type: String,
    default: null,
    description: "Statut de diffusion des candidatures",
  },
  statut_diffusion_generique: {
    index: true,
    type: String,
    default: null,
    description: "Statut générique",
  },
  nombre_voeux: {
    index: true,
    type: Number,
    default: 0,
    description: "Nombre de vœux",
  },
  last_import_voeux: {
    index: true,
    type: Date,
    default: null,
    description: "Date du dernier import de vœux",
  },
  telechargement: {
    index: true,
    type: Boolean,
    default: false,
    description: "Téléchargement",
  },
  telechargement_date: {
    index: true,
    type: Date,
    default: null,
    description: "Date du dernier téléchargement",
  },
  nombre_voeux_telecharges: {
    index: true,
    type: Number,
    default: 0,
    description: "Vœux téléchargés par le destinataire principal",
  },
  nombre_voeux_a_retelecharges: {
    index: true,
    type: Number,
    default: 0,
    description: "Vœux à télécharger pour mise à jour",
  },
  nombre_voeux_jamais_telecharges: {
    index: true,
    type: Number,
    default: 0,
    description: "Vœux jamais téléchargés par le destinataire principal",
  },
  admin_intervention: {
    index: true,
    type: String,
    default: null,
    description: "Intervention par un administrateur",
  },
};

module.exports = candidatureRelationSchema;
