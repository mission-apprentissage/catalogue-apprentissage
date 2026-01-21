import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Link,
  ListItem,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowRightDownLine } from "../../../theme/components/icons";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import { ACADEMIES } from "../../../constants/academies";
import { InfoTooltip } from "../../../common/components/InfoTooltip";
import { isStatusChangeEnabled } from "../../../common/utils/rulesUtils";
import { getCount } from "../../../common/api/perimetre";
import { ActionsSelect } from "./ActionsSelect";
import { STATUS_LIST, StatusSelect } from "./StatusSelect";
import { ANNEES } from "../../../constants/annees";
import { DateContext } from "../../../DateContext";
import { sortDescending } from "../../../common/utils/historyUtils";
import { PLATEFORME } from "../../../constants/plateforme";
import { AFFELNET_STATUS } from "../../../constants/status";
import { hasAccessTo } from "../../../common/utils/rolesUtils";
import useAuth from "../../../common/hooks/useAuth";

export const Line = ({
  showIcon,
  label,
  count,
  plateforme,
  niveau,
  diplome,
  shouldFetchCount,
  onShowRule,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onUpdateStatutAcademieRule,
  onDeleteStatutAcademieRule,
  rule = {},
  academie,
}) => {
  const [auth] = useAuth();

  const [lineCount, setLineCount] = useState(count);
  const [lineLink, setLineLink] = useState(null);
  const [nextStatus, setNextStatus] = useState(null);
  const { sessionStartDate, sessionEndDate } = useContext(DateContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const {
    statut: status,
    _id: idRule,
    nom_regle_complementaire,
    regle_complementaire,
    regle_complementaire_query,
    condition_integration,
    statut_academies,
    num_academie,
    duree,
    annee,
  } = rule;

  let editAcl;

  switch (plateforme) {
    case PLATEFORME.AFFELNET:
      editAcl = "page_perimetre/affelnet-edit-rule";

      break;
    case PLATEFORME.PARCOURSUP:
      editAcl = "page_perimetre/parcoursup-edit-rule";
      break;
    default:
      break;
  }

  const isConditionChangeDisabled = !hasAccessTo(auth, editAcl) || !!academie;

  const isStatusChangeDisabled =
    !hasAccessTo(auth, editAcl) ||
    !isStatusChangeEnabled({
      plateforme,
      academie,
      num_academie,
      status,
      condition_integration,
    });

  const getFirstAllowedStatut = (condition) => {
    return STATUS_LIST[condition][plateforme][0];
  };

  const currentStatus = statut_academies?.[academie] ?? status;
  const academieLabel = Object.values(ACADEMIES).find(
    ({ num_academie: num }) => Number(num) === Number(academie ?? num_academie)
  )?.nom_academie;

  // const isAcademySpecific = (num_academie && String(num_academie) === academie) || !!statut_academies?.[academie];

  // const hasCriteria = !!JSON.parse(regle_complementaire_query ?? "[]").filter((query) => !!query.value.length).length;

  useEffect(() => {
    async function run() {
      try {
        const count = await getCount({ plateforme, niveau, diplome, regle_complementaire, academie, duree, annee });
        setLineCount(count ?? 0);
      } catch (e) {
        console.error(e);
      }
    }
    if (shouldFetchCount && (academie || (nom_regle_complementaire && !count))) {
      run();
    } else {
      setLineCount(count ?? 0);
    }

    const linkQuery = [
      {
        field: "diplome.keyword",
        operator: "===",
        value: diplome,
        combinator: "AND",
        index: 0,
      },
      ...((regle_complementaire_query &&
        JSON.parse(regle_complementaire_query)
          ?.filter((q) => q.value)
          .map((q) => ({ ...q, field: q.field + ".keyword", index: q.index + 1 }))) ??
        []),
    ];

    let linkFormations = `/recherche/formations?qb=${encodeURIComponent(JSON.stringify(linkQuery))}`;

    if (academie ?? num_academie) {
      linkFormations += `&nom_academie=%5B"${ACADEMIES[String(academie ?? num_academie)?.padStart(2, "0")].nom_academie}"%5D`;
    }

    if (niveau) {
      linkFormations += `&niveau=%5B"${niveau.replace(" ", "+")}"%5D`;
    }

    if (annee) {
      linkFormations += `&annee=%5B"${ANNEES[annee].replace(" ", "+")}"%5D`;
    }

    if (duree) {
      linkFormations += `&duree=%5B"${(duree <= 1 ? `${duree} an` : `${duree} ans`).replace(" ", "+")}"%5D`;
    }

    linkFormations += `&date_debut_start=%22${sessionStartDate?.toLocaleDateString(
      "en-CA"
    )}%22&date_debut_end=%22${sessionEndDate?.toLocaleDateString("en-CA")}%22`;

    setLineLink(linkFormations);
  }, [
    plateforme,
    count,
    diplome,
    niveau,
    regle_complementaire,
    regle_complementaire_query,
    nom_regle_complementaire,
    shouldFetchCount,
    academie,
    duree,
    annee,
    num_academie,
    sessionStartDate,
    sessionEndDate,
  ]);

  const updates_history = rule?.updates_history ?? [];

  const academyUpdatesHistory = updates_history
    .filter(
      (update) =>
        (update.from?.statut_academies || update.to?.statut_academies) &&
        (Object.keys(update.from?.statut_academies ?? {}).includes(academie ?? num_academie) ||
          Object.keys(update.to?.statut_academies ?? {}).includes(academie ?? num_academie)) &&
        update.from?.statut_academies?.[academie ?? num_academie] !==
          update.to?.statut_academies?.[academie ?? num_academie]
    )
    ?.sort(sortDescending);

  const handleStatutAcademieRule = useCallback(
    async (nextStatus) => {
      status === nextStatus
        ? await onDeleteStatutAcademieRule({ _id: idRule, num_academie: academie })
        : await onUpdateStatutAcademieRule({
            _id: idRule,
            num_academie: academie,
            statut: nextStatus,
          });

      onClose();
    },
    [status, onDeleteStatutAcademieRule, idRule, academie, onUpdateStatutAcademieRule, onClose]
  );

  const onStatusSelectChange = useCallback(
    async (e) => {
      const nextStatus = e.target.value;
      console.log(`onChange ${status} -> ${nextStatus}`);

      if (!academie) {
        // update the status for the rule
        await onUpdateRule({ _id: idRule, statut: nextStatus });
      } else {
        switch (true) {
          case plateforme === PLATEFORME.AFFELNET &&
            [AFFELNET_STATUS.A_DEFINIR, AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT].includes(nextStatus) &&
            [AFFELNET_STATUS.A_PUBLIER, AFFELNET_STATUS.A_PUBLIER_VALIDATION].includes(currentStatus):
            setNextStatus(nextStatus);
            onOpen();

            break;
          case PLATEFORME.PARCOURSUP:
            // TODO
            break;
          default:
            console.log({ nextStatus, status });
            // if the status equals the national one, we just remove the academy specificity, if different, we update the status for the academy
            handleStatutAcademieRule(nextStatus);
            break;
        }
      }
    },
    [academie, currentStatus, idRule, onOpen, onUpdateRule, plateforme, status, handleStatutAcademieRule, setNextStatus]
  );

  return (
    <Box
      data-testid="line"
      borderBottom={"1px solid"}
      borderColor={"grey.300"}
      // backgroundColor={
      //   academie && condition_integration === CONDITIONS.PEUT_INTEGRER && !statut_academies?.[academie]
      //     ? "red.200"
      //     : "none"
      // }
      _hover={{
        bg: nom_regle_complementaire ? "grey.200" : "none",
        cursor: nom_regle_complementaire ? "pointer" : "auto",
      }}
      onClick={() => {
        !academie && nom_regle_complementaire && onShowRule(rule);
      }}
    >
      <Flex px={8} py={3} alignItems="center" w={"full"}>
        <Flex grow={1} alignItems="center" pl={showIcon ? 2 : 0} pr={2} maxWidth={"50%"} isTruncated>
          {showIcon && <ArrowRightDownLine boxSize={3} mr={2} />}
          <Text data-testid={"line-label"} isTruncated>
            {num_academie ? `${academieLabel} (${String(num_academie)?.padStart(2, "0")}) - ` : ""}
            {label}
          </Text>
          {/* {hasCriteria && <Badge ml={4}>Critères additionnels</Badge>} */}
        </Flex>
        <Flex flexBasis={"50%"} justifyContent={"flex-start"} alignItems="center">
          <Flex minW={12} mr={8}>
            <Link onClick={(e) => e.stopPropagation()} href={lineLink} textDecoration={"underline"}>
              {lineCount}
            </Link>{" "}
          </Flex>
          <Flex justifyContent={"space-between"}>
            {!academie && (
              <Flex mr={8}>
                <ActionsSelect
                  data-testid={"actions-select"}
                  aria-disabled={isConditionChangeDisabled}
                  disabled={isConditionChangeDisabled}
                  value={condition_integration ?? CONDITIONS.NE_DOIT_PAS_INTEGRER}
                  onChange={async (e) => {
                    console.log("onChange action");
                    const action = e.target.value;
                    if (action === CONDITIONS.NE_DOIT_PAS_INTEGRER) {
                      if (nom_regle_complementaire) {
                        await onUpdateRule({
                          _id: idRule,
                          condition_integration: e.target.value,
                          statut: getFirstAllowedStatut(e.target.value),
                        });
                      } else {
                        await onDeleteRule({ _id: idRule });
                      }
                    } else {
                      if (idRule) {
                        await onUpdateRule({
                          _id: idRule,
                          condition_integration: e.target.value,
                          statut: getFirstAllowedStatut(e.target.value),
                        });
                      } else {
                        await onCreateRule({
                          plateforme,
                          niveau,
                          diplome,
                          condition_integration: e.target.value,
                          statut: getFirstAllowedStatut(e.target.value),
                          regle_complementaire: "{}",
                        });
                      }
                    }
                  }}
                />
              </Flex>
            )}
            <Flex alignItems="center" mr={8}>
              <StatusSelect
                data-testid="status-select"
                aria-disabled={isStatusChangeDisabled}
                isDisabled={isStatusChangeDisabled}
                plateforme={plateforme}
                academie={academie}
                currentStatus={currentStatus}
                condition={condition_integration ?? CONDITIONS.NE_DOIT_PAS_INTEGRER}
                onChange={onStatusSelectChange}
              />
              {!!academyUpdatesHistory?.length && (
                <Box px={4}>
                  <InfoTooltip
                    description={
                      <UnorderedList ml={4}>
                        {academyUpdatesHistory.map((history, index) => (
                          <ListItem key={index}>
                            <Text as={"b"}>
                              {history?.from?.statut_academies?.[academie] ?? "À définir pour cette académie"}
                            </Text>
                            {" ➔ "}
                            <Text as={"b"}>
                              {history?.to?.statut_academies?.[academie] ?? "À définir pour cette académie"}
                            </Text>
                            <br />
                            <Text variant={"slight"} as={"span"}>
                              Modifié {history?.to?.last_update_who && <>par {history?.to?.last_update_who}, </>}le{" "}
                              {new Date(history?.updated_at)?.toLocaleDateString("fr-FR")}
                            </Text>
                          </ListItem>
                        ))}
                      </UnorderedList>
                    }
                  />
                </Box>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Modification de la règle de périmètre
            </AlertDialogHeader>

            <AlertDialogBody>
              Si des offres associées à ce type de formation ont déjà été intégrées à Affelnet-lycée, pour que les
              suppressions puissent être prises en compte, un nouvel import Affelnet-lycée sera nécessaire.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={() => handleStatutAcademieRule(nextStatus)} ml={3}>
                J’ai compris
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
