import React, { useState, useCallback } from "react";
import { Box, Container, Heading, HStack } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
// import { hasAccessTo } from "../../common/utils/rolesUtils";
// import useAuth from "../../common/hooks/useAuth";
import { Prerequis } from "./Prerequis";
import { Organismes } from "./Organismes";
import { Diplome } from "./Diplome";
import { LieuFormation } from "./LieuFormation";
import { FormationContainer } from "./Formation";
import { _post } from "../../common/httpClient";
import StepButton from "./components/StepButton";

// const endpointFront = `${process.env.REACT_APP_BASE_URL}/api`;

export default () => {
  const title = "Collecte de l'offre de formation";
  setTitle(title);
  // let [auth] = useAuth();
  const [organismes, setOrganismes] = useState();
  const [lieuDeFormation, setLieuDeFormation] = useState(null);
  const [formation, setFormation] = useState(null);
  const [step, setStep] = useState(0);

  let onStepClicked = useCallback((s) => {
    setStep(s);
  }, []);

  const buildFormation = async (codes) => {
    console.log({ ...organismes, ...lieuDeFormation, ...codes });
    const updatedFormation = await _post(`/api/entity/formation2021/update`, {
      cfd: codes.cfd,
      rncp_code: codes.rncp,
      nom_academie: lieuDeFormation.adresse.nom_academie,
      num_academie: lieuDeFormation.adresse.num_academie,
      code_postal: lieuDeFormation.adresse.code_postal,
      code_commune_insee: lieuDeFormation.adresse.code_commune_insee,
      num_departement: lieuDeFormation.adresse.num_departement,
      nom_departement: lieuDeFormation.adresse.nom_departement,
      region: lieuDeFormation.adresse.region,
      localite: lieuDeFormation.adresse.commune,
      uai_formation: lieuDeFormation.uai,
      source: "COLLECTE-CATALOGUE",
      draft: true,
      lieu_formation_geo_coordonnees: `${lieuDeFormation.adresse.latitude},${lieuDeFormation.adresse.longitude}`,
      lieu_formation_adresse: `${lieuDeFormation.adresse.numero_voie} ${lieuDeFormation.adresse.type_voie} ${lieuDeFormation.adresse.nom_voie} ${lieuDeFormation.adresse.code_postal} ${lieuDeFormation.adresse.commune}`,
      lieu_formation_siret: lieuDeFormation.siret,

      etablissement_gestionnaire_siret: organismes.gestionnaire.siret,

      etablissement_formateur_siret: organismes.formateur.siret,
      periode: codes.periodes,
    });

    // console.log(updatedFormation);
    setFormation(updatedFormation);
    setStep(4);
  };

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5} mb={5}>
            Ajouter une offre de formation
          </Heading>

          <HStack px={[4, 16]} mt={5}>
            <StepButton title="Prérequis" stepNumber={0} onClick={onStepClicked} currentStep={step} />
            <StepButton title="Organismes" stepNumber={1} onClick={onStepClicked} currentStep={step} />
            <StepButton title="Lieu de formation" stepNumber={2} onClick={onStepClicked} currentStep={step} />
            <StepButton title="Diplôme" stepNumber={3} onClick={onStepClicked} currentStep={step} />
            <StepButton title="Résumé" stepNumber={4} onClick={onStepClicked} currentStep={step} />
          </HStack>

          {step === 0 && (
            <Prerequis
              onSubmited={(orga) => {
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <Organismes
              onSubmited={(orga) => {
                setOrganismes(orga);
                setStep(2);
              }}
            />
          )}
          {step === 2 && organismes && (
            <LieuFormation
              onSubmited={(lieu) => {
                setLieuDeFormation(lieu);
                setStep(3);
              }}
              formateur={organismes.formateur}
            />
          )}
          {step === 3 && lieuDeFormation && (
            <Diplome
              onSubmited={(codes) => {
                buildFormation(codes);
              }}
            />
          )}
          {step === 4 && formation && <FormationContainer formation={formation} />}
        </Container>
      </Box>
    </Layout>
  );
};
