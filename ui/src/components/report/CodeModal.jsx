import React from "react";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokai } from "react-syntax-highlighter/dist/cjs/styles/hljs";

const CodeModal = ({ isOpen, onClose, title, code, language = "json" }) => {
  let formattedCode = "";
  try {
    formattedCode = code && JSON.stringify(JSON.parse(code), null, "  ");
  } catch (e) {
    console.error(e);
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SyntaxHighlighter language={language} style={monokai} showLineNumbers>
            {formattedCode}
          </SyntaxHighlighter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { CodeModal };
