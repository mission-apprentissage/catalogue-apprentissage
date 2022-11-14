import { _delete, _get, _post, _put } from "../httpClient";
import { useQuery } from "react-query";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

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
  return await _post(`${CATALOGUE_API}/entity/perimetre/regle`, {
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
  return await _put(`${CATALOGUE_API}/entity/perimetre/regle/${_id}`, {
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
  return await _delete(`${CATALOGUE_API}/entity/perimetre/regle/${_id}`);
};

export const getIntegrationCount = async ({ plateforme, niveau, academie }) => {
  try {
    const countUrl = `${CATALOGUE_API}/v1/entity/perimetre/regles/integration/count`;
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

export const useIntegrationCount = ({ plateforme, academie }) => {
  return useQuery(["integration", plateforme, academie], () => getIntegrationCount({ plateforme, academie }), {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const getRules = async ({ plateforme }) => {
  const reglesUrl = `${CATALOGUE_API}/v1/entity/perimetre/regles`;
  return await _get(`${reglesUrl}?plateforme=${plateforme}`, false);
};

export const getNiveaux = async ({ plateforme }) => {
  const niveauxURL = `${CATALOGUE_API}/v1/entity/perimetre/niveau?plateforme=${plateforme}`;
  return await _get(niveauxURL, false);
};

export const useNiveaux = ({ plateforme }) => {
  return useQuery(`niveaux-${plateforme}`, () => getNiveaux({ plateforme }), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const getCount = async ({ plateforme, niveau, diplome, regle_complementaire, academie, duree, annee }) => {
  const countUrl = `${CATALOGUE_API}/v1/entity/perimetre/regle/count`;
  const params = new URLSearchParams({
    plateforme,
    niveau,
    diplome,
    ...(regle_complementaire && { regle_complementaire }),
    ...(academie && { num_academie: academie }),
    ...(duree && { duree }),
    ...(annee && { annee }),
  });
  return await _get(`${countUrl}?${params}`, false);
};
