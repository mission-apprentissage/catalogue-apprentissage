import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
// import { _put } from "../../httpClient";
import useAuth from "../../hooks/useAuth";
// import { buildUpdatesHistory } from "../../utils/formationUtils";
import * as Yup from "yup";

const Rejected = ({ formation, onClose }) => {
  const [user] = useAuth();
  const [isAffelnetFormOpen, setAffelnetFormOpen] = useState(
    ["publié", "en attente de publication"].includes(formation?.affelnet_statut)
  );

  const [isAffelnetUnpublishFormOpen, setAffelnetUnpublishFormOpen] = useState(
    ["non publié"].includes(formation?.affelnet_statut)
  );
  const [isParcoursupUnpublishFormOpen, setParcousupUnpublishFormOpen] = useState(
    ["non publié"].includes(formation?.parcoursup_statut)
  );

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, errors } = useFormik({
    initialValues: {
      //affelnet: getPublishRadioValue(formation?.affelnet_statut),
      //parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
      affelnet_infos_offre: formation?.affelnet_infos_offre ?? "",
      affelnet_raison_depublication: formation?.affelnet_raison_depublication ?? "",
      parcoursup_raison_depublication: formation?.parcoursup_raison_depublication ?? "",
    },
    // validationSchema: Yup.object().shape({
    //   affelnet_raison_depublication: isAffelnetUnpublishFormOpen
    //     ? Yup.string().nullable().required("Veuillez saisir la raison")
    //     : Yup.string().nullable(),
    //   parcoursup_raison_depublication: isParcoursupUnpublishFormOpen
    //     ? Yup.string().nullable().required("Veuillez saisir la raison")
    //     : Yup.string().nullable(),
    // }),
    onSubmit: ({
      affelnet,
      parcoursup,
      affelnet_infos_offre,
      affelnet_raison_depublication,
      parcoursup_raison_depublication,
    }) => {
      return new Promise(async (resolve) => {
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const isParcoursupPublishDisabled = ["hors périmètre"].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = ["hors périmètre"].includes(formation?.affelnet_statut);

  return (
    <>
      <Flex px={[4, 16]} pb={[4, 16]}>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Flex flexDirection="column">
            <FormControl display="flex" flexDirection="column" w="auto" isDisabled={isParcoursupPublishDisabled}>
              <FormLabel htmlFor="parcoursup" mb={3} fontSize="epsilon" fontWeight={400}>
                Pouvez-vous préciser les raisons de votre signalement
              </FormLabel>
              <RadioGroup defaultValue={values.parcoursup} id="parcoursup" name="parcoursup">
                <Stack spacing={2} direction="column">
                  <Radio
                    mb={0}
                    size="lg"
                    value="true"
                    isDisabled={isParcoursupPublishDisabled}
                    onChange={(evt) => {
                      setParcousupUnpublishFormOpen(false);
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
                    value="false"
                    isDisabled={isParcoursupPublishDisabled}
                    onChange={(evt) => {
                      setParcousupUnpublishFormOpen(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Libellé Psup ne correspond pas au Code diplome
                    </Text>
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl
              // isRequired
              isInvalid={errors.parcoursup_raison_depublication}
              // display={isParcoursupUnpublishFormOpen ? "flex" : "none"}
              flexDirection="column"
              w="auto"
              mt={8}
            >
              <FormLabel htmlFor="parcoursup_raison_depublication" mb={3} fontSize="epsilon" fontWeight={400}>
                Informations complémentaires (facultatif)
              </FormLabel>
              <Flex flexDirection="column" w="100%">
                <Textarea
                  name="parcoursup_raison_depublication"
                  value={values.parcoursup_raison_depublication}
                  onChange={handleChange}
                  placeholder="Précisez ici la raison pour laquelle vous souhaitez rejeter ce rapprochement..."
                  rows={2}
                />
                <FormErrorMessage>{errors.parcoursup_raison_depublication}</FormErrorMessage>
              </Flex>
            </FormControl>
          </Flex>
        </Box>
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            variant="secondary"
            onClick={() => {
              //setFieldValue("affelnet", getPublishRadioValue(formation?.affelnet_statut));
              //setFieldValue("parcoursup", getPublishRadioValue(formation?.parcoursup_statut));
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
            loadingText="Enregistrement des modifications"
          >
            Envoyer
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export { Rejected };
