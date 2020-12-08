const rcoEtablissementSchema = {
  id_mna_etablissement: {
    type: String,
    default: null,
    description: "Id de l'établissement MNA créé",
  },
  id_rco_formation: {
    type: String,
    default: null,
    description: "Id de la formation RCO",
  },
  type: {
    type: String,
    default: null,
    description: "Type de l'établissement",
  },
  rco_siret: {
    type: String,
    default: null,
    description: "Siret de l'établissement RCO",
  },
  rco_uai: {
    type: String,
    default: null,
    description: "UAI de l'établissement RCO",
  },
  rco_adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement RCO",
  },
  rco_code_postal: {
    type: String,
    default: null,
    description: "Cde postal de l'établissement MNA créé",
  },
  rco_code_commune_insee: {
    type: String,
    default: null,
    description: "Code commune insee de l'établissement RCO",
  },
  rco_geo_coordonnees: {
    type: String,
    implicit_type: "geo_point",
    description: "Latitude et longitude de l'établissement RCO",
  },
};

module.exports = rcoEtablissementSchema;
