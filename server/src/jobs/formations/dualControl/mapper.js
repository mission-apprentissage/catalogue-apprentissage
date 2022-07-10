// @ts-check

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */

/**
 *  @type {{ [key: string]:  keyof Formation | 0 }}
 */
const KEYS_MAP = {
  // here list the keys you want to rename to match model/schema/formation
  // e.g: below if we receive "code_diplome" and want to rename to "cfd"
  // code_diplome: "cfd",
  intitule_formation: "intitule_rco",
  intitule_long_bcn: "intitule_long",
  niveau_formation_diplome: "niveau",

  etablissement_lieu_formation_adresse: "lieu_formation_adresse",
  etablissement_lieu_formation_code_postal: "code_postal",
  etablissement_lieu_formation_geo_coordonnees: "lieu_formation_geo_coordonnees",
  etablissement_lieu_formation_code_insee: "code_commune_insee",
  etablissement_lieu_formation_siret: "lieu_formation_siret",
  etablissement_lieu_formation_adresse_computed: "lieu_formation_adresse_computed",
  etablissement_lieu_formation_geo_coordonnees_computed: "lieu_formation_geo_coordonnees_computed",

  etablissement_gestionnaire_code_insee: "etablissement_gestionnaire_code_commune_insee",
  etablissement_formateur_code_insee: "etablissement_formateur_code_commune_insee",
  etablissement_formateur_geo_coordonnees: "geo_coordonnees_etablissement_formateur",
  catalogue_general: "catalogue_published",

  // To exclude keys, map it to 0
  // TODO useless data received ? -->  ask RCO
  rco_cfd: 0,
  rco_cfd_traite: 0,
  rco_cfd_verifie: 0,
  "RCO-CP_CI_OG": 0,
  "RCO-CP_CI_OF": 0,
  rncp_id_interne: 0,
  rncp_valide: 0,
  titre_rncp: 0,
  habilitation_rncp: 0,
  // TODO error from RCO, mixing fields with lieu_formation ? -->  ask RCO
  etablissement_formateur_adresse_computed: 0,
  etablissement_formateur_geo_coordonnees_computed: 0,
};

const mapper = (obj, keysMap = KEYS_MAP) => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => keysMap[key] !== 0)
      .map(([key, value]) => {
        // if (key === "cfd_date_fermeture") console.log(value);

        return [keysMap[key] ?? key, value];
      })
  );
};

module.exports = { mapper };
