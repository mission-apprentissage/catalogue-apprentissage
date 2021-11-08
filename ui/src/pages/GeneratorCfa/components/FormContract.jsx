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

const FormContract = () => {
  return (
    <Box>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800"></Box>
      <Box mx="5rem">
        <Heading textStyle="h2" marginBottom="2w">
          FORMULAIRE DU CONTRAT
        </Heading>
        <Box>
          <Formik
            initialValues={{
              contractType: "",
              exemptionType: "",
              contractNumber: "",
              conclusionDate: "",
              startedContractDate: "",
              effectDate: "",
              endContractDate: "",
              hours: "",
              minutes: "",
              workDangerous: "",
              firstYearPayStartedDate: "",
              firstYearPayEndDate: "",
              firstYearPayPercentage: "",
              firstYearPaySmicOrSmec: "",
              secondYearPayStartedDate: "",
              secondYearPayEndDate: "",
              secondYearPayPercentage: "",
              secondYearPaySmicOrSmec: "",
              thirdYearPayStartedDate: "",
              thirdYearPayEndDate: "",
              thirdYearPayPercentage: "",
              thirdYearPaySmicOrSmec: "",
              fourthYearPayStartedDate: "",
              fourthYearPayEndDate: "",
              fourthYearPayPercentage: "",
              fourthYearPaySmicOrSmec: "",
              monthlyGrossSalary: "",
              pensionFund: "",
              food: "",
              lodging: "",
              other: "",
            }}
            validationSchema={Yup.object().shape({
              contractType: Yup.string().required("Requis"),
              exemptionType: Yup.string().required("Requis"),
              contractNumber: Yup.string().required("Requis"),
              conclusionDate: Yup.string(),
              startedContractDate: Yup.string(),
              effectDate: Yup.string(),
              endContractDate: Yup.string(),
              hours: Yup.string(),
              minutes: Yup.string(),
              workDangerous: Yup.string(),
              firstYearPayStartedDate: Yup.string(),
              firstYearPayEndDate: Yup.string(),
              firstYearPayPercentage: Yup.string(),
              firstYearPaySmicOrSmec: Yup.string(),
              secondYearPayStartedDate: Yup.string(),
              secondYearPayEndDate: Yup.string(),
              secondYearPayPercentage: Yup.string(),
              secondYearPaySmicOrSmec: Yup.string(),
              thirdYearPayStartedDate: Yup.string(),
              thirdYearPayEndDate: Yup.string(),
              thirdYearPayPercentage: Yup.string(),
              thirdYearPaySmicOrSmec: Yup.string(),
              fourthtYearPayStartedDate: Yup.string(),
              fourthtYearPayEndDate: Yup.string(),
              fourthtYearPayPercentage: Yup.string(),
              fourthtYearPaySmicOrSmec: Yup.string(),
              monthlyGrossSalary: Yup.string(),
              pensionFund: Yup.string(),
              food: Yup.string(),
              lodging: Yup.string(),
              other: Yup.string(),
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
                      <Field name="contractType">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Type de contrat ou d’avenant :</FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="exemptionType">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Type de dérogation : </FormLabel>
                            <Input {...field} id={field.name} />
                            <Text textStyle="sm" fontStyle="italic">
                              à renseigner si une dérogation existe pour ce contrat
                            </Text>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="contractNumber">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>
                              Numéro du contrat précédent ou du contrat sur lequel porte l’avenant :
                            </FormLabel>
                            <Input {...field} id={field.name} />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="conclusionDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de conclusion :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <Text textStyle="sm">(Date de signature du présent contrat)</Text>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                    <Box w="55%" ml="5w">
                      <Field name="startedContractDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de début d’exécution du contrat :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="effectDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Si avenant, date d’effet :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="endContractDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Date de fin du contrat ou de la période d’apprentissage :</FormLabel>
                            <Input {...field} id={field.name} type="date" />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <FormLabel>Durée hebdomadaire du travail :</FormLabel>
                      <Flex>
                        <Field name="hours">
                          {({ field, meta }) => (
                            <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                              <FormLabel>heures</FormLabel>
                              <Input {...field} id={field.name} />
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                        <Field name="minutes" flex="1">
                          {({ field, meta }) => (
                            <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="2rem">
                              <FormLabel>minutes</FormLabel>
                              <Input {...field} id={field.name} />
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                      </Flex>
                    </Box>
                  </Flex>
                  <Box pt={4}>
                    <Field name="workDangerous">
                      {({ meta }) => (
                        <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                          <HStack>
                            <FormLabel>
                              Travail sur machines dangereuses ou exposition à des risques particuliers :
                            </FormLabel>
                            <Flex ml="2w" alignItems="center">
                              <Field type="radio" name="workDangerous" value="oui" />
                              <Text ml="1w">oui</Text>
                            </Flex>
                            <Flex alignItems="center">
                              <Field type="radio" name="workDangerous" value="non" ml="2w" />
                              <Text ml="1w">non</Text>
                            </Flex>
                          </HStack>
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <FormLabel fontWeight={700}>Rémunération</FormLabel>
                    <FormLabel fontSize="zeta">1 re année, du</FormLabel>
                    <Flex>
                      <Field name="firstYearPayStartedDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <Flex>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="firstYearPayEndDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">au</FormLabel>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="firstYearPayPercentage">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">:</FormLabel>
                              <Input {...field} id={field.name} type="number" />%
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="firstYearPaySmicOrSmec">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">du</FormLabel>
                              <Input {...field} id={field.name} />;
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Flex>
                    <FormLabel fontSize="zeta">2 eme année, du</FormLabel>
                    <Flex>
                      <Field name="secondYearPayStartedDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <Flex>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="secondYearPayEndDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">au</FormLabel>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="secondYearPayPercentage">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">:</FormLabel>
                              <Input {...field} id={field.name} type="num" />%
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="secondYearPaySmicOrSmec">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">du</FormLabel>
                              <Input {...field} id={field.name} />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Flex>
                    <FormLabel fontSize="zeta">3 eme année, du</FormLabel>
                    <Flex>
                      <Field name="thirdYearPayStartedDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <Flex>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="thirdYearPayEndDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">au</FormLabel>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="thirdYearPayPercentage">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">:</FormLabel>
                              <Input {...field} id={field.name} type="num" />%
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="thirdYearPaySmicOrSmec">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">du</FormLabel>
                              <Input {...field} id={field.name} />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Flex>
                    <FormLabel fontSize="zeta">4 eme année, du</FormLabel>
                    <Flex>
                      <Field name="fourthYearPayStartedDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <Flex>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="fourthYearPayEndDate">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">au</FormLabel>
                              <Input {...field} id={field.name} type="date" />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="fourthYearPayPercentage">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">:</FormLabel>
                              <Input {...field} id={field.name} type="num" />%
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name="fourthYearPaySmicOrSmec">
                        {({ field, meta }) => (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w" ml="1w">
                            <Flex>
                              <FormLabel fontSize="zeta">du</FormLabel>
                              <Input {...field} id={field.name} />
                            </Flex>
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </Flex>
                    <Flex>
                      <Box w="55%" flex="1">
                        <Field name="monthlyGrossSalary">
                          {({ field, meta }) => (
                            <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                              <FormLabel fontWeight={700}>Salaire brut mensuel à l’embauche :</FormLabel>
                              <Flex>
                                <Input {...field} id={field.name} />€
                              </Flex>
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                      </Box>
                      <Box w="55%" ml="5w">
                        <Field name="pensionFund">
                          {({ field, meta }) => (
                            <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                              <FormLabel fontWeight={700}>Caisse de retraite complémentaire :</FormLabel>
                              <Input {...field} id={field.name} />
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                      </Box>
                    </Flex>
                    <Box>
                      <FormLabel fontWeight={700}>Avantages en nature, le cas échéant :</FormLabel>
                      <Flex>
                        <Field name="food">
                          {({ field, meta }) => (
                            <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                              <FormLabel fontWeight={700}>Nourriture :</FormLabel>
                              <Flex>
                                <Input {...field} id={field.name} /> <Text ml="2w">€ / repas</Text>
                              </Flex>
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                        <Field name="lodging">
                          {({ field, meta }) => (
                            <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                              <FormLabel fontWeight={700}>Logement :</FormLabel>
                              <Flex>
                                <Input {...field} id={field.name} />
                                <Text ml="2w">€ / mois</Text>
                              </Flex>
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                        <Field name="other">
                          {({ field, meta }) => (
                            <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                              <FormLabel fontWeight={700}>Autre :</FormLabel>
                              <Input {...field} id={field.name} />
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                      </Flex>
                    </Box>
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

export default FormContract;
