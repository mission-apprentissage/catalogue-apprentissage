import React from "react";
import { Box, Heading, Button, FormControl, FormLabel, Input, FormErrorMessage, Text, Flex } from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

// import { _post, _get, _put } from "../../common/httpClient";

const FormLearningMaster = () => {
  return (
    <Box>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800"></Box>
      <Box mx="5rem">
        <Heading textStyle="h2" marginBottom="2w">
          FORMULAIRE MAÎTRE D’APPRENTISSAGE
        </Heading>
        <Box>
          <Formik
            initialValues={{
              nameMaster1: "",
              firstnameMaster1: "",
              birthMaster1: "",
              nameMaster2: "",
              firstnameMaster2: "",
              birthMaster2: "",
            }}
            validationSchema={Yup.object().shape({
              nameMaster1: Yup.string().required("Requis"),
              firstnameMaster1: Yup.string().required("Requis"),
              birthMaster1: Yup.string().required("Requis"),
              nameMaster2: Yup.string(),
              firstnameMaster2: Yup.string(),
              birthMaster2: Yup.string(),
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
                      <FormLabel fontWeight={700}>Maître d’apprentissage n°1 </FormLabel>
                      <Field name="nameMaster1">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel fontWeight={700}>Nom de naissance :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="firstnameMaster1">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel fontWeight={700}>Prénom</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="birthMaster1">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de naissance :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                    <Box w="55%" ml="5w">
                      <FormLabel fontWeight={700}>Maître d’apprentissage n°2 </FormLabel>
                      <Field name="nameMaster2">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel fontWeight={700}>Nom de naissance :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="firstnameMaster2">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel fontWeight={700}>Prénom</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="birthMaster2">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de naissance :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                  </Flex>
                  <Text fontStyle="italic" fontWeight={700} textStyle="sm">
                    L’employeur atteste sur l’honneur que le maître d’apprentissage répond à l’ensemble des critères
                    d’éligibilité à cette fonction.
                  </Text>
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

export default FormLearningMaster;
