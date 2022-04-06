// here list the keys you want to rename to match model/schema/formation
const KEYS_MAP = {
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

  // To exclude keys, map it to 0
  // FIXME RCO sends a data that is impossible to parse -->  ask RCO
  bcn_mefs_10: 0,

  // TODO useless data received ? -->  ask RCO
  rco_cfd: 0,
  rco_cfd_traite: 0,
  rco_cfd_verifie: 0,
};

const mapper = (obj, keysMap = KEYS_MAP) => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => keysMap[key] !== 0)
      .map(([key, value]) => {
        return [keysMap[key] ?? key, value];
      })
  );
};

module.exports = { mapper };
