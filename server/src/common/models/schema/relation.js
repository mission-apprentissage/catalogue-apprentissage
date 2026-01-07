const { default: mongoose } = require("mongoose");
const { emailFormat, siretFormat } = require("../format");

const updateHistorySchema = new mongoose.Schema(
  {
    from: {
      type: Object,
      default: {},
      description: "Valeurs avant mise à jour",
    },
    to: {
      type: Object,
      default: {},
      description: "Valeurs après mise à jour",
    },
  },
  {
    _id: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const RelationEditedFieldsSchema = new mongoose.Schema({
  email_responsable: {
    type: String,
    index: true,
    default: null,
    description: "Adresse courriel du directeur de l'établissement responsable éditée",
    validate: {
      validator: (value) => !value || emailFormat.test(value),
      message: (props) => `${props.value} n'est pas une adresse courriel valide.`,
    },
  },
});

const relationSchema = {
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

  email_responsable: {
    type: String,
    index: true,
    default: null,
    description: "Adresse courriel du directeur de l'établissement responsable éditée",
    validate: {
      validator: (value) => !value || emailFormat.test(value),
      message: (props) => `${props.value} n'est pas une adresse courriel valide.`,
    },
  },

  editedFields: {
    type: RelationEditedFieldsSchema,
    default: null,
    description: "Champs édités par un utilisateur",
  },

  updates_history: {
    type: [updateHistorySchema],
    default: [],
    description: "Historique des mises à jours",
  },

  last_update_at: {
    type: Date,
    default: Date.now,
    description: "Date de dernières mise à jour",
  },
  last_update_who: {
    type: String,
    default: null,
    description: "Qui a réalisé la dernière modification",
  },
};

module.exports = relationSchema;
