import React, { useCallback, useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { Alert } from "../Alert";
import { handleRejection, unhandleRejection } from "../../api/formation";
import useAuth from "../../hooks/useAuth";
import { SuccessLine } from "../../../theme/components/icons";

export const RejectionBlock = ({ formation: baseFormation }) => {
  const [user] = useAuth();
  const [formation, setFormation] = useState(baseFormation);

  // TODO : check par académie
  const canHandleBusinessError = true;

  const handleBusinessError = useCallback(async () => {
    const updateFormation = await handleRejection({ id: formation._id });
    setFormation(updateFormation);
  }, [formation]);

  const unhandleBusinessError = useCallback(async () => {
    const updateFormation = await unhandleRejection({ id: formation._id });
    setFormation(updateFormation);
  }, [formation]);

  if (!formation?.parcoursup_error) {
    return null;
  }

  const isBusinessError = formation?.parcoursup_error && formation?.rejection?.error;

  const description = formation?.rejection?.description;
  const error = formation?.rejection?.error ?? (
    <>
      Erreur technique : <b>{formation?.parcoursup_error}</b>
    </>
  );
  const action = formation?.rejection?.action;

  return (
    <>
      <Box mt={4}>
        <Alert type={isBusinessError ? "warning" : "info"}>
          <Flex>
            <Box flexBasis={"70%"}>
              {description && (
                <Text mb={error || action ? 2 : 0}>
                  <b>{description}</b>
                </Text>
              )}
              {error && (
                <Text variant="slight" mb={action ? 2 : 0}>
                  {error}
                </Text>
              )}
              {action && <Text>{action} Revenir sur cette page demander la publication.</Text>}
            </Box>
            {isBusinessError && (
              <Box flexBasis={"30%"}>
                <Box m={"auto"}>
                  {!formation?.rejection?.handled_by ? (
                    <Flex direction={"column"} justifyItems={"space-evenly"}>
                      <Flex my={2} mx="auto">
                        <Button variant={"secondary"} disabled={!canHandleBusinessError} onClick={handleBusinessError}>
                          Je prends en charge
                        </Button>
                      </Flex>

                      <Text variant="slight" my={2} mx="auto" textAlign={"center"}>
                        {canHandleBusinessError
                          ? `En tant qu'instructeur, je veux résoudre l'erreur pour permettre le retour dans le flux de publication.`
                          : `Vous n'avez pas les droits pour prendre en charge cette erreur.`}
                      </Text>
                    </Flex>
                  ) : (
                    <Flex direction={"column"} justifyItems={"space-evenly"}>
                      <Flex my={2} mx="auto">
                        <Text mt={2} variant={"secondary"}>
                          Pris en charge <SuccessLine />
                        </Text>
                      </Flex>

                      <Text variant="slight" my={2} mx="auto" textAlign={"center"}>
                        {user.email === formation?.rejection?.handled_by ? (
                          <Button variant="slight" onClick={unhandleBusinessError}>
                            Annuler
                          </Button>
                        ) : (
                          `Par ${formation?.rejection?.handled_by} le ${new Date(
                            formation?.rejection?.handled_date
                          )?.toLocaleDateString("fr-FR")}`
                        )}
                      </Text>
                    </Flex>
                  )}
                </Box>
              </Box>
            )}
          </Flex>
        </Alert>
      </Box>
    </>
  );
};
