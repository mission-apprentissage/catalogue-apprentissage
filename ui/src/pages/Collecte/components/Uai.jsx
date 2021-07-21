import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Heading, Spinner } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";

const Uai = ({ handleSubmit, siret, isRequired }) => {
  const [show, setShow] = useState(false);

  const { values, handleChange, handleSubmit: handleFormSubmit, errors } = useFormik({
    initialValues: {
      uai: "",
    },
    onSubmit: ({ uai }) => {
      return new Promise(async (resolve) => {
        handleSubmit(uai);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    let timer1 = null;
    if (siret) {
      timer1 = setTimeout(() => setShow(true), 2500);
    } else {
      setShow(true);
    }

    return () => {
      clearTimeout(timer1);
    };
  }, [siret]);

  return (
    <Box mt={5} border="1px solid" borderColor="bluefrance" pt={4} pb={8} px={8}>
      <Heading as="h5" fontSize="0.9rem" mb={5}>
        UAI Apprentissage
      </Heading>
      {!show && siret && (
        <Box>
          <Flex alignItems="center">
            <Spinner mr={2} />
            <Heading as="h5" fontSize="1.1rem" my={5} color="bluefrance">
              Recherche UAI pour le siret ({siret})...
            </Heading>
          </Flex>
        </Box>
      )}
      {show && (
        <Box>
          {siret && (
            <Heading as="h5" fontSize="1.1rem" my={5} color="warning">
              Aucun UAI n'a été trouvé pour ce siret.
            </Heading>
          )}
          <Box mt={2}>
            <Flex flexDirection="row">
              <FormControl isRequired={isRequired} isInvalid={errors.uai} flexDirection="column" w="full" ml={3}>
                <FormLabel htmlFor="uai" mb={3} fontSize="epsilon" fontWeight={400}>
                  Merci de saisir l'<strong>Uai Apprentissage</strong>
                  {siret && "de l'organisme"} :
                </FormLabel>
                <Flex flexDirection="column" w="100%">
                  <Input
                    type="text"
                    name="uai"
                    onChange={handleChange}
                    value={values.uai}
                    autoComplete="off"
                    maxLength="8"
                    required={isRequired}
                  />
                  <FormErrorMessage>{errors.uai}</FormErrorMessage>
                </Flex>
              </FormControl>
              <Flex alignItems="flex-end" ml={3}>
                <Button variant="primary" onClick={handleFormSubmit} loadingText="..." isDisabled={!values.uai}>
                  Valider
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { Uai };
