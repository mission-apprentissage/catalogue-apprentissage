import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import useAuth from "../../hooks/useAuth";
import { hasAccessTo } from "../../utils/rolesUtils";

export const StatutHistoryBlock = ({ formation }) => {
  const [user] = useAuth();

  if (!formation) {
    return <></>;
  }

  const affelnet_history = [...formation.affelnet_statut_history].reduce((acc, curr, index, arr) => {
    if (index === 1) {
      return [...(curr.affelnet_statut !== acc.affelnet_statut ? [curr] : []), acc];
    }

    return [...(curr.affelnet_statut !== arr[index - 1]?.affelnet_statut ? [curr] : []), ...acc];
  });

  const parcoursup_history = [...formation.parcoursup_statut_history].reduce((acc, curr, index, arr) => {
    if (index === 1) {
      return [...(curr.parcoursup_statut !== acc.parcoursup_statut ? [curr] : []), acc];
    }
    return [...(curr.parcoursup_statut !== arr[index - 1]?.parcoursup_statut ? [curr] : []), ...acc];
  });

  return (
    (hasAccessTo(user, "page_formation/voir_status_publication_ps") ||
      hasAccessTo(user, "page_formation/voir_status_publication_aff")) && (
      <>
        <Heading textStyle="h4" color="grey.800" mb={4}>
          Historique des statuts
        </Heading>

        {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
          <>
            <Text textStyle="rf-text" color="grey.700" fontWeight="700" my={3}>
              Affelnet
            </Text>
            <Box ml={4}>
              <ul>
                {affelnet_history.map((value) => {
                  return (
                    <li key={value.date}>
                      <span>{new Date(value.date).toLocaleDateString()}</span> : {value.affelnet_statut}
                      {value.last_update_who && " - "}
                      {value.last_update_who}
                    </li>
                  );
                })}
              </ul>
            </Box>
          </>
        )}

        {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
          <>
            <Text textStyle="rf-text" color="grey.700" fontWeight="700" my={3}>
              Parcoursup
            </Text>
            <Box ml={4}>
              <ul>
                {parcoursup_history.map((value) => {
                  return (
                    <li key={value.date}>
                      <span>{new Date(value.date).toLocaleDateString()}</span> : {value.parcoursup_statut}
                      {value.last_update_who && " - "}
                      {value.last_update_who}
                    </li>
                  );
                })}
              </ul>
            </Box>
          </>
        )}
      </>
    )
  );
};
