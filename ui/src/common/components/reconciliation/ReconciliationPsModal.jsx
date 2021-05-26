import {
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React, { useState, useCallback } from "react";
import useAuth from "../../hooks/useAuth";
import { Close } from "../../../theme/components/icons/Close";
import { ArrowRightLine } from "../../../theme/components/icons";
import { ReconciliationPsModalValidated } from "./ReconciliationPsModalValidate";
import { ReconciliationPsModalCompare } from "./ReconciliationPsModalCompare";

const ReconciliationPsModal = ({ isOpen, onClose, formation, onFormationUpdate }) => {
  const [user] = useAuth();
  const [step, setStep] = useState(1);

  const onCompareValidated = useCallback(() => {
    setStep(2);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
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
                {step === 1 && "Valider le rapprochement de l’offre de formation"}
                {step === 2 && "Rapprochement validé"}
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0} display="flex" flexDirection="column">
          {step === 1 && (
            <ReconciliationPsModalCompare formation={formation} onValidate={onCompareValidated} onClose={onClose} />
          )}
          {step === 2 && <ReconciliationPsModalValidated formation={formation} onClose={onClose} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ReconciliationPsModal };
