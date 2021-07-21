import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

function Siret({ onFetched, reset, onReset }) {
  const [isFetching, setIsFetching] = useState(false);

  const { values, handleChange, errors, resetForm } = useFormik({
    initialValues: {
      siret: "",
    },
  });

  useEffect(() => {
    if (reset) {
      resetForm();
      onReset();
    }
  }, [onReset, reset, resetForm]);

  const handleSearch = async (e) => {
    e.preventDefault();
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
          <Button variant="primary" onClick={handleSearch} loadingText="Rechercher" isLoading={isFetching}>
            Rechercher
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export { Siret };
