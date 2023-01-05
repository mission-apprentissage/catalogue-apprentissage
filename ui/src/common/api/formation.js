import { _put, _post } from "../httpClient";
import { buildUpdatesHistory } from "../utils/historyUtils";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const updateFormation = async ({ formation, body, user }) => {
  const date = new Date();

  return await _put(`${CATALOGUE_API}/entity/formations/${formation._id}`, {
    num_academie: formation.num_academie,
    ...body,
    last_update_who: user.email,
    last_update_at: Date.now(),
    $push: {
      updates_history: buildUpdatesHistory(
        formation,
        { ...body, last_update_who: user.email },
        Object.keys(body),
        date
      ),
      ...(body.parcoursup_statut
        ? {
            parcoursup_statut_history: {
              parcoursup_statut: body.parcoursup_statut,
              date: new Date(date.getTime() + 1000),
            },
          }
        : {}),
    },
  });
};

export const handleRejection = async ({ id }) => {
  return await _post(`${CATALOGUE_API}/entity/formations/${id}/handle-rejection`, {});
};

export const unhandleRejection = async ({ id }) => {
  return await _post(`${CATALOGUE_API}/entity/formations/${id}/unhandle-rejection`, {});
};
