import React from "react";
import {
  Box,
  Button,
  Flex,
  Link,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { ArrowRightLine, ExternalLinkLine } from "../../../theme/components/icons";
import { Close } from "../../../theme/components/icons/Close";

const HowToFixModal = ({ isOpen, onClose }) => {
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
          <Text as="h2" fontSize="2rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Demander des corrections sur les données sur votre organisme
              </Text>
            </Flex>
          </Text>
        </ModalHeader>
        <ModalBody px={[4, 16]} pb={[4, 16]}>
          <Box border="1px solid" borderColor="bluefrance" p={8}>
            <Text as="h3" fontSize="1.5rem">
              Votre organisme fait partie des CFAs historiques et votre UAI a été modifié depuis le 01/01/2020 :
            </Text>
            <Text as={"p"} mt={2}>
              Merci de signaler votre nouvel UAI à cette adresse :{" "}
              <Link href="mailto:catalogue@apprentissage.beta.gouv.fr" textDecoration="underline">
                catalogue@apprentissage.beta.gouv.fr
              </Link>
            </Text>
          </Box>
          <Box border="1px solid" borderColor="bluefrance" p={8} mt={8}>
            <Text as="h3" fontSize="1.5rem">
              Votre organisme est déclaré en préfecture :
            </Text>
            <Box mt={2}>
              Merci de réaliser la démarche suivante :
              <UnorderedList>
                <ListItem>
                  rendez-vous sur la{" "}
                  <Link
                    href="https://www.data.gouv.fr/fr/datasets/liste-publique-des-organismes-de-formation-l-6351-7-1-du-code-du-travail/"
                    textDecoration={"underline"}
                    isExternal
                  >
                    liste publique des Organismes des formations{" "}
                    <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
                  </Link>
                </ListItem>
                <ListItem>téléchargez la “liste OF à jour”</ListItem>
                <ListItem>vérifiez que :</ListItem>
                <UnorderedList>
                  <ListItem>votre SIREN y est bien référencé (colonne B du fichier .csv)</ListItem>
                  <ListItem>
                    votre organisme de formation est déclaré comme CFA en préfecture (mention “OUI” dans la colonne E du
                    fichier .csv - si la colonne mentionne “NON” cela veut dire que la DGEFP considère que votre
                    organisme n'est pas déclaré en tant que “CFA”en préfecture)
                  </ListItem>
                </UnorderedList>
              </UnorderedList>
              <Text mt={2}>
                Si votre organisme n’est pas référencé et/ou n’est pas déclaré comme CFA en préfecture, vous devez
                prendre contact avec la préfecture et/ou la Direccte pour corriger ce problème.
              </Text>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { HowToFixModal };
