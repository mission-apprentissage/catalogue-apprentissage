import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import useAuth from "../../hooks/useAuth";
import { hasAccessTo } from "../../utils/rolesUtils";

/**
 * Retire les valeurs successives identiques dans un tableau
 *
 * @param {*} array the array to reduce
 * @param {*} check a function to check equality between two successive values in the array
 * @returns An array containing only the last items
 */
const reduceSameValues = (array, check) => {
  return [...array].reduce((acc, curr, index, arr) => {
    if (index === 1) {
      return [...(check(curr, acc) ? [curr] : []), acc];
    }

    return [...(check(curr, arr[index - 1]) ? [curr] : []), ...acc];
  });
};

const isUpdatedToStatus = (value, status) => {
  return [value.to.affelnet_statut, value.to.parcoursup_statut].includes(status);
};

/**
 *  Display an history of statuses
 *
 * @param {object} config
 * @param {object} config.formation La formation dont on souhaite afficher l'historique des changements de statuts
 */
export const StatutHistoryBlock = ({ formation }) => {
  const [user] = useAuth();

  if (!formation) {
    return <></>;
  }

  const updates_history = formation.updates_history ?? [];

  const publication_history = updates_history
    .filter(
      (value) =>
        isUpdatedToStatus(value, "publié") ||
        isUpdatedToStatus(value, "en attente de publication") ||
        isUpdatedToStatus(value, "non publié")
    )
    ?.map((value) => ({
      status: (
        <>
          {isUpdatedToStatus(value, "publié") && "Publication forcée ou rapprochée"}
          {isUpdatedToStatus(value, "en attente de publication") && "Publication demandée"}
          {isUpdatedToStatus(value, "non publié") && "Publication retirée"}
        </>
      ),
      user: value.to.last_update_who,
      date: new Date(value.updated_at),
    }));

  const other_history = updates_history
    .filter(
      (value) =>
        !(
          isUpdatedToStatus(value, "publié") ||
          isUpdatedToStatus(value, "en attente de publication") ||
          isUpdatedToStatus(value, "non publié")
        )
    )
    ?.map((value) => ({
      status: <>Modification apportée</>,
      user: value.to.last_update_who,
      date: new Date(value.updated_at),
    }));

  const affelnet_history = reduceSameValues(
    formation.affelnet_statut_history,
    (previous, current) => current.affelnet_statut !== previous?.affelnet_statut
  ).map((value) => ({
    status: <>Affelnet - {value.affelnet_statut}</>,
    date: new Date(value.date),
  }));
  const parcoursup_history = reduceSameValues(
    formation.parcoursup_statut_history,
    (previous, current) => current.parcoursup_statut !== previous?.parcoursup_statut
  ).map((value) => ({
    status: <>Parcoursup - {value.parcoursup_statut}</>,
    date: new Date(value.date),
  }));

  const history = [
    ...(hasAccessTo(user, "page_formation/gestion_publication") ? publication_history : []),
    ...(hasAccessTo(user, "page_formation/modifier_informations") ? other_history : []),
    ...(hasAccessTo(user, "page_formation/voir_status_publication_aff") ? affelnet_history : []),
    ...(hasAccessTo(user, "page_formation/voir_status_publication_ps") ? parcoursup_history : []),
  ].sort((a, b) => b.date - a.date);

  return (
    (hasAccessTo(user, "page_formation/gestion_publication") ||
      hasAccessTo(user, "page_formation/modifier_informations") ||
      hasAccessTo(user, "page_formation/voir_status_publication_ps") ||
      hasAccessTo(user, "page_formation/voir_status_publication_aff")) && (
      <>
        <Heading textStyle="h4" color="grey.800" mb={4}>
          Historique des modifications
        </Heading>

        <Box ml={4}>
          <ul>
            {history.map((value, index) => {
              return (
                <li key={index}>
                  {value.status}
                  <Text display={"inline"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                    {value.user && ` par ${value.user}`} le <span>{value.date.toLocaleDateString("fr-FR")}</span>
                  </Text>
                </li>
              );
            })}
          </ul>
        </Box>
      </>
    )
  );
};
