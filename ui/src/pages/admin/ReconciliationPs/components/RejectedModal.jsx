import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Text,
  Textarea,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";
import * as Yup from "yup";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../../../common/httpClient";
import { Close } from "../../../../theme/components/icons/Close";
import { ArrowRightLine } from "../../../../theme/components/icons";

const Rejected = ({ formation, onClose, onSubmitReject }) => {
  const [canSubmit, setCanSubmit] = useState(false);
  const [showRaison, setShowRaison] = useState(false);
  const { values, handleChange, handleSubmit, isSubmitting, resetForm } = useFormik({
    initialValues: {
      parcoursup_raison_rejet: "",
      parcoursup_raison_rejet_complement: "",
    },
    validationSchema: Yup.object().shape({
      parcoursup_raison_rejet: Yup.string().nullable().required("Veuillez selectionner la raison"),
      parcoursup_raison_rejet_complement: Yup.string().nullable(),
    }),
    onSubmit: ({ parcoursup_raison_rejet, parcoursup_raison_rejet_complement }) => {
      return new Promise(async (resolve) => {
        let matching_rejete_raison = parcoursup_raison_rejet;
        if (parcoursup_raison_rejet === "Autre") {
          matching_rejete_raison = `${parcoursup_raison_rejet}#-REJECT_COMPLEMENT-#${parcoursup_raison_rejet_complement}`;
        }
        await _post("/api/parcoursup/reconciliation", {
          id_formation: formation._id,
          reject: true,
          matching_rejete_raison,
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
          <FormControl display="flex" flexDirection="column" w="auto">
            <RadioGroup
              defaultValue={values.parcoursup_raison_rejet}
              id="parcoursup_raison_rejet"
              name="parcoursup_raison_rejet"
            >
              <Stack spacing={2} direction="column">
                <FormLabel htmlFor="parcoursup_raison_rejet" mb={3} fontSize="epsilon" fontWeight={400}>
                  <Heading as="h3" fontSize="1.3rem" flexGrow="1">
                    Pouvez-vous préciser les raisons de votre signalement{" "}
                    <Text as="span" color="redmarianne">
                      *
                    </Text>
                  </Heading>
                </FormLabel>
                <Radio
                  mb={0}
                  size="lg"
                  value="UAI Formation ne correspond pas (UAI gestionnaire correspond)"
                  onChange={(evt) => {
                    setShowRaison(false);
                    setCanSubmit(true);
                    handleChange(evt);
                  }}
                >
                  <Text fontSize="1rem">UAI Formation ne correspond pas (UAI gestionnaire correspond)</Text>
                </Radio>
                <Radio
                  mb={0}
                  size="lg"
                  value="UAI Formateur ne correspond pas (UAI gestionnaire correspond)"
                  onChange={(evt) => {
                    setShowRaison(false);
                    setCanSubmit(true);
                    handleChange(evt);
                  }}
                >
                  <Text fontSize="1rem">UAI Formateur ne correspond pas (UAI gestionnaire correspond)</Text>
                </Radio>
                <Radio
                  mb={0}
                  size="lg"
                  value="les codes formations ne sont pas cohérents (entre PS et Catalogue)"
                  onChange={(evt) => {
                    setShowRaison(false);
                    setCanSubmit(true);
                    handleChange(evt);
                  }}
                >
                  <Text fontSize="1rem">Les codes formations ne sont pas cohérents (entre PS et Catalogue)</Text>
                </Radio>
                <Radio
                  mb={0}
                  size="lg"
                  value="les établissements sont différents"
                  onChange={(evt) => {
                    setShowRaison(false);
                    setCanSubmit(true);
                    handleChange(evt);
                  }}
                >
                  <Text fontSize="1rem">Les établissements sont différents</Text>
                </Radio>
                <Radio
                  mb={0}
                  size="lg"
                  value="Nouvelle formation / formation récente"
                  onChange={(evt) => {
                    setShowRaison(false);
                    setCanSubmit(true);
                    handleChange(evt);
                  }}
                >
                  <Text fontSize="1rem">Nouvelle formation / formation récente</Text>
                </Radio>
                <Radio
                  mb={0}
                  size="lg"
                  value="incohérence entre UAI et SIRET"
                  onChange={(evt) => {
                    setShowRaison(false);
                    setCanSubmit(true);
                    handleChange(evt);
                  }}
                >
                  <Text fontSize="1rem">Incohérence entre UAI et SIRET</Text>
                </Radio>
                <Radio
                  mb={0}
                  size="lg"
                  value="Autre"
                  onChange={(evt) => {
                    setShowRaison(true);
                    setCanSubmit(false);
                    handleChange(evt);
                  }}
                >
                  <Text fontSize="1rem">Autre</Text>
                </Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          {showRaison && (
            <Flex flexDirection="column" mt={2}>
              <FormControl display="flex" flexDirection="column" w="auto">
                <Textarea
                  onChange={(evt) => {
                    setCanSubmit(true);
                    handleChange(evt);
                  }}
                  name="parcoursup_raison_rejet_complement"
                  value={values.parcoursup_raison_rejet_complement}
                  placeholder="Précisez ici ..."
                />
              </FormControl>
            </Flex>
          )}
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

const RejectedModal = ({ isOpen, onClose, formation, onSubmitReject }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" my="0">
        <Button
          display={"flex"}
          alignSelf={"flex-end"}
          color="bluefrance"
          fontSize={"epsilon"}
          onClick={onClose}
          variant="unstyled"
          p={8}
          fontWeight={400}
        >
          fermer{" "}
          <Text as={"span"} ml={2}>
            <Close boxSize={4} />
          </Text>
        </Button>
        <ModalHeader px={[4, 16]} pt={[3, 6]} pb={[3, 6]}>
          <Heading as="h2" fontSize="2rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Signaler une anomalie
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0} display="flex" flexDirection="column">
          <Rejected formation={formation} onClose={onClose} onSubmitReject={onSubmitReject} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { RejectedModal };
