import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  VStack,
  Heading,
  Grid,
  UnorderedList,
  ListItem,
  Spinner,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { _post } from "../../../common/httpClient";
import { CardListEtablissements } from "../../../common/components/CardListEtablissements";
import Map from "./Map";
import { Siret } from "./Siret";
import { Uai } from "./Uai";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const InformationConventionnement = ({ etablissement, onFetched }) => {
  const [conventionnementResp, setConventionnementResp] = useState();

  useEffect(() => {
    async function run() {
      try {
        const { etablissement: updatedEtablissement, error } = await _post(`${endpointTCO}/services/etablissement`, {
          ...etablissement,
        });

        if (error) {
          console.error(error);
          return;
        }

        // console.log(response);
        setConventionnementResp(updatedEtablissement);
        onFetched(etablissement);
      } catch (err) {
        console.error(err);
      }
    }
    run();
  }, [etablissement, onFetched]);

  return (
    <Box mt={5} border="1px solid" borderColor="bluefrance" pt={4} pb={8} px={8}>
      <Heading as="h5" fontSize="0.9rem" mb={5}>
        Information établissement
      </Heading>
      {!conventionnementResp && (
        <Box>
          <Flex alignItems="center">
            <Spinner mr={2} />
            <Heading as="h5" fontSize="1.1rem" my={5} color="bluefrance">
              Recherche des informations relative à cet organisme.
            </Heading>
          </Flex>
        </Box>
      )}
      {conventionnementResp && (
        <Box>
          <ul>
            <li>Conventionné: {conventionnementResp.computed_conventionne}</li>
            <li>Déclaré en préfecture: {conventionnementResp.computed_declare_prefecture}</li>
          </ul>
        </Box>
      )}
    </Box>
  );
};

