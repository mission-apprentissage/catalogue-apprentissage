import { _put } from "../httpClient";
import { buildUpdatesHistory } from "../utils/historyUtils";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export const updateFormation = async ({ formation, body, user }) => {
  return await _put(`${endpointNewFront}/entity/formations2021/${formation._id}`, {
    num_academie: formation.num_academie,
    ...body,
    last_update_who: user.email,
    last_update_at: Date.now(),
    updates_history: buildUpdatesHistory(formation, { ...body, last_update_who: user.email }, Object.keys(body)),
  });
};

export const updateReconciliationAffelnet = async ({ formation, shouldRemoveAfReconciliation, user }) => {
  return await _put(`${endpointNewFront}/affelnet/reconciliation`, {
    uai_formation: formation.uai_formation,
    uai_gestionnaire: formation.etablissement_gestionnaire_uai,
    uai_formateur: formation.etablissement_formateur_uai,
    cfd: formation.cfd,
    email: shouldRemoveAfReconciliation ? user.email : null,
  });
};

export const updateReconciliationParcoursup = async ({ formation, shouldRemovePsReconciliation, user }) => {
  return await _put(`${endpointNewFront}/parcoursup/reconciliation`, {
    uai_gestionnaire: formation.etablissement_gestionnaire_uai,
    uai_affilie: formation.etablissement_formateur_uai,
    cfd: formation.cfd,
    email: shouldRemovePsReconciliation ? user.email : null,
  });
};
