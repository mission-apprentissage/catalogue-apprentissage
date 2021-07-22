import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Heading } from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const Periodes = ({ onSubmited }) => {
  const [periodes, setPeriodes] = useState([]);

  const { values, handleChange, handleSubmit, errors, touched, resetForm } = useFormik({
    initialValues: {
      periode: "",
    },
    validationSchema: Yup.object().shape({
      periode: Yup.string()
        .matches(/^[0-9]{4}-[0-9]{2}$/, "Année-Mois exemple 2021-09")
        .required("Veuillez saisir une période"),
    }),
    onSubmit: ({ periode }) => {
      return new Promise(async (resolve) => {
        setPeriodes([...periodes, periode]);
        resetForm();
        resolve("onSubmitHandler periode complete");
      });
    },
  });

  return (
    <>
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Heading as="h3" fontSize="1.5rem" my={3}>
          Ajouter une ou plusieurs période(s) de formations
        </Heading>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Flex flexDirection="row">
            <FormControl isRequired isInvalid={errors.periode} flexDirection="column" w="full" ml={3}>
              <FormLabel htmlFor="periode" mb={3} fontSize="epsilon" fontWeight={400}>
                Période
              </FormLabel>
              <Flex>
                <Flex flexDirection="column" w="100%">
                  <Input
                    type="text"
                    name="periode"
                    onChange={handleChange}
                    value={values.periode}
                    autoComplete="off"
                    placeholder="annee mois exemple: 2021-09"
                    required
                  />
                  {errors.periode && touched.periode && <FormErrorMessage>{errors.periode}</FormErrorMessage>}
                </Flex>
                <Button ml={3} variant="primary" onClick={handleSubmit} loadingText="...">
                  Ajouter
                </Button>
              </Flex>
            </FormControl>
          </Flex>
          {periodes.length > 0 && (
            <Box>
              <ul>
                {periodes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Box>
          )}
          <Flex justifyContent="flex-end" mt={6}>
            <Button
              ml={3}
              variant="primary"
              onClick={() => {
                onSubmited(JSON.stringify(periodes));
              }}
              loadingText="..."
              isDisabled={periodes.length === 0}
            >
              Valider
            </Button>
          </Flex>
        </Box>
      </Flex>
    </>
  );
};

export { Periodes };
