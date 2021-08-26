import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";

const Prerequis = ({ onSubmited }) => {
  return (
    <Box border="1px solid" borderColor="bluefrance" w="full">
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Heading as="h3" fontSize="1.5rem" mt={3} mb={5}>
          Prérequis
        </Heading>
        <Text>Avant de commencer, veuillez vous assurer d'avoir les informations suivante :</Text>
        <Box mt={5}>
          <ul>
            <li>Du numéro de Siret et de l'UAI de l'organisme Gestionnaire</li>
            <li>Du numéro de Siret et de l'UAI de l'organisme Formateur</li>
            <li>De l'adreese du lieu de formation</li>
            <li>(Si applicable, du numéro de Siret et de l'UAI du lieu de formation)</li>
            <li>
              Du Code formation diplôme CFD <strong>ou</strong> du numéro de fiche RNCP.
            </li>
            <li>Des périodes de formation</li>
          </ul>
        </Box>
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            type="submit"
            variant="primary"
            onClick={() => {
              onSubmited();
            }}
          >
            Commencer
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export { Prerequis };
