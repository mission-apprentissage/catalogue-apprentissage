const { Formation, PsFormation } = require("../../../../common/model");
const { asyncForEach } = require("../../../../common/utils/asyncUtils");

/**
 * For a given RcoFormation, try to find some Formation published in catalogue which includes ids_action
 */
const findPreviousFormations = async ({
  id_formation,
  id_certifinfo,
  id_action,
  cle_ministere_educatif,
  etablissement_lieu_formation_code_insee,
}) => {
  if (cle_ministere_educatif?.includes("-")) {
    // here merge multi-site / mono-site : check cle_ministere_educatif + code_insee
    const rootKey = cle_ministere_educatif?.split("-")[0];

    const previousFormation = await Formation.findOne({
      cle_ministere_educatif: rootKey,
      code_commune_insee: etablissement_lieu_formation_code_insee,
      published: true,
    }).lean();

    if (previousFormation) {
      return [previousFormation];
    }
  }

  const ids_action = extractFlatIdsAction(id_action);
  const ids_formation = id_formation.split("##");

  const previousFormations = await Formation.find({
    $or: [
      { cle_ministere_educatif: null }, // no key means it is a legacy formation
      { annee: "X" }, // X means it is not validated yet
    ],
    published: true,
    id_formation: { $in: ids_formation },
    id_certifinfo,
  }).lean();

  return previousFormations.filter((prevFormation) => {
    return (
      prevFormation?.ids_action?.length > 0 &&
      prevFormation.ids_action.every((id_action) => ids_action.includes(id_action))
    );
  });
};

const copyEditedFields = (oldFormation, newFormation) => {
  newFormation.editedFields = oldFormation.editedFields;
  return newFormation;
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

const copyRapprochementFields = (oldFormation, newFormation) => {
  newFormation.parcoursup_id = oldFormation.parcoursup_id;
  return newFormation;
};

const updateRapprochement = async (oldFormation, newFormation) => {
  const psFormations = await PsFormation.find({
    "matching_mna_formation.cle_ministere_educatif": oldFormation.cle_ministere_educatif,
  }).lean();

  await asyncForEach(psFormations, async (psFormation) => {
    let matchs = psFormation.matching_mna_formation?.map((match) => {
      let _id = match._id;
      let cle_ministere_educatif = match.cle_ministere_educatif;
      if (_id?.toString() === oldFormation._id?.toString()) {
        _id = newFormation._id;
        cle_ministere_educatif = newFormation.cle_ministere_educatif;
      }
      return { ...match, _id, cle_ministere_educatif };
    });

    // keep unique match
    matchs = matchs.reduce((acc, match) => {
      if (acc.some((m) => m._id.toString() === match._id.toString())) {
        return acc;
      }
      return [...acc, match];
    }, []);

    const validatedIds = psFormation.validated_formation_ids?.map((id) => {
      if (id === oldFormation._id?.toString()) {
        return newFormation._id?.toString();
      }
      return id;
    });

    await PsFormation.findOneAndUpdate(
      { _id: psFormation._id },
      {
        matching_mna_formation: matchs,
        matching_mna_parcoursup_statuts: matchs?.map(({ parcoursup_statut }) => parcoursup_statut),
        validated_formation_ids: validatedIds,
      }
    );
  });

  return newFormation;
};

const extractIdsAction = (id_action) => {
  const ids_action_arr = id_action.split("##");
  return ids_action_arr.map((actions) => actions.split("|"));
};

const extractFlatIdsAction = (id_action) => {
  return extractIdsAction(id_action).flat();
};

module.exports = {
  findPreviousFormations,
  copyAffelnetFields,
  copyParcoursupFields,
  extractFlatIdsAction,
  copyRapprochementFields,
  updateRapprochement,
  copyEditedFields,
};
