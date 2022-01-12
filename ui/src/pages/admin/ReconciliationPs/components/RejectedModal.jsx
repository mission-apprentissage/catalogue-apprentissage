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
  Checkbox,
} from "@chakra-ui/react";
import * as Yup from "yup";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../../../common/httpClient";
import { ArrowRightLine, Close } from "../../../../theme/components/icons";

const raisons = [
  "Codes diplômes différents",
  "Codes RNCP différents",
  "Différence entre un des UAI (CERFA ou Inserjeunes) et un des UAI (formateur ou gestionnaire)",
  "Adresses des lieux de formation différentes",
  "Différence entre le SIRET Etablissement Parcoursup et un des SIRET Formateur ou Gestionnaire Catalogue",
  "Autre",
];

const Rejected = ({ formation, onClose, onSubmitReject }) => {
  const [canSubmit, setCanSubmit] = useState(false);
  const [showRaison, setShowRaison] = useState(false);
  const { values, handleChange, handleSubmit, isSubmitting, resetForm, setFieldValue } = useFormik({
    initialValues: {
      parcoursup_raison_rejet_complement: "",
      raisons: [],
    },
    validationSchema: Yup.object().shape({
      parcoursup_raison_rejet_complement: Yup.string().nullable(),
    }),
    onSubmit: ({ raisons: raisonsForm, parcoursup_raison_rejet_complement }) => {
      return new Promise(async (resolve) => {
        if (raisonsForm.length === 0) {
          resolve();
        }

        let matching_rejete_raison = raisonsForm.join("||");
        if (raisonsForm.includes("Autre")) {
          matching_rejete_raison = `${matching_rejete_raison}#-REJECT_COMPLEMENT-#${parcoursup_raison_rejet_complement}`;
        }

        await _post("/api/parcoursup/reconciliation", {
          id_formation: formation._id,
          reject: true,
          matching_rejete_raison,
          rapprochement_rejete_raisons: raisonsForm,
          rapprochement_rejete_raison_autre: parcoursup_raison_rejet_complement ?? null,
        });
        onSubmitReject();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const handleRaisonsChange = (raison) => {
    let newRaisons = [];
    let checked = false;
    if (values.raisons.includes(raison)) {
      newRaisons = values.raisons.filter((r) => r !== raison);
    } else {
      newRaisons = [...values.raisons, raison];
      checked = true;
    }

    if (raison === "Autre") {
      setShowRaison(checked);

      if (!checked) {
        setFieldValue("parcoursup_raison_rejet_complement", "");
      } else {
        setCanSubmit(values.parcoursup_raison_rejet_complement !== "");
      }
    } else {
      setCanSubmit(newRaisons.length > 0);
    }

    setFieldValue("raisons", newRaisons);
  };

  return (
    <>
      <Flex px={[4, 16]} pb={[4, 16]}>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <FormControl display="flex" flexDirection="column" w="auto">
            <FormLabel htmlFor="raisons" mb={3} fontSize="epsilon" fontWeight={400}>
              <Heading as="h3" fontSize="1.3rem" flexGrow="1">
                Pouvez-vous préciser les raisons de votre signalement{" "}
                <Text as="span" color="redmarianne">
                  *
                </Text>
              </Heading>
            </FormLabel>
            {raisons.map((raison, i) => {
              return (
                <Checkbox
                  name="raisons"
                  py={2}
                  key={i}
                  onChange={() => handleRaisonsChange(raison)}
                  value={raison}
                  isChecked={values.raisons.includes(raison)}
                >
                  {raison}
                </Checkbox>
              );
            })}
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
