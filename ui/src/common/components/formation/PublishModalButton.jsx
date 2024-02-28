import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import { Parametre } from "../../../theme/components/icons";
import { hasAccessTo } from "../../utils/rolesUtils";
import { PublishModal } from "./PublishModal";
import useAuth from "../../hooks/useAuth";

export const PublishModalButton = ({ formation, setFormation }) => {
  const [user] = useAuth();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  return (
    <>
      <Button
        textStyle="sm"
        variant="primary"
        px={8}
        mt={4}
        minW={"auto"}
        onClick={() => {
          onOpenPublishModal();
        }}
        disabled={!formation.uai_formation || !formation.uai_formation.length || !formation.uai_formation_valide}
        title={
          !formation.uai_formation || !formation.uai_formation.length || !formation.uai_formation_valide
            ? "Vous devez éditer l'UAI du lieu de la formation avant de pouvoir accéder à la gestion des publications"
            : "Gérer les publications"
        }
      >
        <Parametre color="white" mr="2" />
        Gérer les publications
      </Button>

      {hasAccessTo(user, "page_formation/gestion_publication") && formation && (
        <PublishModal
          isOpen={isOpenPublishModal}
          onClose={onClosePublishModal}
          formation={formation}
          onFormationUpdate={(updatedFormation) => {
            setFormation(updatedFormation);
          }}
        />
      )}
    </>
  );
};
