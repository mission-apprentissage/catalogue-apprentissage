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
import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { Close } from "../../../theme/components/icons/Close";
import { ArrowRightLine } from "../../../theme/components/icons";
import { Validate } from "./Validate";
import { Compare } from "./Compare";
import { Rejected } from "./Rejected";

const ReconciliationPsModal = ({ isOpen, onClose, formation, onFormationUpdate }) => {
  const [user] = useAuth();
  const [step, setStep] = useState("compare");

  const onCompareValidated = () => {
    setStep("validated");
  };

  const onRejected = () => {
    setStep("rejected");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" my="0" h="auto">
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
                {step === "compare" && "Valider le rapprochement de l’offre de formation"}
                {step === "validated" && "Rapprochement validé"}
                {step === "rejected" && "Rapprochement rejeté"}
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0} display="flex" flexDirection="column">
          {step === "compare" && (
            <Compare formation={formation} onValidate={onCompareValidated} onRejected={onRejected} onClose={onClose} />
          )}
          {step === "validated" && <Validate formation={formation} onClose={onClose} />}
          {step === "rejected" && <Rejected formation={formation} onClose={onClose} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ReconciliationPsModal };
