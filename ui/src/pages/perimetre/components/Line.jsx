import React, { useEffect, useState } from "react";
import { _get } from "../../../common/httpClient";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightDownLine } from "../../../theme/components/icons";
import { StatusSelect } from "./StatusSelect";
import { ActionsSelect } from "./ActionsSelect";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import { COMMON_STATUS } from "../../../constants/status";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

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
}) => {
  const [lineCount, setLineCount] = useState(count);

  const { statut: status, _id: idRule, nom_regle_complementaire, regle_complementaire, condition_integration } = rule;

  useEffect(() => {
    async function run() {
      try {
        const countUrl = `${endpointNewFront}/v1/entity/perimetre/regle/count`;
        const count = await _get(
          `${countUrl}?niveau=${niveau}&diplome=${diplome}&regle_complementaire=${regle_complementaire}`,
          false
        );
        setLineCount(count ?? 0);
      } catch (e) {
        console.error(e);
      }
    }
    if (nom_regle_complementaire && !count && shouldFetchCount) {
      run();
    }
  }, [count, diplome, niveau, regle_complementaire, nom_regle_complementaire, shouldFetchCount]);

  return (
    <Box
      borderBottom={"1px solid"}
      borderColor={"grey.300"}
      _hover={{ bg: nom_regle_complementaire ? "grey.200" : "none" }}
      onClick={() => {
        nom_regle_complementaire && onShowRule(rule);
      }}
    >
      <Flex px={8} py={3} alignItems="center" w={"full"}>
        <Flex grow={1} alignItems="center" pl={showIcon ? 2 : 0} pr={2} maxWidth={"50%"} isTruncated>
          {showIcon && <ArrowRightDownLine boxSize={3} mr={2} />}
          <Text isTruncated>{label}</Text>
        </Flex>
        <Flex flexBasis={"50%"} justifyContent={"flex-start"} alignItems="center">
          <Flex minW={12}>{lineCount}</Flex>
          <Flex justifyContent={"space-between"}>
            <Flex px={2}>
              <ActionsSelect
                value={condition_integration ?? CONDITIONS.NE_DOIT_PAS_INTEGRER}
                onChange={async (e) => {
                  const action = e.target.value;
                  if (action === CONDITIONS.NE_DOIT_PAS_INTEGRER) {
                    if (nom_regle_complementaire) {
                      await onUpdateRule({
                        _id: idRule,
                        plateforme,
                        condition_integration: e.target.value,
                        statut: COMMON_STATUS.HORS_PERIMETRE,
                      });
                    } else {
                      await onDeleteRule({ _id: idRule });
                    }
                  } else {
                    if (idRule) {
                      await onUpdateRule({
                        _id: idRule,
                        plateforme,
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
                plateforme={plateforme}
                currentStatus={status}
                condition={condition_integration ?? CONDITIONS.NE_DOIT_PAS_INTEGRER}
                onChange={async (e) => {
                  await onUpdateRule({ _id: idRule, plateforme, statut: e.target.value });
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
