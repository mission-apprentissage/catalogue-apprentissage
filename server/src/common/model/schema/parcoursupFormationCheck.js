const parcoursupFormationCheckSchema = {
  uai_ges: {
    type: String,
    default: null,
    description: "UAI_GES",
  },
  uai_composante: {
    type: String,
    default: null,
    description: "UAI_COMPOSANTE",
  },
  lib_composante: {
    type: String,
    default: null,
    description: "LIB_COMPOSANTE",
  },
  lib_ins: {
    type: String,
    default: null,
    description: "LIB_INS",
  },
  uai_aff: {
    type: String,
    default: null,
    description: "UAI_AFF",
  },
  lib_aff: {
    type: String,
    default: null,
    description: "LIB_AFF",
  },
  codecommune: {
    type: String,
    default: null,
    description: "CODECOMMUNE",
  },
  libcommune: {
    type: String,
    default: null,
    description: "LIBCOMMUNE",
  },
  codepostal: {
    type: String,
    default: null,
    description: "CODEPOSTAL",
  },
  académie: {
    type: String,
    default: null,
    description: "ACADÉMIE",
  },
  ministeretutelle: {
    type: String,
    default: null,
    description: "MINISTERETUTELLE",
  },
  libministere: {
    type: String,
    default: null,
    description: "LIBMINISTERE",
  },
  typeeta: {
    type: String,
    default: null,
    description: "TYPEETA",
  },
  codeformation: {
    type: String,
    default: null,
    description: "CODEFORMATION",
  },
  libformation: {
    type: String,
    default: null,
    description: "LIBFORMATION",
  },
  codespécialité: {
    type: String,
    default: null,
    description: "CODESPÉCIALITÉ",
  },
  libspécialité: {
    type: String,
    default: null,
    description: "LIBSPÉCIALITÉ",
  },
  codespéformationinitiale: {
    type: String,
    default: null,
    description: "CODESPÉFORMATIONINITIALE",
  },
  codemef: {
    type: String,
    default: null,
    description: "CODEMEF",
  },
  uai_insert: {
    type: String,
    default: null,
    description: "UAI_INSERT",
  },
  uai_cerfa: {
    type: String,
    default: null,
    description: "UAI_CERFA",
  },
  siret_cerfa: {
    type: String,
    default: null,
    description: "SIRET_CERFA",
  },
  uai_map: {
    type: String,
    default: null,
    description: "UAI_MAP",
  },
  siret_map: {
    type: String,
    default: null,
    description: "SIRET_MAP",
  },
  codediplome_map: {
    type: String,
    default: null,
    description: "CODEDIPLOME_MAP",
  },
  codeformationinscription: {
    type: String,
    default: null,
    description: "CODEFORMATIONINSCRIPTION (id_parcoursup)",
  },
  codeformationaccueil: {
    type: String,
    default: null,
    description: "CODEFORMATIONACCUEIL",
  },
  latitude: {
    type: String,
    default: null,
    description: "LATITUDE",
  },
  longitude: {
    type: String,
    default: null,
    description: "LONGITUDE",
  },
  complementadresse: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE",
  },
  complementadresse1: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE1",
  },
  complementadresse2: {
    type: String,
    default: null,
    description: "COMPLEMENTADRESSE2",
  },
  complementcodepostal: {
    type: String,
    default: null,
    description: "COMPLEMENTCODEPOSTAL",
  },
  complementcommune: {
    type: String,
    default: null,
    description: "COMPLEMENTCOMMUNE",
  },
  complementcedex: {
    type: String,
    default: null,
    description: "COMPLEMENTCEDEX",
  },
  premiereligneadresseetab: {
    type: String,
    default: null,
    description: "PREMIERELIGNEADRESSEETAB",
  },
  secondeligneadresseetab: {
    type: String,
    default: null,
    description: "SECONDELIGNEADRESSEETAB",
  },
  id_rco: {
    type: String,
    default: null,
    description: "ID_RCO (cle_ministere_educatif)",
  },
  flag_certif: {
    type: String,
    default: null,
    description: "FLAG_CERTIF",
  },
};

module.exports = parcoursupFormationCheckSchema;
