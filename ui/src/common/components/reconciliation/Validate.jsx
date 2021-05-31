import { Box, Button, Flex, FormControl, FormLabel, Heading, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
// import { buildUpdatesHistory } from "../../utils/formationUtils";
import { ValidateIcon } from "../../../theme/components/icons";

const Validate = ({ formation, onClose }) => {
  const [canSubmit, setCanSubmit] = useState(false);

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue } = useFormik({
    initialValues: {
      parcoursup_keep_publish: undefined,
    },
    onSubmit: ({ parcoursup_keep_publish }) => {
      return new Promise(async (resolve) => {
        onClose();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  return (
    <Flex flexDirection="row-reverse" px={[4, 16]}>
      <Flex w="35%">
        <Box p={8} w="full">
          <Heading as="h3" fontSize="1.5rem" mb={3}>
            Récapitualif
          </Heading>
          <Text as="span">
            La formation Parcoursup “BTS - Services Communication - en apprentissage” associée à l’organisme “Ecole
            Auvergne Formation” a bien été rapprochée à la formation du Catalogue 2021 “COMMUNICATION (BTS)” associée à
            l’organisme “EAF”
          </Text>
        </Box>
      </Flex>
      <Flex w="65%">
        <Box p={8} w="full">
          <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance" flexGrow="1">
            Vérification automatique des conditions d’intégration
          </Heading>
          <Text
            as="div"
            variant="highlight"
            borderLeft="3px solid"
            borderColor="greensoft.500"
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="flex-start"
            p={3}
            mb={5}
          >
            <ValidateIcon width="14px" height="14px" color="greensoft.500" mr="2" mt="0.35rem" />
            <Text fontWeight="normal">
              La formation est paramétrée dans la plateforme Parcoursup et répond bien aux conditions d’intégration.{" "}
              <Text fontWeight="bold" as="span">
                Elle apparait aujourd’hui dans le Catalogue 2021 sous le statut “publiée”.
              </Text>
            </Text>
          </Text>
          <Flex flexDirection="column">
            <FormControl display="flex" flexDirection="column" w="auto">
              <FormLabel htmlFor="parcoursup_keep_publish" mb={3} fontSize="epsilon" fontWeight={400}>
                <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance" flexGrow="1">
                  Conserver la publication{" "}
                  <Text as="span" color="redmarianne">
                    *
                  </Text>
                </Heading>
              </FormLabel>
              <RadioGroup
                defaultValue={values.parcoursup_keep_publish}
                id="parcoursup_keep_publish"
                name="parcoursup_keep_publish"
                border="1px solid"
                borderColor="bluefrance"
                p={6}
              >
                <Stack spacing={2} direction="column">
                  <Radio
                    mb={0}
                    size="lg"
                    value="true"
                    onChange={(evt) => {
                      setCanSubmit(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Oui
                    </Text>
                  </Radio>
                  <Radio
                    mb={0}
                    size="lg"
                    value="false"
                    onChange={(evt) => {
                      setCanSubmit(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Non
                    </Text>
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </Flex>
          <Flex flexDirection={["column", "row"]} mt={5} justifyContent="flex-start">
            <Box flexGrow="1">
              <Button
                variant="secondary"
                onClick={() => {
                  setFieldValue("parcoursup_keep_publish", undefined);
                  onClose();
                }}
                mr={[0, 4]}
                px={8}
                mb={[3, 0]}
              >
                Annuler
              </Button>
            </Box>

            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Enregistrement..."
              isDisabled={!canSubmit}
            >
              Enregistrer
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export { Validate };
