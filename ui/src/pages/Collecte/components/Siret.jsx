import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";
import * as Yup from "yup";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

function Siret({ onFetched, reset, onReset }) {
  const [isFetching, setIsFetching] = useState(false);

  const { values, handleChange, handleSubmit, errors, resetForm, touched } = useFormik({
    initialValues: {
      siret: "",
    },
    validationSchema: Yup.object().shape({
      siret: Yup.string()
        .matches(/[0-9]{14}/, "Le siret est code sur 14 caractères numérique")
        .required("Veuillez saisir un siret"),
    }),
    onSubmit: () => {
      return new Promise(async (resolve) => {
        await handleSearch();
        resolve("onSubmitHandler siret complete");
      });
    },
  });

  useEffect(() => {
    if (reset) {
      resetForm();
      onReset();
    }
  }, [onReset, reset, resetForm]);

  const handleSearch = async () => {
    setIsFetching(true);
    try {
      const response = await _post("/api/entity/etablissement", { query: { siret: values.siret } });
      if (response) {
        const { result } = await _post(`${endpointTCO}/siret`, { siret: values.siret });
        const [lat, lng] = result.geo_coordonnees.split(",");
        if (!response.new) {
          onFetched({ ...response, latitude: lat, longitude: lng });
        } else {
          onFetched({ ...result, latitude: lat, longitude: lng, new: true });
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsFetching(false);
  };

  return (
    <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
      <Flex flexDirection="row">
        <FormControl isRequired isInvalid={errors.siret} flexDirection="column" w="full" ml={3}>
          <FormLabel htmlFor="siret" mb={3} fontSize="epsilon" fontWeight={400}>
            SIRET
          </FormLabel>
          <Flex>
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
              {errors.siret && touched.siret && <FormErrorMessage>{errors.siret}</FormErrorMessage>}
            </Flex>
            <Button variant="primary" ml={3} onClick={handleSubmit} loadingText="Rechercher" isLoading={isFetching}>
              Rechercher
            </Button>
          </Flex>
        </FormControl>
      </Flex>
    </Box>
  );
}

export { Siret };
