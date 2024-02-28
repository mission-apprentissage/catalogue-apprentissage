import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import { ReinitStatutModal } from "./ReinitStatutModal";

export const ReinitStatutModalButton = ({ formation, setFormation }) => {
  const { isOpen: isReinitModalOpen, onClose: onCloseReinitModal, onOpen: onOpenReinitModal } = useDisclosure();

  return (
    <>
      <Button textStyle="sm" variant="secondary" px={8} mt={4} onClick={onOpenReinitModal}>
        Réinitialiser la publication Parcoursup
      </Button>
      <ReinitStatutModal
        formation={formation}
        setFormation={setFormation}
        onClose={onCloseReinitModal}
        isOpen={isReinitModalOpen}
      />
    </>
  );
};
