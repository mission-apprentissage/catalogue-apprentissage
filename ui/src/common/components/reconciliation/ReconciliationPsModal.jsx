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
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Close } from "../../../theme/components/icons/Close";
import { ArrowRightLine } from "../../../theme/components/icons";
import { Compare } from "./Compare";
import { _get } from "../../../common/httpClient";

const endpointNewFront = "http://localhost/api"; // `${process.env.REACT_APP_BASE_URL}/api`;

const ReconciliationPsModal = ({ isOpen, onClose, data, onFormationUpdate }) => {
  const [formation, setFormation] = useState();

  useEffect(() => {
    async function run() {
      try {
        const apiURL = `${endpointNewFront}/parcoursup/reconciliation/result/`;
        const form = await _get(`${apiURL}${data._id}`, false);
        setFormation(form);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [data]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" my="0" minH="full" h="auto">
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
                Valider le rapprochement de l’offre de formation
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0} display="flex" flexDirection="column">
          {formation && <Compare formation={formation} onClose={onClose} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ReconciliationPsModal };
