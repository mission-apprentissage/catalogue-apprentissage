import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import * as Yup from "yup";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";

const Rejected = ({ formation, onClose, onSubmitReject }) => {
  const [canSubmit, setCanSubmit] = useState(false);
  const [showRaison, setShowRaison] = useState(false);
  const { values, handleChange, handleSubmit, isSubmitting, resetForm, errors } = useFormik({
    initialValues: {
      parcoursup_raison_rejet: "",
      parcoursup_raison_rejet_complement: "",
    },
    validationSchema: Yup.object().shape({
      parcoursup_raison_rejet: Yup.string().nullable(),
      parcoursup_raison_rejet_complement: showRaison
        ? Yup.string().nullable().required("Veuillez saisir la raison")
        : Yup.string().nullable(),
    }),
    onSubmit: ({ parcoursup_raison_rejet, parcoursup_raison_rejet_complement }) => {
      return new Promise(async (resolve) => {
        await _post("/api/parcoursup/reconciliation", {
          id_formation: formation._id,
          reject: true,
          matching_rejete_raison: `${parcoursup_raison_rejet}#-complement-#${parcoursup_raison_rejet_complement}`,
        });
        onSubmitReject();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  return (
    <>
      <Flex px={[4, 16]} pb={[4, 16]}>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Flex flexDirection="column">
            <FormControl display="flex" flexDirection="column" w="auto">
              <FormLabel htmlFor="parcoursup_raison_rejet" mb={3} fontSize="epsilon" fontWeight={400}>
                Pouvez-vous préciser les raisons de votre signalement
              </FormLabel>
              <RadioGroup
                defaultValue={values.parcoursup_raison_rejet}
                id="parcoursup_raison_rejet"
                name="parcoursup_raison_rejet"
              >
                <Stack spacing={2} direction="column">
                  <Radio
                    mb={0}
                    size="lg"
                    value="lieu de le formation"
                    onChange={(evt) => {
                      setShowRaison(false);
                      setCanSubmit(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Le lieu de le formation pas ok
                    </Text>
                  </Radio>
                  <Radio
                    mb={0}
                    size="lg"
                    value="Libellé Psup"
                    onChange={(evt) => {
                      setShowRaison(false);
                      setCanSubmit(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Libellé Psup ne correspond pas au Code diplome
                    </Text>
                  </Radio>
                  <Radio
                    mb={0}
                    size="lg"
                    value="Autres"
                    onChange={(evt) => {
                      setShowRaison(true);
                      setCanSubmit(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Autres - informations complémentaires
                    </Text>
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            {showRaison && (
              <FormControl
                isInvalid={errors.parcoursup_raison_rejet_complement}
                flexDirection="column"
                w="auto"
                mt={8}
                isRequired={showRaison}
              >
                <FormLabel htmlFor="parcoursup_raison_rejet_complement" mb={3} fontSize="epsilon" fontWeight={400}>
                  Informations complémentaires
                </FormLabel>
                <Flex flexDirection="column" w="100%">
                  <Textarea
                    name="parcoursup_raison_rejet_complement"
                    value={values.parcoursup_raison_rejet_complement}
                    onChange={handleChange}
                    placeholder="Précisez ici la raison pour laquelle vous souhaitez rejeter ce rapprochement..."
                    rows={2}
                    isRequired
                  />
                  <FormErrorMessage>{errors.parcoursup_raison_rejet_complement}</FormErrorMessage>
                </Flex>
              </FormControl>
            )}
          </Flex>
        </Box>
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            variant="secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
            mr={[0, 4]}
            px={8}
            mb={[3, 0]}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="..."
            isDisabled={!canSubmit}
          >
            Envoyer
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export { Rejected };
