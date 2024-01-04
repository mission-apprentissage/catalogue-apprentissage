import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightDownLine } from "../../../theme/components/icons";
import { StatusSelect } from "./StatusSelect";
import { ActionsSelect } from "./ActionsSelect";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import { COMMON_STATUS } from "../../../constants/status";
import { academies } from "../../../constants/academies";
import { InfoTooltip } from "../../../common/components/InfoTooltip";
import { isStatusChangeEnabled } from "../../../common/utils/rulesUtils";
import { getCount } from "../../../common/api/perimetre";

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
  rule = {},
  academie,
}) => {
  const [lineCount, setLineCount] = useState(count);

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

  const isConditionChangeEnabled = !academie;

  const isStatusChangeDisabled = !isStatusChangeEnabled({
    plateforme,
    academie,
    num_academie,
    status,
    condition_integration,
  });

  const currentStatus = statut_academies?.[academie] ?? status;
  const academieLabel = Object.values(academies).find(({ num_academie: num }) => num === num_academie)?.nom_academie;

  const isAcademySpecific = (num_academie && String(num_academie) === academie) || !!statut_academies?.[academie];

  const hasCriteria = !!JSON.parse(regle_complementaire_query ?? "[]").filter((query) => !!query.value.length).length;

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
  }, [
    plateforme,
    count,
    diplome,
    niveau,
    regle_complementaire,
    nom_regle_complementaire,
    shouldFetchCount,
    academie,
    duree,
    annee,
  ]);

  return (
    <Box
      data-testid="line"
      borderBottom={"1px solid"}
      borderColor={"grey.300"}
      _hover={{
        bg: nom_regle_complementaire ? "grey.200" : "none",
        cursor: nom_regle_complementaire ? "pointer" : "auto",
      }}
      onClick={() => {
        nom_regle_complementaire && onShowRule(rule);
      }}
    >
      <Flex px={8} py={3} alignItems="center" w={"full"}>
        <Flex grow={1} alignItems="center" pl={showIcon ? 2 : 0} pr={2} maxWidth={"50%"} isTruncated>
          {showIcon && <ArrowRightDownLine boxSize={3} mr={2} />}
          <Text data-testid={"line-label"} isTruncated>
            {num_academie ? `${academieLabel} (${num_academie}) - ` : ""}
            {label}
          </Text>
          {hasCriteria && <Badge ml={4}>Critères additionnels</Badge>}
        </Flex>
        <Flex flexBasis={"50%"} justifyContent={"flex-start"} alignItems="center">
          <Flex minW={12}>{lineCount}</Flex>
          <Flex justifyContent={"space-between"}>
            <Flex px={2}>
              <ActionsSelect
                data-testid={"actions-select"}
                aria-disabled={!isConditionChangeEnabled}
                disabled={!isConditionChangeEnabled}
                value={condition_integration ?? CONDITIONS.NE_DOIT_PAS_INTEGRER}
                onChange={async (e) => {
                  const action = e.target.value;
                  if (action === CONDITIONS.NE_DOIT_PAS_INTEGRER) {
                    if (nom_regle_complementaire) {
                      await onUpdateRule({
                        _id: idRule,
                        condition_integration: e.target.value,
                        statut: COMMON_STATUS.NON_PUBLIABLE_EN_LETAT,
                      });
                    } else {
                      await onDeleteRule({ _id: idRule });
                    }
                  } else {
                    if (idRule) {
                      await onUpdateRule({
                        _id: idRule,
                        condition_integration: e.target.value,
                        statut: COMMON_STATUS.A_PUBLIER,
                      });
                    } else {
                      await onCreateRule({
                        plateforme,
                        niveau,
                        diplome,
                        condition_integration: e.target.value,
                        statut: COMMON_STATUS.A_PUBLIER,
                        regle_complementaire: "{}",
                      });
                    }
                  }
                }}
              />
            </Flex>
            <Flex alignItems="center">
              <StatusSelect
                data-testid="status-select"
                aria-disabled={isStatusChangeDisabled}
                isDisabled={isStatusChangeDisabled}
                plateforme={plateforme}
                currentStatus={currentStatus}
                condition={condition_integration ?? CONDITIONS.NE_DOIT_PAS_INTEGRER}
                onChange={async (e) => {
                  if (!academie) {
                    // update the status for the rule
                    await onUpdateRule({ _id: idRule, statut: e.target.value });
                  } else {
                    // update the status only for the selected academy
                    const statusAcademies = {
                      ...statut_academies,
                      [academie]: e.target.value,
                    };

                    // if the status equals the national one just remove the academy specificity
                    if (status === e.target.value) {
                      delete statusAcademies[academie];
                    }

                    await onUpdateRule({
                      _id: idRule,
                      statut_academies: statusAcademies,
                    });
                  }
                }}
              />
              {isAcademySpecific && (
                <Box px={4}>
                  <InfoTooltip
                    description={"sur ce diplôme et titre la règle d'intégration est spécifique à cette académie"}
                  />
                </Box>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
