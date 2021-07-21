import React from "react";
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
import { ArrowRightLine, Close } from "../../theme/components/icons";

const RuleModal = ({ isOpen, onClose, title, rule, name }) => {
  const initialRef = React.useRef();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" ref={initialRef}>
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
                Ajouter des conditions au diplôme ou à la certification {title}
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody px={[4, 16]} pb={[4, 16]}>
          <Box border="1px solid" borderColor="bluefrance" p={8}>
            {name && (
              <Text as={"p"} mt={2}>
                {name} :
              </Text>
            )}
            <Text as={"p"} mt={2}>
              {rule}
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { RuleModal };
