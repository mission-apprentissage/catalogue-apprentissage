import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  IconButton,
  HStack,
  Box,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Close } from "../../../theme/components/icons/Close";
import { ArrowRightLine } from "../../../theme/components/icons";
import { Compare } from "./Compare";
import { _get } from "../../../common/httpClient";
import "./index.css";
// TODO FIXEME !important css rules

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`; // "http://localhost/api";

const ReconciliationPsModal = React.memo(({ isOpen, onClose: onCloseProp, data, onFormationUpdate }) => {
  const [formation, setFormation] = useState();
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function run() {
      try {
        const apiURL = `${endpointNewFront}/parcoursup/reconciliation/result/`;
        const form = await _get(`${apiURL}${data._id}`, false);
        setFormation(form);
        if (form.statut_reconciliation === "VALIDE" && form.etat_reconciliation) {
          setStep(3);
        }
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [data]);

  let onStepClicked = useCallback((s) => {
    setStep(s);
  }, []);

  let onValidationSubmit = useCallback(() => {
    setStep(1);
    window.location.reload();
  }, []);
  let onClose = useCallback(() => {
    setStep(1);
    setFormation(null);
    onCloseProp();
  }, [onCloseProp]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" id="reconciliationPsModal">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" my="0" minH="full" h="auto" px={20}>
        <HStack px={[4, 5]} mt={5} position="sticky" top="0">
          className="sticky-inner"
          <Box borderBottom="3px solid grey" />
          {step < 3 && (
            <>
              <Text
                variant="secondary"
                onClick={() => {
                  onStepClicked(1);
                }}
                py={2}
                px={8}
                fontWeight="bold"
                textStyle="h4"
                h="auto"
                color={step === 1 ? "bluefrance" : "gray.600"}
              >
                1. Valider le rapprochement
              </Text>
              <Text
                disabled={step !== 2}
                py={2}
                fontWeight="bold"
                textStyle="h4"
                h="auto"
                color={step === 2 ? "bluefrance" : "gray.600"}
              >
                2. Gérer la publication
              </Text>

              <Box flexGrow="1" textAlign="end">
                <Button color="bluefrance" fontSize={"epsilon"} onClick={onClose} variant="unstyled" fontWeight={400}>
                  fermer{" "}
                  <Text as={"span"} ml={2}>
                    <Close boxSize={4} />
                  </Text>
                </Button>
              </Box>
            </>
          )}
        </HStack>

        <ModalHeader px={[4, 16]} pt={[3, 6]} pb={[3, 6]} borderTop="1px solid #E7E7E7">
          <Heading as="h2" fontSize="2rem">
            <Flex>
              <Text as={"span"} ml={4}>
                {step === 3 && "Rapprochement validé de l’offre de formation"}
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0} display="flex" flexDirection="column">
          {formation && (
            <Compare
              formation={formation}
              onClose={onClose}
              onValidationSubmit={onValidationSubmit}
              onStepChanged={onStepClicked}
              step={step}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export { ReconciliationPsModal };
