import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import { Parametre } from "../../../theme/components/icons";
import { hasAcademyRight, hasAccessTo } from "../../utils/rolesUtils";
import { PublishModal } from "./PublishModal";
import useAuth from "../../hooks/useAuth";
import { AFFELNET_STATUS } from "../../../constants/status";

export const PublishModalButton = ({ formation, setFormation }) => {
  const [user] = useAuth();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  let title = "Gérer les publications";
  let disabled = false;

  switch (true) {
    case formation.affelnet_statut === AFFELNET_STATUS.A_PUBLIER_VALIDATION &&
      hasAccessTo(user, "page_perimetre/affelnet") &&
      hasAcademyRight(user, formation.num_academie):
      title = "La publication Affelnet nécessite un réglage des règles de périmètre.";
      disabled = true;
      break;
    case formation.affelnet_statut === AFFELNET_STATUS.A_PUBLIER_VALIDATION &&
      !hasAccessTo(user, "page_perimetre/affelnet") &&
      hasAcademyRight(user, formation.num_academie):
      title =
        "La publication Affelnet nécessite un réglage des règles de périmètre par le chef de service ou un délégué";
      disabled = true;
      break;

    case !formation.uai_formation || !formation.uai_formation.length || !formation.uai_formation_valide:
      title = "Vous devez éditer l'UAI du lieu de la formation avant de pouvoir accéder à la gestion des publications";
      disabled = true;
      break;
    default:
      title = "Gérer les publications";
      break;
  }
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
        isDisabled={disabled}
        title={title}
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
