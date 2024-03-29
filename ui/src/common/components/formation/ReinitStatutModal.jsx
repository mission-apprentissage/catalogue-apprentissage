import React, { useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { ArrowRightLine, Close } from "../../../theme/components/icons";
import { _get, _post } from "../../httpClient";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const ReinitStatutModal = ({ isOpen, onClose, formation, setFormation }) => {
  const toast = useToast();

  const initialRef = useRef();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmiting] = useState("");

  const cancel = useCallback(() => {
    setComment("");
    onClose();
  }, [onClose]);

  const reinitStatut = useCallback(
    async ({ comment }) => {
      try {
        const response = await _post(`${CATALOGUE_API}/entity/formations/${formation?._id}/reinit-statut`, {
          comment,
        });
        const message = response?.message;

        toast({
          title: "Succès",
          description: message,
          status: "success",
          duration: 10000,
          isClosable: true,
        });
      } catch (e) {
        console.error("Can't reinit status", e);

        const response = await (e?.json ?? {});
        const message = response?.message ?? e?.message;

        toast({
          title: "Erreur",
          description: message,
          status: "error",
          duration: 10000,
          isClosable: true,
        });
      }

      const response = await _get(`${CATALOGUE_API}/entity/formation/${formation?._id}?select={"__v":0}`);
      setFormation(response);
    },
    [formation, setFormation, toast]
  );

  const submit = useCallback(async () => {
    setIsSubmiting(true);
    await reinitStatut({ comment });

    setIsSubmiting(false);
    setComment("");
    onClose();
  }, [comment, onClose, reinitStatut]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" ref={initialRef}>
        <Button
          display={"flex"}
          alignSelf={"flex-end"}
          color="bluefrance"
          fontSize={"epsilon"}
          onClick={cancel}
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
          <Text as="h2" fontSize="2rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Réinitialiser le statut de publication de la formation
              </Text>
            </Flex>
          </Text>
        </ModalHeader>
        <ModalBody px={[4, 16]} pb={[4, 16]}>
          <Box>
            <Text mb={4}>Vous êtes sur le point de réinitialiser le statut de publication de la formation.</Text>

            <FormControl>
              <FormLabel mb={3}>* Motif de la réinitialisation : </FormLabel>
              <Textarea onChange={(event) => setComment(event.target.value)} />
            </FormControl>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Box>
            <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
              <Button variant="secondary" onClick={cancel} mr={[0, 4]} mb={[3, 0]}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={submit}
                isDisabled={!(comment && comment.length > 0)}
                isLoading={isSubmitting}
                loadingText="Réinitialisation en cours"
              >
                Réinitialiser
              </Button>
            </Flex>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
