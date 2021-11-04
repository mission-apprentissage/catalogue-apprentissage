const { Formation } = require("../../../common/model");

/**
 * For a given RcoFormation, try to find some Formation published in catalogue which includes ids_action
 */
const findPreviousFormations = async ({ id_formation, id_certifinfo, id_action }) => {
  const ids_action = extractIdsAction(id_action);
  const ids_formation = id_formation.split("##");

  const previousFormations = await Formation.find({
    cle_ministere_educatif: null, // no key means it is a legacy formation
    published: true,
    id_formation: { $in: ids_formation },
    id_certifinfo,
  }).lean();

  return previousFormations.filter((prevFormation) => {
    return (
      prevFormation?.ids_action?.length > 0 &&
      ids_action.some((actions) => prevFormation.ids_action.every((id_action) => actions.includes(id_action)))
    );
  });
};

const copyAffelnetFields = (oldFormation, newFormation) => {
  newFormation.affelnet_statut = oldFormation.affelnet_statut;
  newFormation.affelnet_statut_history = oldFormation.affelnet_statut_history;
  newFormation.affelnet_infos_offre = oldFormation.affelnet_infos_offre;
  newFormation.affelnet_code_nature = oldFormation.affelnet_code_nature;
  newFormation.affelnet_secteur = oldFormation.affelnet_secteur;
  newFormation.affelnet_raison_depublication = oldFormation.affelnet_raison_depublication;
  return newFormation;
};

const copyParcoursupFields = (oldFormation, newFormation) => {
  newFormation.parcoursup_statut = oldFormation.parcoursup_statut;
  newFormation.parcoursup_statut_history = oldFormation.parcoursup_statut_history;
  newFormation.parcoursup_raison_depublication = oldFormation.parcoursup_raison_depublication;
  return newFormation;
};

const extractIdsAction = (id_action) => {
  const ids_action_arr = id_action.split("##");
  return ids_action_arr.map((actions) => actions.split("|"));
};

const extractFlatIdsAction = (id_action) => {
  return extractIdsAction(id_action).flat();
};

module.exports = { findPreviousFormations, copyAffelnetFields, copyParcoursupFields, extractFlatIdsAction };
