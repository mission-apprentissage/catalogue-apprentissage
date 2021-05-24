import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
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

const HowToAddModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none">
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
          <Heading as="h2" fontSize="2rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Demander l'ajout d'une formation
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody px={[4, 16]} pb={[4, 16]}>
          <Box border="1px solid" borderColor="bluefrance" p={8}>
            <Heading as="h3" fontSize="1.5rem">
              Vous êtes organisme de formation et vous n’avez pas encore déclaré votre formation auprès de votre
              Carif-Oref :
            </Heading>
            <Text as={"p"} mt={2}>
              <strong>Pour ajouter une offre de formation au catalogue</strong>, merci de la déclarer auprès du
              Carif-Oref de votre région en allant sur la page{" "}
              <Link
                href="https://reseau.intercariforef.org/referencer-son-offre-de-formation"
                textDecoration="underline"
                color="bluefrance"
                isExternal
              >
                "référencer son offre de formation <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} color="bluefrance" />"
              </Link>
              . Les référencements et mises à jour effectuées dans les bases “Offre des Carif-Oref” sont répercutés
              quotidiennement dans le “Catalogue des offres de formations en apprentissage” (délai 72h entre
              modifications demandées et publication).
            </Text>
          </Box>
          <Box border="1px solid" borderColor="bluefrance" p={8} mt={8}>
            <Heading as="h3" fontSize="1.5rem">
              Vous êtes organisme de formation et vous avez déjà déclaré votre formation auprès de votre Carif-Oref :
            </Heading>
            <Box mt={2}>
              Votre formation devrait figurer dans le catalogue. Si ce n’est pas le cas, merci de nous signaler votre
              situation par mail :{" "}
              <Link href="mailto:pole-apprentissage@intercariforef.org">pole-apprentissage@intercariforef.org</Link>{" "}
              avec les informations suivantes :
              <UnorderedList>
                <ListItem>SIRET;</ListItem>
                <ListItem>RNCP et/ou le code diplôme ;</ListItem>
                <ListItem>
                  la période d'inscription telle que mentionnée dans le catalogue Carif-Oref (exprimée en AAAA-MM) ;
                </ListItem>
                <ListItem>le lieu de la formation (code commune INSEE ou à défaut code postal) ;</ListItem>
                <ListItem>mail de la personne signalant l’erreur ;</ListItem>
              </UnorderedList>
              Une investigation sera menée par le Réseau des Carif-Oref pour le traitement de cette anomalie. Il
              reviendra vers vous dès la résolution de ce dysfonctionnement via le mail que vous avez indiqué.
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { HowToAddModal };
