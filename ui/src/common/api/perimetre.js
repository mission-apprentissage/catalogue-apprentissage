import { _delete, _get, _post, _put } from "../httpClient";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export const createRule = async ({
  plateforme,
  niveau,
  diplome,
  statut,
  regle_complementaire,
  regle_complementaire_query,
  nom_regle_complementaire,
  condition_integration,
  duree,
  annee,
  statut_academies,
  num_academie,
}) => {
  return await _post(`${endpointNewFront}/entity/perimetre/regle`, {
    plateforme,
    niveau,
    diplome,
    statut,
    regle_complementaire,
    regle_complementaire_query,
    nom_regle_complementaire,
    condition_integration,
    duree,
    annee,
    statut_academies,
    num_academie,
  });
};

export const updateRule = async ({
  _id,
  plateforme,
  niveau,
  diplome,
  statut,
  regle_complementaire,
  regle_complementaire_query,
  nom_regle_complementaire,
  condition_integration,
  duree,
  annee,
  statut_academies,
}) => {
  return await _put(`${endpointNewFront}/entity/perimetre/regle/${_id}`, {
    plateforme,
    niveau,
    diplome,
    statut,
    regle_complementaire,
    regle_complementaire_query,
    nom_regle_complementaire,
    condition_integration,
    duree,
    annee,
    statut_academies,
  });
};

export const deleteRule = async ({ _id }) => {
  return await _delete(`${endpointNewFront}/entity/perimetre/regle/${_id}`);
};

export const getIntegrationCount = async ({ plateforme, niveau, academie }) => {
  try {
    const countUrl = `${endpointNewFront}/v1/entity/perimetre/regles/integration/count`;
    const params = new URLSearchParams({
      plateforme: plateforme,
      num_academie: academie,
      ...(niveau ? { niveau } : {}),
    });
    return await _get(`${countUrl}?${params}`, false);
  } catch (e) {
    console.error(e);
    return { nbRules: 0, nbFormations: 0 };
  }
};

export const getRules = async ({ plateforme }) => {
  const reglesUrl = `${endpointNewFront}/v1/entity/perimetre/regles`;
  return await _get(`${reglesUrl}?plateforme=${plateforme}`, false);
};

export const getNiveaux = async () => {
  const niveauxURL = `${endpointNewFront}/v1/entity/perimetre/niveau`;
  return await _get(niveauxURL, false);
};
