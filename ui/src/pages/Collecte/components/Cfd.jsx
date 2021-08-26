import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Heading } from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";
import * as Yup from "yup";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const Cfd = ({ onSubmited }) => {
  const [cfd, setCfd] = useState();

  const { values, handleChange, handleSubmit, errors, touched } = useFormik({
    initialValues: {
      cfd: "",
    },
    validationSchema: Yup.object().shape({
      cfd: Yup.string()
        .matches(
          /^[0-9A-Z]{8}[A-Z]?$/,
          "Le code formation diplôme doit être définit et au format 8 caractères ou 9 avec la lettre specialité"
        )
        .required("Veuillez saisir un CFD"),
    }),
    onSubmit: () => {
      return new Promise(async (resolve) => {
        await handleSearch();
        resolve("onSubmitHandler cfd complete");
      });
    },
  });

  const handleSearch = async () => {
    try {
      const response = await _post(`${endpointTCO}/cfd`, { cfd: values.cfd });
      if (response) {
        setCfd(response);
        onSubmited(response.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Heading as="h3" fontSize="1.5rem" my={3}>
          Code Formation Diplôme
        </Heading>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Flex flexDirection="row">
            <FormControl isRequired isInvalid={errors.cfd} flexDirection="column" w="full" ml={3}>
              <FormLabel htmlFor="cfd" mb={3} fontSize="epsilon" fontWeight={400}>
                CFD
              </FormLabel>
              <Flex>
                <Flex flexDirection="column" w="100%">
                  <Input
                    type="text"
                    name="cfd"
                    onChange={handleChange}
                    value={values.cfd}
                    autoComplete="off"
                    maxLength="9"
                    pattern="[0-9A-Z]{8}[A-Z]?"
                    required
                  />
                  {errors.cfd && touched.cfd && <FormErrorMessage>{errors.cfd}</FormErrorMessage>}
                </Flex>
                <Button variant="primary" onClick={handleSubmit} loadingText="..." ml={3}>
                  Rechercher
                </Button>
              </Flex>
            </FormControl>
          </Flex>
        </Box>
        {cfd && (
          <Box>
            <ul>
              {cfd.result.cfd === values.cfd && (
                <li>Le Code Formation diplôme {cfd.result.cfd} est à jour et actif.</li>
              )}
              {cfd.result.cfd !== values.cfd && <li>Le Code Formation diplôme {values.cfd} n'est plus actif</li>}
              <li>Diplôme: {cfd.result.diplome}</li>
              <li>Intitulé court (normalisé): {cfd.result.intitule_court}</li>
              <li>Intitulé long (normalisé): {cfd.result.intitule_long}</li>
              <li>Niveau: {cfd.result.niveau}</li>
              <li>
                Code RNCP Actif associé: {cfd.result.rncp.code_rncp} <br />
                (Anciens codes RNCP: {cfd.result.rncp.ancienne_fiche?.join(", ")})
              </li>
            </ul>
          </Box>
        )}
      </Flex>
    </>
  );
};

export { Cfd };
