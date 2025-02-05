const usersSchema = {
  username: {
    type: String,
    default: null,
    description: "Le nom de l'utilisateur",
    unique: true,
  },
  password: {
    type: String,
    default: null,
    description: "Le mot de passe hashé",
  },
  isAdmin: {
    type: Boolean,
    default: false,
    description: "true si l'utilisateur est administrateur",
  },
  tag: {
    type: String,
    default: null,
    description: "Champ libre: Tag",
  },
  fonction: {
    type: String,
    default: null,
    description: "Champ libre: Fonction",
  },
  // tags: {
  //   type: [String],
  //   default: [],
  //   description: "Liste de tags libre",
  // },
  email: {
    type: String,
    default: null,
    description: "Email",
  },
  academie: {
    type: String,
    default: null,
    description: "Academie coma separated",
  },
  account_status: {
    type: String,
    default: "FORCE_RESET_PASSWORD",
    description: "Account status",
  },
  roles: {
    type: [String],
    default: [],
    description: "Roles de l'utilisateur",
  },
  acl: {
    type: [String],
    default: null,
    description: "Access control level array",
  },
  last_connection: {
    type: Date,
    default: null,
    description: "Date de dernière connexion",
  },
  connection_history: {
    type: [Date],
    default: null,
    description: "Historique des dates de connexion",
  },
};
module.exports = usersSchema;
