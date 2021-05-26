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
import React from "react";
import { Close } from "../../../theme/components/icons/Close";
import { ArrowRightLine } from "../../../theme/components/icons";
import { AddEtablissement } from "./AddEtablissement";

const EtablissementModal = ({ isOpen, onClose }) => {
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
                Ajouter un organisme
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0} display="flex" flexDirection="column">
          <AddEtablissement formation={null} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { EtablissementModal };
