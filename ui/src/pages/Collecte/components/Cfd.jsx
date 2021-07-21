import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Heading } from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const Cfd = ({ onSubmited }) => {
  const [cfd, setCfd] = useState();

  const { values, handleChange, errors } = useFormik({
    initialValues: {
      cfd: "",
    },
    // onSubmit: () => {
    //   return new Promise(async (resolve) => {
    //     onSubmited(cfd.result);
    //     resolve("onSubmitHandler cfd complete");
    //   });
    // },
  });

  const handleSearch = async (e) => {
    e.preventDefault();
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
                <FormErrorMessage>{errors.cfd}</FormErrorMessage>
              </Flex>
            </FormControl>
            <Flex alignItems="flex-end" ml={3}>
              <Button variant="primary" onClick={handleSearch} loadingText="...">
                Rechercher
              </Button>
            </Flex>
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
                (Anciens codes RNCP: {cfd.result.rncp.ancienne_fiche.join(", ")})
              </li>
            </ul>
          </Box>
        )}
      </Flex>
      {/* <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enregistrement des modifications"
            isDisabled={!values.cfd}
          >
            Confirmer ce diplôme
          </Button>
        </Flex>
      </Box> */}
    </>
  );
};

export { Cfd };
