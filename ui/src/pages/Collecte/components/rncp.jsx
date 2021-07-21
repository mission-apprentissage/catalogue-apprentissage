import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Heading } from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const Rncp = ({ onSubmited }) => {
  const [rncp, setRncp] = useState();

  const { values, handleChange, errors } = useFormik({
    initialValues: {
      rncp: "",
    },
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await _post(`${endpointTCO}/rncp`, { rncp: values.rncp });
      if (response) {
        setRncp(response);
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
          Code Fiche RNCP
        </Heading>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Flex flexDirection="row">
            <FormControl isRequired isInvalid={errors.rncp} flexDirection="column" w="full" ml={3}>
              <FormLabel htmlFor="rncp" mb={3} fontSize="epsilon" fontWeight={400}>
                RNCP
              </FormLabel>
              <Flex flexDirection="column" w="100%">
                <Input
                  type="text"
                  name="rncp"
                  onChange={handleChange}
                  value={values.rncp}
                  autoComplete="off"
                  maxLength="9"
                  pattern="[0-9A-Z]{8}[A-Z]?"
                  required
                />
                <FormErrorMessage>{errors.rncp}</FormErrorMessage>
              </Flex>
            </FormControl>
            <Flex alignItems="flex-end" ml={3}>
              <Button variant="primary" onClick={handleSearch} loadingText="...">
                Rechercher
              </Button>
            </Flex>
          </Flex>
        </Box>
        {rncp && (
          <Box>
            <ul>
              {rncp.result.active_inactive && <li>La fiche {rncp.result.code_rncp} est à jour et actif.</li>}
              {!rncp.result.active_inactive && (
                <li>
                  La fiche {rncp.result.code_rncp} n'est plus actif ! <br />
                  Nouvelle Fiche {rncp.result.nouvelle_fiche}.
                </li>
              )}

              <li>Diplôme: {rncp.result.intitule_diplome}</li>
              <li>Niveau: {rncp.result.niveau_europe}</li>
              <li>Codes diplômes associés: {rncp.result.cfds.join(", ")})</li>
              <li>--</li>
              <li>Anciennes Fiches: {rncp.result.ancienne_fiche.join(", ")}</li>
            </ul>
          </Box>
        )}
      </Flex>
    </>
  );
};

export { Rncp };
