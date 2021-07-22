import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Heading } from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";
import * as Yup from "yup";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const Rncp = ({ onSubmited }) => {
  const [rncp, setRncp] = useState();

  const { values, handleChange, handleSubmit, errors, touched } = useFormik({
    initialValues: {
      rncp: "",
    },
    validationSchema: Yup.object().shape({
      rncp: Yup.string()
        .matches(
          /^(RNCP)?[0-9]{2,5}$/,
          "Le code RNCP doit être définit et au format 5 ou 9 caractères,  RNCP24440 ou 24440"
        )
        .required("Veuillez saisir un RNCP"),
    }),
    onSubmit: () => {
      return new Promise(async (resolve) => {
        await handleSearch();
        resolve("onSubmitHandler rncp complete");
      });
    },
  });

  const handleSearch = async () => {
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
              <Flex>
                <Flex flexDirection="column" w="100%">
                  <Input
                    type="text"
                    name="rncp"
                    onChange={handleChange}
                    value={values.rncp}
                    autoComplete="off"
                    maxLength="9"
                    pattern="(RNCP)?[0-9]{2,5}"
                    required
                  />
                  {errors.rncp && touched.rncp && <FormErrorMessage>{errors.rncp}</FormErrorMessage>}
                </Flex>
                <Button ml={3} variant="primary" onClick={handleSubmit} loadingText="...">
                  Rechercher
                </Button>
              </Flex>
            </FormControl>
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
              <li>Anciennes Fiches: {rncp.result.ancienne_fiche?.join(", ")}</li>
              <li>Diplôme: {rncp.result.intitule_diplome}</li>
              <li>Niveau: {rncp.result.niveau_europe}</li>
              <li>
                {rncp.result.cfds && <strong>Codes diplômes associés: {rncp.result.cfds?.join(", ")}</strong>}
                {!rncp.result.cfds && <strong>Aucun code diplôme retrouvé</strong>}
              </li>
            </ul>
          </Box>
        )}
      </Flex>
    </>
  );
};

export { Rncp };
