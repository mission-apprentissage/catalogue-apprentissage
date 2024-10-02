import React, { useRef } from "react";
import {
  Button,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { Close } from "../../../theme/components/icons";
import { sortDescending } from "../../utils/historyUtils";

const UaiHistoryModal = ({ onClose, isOpen, formation }) => {
  const initialRef = useRef();

  const uai_updated_history = formation.updates_history
    .filter((value) => typeof value.to?.uai_formation !== "undefined")
    ?.sort(sortDescending);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" initialFocusRef={initialRef}>
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
          <Text as="h4" fontSize="1.6rem">
            Historique de modification de l'UAI du lieu de formation
          </Text>
        </ModalHeader>
        <ModalBody mb={8}>
          <UnorderedList>
            <ListItem mb="8px">
              Actuellement l'UAI est{" "}
              <Text as="span" variant="highlight" mx="0.5rem">
                {formation.uai_formation?.length ? formation.uai_formation : "non défini"}
              </Text>
            </ListItem>
            {uai_updated_history?.map((history, index) => (
              <ListItem key={index} mb="8px">
                {history.from?.uai_formation?.length > 0 && history.to?.uai_formation?.length > 0 && (
                  <>
                    Modification de l'UAI
                    <Text as="span" variant="highlight" mx="0.5rem">
                      {history.from?.uai_formation ?? ""}
                    </Text>
                    à
                    <Text as="span" variant="highlight" mx="0.5rem">
                      {history.to?.uai_formation ?? ""}
                    </Text>
                  </>
                )}

                {history.from?.uai_formation?.length > 0 && history.to?.uai_formation?.length === 0 && (
                  <>
                    Suppression de l'UAI
                    <Text as="span" variant="highlight" mx="0.5rem">
                      {history.from?.uai_formation ?? ""}
                    </Text>
                  </>
                )}

                {(!history.from?.uai_formation || history.from?.uai_formation?.length === 0) &&
                  history.to?.uai_formation?.length > 0 && (
                    <>
                      Définition de l'UAI à
                      <Text as="span" variant="highlight" mx="0.5rem">
                        {history.to?.uai_formation ?? ""}
                      </Text>
                    </>
                  )}

                <Text as="span" variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                  le {new Date(history.updated_at).toLocaleDateString()} à{" "}
                  {new Date(history.updated_at).toLocaleTimeString()} par {history.to?.last_update_who}
                  {history.to?.last_update_automatic
                    ? " (action effectuée sur la précédente version de la fiche, reprise ici automatiquement)"
                    : ""}
                </Text>
              </ListItem>
            ))}
          </UnorderedList>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { UaiHistoryModal };
