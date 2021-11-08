import React from "react";
import { Box, Heading, Button, FormControl, FormLabel, Input, FormErrorMessage, Text, Flex } from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

// import { _post, _get, _put } from "../../common/httpClient";

const FormSubmittingContract = () => {
  return (
    <Box>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800"></Box>
      <Box mx="5rem">
        <Heading textStyle="h2" marginBottom="2w">
          FORMULAIRE DE CADRE RÉSERVÉ À L’ORGANISME EN CHARGE DU DÉPÔT DU CONTRAT
        </Heading>
        <Box>
          <Formik
            initialValues={{
              organizationName: "",
              dateReceipt: "",
              number: "",
              siret: "",
              decisionDate: "",
              riderNumber: "",
            }}
            validationSchema={Yup.object().shape({
              organizationName: Yup.string().required("Requis"),
              dateReceipt: Yup.string().required("Requis"),
              number: Yup.string().required("Requis"),
              siret: Yup.string().required("Requis"),
              decisionDate: Yup.string().required("Requis"),
              riderNumber: Yup.string().required("Requis"),
            })}
            onSubmit={(value) => {
              console.log(value);
            }}
          >
            {({ status = {} }) => {
              return (
                <Form>
                  <Flex>
                    <Box w="55%" flex="1">
                      <Field name="organizationName">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel fontWeight={700}>Nom de l’organisme :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="dateReceipt">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de réception du dossier complet :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="number">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>N° de dépôt :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                    <Box w="55%" ml="5w">
                      <Field name="siret">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel fontWeight={700}>N° SIRET de l’organisme :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="decisionDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de la décision : </FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="riderNumber">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Numéro d’avenant :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                  </Flex>

                  <Box mt="2rem">
                    <Button textStyle="sm" variant="primary" type="submit">
                      Enregistrer
                    </Button>
                  </Box>
                  {status.error && (
                    <Text color="error" mt={2}>
                      {status.error}
                    </Text>
                  )}
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
};

export default FormSubmittingContract;
