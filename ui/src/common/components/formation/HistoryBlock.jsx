import React from "react";
import { Box, Button, Heading, Text, Collapse, useDisclosure } from "@chakra-ui/react";
import { ArrowDownLine } from "../../../theme/components/icons/";
import useAuth from "../../hooks/useAuth";
import { hasAccessTo } from "../../utils/rolesUtils";

// /**
//  * Retire les valeurs successives identiques dans un tableau
//  *
//  * @param {any[]} array the array to reduce
//  * @param {(curr, acc) => boolean)} check a function to check equality between two successive values in the array
//  * @returns {any[]} An array containing only the last items
//  */
// const reduceSameValues = (array, check) => {
//   if (array.length === 1) {
//     return [...array];
//   }
//   return [...array].reduce((acc, curr, index, arr) => {
//     if (index === 1) {
//       return [...(check(curr, acc) ? [curr] : []), acc];
//     }

//     return [...(check(curr, arr[index - 1]) ? [curr] : []), ...acc];
//   });
// };

/**
 *  Display an history of statuses
 *
 * @param {object} config
 * @param {object} config.formation La formation dont on souhaite afficher l'historique des changements de statuts
 */
export const HistoryBlock = ({ formation, limit = 5 }) => {
  const [user] = useAuth();
  const { isOpen, onToggle } = useDisclosure(false);

  if (!formation) {
    return <></>;
  }

  const updates_history = formation.updates_history ?? [];

  const other_history = updates_history?.map((value) => ({
    status: <>Modification apportée</>,
    user: value.to.last_update_who,
    date: new Date(value.updated_at),
  }));

  const history = [...(hasAccessTo(user, "page_formation/modifier_informations") ? other_history : [])].sort(
    (a, b) => b.date - a.date
  );

  return (
    hasAccessTo(user, "page_formation/modifier_informations") && (
      <>
        <Heading textStyle="h4" color="grey.800" mb={4}>
          Historique des modifications
        </Heading>

        <Box ml={4}>
          <ul>
            {history.slice(0, limit - 1)?.map((value, index) => {
              return (
                <li key={index} style={{ marginBottom: "8px" }}>
                  {value.status}
                  <Text display={"inline"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                    {value.user && ` par ${value.user}`} le <span>{value.date.toLocaleDateString("fr-FR")}</span>
                  </Text>
                </li>
              );
            })}
          </ul>

          {history.length > limit && (
            <>
              <Button onClick={onToggle} variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                {isOpen ? "Voir moins" : "Voir plus"}{" "}
                <ArrowDownLine boxSize={5} transform={isOpen ? "rotate(180deg)" : "none"} />
              </Button>
              <Collapse in={isOpen} animateOpacity unmountOnExit={true} style={{ overflow: "unset" }}>
                <ul>
                  {history.slice(limit)?.map((value, index) => {
                    return (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {value.status}
                        <Text display={"inline"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                          {value.user && ` par ${value.user}`} le <span>{value.date.toLocaleDateString("fr-FR")}</span>
                        </Text>
                      </li>
                    );
                  })}
                </ul>
              </Collapse>
            </>
          )}
        </Box>
      </>
    )
  );
};
