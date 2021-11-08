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
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

// import { _post, _get, _put } from "../../common/httpClient";

const FormLearner = () => {
  const phoneRegExp = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;

  return (
    <Box>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800"></Box>
      <Box mx="5rem">
        <Heading textStyle="h2" marginBottom="2w">
          FORMULAIRE APPRENTI(E)
        </Heading>
        <Box>
          <Formik
            initialValues={{
              name: "",
              firstname: "",
              nir: "",
              number: "",
              complement: "",
              zipCode: "",
              townShip: "",
              phone: "",
              email: "",
              nameLegal: "",
              numberLegal: "",
              wayLegal: "",
              complementLegal: "",
              zipCodeLegal: "",
              townShipLegal: "",
              birth: "",
              gender: "",
              departmentOfBirth: "",
              townShipOfBirth: "",
              nationality: "",
              socialRegime: "",
              sportList: "",
              handicapped: "",
              situationContract: "",
              diplomOrTitle: "",
              lastClass: "",
              lastDiplomOrTitle: "",
              highDiplom: "",
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required("Requis"),
              firstname: Yup.string().required("Requis"),
              nir: Yup.string().required("Requis"),
              number: Yup.string().required("Requis"),
              complement: Yup.string().required("Requis"),
              zipCode: Yup.string().required("Requis"),
              townShip: Yup.string().required("Requis"),
              nameLegal: Yup.string(),
              numberLegal: Yup.string(),
              wayLegal: Yup.string(),
              complementLegal: Yup.string(),
              zipCodeLegal: Yup.string(),
              townShipLegal: Yup.string(),
              birth: Yup.string().required("Requis"),
              gender: Yup.string().required("Requis"),
              departmentOfBirth: Yup.string().required("Requis"),
              townShipOfBirth: Yup.string().required("Requis"),
              nationality: Yup.string().required("Requis"),
              socialRegime: Yup.string().required("Requis"),
              sportList: Yup.string().required("Requis"),
              handicapped: Yup.string().required("Requis"),
              situationContract: Yup.string().required("Requis"),
              diplomOrTitle: Yup.string().required("Requis"),
              lastClass: Yup.string().required("Requis"),
              lastDiplomOrTitle: Yup.string().required("Requis"),
              highDiplom: Yup.string().required("Requis"),
              phone: Yup.string().matches(phoneRegExp, "Phone number is not valid").required("Requis"),
              email: Yup.string().email("Email invalide").required("Required"),
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
                      <Field name="name">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Nom de naissance de l’apprenti(e) :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="firstname">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Prénom de l’apprenti(e) :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="nir">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>NIR de l’apprenti(e)* :</FormLabel>
                            <Text fontSize="caption" fontStyle="italic">
                              *Pour les employeurs du secteur privé dans le cadre L.6353-10 du code du travail
                            </Text>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Text mb={5}>Adresse de l’apprenti(e) :</Text>
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
                      <Field name="phone">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Téléphone :</FormLabel>
                            <Input {...field} id={field.name} type="tel" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="email">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Courriel :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Text fontWeight="bold" mb={3}>
                        Représentant légal <Text as="span">(à renseigner si l’apprenti est mineur non émancipé)</Text>
                      </Text>
                      <Field name="nameLegal">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Nom de naissance et prénom :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Text fontWeight="bold" mb={3}>
                        Adresse du représentant légal :
                      </Text>
                      <Field name="numberLegal">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>N° :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="wayLegal">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Voie :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="complementLegal">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Complément :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="zipCodeLegal">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Code postal :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="townShipLegal">
                        {({ field, meta }) => (
                          <FormControl isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Commune :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                    <Box w="45%" ml="5w">
                      <Field name="birth">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de naissance :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="gender">
                        {({ meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Sexe :</FormLabel>
                            <HStack w="40%">
                              <Flex mx="2w" alignItems="center">
                                <Field type="radio" name="gender" value="M" />
                                <Text ml="1w">M</Text>
                              </Flex>
                              <Flex alignItems="center" flex="1">
                                <Field type="radio" name="gender" value="F" />
                                <Text ml="1w">F</Text>
                              </Flex>
                            </HStack>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="departmentOfBirth">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Département de naissance :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="townShipOfBirth">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Commune de naissance :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="nationality">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Nationalité :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="socialRegime">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Régime social :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="sportList">
                        {({ meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>
                              Déclare être inscrit sur la liste des sportifs, entraîneurs, arbitres et juges sportifs de
                              haut niveau :
                            </FormLabel>
                            <HStack w="40%">
                              <Flex mx="2w" alignItems="center">
                                <Field type="radio" name="sportList" value="oui" />
                                <Text ml="1w">oui</Text>
                              </Flex>
                              <Flex alignItems="center">
                                <Field type="radio" name="sportList" value="non" ml="2w" />
                                <Text ml="1w">non</Text>
                              </Flex>
                            </HStack>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="handicapped">
                        {({ meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Déclare bénéficier de la reconnaissance travailleur handicapé :</FormLabel>
                            <HStack w="40%">
                              <Flex mx="2w" alignItems="center">
                                <Field type="radio" name="handicapped" value="oui" />
                                <Text ml="1w">oui</Text>
                              </Flex>
                              <Flex alignItems="center">
                                <Field type="radio" name="handicapped" value="non" ml="2w" />
                                <Text ml="1w">non</Text>
                              </Flex>
                            </HStack>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="situationContract">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Situation avant ce contrat :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="diplomOrTitle">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Dernier diplôme ou titre préparé :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="lastClass">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Dernière classe / année suivie :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="lastDiplomOrTitle">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Intitulé précis du dernier diplôme ou titre préparé :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="highDiplom">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Diplôme ou titre le plus élevé obtenu :</FormLabel>
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

export default FormLearner;
