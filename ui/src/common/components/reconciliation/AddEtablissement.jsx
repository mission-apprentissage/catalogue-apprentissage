import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Radio,
  RadioGroup,
  HStack,
  Input,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../httpClient";
import { CardListEtablissements } from "../Search/components/CardListEtablissements";

const AddEtablissement = ({ formation, onClose }) => {
  const [etablissement, setEtablissement] = useState();

  const { values, handleChange, handleSubmit, isSubmitting, resetForm, errors } = useFormik({
    initialValues: {
      uai: "",
      siret: "",
      typeOrganisme: "",
    },
    onSubmit: ({ uai, siret, typeOrganisme }) => {
      return new Promise(async (resolve) => {
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await _post("/api/parcoursup/etablissement", values);

      if (response) {
        setEtablissement(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Flex flexDirection="row">
            <FormControl isRequired isInvalid={errors.uai} flexDirection="column" w="auto" mt={3}>
              <FormLabel htmlFor="uai" mb={3} fontSize="epsilon" fontWeight={400}>
                UAI
              </FormLabel>
              <Flex flexDirection="column" w="100%">
                <Input
                  type="text"
                  name="uai"
                  onChange={handleChange}
                  value={values.uai}
                  autoComplete="off"
                  maxLength="8"
                  required
                />
                <FormErrorMessage>{errors.uai}</FormErrorMessage>
              </Flex>
            </FormControl>
            <FormControl isRequired isInvalid={errors.siret} flexDirection="column" w="auto" mt={3} ml={3}>
              <FormLabel htmlFor="siret" mb={3} fontSize="epsilon" fontWeight={400}>
                SIRET
              </FormLabel>
              <Flex flexDirection="column" w="100%">
                <Input
                  type="text"
                  name="siret"
                  onChange={handleChange}
                  value={values.siret}
                  autoComplete="off"
                  maxLength="14"
                  pattern="[0-9]{14}"
                  required
                />
                <FormErrorMessage>{errors.siret}</FormErrorMessage>
              </Flex>
            </FormControl>
            <Flex alignItems="flex-end" ml={3}>
              <Button variant="primary" onClick={handleSearch} loadingText="...">
                Rechercher
              </Button>
            </Flex>
          </Flex>
        </Box>
        {etablissement && <CardListEtablissements data={etablissement} />}
        {etablissement && (
          <FormControl as="fieldset" display="flex" mt={5}>
            <FormLabel as="div">Ajouter cet organisme en tant que :</FormLabel>
            <RadioGroup id="typeOrganisme" name="typeOrganisme">
              <HStack spacing="24px">
                <Radio
                  value="formateur"
                  size="lg"
                  onChange={(evt) => {
                    handleChange(evt);
                  }}
                >
                  Formateur
                </Radio>
                <Radio
                  value="gestionnaire"
                  size="lg"
                  onChange={(evt) => {
                    handleChange(evt);
                  }}
                >
                  Gestionnaire
                </Radio>
                {/* <Radio value="formateur-gestionnaire">Formateur & gestionnaire</Radio> */}
              </HStack>
            </RadioGroup>
          </FormControl>
        )}
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            variant="secondary"
            onClick={() => {
              // TODO DELETE IF NEW
              // if(etablissement.new)
              // DELETE
              resetForm();
              onClose();
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
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enregistrement des modifications"
            isDisabled={!values.typeOrganisme}
          >
            Ajouter l’organisme
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export { AddEtablissement };
