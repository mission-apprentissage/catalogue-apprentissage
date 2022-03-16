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

/**
 *  Display an history for one status
 *
 * @param {{
 * history: {date: string, last_update_who?: string, [statusField: string]: string }
 * title: string
 * statusField: string
 * }}
 * @returns
 */
const StatutHistorySubBlock = ({ history, title, statusField }) => {
  return (
    <>
      <Text textStyle="rf-text" color="grey.700" fontWeight="700" my={3}>
        {title}
      </Text>
      <Box ml={4}>
        <ul>
          {history.map((value) => {
            return (
              <li key={value.date}>
                <span>{new Date(value.date).toLocaleDateString()}</span> : {value[statusField]}
                {value.last_update_who && " - "}
                {value.last_update_who}
              </li>
            );
          })}
        </ul>
      </Box>
    </>
  );
};

/**
 *  Display an history of statuses
 *
 * @param {{
 * formation: Formation
 * }}
 * @returns
 */
export const StatutHistoryBlock = ({ formation }) => {
  const [user] = useAuth();

  if (!formation) {
    return <></>;
  }

  const affelnet_history = reduceSameValues(
    formation.affelnet_statut_history,
    (previous, current) => current.affelnet_statut !== previous?.affelnet_statut
  );
  const parcoursup_history = reduceSameValues(
    formation.parcoursup_statut_history,
    (previous, current) => current.parcoursup_statut !== previous?.parcoursup_statut
  );

  return (
    (hasAccessTo(user, "page_formation/voir_status_publication_ps") ||
      hasAccessTo(user, "page_formation/voir_status_publication_aff")) && (
      <>
        <Heading textStyle="h4" color="grey.800" mb={4}>
          Historique des statuts
        </Heading>

        {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
          <StatutHistorySubBlock title="Affelnet" history={affelnet_history} statusField="affelnet_statut" />
        )}

        {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
          <StatutHistorySubBlock title="Parcoursup" history={parcoursup_history} statusField="parcoursup_statut" />
        )}
      </>
    )
  );
};
