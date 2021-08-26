import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";

import { AddEtablissement } from "./components/AddEtablissement";

const Organismes = ({ onSubmited }) => {
  const [gestionnaire, setGestionnaire] = useState(null);
  const [formateur, setFormateur] = useState(null);
  const [alreadySelected, setAlreadySelected] = useState([]);
  const [resetEtablissement, setResetEtablissement] = useState(false);

  const onAdd = (result) => {
    if (result.typeOrganisme === "formateur") {
      setFormateur(result);
      setAlreadySelected([...alreadySelected, result.typeOrganisme]);
    } else if (result.typeOrganisme === "gestionnaire") {
      setGestionnaire(result);
      setAlreadySelected([...alreadySelected, result.typeOrganisme]);
    } else if (result.typeOrganisme === "formateur-gestionnaire") {
      setGestionnaire(result);
      setFormateur(result);
      setAlreadySelected([result.typeOrganisme]);
    }
  };

  return (
    <Box border="1px solid" borderColor="bluefrance" w="full">
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Heading as="h3" fontSize="1.5rem" mt={3} mb={5}>
          Selection des organismes
        </Heading>
        <Box mb={5}>
          <Text mb={1}>À cette étape, nous associons les établissements. Vous aurez besoin:</Text>
          <ul>
            <li>Du numéro de Siret et de l'UAI de l'organisme Gestionnaire</li>
            <li>Du numéro de Siret et de l'UAI de l'organisme Formateur</li>
          </ul>
        </Box>

        <AddEtablissement
          onSubmited={onAdd}
          alreadySelected={alreadySelected}
          reset={resetEtablissement}
          onReset={() => {
            setResetEtablissement(false);
          }}
        />
        {!alreadySelected.includes("formateur-gestionnaire") && alreadySelected.length > 0 && (
          <Box mt={6}>
            {!(alreadySelected.includes("gestionnaire") && alreadySelected.includes("formateur")) && (
              <Heading as="h4" fontSize="0.9rem" my={3}>
                Veuillez renseigner l'organisme{" "}
                {alreadySelected.includes("gestionnaire") ? "Formateur" : "Gestionnaire"}
              </Heading>
            )}
            <AddEtablissement
              onSubmited={onAdd}
              alreadySelected={alreadySelected}
              reset={resetEtablissement}
              onReset={() => {
                setResetEtablissement(false);
              }}
            />
          </Box>
        )}
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            variant="secondary"
            onClick={() => {
              setGestionnaire(null);
              setFormateur(null);
              setAlreadySelected([]);
              setResetEtablissement(true);
            }}
            mr={[0, 4]}
            px={8}
            mb={[3, 0]}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={() => {
              onSubmited({ gestionnaire, formateur });
            }}
            isDisabled={!gestionnaire || !formateur}
          >
            Valider les organismes
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export { Organismes };