const AddEtablissement = ({ onSubmited, alreadySelected, reset, onReset }) => {
  const [etablissement, setEtablissement] = useState();
  const [showConventionnement, setShowConventionnement] = useState(false);
  const [canValidate, setCanValidate] = useState(false);
  const [isEtablissementValidated, setIsEtablissementValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetSiret, setResetSiret] = useState(false);

  const { values, handleChange, handleSubmit, isSubmitting, resetForm, setFieldValue } = useFormik({
    initialValues: {
      uai: "",
      typeOrganisme: "",
    },
    onSubmit: ({ uai, typeOrganisme }) => {
      return new Promise(async (resolve) => {
        onSubmited({ ...etablissement, uai, typeOrganisme });
        setSubmitted(true);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    if (reset) {
      resetForm();
      setEtablissement();
      setShowConventionnement(false);
      setIsEtablissementValidated(false);
      setCanValidate(false);
      setSubmitted(false);
      setResetSiret(true);
      onReset();
    }
  }, [onReset, reset, resetForm]);

  const resetComp = () => {
    resetForm();
    setEtablissement();
    setShowConventionnement(false);
    setIsEtablissementValidated(false);
    setCanValidate(false);
    setSubmitted(false);
    setResetSiret(true);
  };

  const validateOrga = () => {
    setIsEtablissementValidated(true);
  };

  if (submitted && etablissement) {
    return (
      <Box>
        <Heading as="h5" fontSize="1.2rem" mb={5} color="info">
          {values.typeOrganisme}
        </Heading>
        <CardListEtablissements data={etablissement} withoutLink={etablissement.new} />
      </Box>
    );
  }

  if (alreadySelected.includes("formateur-gestionnaire")) {
    return <></>;
  }

  return (
    <Box w="full">
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Siret
          onFetched={(etablissement) => {
            // console.log(etablissement);
            setEtablissement(etablissement);
            setIsEtablissementValidated(!etablissement.new);
          }}
          reset={resetSiret}
          onReset={() => {
            setResetSiret(false);
          }}
        />
        {etablissement && (
          <Box>
            {etablissement.new && !isEtablissementValidated && (
              <>
                <Heading as="h4" fontSize="1.2rem" my={3} color="info">
                  Cet établissement n'a pas encore été enregistré dans une précédente collecte.
                </Heading>
                {etablissement.ferme && (
                  <Heading as="h5" fontSize="1.2rem" mb={5} color="error">
                    Cet établissement est fermé !
                  </Heading>
                )}
                <Box mt={5} border="1px solid" borderColor="bluefrance" pt={4} pb={8} px={8}>
                  <Heading as="h5" fontSize="1.2rem" mb={5}>
                    Ajouter l'organisme
                  </Heading>
                  <Box mt={5} border="1px solid" borderColor="bluefrance" pt={4} pb={8} px={8}>
                    <Heading as="h5" fontSize="0.9rem" mb={5}>
                      Détails de l'établissement:
                    </Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <Flex alignItems="top" flexDirection="column">
                        <UnorderedList ml={5}>
                          <ListItem>Siret: {etablissement.siret}</ListItem>
                          <ListItem>Raison sociale de l'entreprise: {etablissement.entreprise_raison_sociale}</ListItem>
                          {etablissement.enseigne &&
                            etablissement.enseigne !== etablissement.entreprise_raison_sociale && (
                              <ListItem>Enseigne: {etablissement.enseigne}</ListItem>
                            )}
                          <ListItem>Adresse: {etablissement.adresse}</ListItem>
                        </UnorderedList>
                      </Flex>
                      <Box>
                        <Map
                          position={{
                            lat: parseFloat(etablissement.latitude),
                            lng: parseFloat(etablissement.longitude),
                          }}
                          defaultZoom={15}
                          containerStyle={{
                            width: "400px",
                            height: "400px",
                          }}
                        />
                      </Box>
                    </Grid>
                  </Box>
                  <Uai
                    handleSubmit={({ uai }) => {
                      setFieldValue("uai", uai);
                      setShowConventionnement(true);
                    }}
                    onError={() => {
                      setFieldValue("uai", "");
                    }}
                    siret={etablissement.siret}
                    isRequired
                  />
                  {showConventionnement && (
                    <InformationConventionnement
                      onFetched={(updatedEtablissement) => {
                        // console.log(updatedEtablissement);
                        setEtablissement(updatedEtablissement);
                        setCanValidate(true);
                      }}
                      etablissement={{ ...etablissement, uai: values.uai }}
                    />
                  )}
                  <Box>
                    <Flex flexDirection={["column", "row"]} mt={3} justifyContent="flex-end">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          resetComp();
                        }}
                        mr={[0, 4]}
                        px={8}
                        mb={[3, 0]}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        onClick={validateOrga}
                        loadingText="Enregistrement"
                        isDisabled={!canValidate}
                      >
                        Ajouter
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              </>
            )}
            {isEtablissementValidated && (
              <Box mt={3}>
                {!etablissement.new && (
                  <Heading as="h4" fontSize="1.2rem" my={3} color="info">
                    Cet établissement a déjà fait l'objet d'une collecte antérieure.
                  </Heading>
                )}
                <CardListEtablissements data={etablissement} withoutLink={etablissement.new} />
                <FormControl as="fieldset" display="flex" mt={5}>
                  <FormLabel as="div">Pour cette offre, cet organisme est :</FormLabel>
                  <RadioGroup id="typeOrganisme" name="typeOrganisme">
                    <VStack spacing="24px" alignItems="baseline" ml={3}>
                      <Radio
                        value="formateur"
                        size="lg"
                        onChange={handleChange}
                        isDisabled={alreadySelected.includes("formateur")}
                      >
                        Formateur
                      </Radio>
                      <Radio
                        value="gestionnaire"
                        size="lg"
                        onChange={handleChange}
                        isDisabled={alreadySelected.includes("gestionnaire")}
                      >
                        Gestionnaire
                      </Radio>
                      <Radio
                        value="formateur-gestionnaire"
                        size="lg"
                        onChange={handleChange}
                        isDisabled={alreadySelected.includes("gestionnaire") || alreadySelected.includes("formateur")}
                      >
                        Formateur et gestionnaire
                      </Radio>
                    </VStack>
                  </RadioGroup>
                </FormControl>
              </Box>
            )}
          </Box>
        )}
      </Flex>
      {etablissement && isEtablissementValidated && (
        <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
          <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
            <Button
              variant="secondary"
              onClick={() => {
                resetComp();
              }}
              mr={[0, 4]}
              px={8}
              mb={[3, 0]}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Enregistrement des modifications"
              isDisabled={!values.typeOrganisme}
            >
              Choisir l’organisme
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export { AddEtablissement };
