import React from "react";
import { Link, useDisclosure } from "@chakra-ui/react";
import { RelationEmailResponsableModal } from "./RelationEmailResponsableModal";

export const RelationEmailResponsableModalButton = ({ relation, formation, callback }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Link fontSize={"zeta"} color={"grey.600"} textDecoration={"underline"} onClick={onOpen}>
        Modifier
      </Link>

      <RelationEmailResponsableModal
        isOpen={isOpen}
        onClose={onClose}
        callback={callback}
        relation={relation}
        formation={formation}
      />
    </>
  );
};
