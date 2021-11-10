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
import { useFormik } from "formik";
import * as Yup from "yup";

// import { _post, _get, _put } from "../../common/httpClient";

const FormEmployer = () => {
  const phoneRegExp = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;
  const { values, handleChange, handleSubmit, errors, touched } = useFormik({
    initialValues: {
      priveOrPublic: "",
      name: "",
      number: "",
      way: "",
      complement: "",
      zipCode: "",
      townShip: "",
      phone: "",
      email: "",
      siret: "",
      typeEmployer: "",
      specificEmployer: "",
      companyCode: "",
      numberOfEmployees: "",
      collectiveAgreement: "",
      codeIDCC: "",
      publicSector: "",
    },
    validationSchema: Yup.object().shape({
      priveOrPublic: Yup.string().required("Requis"),
      name: Yup.string().required("Requis"),
      number: Yup.string().required("Requis"),
      way: Yup.string().required("Requis"),
      complement: Yup.string().required("Requis"),
      zipCode: Yup.string().required("Requis"),
      townShip: Yup.string().required("Requis"),
      phone: Yup.string().matches(phoneRegExp, "Phone number is not valid").required("Requis"),
      email: Yup.string().email("Email invalide").required("Required"),
      siret: Yup.string().required("Requis"),
      typeEmployer: Yup.string().required("Requis"),
      specificEmployer: Yup.string().required("Requis"),
      companyCode: Yup.string().required("Requis"),
      numberOfEmployees: Yup.string().required("Requis"),
      collectiveAgreement: Yup.string().required("Requis"),
      codeIDCC: Yup.string().required("Requis"),
      publicSector: Yup.string().required("Requis"),
    }),
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });
  return (
    <Box>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800"></Box>
      <Box mx="5rem">
        <Heading textStyle="h2" marginBottom="2w">
          FORMULAIRE EMPLOYEUR
        </Heading>
        <Box>
          <FormControl>
            <HStack w="40%">
              <Flex alignItems="center">
                <input
                  type="radio"
                  name="priveOrPublic"
                  value="prive"
                  checked={values.priveOrPublic === "prive"}
                  onChange={handleChange}
                />
                <Text ml="1w">employeur privé</Text>
              </Flex>
              <Flex alignItems="center">
                <input
                  type="radio"
                  name="priveOrPublic"
                  value="public"
                  checked={values.priveOrPublic === "public"}
                  onChange={handleChange}
                />
                <Text ml="1w">employeur « public »</Text>
              </Flex>
            </HStack>
            {errors.priveOrPublic && touched.priveOrPublic && (
              <FormErrorMessage>{errors.priveOrPublic}</FormErrorMessage>
            )}
          </FormControl>
          <Flex>
            <Box w="55%" flex="1">
              <FormControl isRequired mt={2} isInvalid={errors.name}>
                <FormLabel>Nom et prénom ou dénomination :</FormLabel>
                <Input type="text" name="name" onChange={handleChange} value={values.name} required />
                {errors.name && touched.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
              </FormControl>
              <FormLabel my={3} fontWeight={700}>
                Adresse de l’établissement d’exécution du contrat :
              </FormLabel>
              <FormControl isRequired mt={2} isInvalid={errors.number}>
                <FormLabel>N° :</FormLabel>
                <Input type="text" name="number" onChange={handleChange} value={values.number} required />
                {errors.number && touched.number && <FormErrorMessage>{errors.number}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.way}>
                <FormLabel>Voie :</FormLabel>
                <Input type="text" name="way" onChange={handleChange} value={values.way} required />
                {errors.way && touched.way && <FormErrorMessage>{errors.way}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.complement}>
                <FormLabel>Complément :</FormLabel>
                <Input type="text" name="complement" onChange={handleChange} value={values.complement} required />
                {errors.complement && touched.complement && <FormErrorMessage>{errors.complement}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.zipCode}>
                <FormLabel>Code postal :</FormLabel>
                <Input type="text" name="zipCode" onChange={handleChange} value={values.zipCode} required />
                {errors.zipCode && touched.zipCode && <FormErrorMessage>{errors.zipCode}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.townShip}>
                <FormLabel>Commune :</FormLabel>
                <Input type="text" name="townShip" onChange={handleChange} value={values.townShip} required />
                {errors.townShip && touched.townShip && <FormErrorMessage>{errors.townShip}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.phone}>
                <FormLabel>Téléphone :</FormLabel>
                <Input type="tel" name="phone" onChange={handleChange} value={values.phone} required />
                {errors.phone && touched.phone && <FormErrorMessage>{errors.phone}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.email}>
                <FormLabel>Courriel :</FormLabel>
                <Input type="email" name="email" onChange={handleChange} value={values.email} required />
                {errors.email && touched.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
              </FormControl>
            </Box>
            <Box w="45%" ml="5w">
              <FormControl isRequired mt={2} isInvalid={errors.siret}>
                <FormLabel>N°SIRET de l’établissement d’exécution du contrat :</FormLabel>
                <Input type="siret" name="siret" onChange={handleChange} value={values.siret} required />
                {errors.siret && touched.siret && <FormErrorMessage>{errors.siret}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.typeEmployer}>
                <FormLabel>Type d’employeur :</FormLabel>
                <Input type="text" name="typeEmployer" onChange={handleChange} value={values.typeEmployer} required />
                {errors.typeEmployer && touched.typeEmployer && (
                  <FormErrorMessage>{errors.typeEmployer}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.specificEmployer}>
                <FormLabel>Employeur spécifique :</FormLabel>
                <Input
                  type="text"
                  name="specificEmployer"
                  onChange={handleChange}
                  value={values.specificEmployer}
                  required
                />
                {errors.specificEmployer && touched.specificEmployer && (
                  <FormErrorMessage>{errors.specificEmployer}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.companyCode}>
                <FormLabel>Code activité de l’entreprise (NAF) :</FormLabel>
                <Input type="text" name="companyCode" onChange={handleChange} value={values.companyCode} required />
                {errors.companyCode && touched.companyCode && <FormErrorMessage>{errors.companyCode}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.numberOfEmployees}>
                <FormLabel>Effectif total salariés de l’entreprise :</FormLabel>
                <Input
                  type="text"
                  name="numberOfEmployees"
                  onChange={handleChange}
                  value={values.numberOfEmployees}
                  required
                />
                {errors.numberOfEmployees && touched.numberOfEmployees && (
                  <FormErrorMessage>{errors.numberOfEmployees}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.collectiveAgreement}>
                <FormLabel>Convention collective applicable :</FormLabel>
                <Input
                  type="text"
                  name="collectiveAgreement"
                  onChange={handleChange}
                  value={values.collectiveAgreement}
                  required
                />
                {errors.collectiveAgreement && touched.collectiveAgreement && (
                  <FormErrorMessage>{errors.collectiveAgreement}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.codeIDCC}>
                <FormLabel>Code IDCC de la convention :</FormLabel>
                <Input type="text" name="codeIDCC" onChange={handleChange} value={values.codeIDCC} required />
                {errors.codeIDCC && touched.codeIDCC && <FormErrorMessage>{errors.codeIDCC}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired mt={2} isInvalid={errors.publicSector}>
                <FormLabel>
                  *Pour les employeurs du secteur public, adhésion de l’apprenti au régime spécifique d’assurance
                  chômage :
                </FormLabel>
                <Input type="text" name="publicSector" onChange={handleChange} value={values.publicSector} required />
                {errors.publicSector && touched.publicSector && (
                  <FormErrorMessage>{errors.publicSector}</FormErrorMessage>
                )}
              </FormControl>
            </Box>
          </Flex>
          <Box mt="2rem">
            <Button variant="primary" ml={3} onClick={handleSubmit} type="submit">
              Enregistrer
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FormEmployer;
