import { Box, Button, Flex, FormControl, FormErrorMessage, Input, Heading, Spinner } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { _get } from "../../../common/httpClient";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const Uai = ({ handleSubmit, siret, isRequired, onError, adresse }) => {
  const [show, setShow] = useState(false);
  const [uaiFound, setUaiFound] = useState(false);
  const [demandeCorrectionAdresse, setDemandeCorrectionAdresse] = useState(false);

  const {
    values,
    handleChange,
    handleSubmit: handleFormSubmit,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldError,
  } = useFormik({
    initialValues: {
      uai: "",
    },
    validationSchema: Yup.object().shape(
      !isRequired
        ? {
            uai: Yup.string()
              .nullable()
              .matches(/[A-Za-z0-9]{8,}$/, "L'UAI est code sur 8 caractères Alpha-Numérique"),
          }
        : {
            uai: Yup.string().matches(/[A-Za-z0-9]{8,}$/, "L'UAI est code sur 8 caractères Alpha-Numérique"),
          }
    ),
    onSubmit: ({ uai }) => {
      return new Promise(async (resolve) => {
        const isValid = await isUaiValid(uai);
        if (isValid) {
          const result = await handleSearch({ uai });
          if (result) {
            if (siret && siret !== result.siret) {
              setFieldError("uai", `L'uai saisi est déjà rattaché à un autre Siret. (Siret: ${result.siret})`);
              onError();
            } else if (
              adresse &&
              (adresse.code_commune_insee.toLowerCase() !== result.code_insee_localite.toLowerCase() ||
                adresse.code_postal.toLowerCase() !== result.code_postal.toLowerCase() ||
                adresse.commune.toLowerCase() !== result.commune_implantation_nom.toLowerCase() ||
                adresse.nom_academie.toLowerCase() !== result.nom_academie.toLowerCase() ||
                adresse.nom_departement.toLowerCase() !== result.nom_departement.toLowerCase() ||
                adresse.nom_voie.toLowerCase() !== result.nom_voie.toLowerCase() ||
                `${adresse.num_academie}`.toLowerCase() !== `${result.num_academie}`.toLowerCase() ||
                `${adresse.num_departement}`.toLowerCase() !== result.num_departement.toLowerCase() ||
                `${adresse.num_region}`.toLowerCase() !== result.region_implantation_code.toLowerCase() ||
                `${adresse.numero_voie}`.toLowerCase() !== result.numero_voie.toLowerCase() ||
                adresse.region.toLowerCase() !== result.region_implantation_nom.toLowerCase() ||
                adresse.type_voie.toLowerCase() !== result.type_voie.toLowerCase())
            ) {
              setFieldError(
                "uai",
                `L'uai saisi est déjà rattaché à une autre Adresse. (Commune ${result.commune_implantation_nom}, Siret: ${result.siret}))`
              );
              onError();
              setDemandeCorrectionAdresse(true);
            } else {
              handleSubmit({ uai, siret: result.siret });
              setDemandeCorrectionAdresse(false);
            }
          } else {
            handleSubmit({ uai });
            setDemandeCorrectionAdresse(false);
          }
        } else {
          setFieldError("uai", "L'uai n'est pas un UAI valide");
          onError();
        }
        resolve("onSubmitHandler complete");
      });
    },
  });

  const isUaiValid = async (uai) => {
    try {
      await _get(`${endpointTCO}/uai/${uai}`);
      return true;
    } catch (error) {
      if (error.statusCode === 400) {
        return false;
      } else {
        console.log(error);
        return false;
      }
    }
  };

  const handleSearch = async ({ siret, uai }: { siret: null, uaisiret: null }) => {
    try {
      let searchUrl = "";
      if (siret) searchUrl = `${endpointTCO}/entity/etablissements/siret-uai?query={"siret":"${siret}"}`;
      if (uai) searchUrl = `${endpointTCO}/entity/etablissements/siret-uai?query={"uai":"${uai}"}`;
      const {
        pagination: { total },
        etablissements,
      } = await _get(searchUrl);
      if (total === 1) {
        // eslint-disable-next-line no-unused-vars
        const [{ uai: uaiFound }, ...rest] = etablissements;
        if (siret) {
          return uaiFound;
        } else if (uai) {
          return etablissements[0];
        }
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  };

  useEffect(() => {
    async function run() {
      if (siret && !uaiFound) {
        const uai = await handleSearch({ siret });
        if (uai) {
          setFieldValue("uai", uai);
          setUaiFound(true);
          handleSubmit({ uai });
        }
      }
      setShow(true);
    }

    run();
  }, [handleSubmit, setFieldValue, siret, uaiFound]);

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
          {!uaiFound && (
            <Heading as="h5" fontSize="1.1rem" my={5} color="warning">
              {siret && isRequired && "Aucun UAI n'a été trouvé pour ce siret. Ce champ est obligatoire."}
              {siret &&
                !isRequired &&
                "Aucun UAI n'a été trouvé pour ce siret. Si vous en avez un, merci de le saisir ci-dessous"}
              {!siret && isRequired && "Merci de renseigner un UAI apprentissage"}
              {!siret && !isRequired && "Si vous disposez d'UAI, merci de le renseigner ci-dessous"}
            </Heading>
          )}
          {uaiFound && (
            <Heading as="h5" fontSize="1.1rem" my={5} color="success">
              Un UAI a été trouvé. <br />
              <br />
              Siret: {siret} - Uai: {values.uai}
            </Heading>
          )}
          {!uaiFound && (
            <Box mt={2}>
              <Flex flexDirection="row">
                <FormControl isRequired={isRequired} isInvalid={errors.uai} flexDirection="column" w="full" ml={3}>
                  <Flex>
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
                      {errors.uai && touched.uai && <FormErrorMessage>{errors.uai}</FormErrorMessage>}
                    </Flex>
                    <Button
                      variant="primary"
                      onClick={handleFormSubmit}
                      loadingText="Recherche..."
                      isLoading={isSubmitting}
                      isDisabled={!values.uai}
                      ml={3}
                    >
                      Valider
                    </Button>
                  </Flex>
                </FormControl>
              </Flex>
            </Box>
          )}
          {demandeCorrectionAdresse && (
            <Box mt={3}>
              <Button variant="primary" isDisabled>
                Faire une demande une correction d'adresse
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export { Uai };
