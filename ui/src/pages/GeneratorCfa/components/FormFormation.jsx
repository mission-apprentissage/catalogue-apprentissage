import React from "react";
import {
  Box,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Text,
  Flex,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

// import { _post, _get, _put } from "../../common/httpClient";

const FormFormation = () => {
  return (
    <Box>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800"></Box>
      <Box mx="5rem">
        <Heading textStyle="h2" marginBottom="2w">
          FORMULAIRE DE LA FORMATION
        </Heading>
        <Box>
          <Formik
            initialValues={{
              companyCfa: "",
              nameResponsibleCFA: "",
              uaiCFA: "",
              siretCFA: "",
              number: "",
              way: "",
              complement: "",
              zipCode: "",
              townShip: "",
              titleTargeted: "",
              preciseTitle: "",
              diplomaCode: "",
              codeRNCP: "",
              startDateTrainingCycle: "",
              endDateExams: "",
              trainingDuration: "",
              checkEmployer: "",
              madeIn: "",
            }}
            validationSchema={Yup.object().shape({
              companyCfa: Yup.string().required("Requis"),
              nameResponsibleCFA: Yup.string().required("Requis"),
              uaiCFA: Yup.string().required("Requis"),
              siretCFA: Yup.string().required("Requis"),
              number: Yup.string().required("Requis"),
              way: Yup.string().required("Requis"),
              complement: Yup.string().required("Requis"),
              zipCode: Yup.string().required("Requis"),
              townShip: Yup.string().required("Requis"),
              titleTargeted: Yup.string().required("Requis"),
              preciseTitle: Yup.string().required("Requis"),
              diplomaCode: Yup.string().required("Requis"),
              codeRNCP: Yup.string().required("Requis"),
              startDateTrainingCycle: Yup.string().required("Requis"),
              endDateExams: Yup.string().required("Requis"),
              trainingDuration: Yup.string().required("Requis"),
              checkEmployer: Yup.string().required("Requis"),
              madeIn: Yup.string().required("Requis"),
            })}
            onSubmit={(value) => {
              console.log(value);
            }}
          >
            {({ status = {} }) => {
              return (
                <Form>
                  <Field name="companyCfa">
                    {({ meta }) => (
                      <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                        <HStack w="40%">
                          <FormLabel>CFA d’entreprise :</FormLabel>
                          <Flex alignItems="center">
                            <Field type="radio" name="companyCfa" value="oui" />
                            <Text ml="1w">oui</Text>
                          </Flex>
                          <Flex alignItems="center">
                            <Field type="radio" name="companyCfa" value="non" ml="2w" />
                            <Text ml="1w">non</Text>
                          </Flex>
                        </HStack>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Flex>
                    <Box w="55%" flex="1">
                      <Field name="nameResponsibleCFA">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Dénomination du CFA responsable :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="uaiCFA">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>N° UAI du CFA :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="siretCFA">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>N° SIRET CFA :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <FormLabel fontWeight={700}>Adresse du CFA responsable : </FormLabel>
                      <Field name="number">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>N° :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="way">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Voie :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="complement">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Complément :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="zipCode">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Code postal :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="townShip">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Commune :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                    <Box w="45%" ml="5w">
                      <Field name="titleTargeted">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Diplôme ou titre visé par l’apprenti :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="preciseTitle">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Intitulé précis :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="diplomaCode">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Code du diplôme :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="codeRNCP">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Code RNCP :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <FormLabel fontWeight={700}>Organisation de la formation en CFA :</FormLabel>
                      <Field name="startDateTrainingCycle">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de début du cycle de formation : </FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="endDateExams">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date prévue de fin des épreuves ou examens :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="trainingDuration">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Durée de la formation : </FormLabel>
                            <Flex>
                              <Input {...field} id={field.name} />
                              <Text ml="1w">heures</Text>
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                  </Flex>
                  <Box>
                    <Field name="checkEmployer">
                      {({ field, meta }) => (
                        <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                          <Flex>
                            <Checkbox {...field} id={field.name} type="checkbox" value="oui" />
                            <FormLabel ml={3} mt={2} fontWeight={700} textStyle="sm" fontStyle="italic">
                              L’employeur atteste disposer de l’ensemble des pièces justificatives nécessaires au dépôt
                              du contrat
                            </FormLabel>
                          </Flex>
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="madeIn">
                      {({ field, meta }) => (
                        <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                          <FormLabel>Fait à :</FormLabel>
                          <Input {...field} id={field.name} />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
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

export default FormFormation;
