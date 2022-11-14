import { _put, _post } from "../httpClient";
import { buildUpdatesHistory } from "../utils/historyUtils";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const updateFormation = async ({ formation, body, user }) => {
  return await _put(`${CATALOGUE_API}/entity/formations/${formation._id}`, {
    num_academie: formation.num_academie,
    ...body,
    last_update_who: user.email,
    last_update_at: Date.now(),
    updates_history: buildUpdatesHistory(formation, { ...body, last_update_who: user.email }, Object.keys(body)),
  });
};

export const updateReconciliationParcoursup = async ({ formation, shouldRemovePsReconciliation, user }) => {
  return await _put(`${CATALOGUE_API}/parcoursup/reconciliation`, {
    uai_gestionnaire: formation.etablissement_gestionnaire_uai,
    uai_affilie: formation.etablissement_formateur_uai,
    cfd: formation.cfd,
    email: shouldRemovePsReconciliation ? user.email : null,
  });
};

export const handleRejection = async ({ id }) => {
  return await _post(`${CATALOGUE_API}/entity/formations/${id}/handle-rejection`, {});
};

export const unhandleRejection = async ({ id }) => {
  return await _post(`${CATALOGUE_API}/entity/formations/${id}/unhandle-rejection`, {});
};
