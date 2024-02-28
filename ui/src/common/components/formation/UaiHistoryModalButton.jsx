import React from "react";
import { Link, useDisclosure } from "@chakra-ui/react";
import { UaiHistoryModal } from "./UaiHistoryModal";

export const UaiHistoryModalButton = ({ formation }) => {
  const {
    isOpen: isUaiHistoryModalOpen,
    onClose: onUaiHistoryModalClose,
    onOpen: onUaiHistoryModalOpen,
  } = useDisclosure();

  return (
    <>
      <Link fontSize={"zeta"} color={"grey.600"} textDecoration={"underline"} onClick={onUaiHistoryModalOpen}>
        Voir l'historique
      </Link>

      <UaiHistoryModal isOpen={isUaiHistoryModalOpen} onClose={onUaiHistoryModalClose} formation={formation} />
    </>
  );
};
