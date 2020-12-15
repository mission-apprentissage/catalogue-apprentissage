import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Box,
  Stack,
  Button,
  Text,
  HStack,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";

import { _post } from "../../../common/httpClient";

export default function TransitionsModal({ isOpen, onClose, onSuccess }) {
  const [etablissement, setEtablissement] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState(false);
  const [values, setValues] = React.useState({
    uai: "",
    siret: "",
    type: "gestionnaire",
    matching: ["utilisateur"],
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (values.siret === "" || values.siret.length !== 14) {
      setErrors(true);
      return;
    }
    setLoading(true);

    const response = await _post("/api/psformation/etablissement", values);

    if (response) {
      setEtablissement(response);
      setLoading(false);
      setValues({ ...values, siret: "", uai: "" });
    }
  };

  const handleChange = (e) => {
    setErrors(false);
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajouter un établissement :</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSearch}>
              <Stack direction="row" spacing={4}>
                <FormControl>
                  <FormLabel>UAI</FormLabel>
                  <Input type="text" name="uai" onChange={handleChange} autoComplete="off" />
                </FormControl>

                <FormControl isInvalid={errors}>
                  <FormLabel>SIRET</FormLabel>
                  <Input type="text" name="siret" onChange={handleChange} autoComplete="off" />
                  <FormErrorMessage>Siret obligatoire (14 chiffres)</FormErrorMessage>
                </FormControl>
                <Flex align="flex-end">
                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={etablissement || loading ? true : false}
                    variant="solid"
                  >
                    Rechercher
                  </Button>
                </Flex>
              </Stack>
            </form>
            {etablissement && (
              <>
                <Box py="6">
                  <Alert status="success">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>{etablissement.entreprise_raison_sociale}</AlertTitle>
                      <AlertDescription display="block">
                        <Text>{etablissement.adresse}</Text>
                      </AlertDescription>
                    </Box>
                  </Alert>
                </Box>
                <Box py="6">
                  <FormControl as="fieldset">
                    <FormLabel as="legend">Type d'établissement :</FormLabel>
                    <RadioGroup defaultValue="gestionnaire" onChange={(value) => setValues({ ...values, type: value })}>
                      <HStack spacing="24px">
                        <Radio value="formateur">Formateur</Radio>
                        <Radio value="gestionnaire">Gestionnaire</Radio>
                        <Radio value="formateur-gestionnaire">Formateur & gestionnaire</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              disabled={loading || !etablissement}
              colorScheme="blue"
              onClick={() =>
                onSuccess.mutate({ ...etablissement, type: values.type, matched_uai: values.matching, uai: values.uai })
              }
            >
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
