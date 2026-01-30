import { Link, useDisclosure } from "@chakra-ui/react";
import { ResponsableEmailModal } from "./ResponsableEmailModal";

export const ResponsableEmailModalButton = ({ responsable, formation, callback, text = "Modifier" }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Link textDecoration={"underline"} onClick={onOpen}>
        {text}
      </Link>

      <ResponsableEmailModal
        isOpen={isOpen}
        onClose={onClose}
        callback={callback}
        responsable={responsable}
        formation={formation}
      />
    </>
  );
};
