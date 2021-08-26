import {
  Box,
  Flex,
  Heading,
  Spinner,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  HStack,
  Radio,
  Grid,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { _post } from "../../common/httpClient";
import Map from "./components/Map";
import { useFormik } from "formik";
import { Siret } from "./components/Siret";
import { Uai } from "./components/Uai";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const LieuFormation = ({ onSubmited, formateur }) => {
  const [adresse, setAdresse] = useState(formateur);
  const [isloading, setIsloading] = useState(false);
  const [etablissement, setEtablissement] = useState();
  const [resetSiret, setResetSiret] = useState(false);
  const [siretFoundByUai, setSiretFoundByUai] = useState();

  const getAdresse = async (coordinate) => {
    try {
      setIsloading(true);
      const response = await _post(`${endpointTCO}/coordinate/gps`, {
        latitude: `${coordinate.latitude}`,
        longitude: `${coordinate.longitude}`,
      });
      if (response) {
        setIsloading(false);
        setAdresse({
          ...response.result.adresse,
          latitude: `${coordinate.latitude}`,
          longitude: `${coordinate.longitude}`,
        });
      }
    } catch (error) {
      setIsloading(false);
      console.log(error);
    }
  };

  const { values, handleChange, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      sameFormateur: "oui",
      hasSiretLieu: "",
      uai: "",
    },
    onSubmit: ({ sameFormateur, hasSiretLieu, uai }) => {
      return new Promise(async (resolve) => {
        const lieu = { siret: null, uai: uai || null, adresse };
        if (sameFormateur === "oui") {
          lieu.siret = formateur.siret;
          lieu.uai = formateur.uai || formateur.rco_uai;
          const response = await _post(`${endpointTCO}/coordinate/gps`, {
            latitude: formateur.latitude,
            longitude: formateur.longitude,
          });
          lieu.adresse = { ...response.result.adresse, latitude: formateur.latitude, longitude: formateur.longitude };
        } else if (sameFormateur === "non" && hasSiretLieu === "oui") {
          lieu.siret = etablissement.siret;
        } else if (siretFoundByUai) {
          lieu.siret = siretFoundByUai;
        }
        onSubmited(lieu);
        resolve("onSubmitHandler complete");
      });
    },
  });

  return (
    <Box border="1px solid" borderColor="bluefrance" w="full">
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Heading as="h3" fontSize="1.5rem" my={3}>
          Lieu de la formation
        </Heading>
        <FormControl as="fieldset" mt={5}>
          <FormLabel as="legend">Le lieu de formation est le même que celui de l'Organisme Formateur :</FormLabel>
          <RadioGroup id="sameFormateur" name="sameFormateur" defaultValue="oui">
            <div style={{ flexDirection: "column", display: "flex" }}>
              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <Radio
                  value="oui"
                  size="lg"
                  onChange={(evt) => {
                    handleChange(evt);
                    setAdresse(formateur);
                    setEtablissement();
                  }}
                >
                  Oui - ({formateur.adresse.toLowerCase()})
                </Radio>
              </div>
              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <Radio
                  value="non"
                  size="lg"
                  onChange={(evt) => {
                    handleChange(evt);
                    setEtablissement();
                    setAdresse(null);
                  }}
                >
                  Non - Choisir une autre adresse
                </Radio>
              </div>
            </div>
          </RadioGroup>
        </FormControl>
        {values.sameFormateur === "non" && (
          <>
            <FormControl as="fieldset" display="flex" mt={5}>
              <FormLabel as="div">Je dispose d'un SIRET pour le lieu de formation :</FormLabel>
              <RadioGroup id="hasSiretLieu" name="hasSiretLieu">
                <HStack spacing="24px">
                  <Radio
                    value="non"
                    size="lg"
                    defaultIsChecked
                    onChange={(evt) => {
                      handleChange(evt);
                      setResetSiret(true);
                      setAdresse(null);
                      setEtablissement();
                      setFieldValue("uai", "");
                    }}
                  >
                    Non
                  </Radio>
                  <Radio
                    value="oui"
                    size="lg"
                    onChange={(evt) => {
                      handleChange(evt);
                      setResetSiret(true);
                      setAdresse(null);
                      setEtablissement();
                      setFieldValue("uai", "");
                    }}
                  >
                    Oui
                  </Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            {values.hasSiretLieu === "oui" && (
              <>
                <Siret
                  onFetched={(etablissement) => {
                    setEtablissement(etablissement);
                    getAdresse({ latitude: etablissement.latitude, longitude: etablissement.longitude });
                  }}
                  reset={resetSiret}
                  onReset={() => {
                    setResetSiret(false);
                  }}
                />
                {etablissement && (
                  <>
                    {etablissement.ferme && (
                      <Heading as="h5" fontSize="1.2rem" mb={5} color="error">
                        Cet établissement est fermé !
                      </Heading>
                    )}
                    <Box mt={5} border="1px solid" borderColor="bluefrance" pt={4} pb={8} px={8}>
                      <Heading as="h5" fontSize="0.9rem" mb={5}>
                        Détails de l'établissement:
                      </Heading>
                      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <Flex alignItems="top" flexDirection="column">
                          <UnorderedList ml={5}>
                            <ListItem>Siret: {etablissement.siret}</ListItem>
                            <ListItem>
                              Raison sociale de l'entreprise: {etablissement.entreprise_raison_sociale}
                            </ListItem>
                            {etablissement.enseigne &&
                              etablissement.enseigne !== etablissement.entreprise_raison_sociale && (
                                <ListItem>Enseigne: {etablissement.enseigne}</ListItem>
                              )}
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
                  </>
                )}
              </>
            )}
            {values.hasSiretLieu === "non" && (
              <>
                <br />
                Veuillez entrer une adresse ci-dessous
                <Map onPositionChanged={getAdresse} withAutoComplete />
              </>
            )}
            {isloading && <Spinner />}
            {!isloading && adresse && (
              <Box>
                <ul>
                  <li>Numéro de la voie: {adresse.numero_voie}</li>
                  <li>Type de voie: {adresse.type_voie}</li>
                  <li>Nom de la voie: {adresse.nom_voie}</li>
                  <li>Code Postal: {adresse.code_postal}</li>
                  <li>Code Commune Insee: {adresse.code_commune_insee}</li>
                  <li>Nom de la Commune: {adresse.commune}</li>
                  <li>Nom de l'académie: {adresse.nom_academie}</li>
                  <li>Numéro de l'académie: {adresse.num_academie}</li>
                  <li>Nom département: {adresse.nom_departement}</li>
                  <li>Numéro département: {adresse.num_departement}</li>
                  <li>Région: {adresse.region}</li>
                  <li>Numéro région: {adresse.num_region}</li>
                </ul>
              </Box>
            )}
            {adresse && etablissement && values.hasSiretLieu === "oui" && (
              <Uai
                handleSubmit={({ uai }) => {
                  setFieldValue("uai", uai);
                }}
                onError={() => {
                  setFieldValue("uai", "");
                }}
                siret={etablissement.siret}
              />
            )}
            {adresse && values.hasSiretLieu === "non" && (
              <Uai
                handleSubmit={({ uai, siret }) => {
                  setFieldValue("uai", uai);
                  if (siret) {
                    setSiretFoundByUai(siret);
                  }
                }}
                onError={() => {
                  setFieldValue("uai", "");
                }}
                adresse={adresse}
              />
            )}
            {(adresse || etablissement) && values.sameFormateur === "non" && values.uai && (
              <Box mt={3}>
                UAI lieu de formatiom: <strong>{values.uai}</strong>
              </Box>
            )}
            {(adresse || etablissement) && values.sameFormateur === "non" && values.uai && siretFoundByUai && (
              <Box mt={3}>
                Siret associé retrouvé: <strong>{siretFoundByUai}</strong>
              </Box>
            )}
            {(adresse || etablissement) && values.sameFormateur === "non" && !values.uai && (
              <Box mt={3}>
                UAI lieu de formatiom: <strong>Aucun</strong>
              </Box>
            )}
          </>
        )}
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            // isDisabled={!adresse || (values.sameFormateur === "non" && !values.uai)}
            isDisabled={!adresse}
          >
            Confirmer ce lieu de formation
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export { LieuFormation };
