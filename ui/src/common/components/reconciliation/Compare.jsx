import { Box, Button, Flex, Heading, Text, useDisclosure, Stack, HStack } from "@chakra-ui/react";
import { InfoBadge } from "../InfoBadge";
import { StatusBadge } from "../StatusBadge";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import InfoTooltip from "../InfoTooltip";
import { SubModal } from "./SubModal";
import { Table } from "./Table";
import { ValidateIcon, RejectIcon } from "../../../theme/components/icons";
import { Validate } from "./Validate";

// TODO FIXEME !important css rules

const Section = ({ left, right, withBorder, minH }) => {
  return (
    <HStack spacing="8" px={[4, 16]} minH={minH ?? "60px"} alignItems="stretch">
      <Box w="50%" flexGrow="1" borderBottom={withBorder ? "1px solid" : null} borderColor="bluefrance">
        {left}
      </Box>
      <Box w="50%" flexGrow="1" borderBottom={withBorder ? "1px solid" : null} borderColor="bluefrance">
        {right}
      </Box>
    </HStack>
  );
};

const Compare = React.memo(({ formation, onClose, step, onStepChanged, onValidationSubmit }) => {
  const { isOpen: isOpenSubModal, onOpen: onOpenSubModal, onClose: onCloseSubM } = useDisclosure();
  const [modalType, setModalType] = useState("validate");
  const [mnaFormation, setMnaFormation] = useState(formation.matching_mna_formation[0]);
  const [formationDiff, setFormationDiff] = useState(formation.diff[0]);
  const [etablissements, setEtablissements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesCount, setSlidesCount] = useState(formation.matching_mna_formation.length);

  useEffect(() => {
    setMnaFormation(formation.matching_mna_formation[0]);
    setFormationDiff(formation.diff[0]);
    setSlidesCount(formation.matching_mna_formation.length);
    setCurrentSlide(0);
    setEtablissements(formation.matching_mna_etablissement);
  }, [formation]);

  // console.log(formation);

  const prevSlide = () => {
    let val = currentSlide;
    setCurrentSlide((s) => {
      val = s === 0 ? slidesCount - 1 : s - 1;
      return val;
    });
    setMnaFormation(formation.matching_mna_formation[val]);
    setFormationDiff(formation.diff[val]);
  };
  const nextSlide = () => {
    let val = currentSlide;
    setCurrentSlide((s) => {
      val = s === slidesCount - 1 ? 0 : s + 1;
      return val;
    });
    setMnaFormation(formation.matching_mna_formation[val]);
    setFormationDiff(formation.diff[val]);
  };

  const onSelectEtablissement = ({ siret, uai }) => {
    // console.log({ siret, uai });
    const mIndex = formation.matching_mna_formation.findIndex((mnaF) => {
      return (
        mnaF.etablissement_formateur_siret === siret ||
        mnaF.etablissement_gestionnaire_siret === siret ||
        mnaF.lieu_formation_siret === siret
      );
    });
    const index = mIndex >= 0 ? mIndex : 0;
    setCurrentSlide(index);
    setMnaFormation(formation.matching_mna_formation[index]);
    setFormationDiff(formation.diff[index]);
    document.getElementById("chakra-modal-reconciliationPsModal").parentNode.scrollTo(0, 0);
  };

  const onCloseSubModal = () => {
    onCloseSubM();
  };
  const onSubmitReject = () => {
    onCloseSubM();
    onClose();
    window.location.reload();
  };

  const arrowStyles = {
    cursor: "pointer",
    w: "auto",
    p: "8px",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
    transition: "0.6s ease",
    borderRadius: "0 3px 3px 0",
    userSelect: "none",
    _hover: {
      opacity: 0.8,
      bg: "black",
    },
  };

  const { handleSubmit, isSubmitting } = useFormik({
    initialValues: {},
    onSubmit: ({
      affelnet,
      parcoursup,
      affelnet_infos_offre,
      affelnet_raison_depublication,
      parcoursup_raison_depublication,
    }) => {
      return new Promise(async (resolve) => {
        setModalType("validate");
        onStepChanged(2);
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  if (step === 2) {
    return (
      <Validate
        formation={formation}
        onClose={onClose}
        onValidationSubmit={onValidationSubmit}
        mnaFormation={mnaFormation}
      />
    );
  }

  return (
    <>
      <Box px={[4, 16]} mb={4}>
        <HStack borderBottom={"1px solid"} borderColor="bluefrance">
          <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance" flexGrow="1">
            {step === 1 && "1. Vérifier la similitude des informations"}
          </Heading>
          {step < 3 && (
            <HStack
              onClick={() => {
                setModalType("reject");
                onOpenSubModal();
              }}
              cursor="pointer"
            >
              <RejectIcon width="14px" height="14px" color="redmarianne" />
              <Text color="redmarianne" ml="0.25rem!important" mt="-0.15rem !important">
                Rejeter le rapprochement
              </Text>
            </HStack>
          )}
        </HStack>
      </Box>
      <Section
        minH="30px"
        left={
          <Heading as="h3" fontSize="1.2rem" mb={1}>
            Informations Parcoursup
          </Heading>
        }
        right={
          <>
            <Heading as="h3" fontSize="1.2rem" mb={5}>
              <Flex justifyContent="space-between">
                Informations Catalogue 2021 <StatusBadge source="Parcoursup" status={mnaFormation.parcoursup_statut} />
              </Flex>
            </Heading>
            {slidesCount > 1 && (
              <>
                <Heading as="h4" fontSize="0.9rem" mb={3} color="bluefrance">
                  {slidesCount} Formations peuvent correspondres dans le catalogue 2021.
                </Heading>
                <HStack>
                  <Button {...arrowStyles} onClick={prevSlide} variant="primary">
                    &#10094;
                  </Button>
                  <Text color="bluefrance" fontSize="md" mx="1rem!important" minW="50px" textAlign="center">
                    {currentSlide + 1} / {slidesCount}
                  </Text>
                  <Button {...arrowStyles} onClick={nextSlide} variant="primary" mx="0!important">
                    &#10095;
                  </Button>
                </HStack>
              </>
            )}
          </>
        }
      />
      <Section
        withBorder
        left={<div />}
        right={
          <Box mb={4} mt={4}>
            id_rco_formation (test): <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight">
              {mnaFormation.id_rco_formation}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={<div />}
        right={
          <Box mb={4} mt={4}>
            Période: <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight">
              {mnaFormation.periode}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Libellé formation : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" mt="1" display="inline-block">
              {formation.libelle_specialite}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Libellé formation : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" mt="1" display="inline-block">
              {mnaFormation.intitule_long}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code formation diplôme : <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.cfd ? "greensoft.200" : "galt"}`}
              mt="1"
              display="inline-block"
            >
              {formation.codes_cfd_mna.join(",")}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Code formation diplôme BCN : <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.cfd ? "greensoft.200" : "galt"}`}
              mt="1"
              display="inline-block"
            >
              {mnaFormation.cfd}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code RNCP : <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.rncp_code ? "greensoft.200" : "galt"}`}
              mt="1"
              display="inline-block"
            >
              {formation.codes_rncp_mna.join(",")}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Code RNCP : <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.rncp_code ? "greensoft.200" : "galt"}`}
              mt="1"
              display="inline-block"
            >
              {mnaFormation.rncp_code}
            </Text>
          </Box>
        }
      />

      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI - Affilié <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.uai.uai_affilie ? "greensoft.200" : "galt"}`}>
              {formation.uai_affilie}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Code UAI du lieu de formation <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.uai.uai_formation.uai_affilie ? "greensoft.200" : "galt"}`}
              color={`${mnaFormation.uai_formation ? "inherit" : "grey.500"}`}
            >
              {mnaFormation.uai_formation ?? "N.A"}
            </Text>
          </Box>
        }
      />

      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI - Composante <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.uai.uai_composante ? "greensoft.200" : "galt"}`}>
              {formation.uai_composante}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Code UAI rattaché au SIRET formateur <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.uai.etablissement_formateur_uai.uai_composante ? "greensoft.200" : "galt"}`}
              color={`${mnaFormation.etablissement_formateur_uai ? "inherit" : "grey.500"}`}
            >
              {mnaFormation.etablissement_formateur_uai ?? "N.A"}
            </Text>
          </Box>
        }
      />

      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI - Gestionnaire <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.uai.uai_gestionnaire ? "greensoft.200" : "galt"}`}>
              {formation.uai_gestionnaire}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Code UAI rattaché au SIRET gestionnaire <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.uai.etablissement_gestionnaire_uai.uai_gestionnaire ? "greensoft.200" : "galt"}`}
              color={`${mnaFormation.etablissement_gestionnaire_uai ? "inherit" : "grey.500"}`}
            >
              {mnaFormation.etablissement_gestionnaire_uai ?? "N.A"}
            </Text>
          </Box>
        }
      />

      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI - Cerfa <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.uai.uai_cerfa ? "greensoft.200" : "galt"}`}>
              {formation.uai_cerfa}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Codes UAI <InfoTooltip description={"tooltip"} />
            {formationDiff.uai.uai_formation.uai_cerfa && (
              <Text
                as="span"
                variant="highlight"
                bg="greensoft.200"
                color={`${mnaFormation.uai_formation ? "inherit" : "grey.500"}`}
              >
                {mnaFormation.uai_formation ?? "N.A"}
                <InfoBadge text="Formation" variant="published" />
              </Text>
            )}
            {formationDiff.uai.etablissement_formateur_uai.uai_cerfa && (
              <Text
                as="span"
                variant="highlight"
                bg="greensoft.200"
                color={`${mnaFormation.etablissement_formateur_uai ? "inherit" : "grey.500"}`}
              >
                {mnaFormation.etablissement_formateur_uai ?? "N.A"}
                <InfoBadge text="Formateur" variant="published" />
              </Text>
            )}
            {formationDiff.uai.etablissement_gestionnaire_uai.uai_cerfa && (
              <Text
                as="span"
                variant="highlight"
                bg="greensoft.200"
                color={`${mnaFormation.etablissement_gestionnaire_uai ? "inherit" : "grey.500"}`}
              >
                {mnaFormation.etablissement_gestionnaire_uai ?? "N.A"}
                <InfoBadge text="Gestionnaire" variant="published" />
              </Text>
            )}
          </Box>
        }
      />

      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI - Insert Jeune <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.uai.uai_insert_jeune ? "greensoft.200" : "galt"}`}>
              {formation.uai_insert_jeune}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Codes UAI <InfoTooltip description={"tooltip"} />
            {formationDiff.uai.uai_formation.uai_insert_jeune && (
              <Text
                as="span"
                variant="highlight"
                bg="greensoft.200"
                color={`${mnaFormation.uai_formation ? "inherit" : "grey.500"}`}
              >
                {mnaFormation.uai_formation ?? "N.A"}
                <InfoBadge text="Formation" variant="published" />
              </Text>
            )}
            {formationDiff.uai.etablissement_formateur_uai.uai_insert_jeune && (
              <Text
                as="span"
                variant="highlight"
                bg="greensoft.200"
                color={`${mnaFormation.etablissement_formateur_uai ? "inherit" : "grey.500"}`}
              >
                {mnaFormation.etablissement_formateur_uai ?? "N.A"}
                <InfoBadge text="Formateur" variant="published" />
              </Text>
            )}
            {formationDiff.uai.etablissement_gestionnaire_uai.uai_insert_jeune && (
              <Text
                as="span"
                variant="highlight"
                bg="greensoft.200"
                color={`${mnaFormation.etablissement_gestionnaire_uai ? "inherit" : "grey.500"}`}
              >
                {mnaFormation.etablissement_gestionnaire_uai ?? "N.A"}
                <InfoBadge text="Gestionnaire" variant="published" />
              </Text>
            )}
          </Box>
        }
      />

      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Siret : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.siret.siret_cerfa ? "greensoft.200" : "galt"}`}>
              {formation.siret_cerfa}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Siret Organisme <InfoTooltip description={"tooltip"} />
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.siret.etablissement_gestionnaire_siret.match ? "greensoft.200" : "galt"}`}
            >
              {mnaFormation.etablissement_gestionnaire_siret}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Nom de l’établissement : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight">
              {formation.libelle_uai_composante}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Enseigne : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight">
              {mnaFormation.etablissement_gestionnaire_entreprise_raison_sociale}
              {mnaFormation.etablissement_gestionnaire_enseigne}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Type de l’établissement : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight">
              {formation.type_etablissement}
            </Text>
          </Box>
        }
        right={<div />}
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Adresse : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" color={`${formation.complement_adresse_1 ? "inherit" : "grey.500"}`}>
              {formation.complement_adresse_1 ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Adresse de l’organisme : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight">
              {mnaFormation.etablissement_gestionnaire_adresse}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={<div />}
        right={
          <Box mb={4} mt={4}>
            Adresse lieu de la formation : <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight">
              {mnaFormation.lieu_formation_adresse}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code Commune Insee: <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.code_commune_insee ? "greensoft.200" : "galt"}`}>
              {formation.code_commune_insee}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Code Commune Insee: <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.code_commune_insee ? "greensoft.200" : "galt"}`}>
              {mnaFormation.code_commune_insee}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Nom académie: <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? "greensoft.200" : "galt"}`}>
              {formation.nom_academie}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            Nom académie: <InfoTooltip description={"tooltip"} />
            <Text as="span" variant="highlight" bg={`${formationDiff.code_commune_insee ? "greensoft.200" : "galt"}`}>
              {mnaFormation.nom_academie}
            </Text>
          </Box>
        }
      />
      {formation.statut_reconciliation === "A_VERIFIER" && (
        <Box px={[4, 16]} my={8}>
          <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance">
            <Stack direction="row">
              <Text>Sélectionner directement le ou les organisme (s) liés à l’offre de formation</Text>
              {/* <Text color="tomato">*</Text> */}
            </Stack>
          </Heading>
          {etablissements.length > 0 && (
            <Box border="1px solid" borderColor="bluefrance" p={8}>
              <Box w="full" overflow="hidden">
                <Box overflowX="scroll" w="full">
                  <Table
                    data={etablissements.map((item) => ({
                      indice: item.matched_uai.length,
                      uai: item.uai,
                      siret: item.siret,
                      enseigne: item.enseigne,
                      raison_sociale: item.raison_sociale,
                      adresse: item.adresse,
                      naf_libelle: item.naf_libelle,
                      siege_social: item.siege_social,
                      matched_uai: item.matched_uai,
                    }))}
                    onSelect={onSelectEtablissement}
                  />
                </Box>
                <Button
                  variant="unstyled"
                  onClick={() => {
                    setModalType("etablissement");
                    onOpenSubModal();
                  }}
                  disabled
                >
                  ajouter un organisme à la liste
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
      {step < 3 && (
        <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
          <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end" px={[4, 16]}>
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
              }}
              mr={[0, 4]}
              px={8}
              mb={[3, 0]}
            >
              Annuler
            </Button>

            <Box flexGrow="1" textAlign="end">
              <Button
                type="submit"
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Enregistrement des modifications"
              >
                <ValidateIcon width="14px" height="14px" color="white" mr="2" />
                Valider et passer à l’étape suivante
              </Button>
            </Box>
          </Flex>
        </Box>
      )}
      <SubModal
        isOpen={isOpenSubModal}
        onClose={onCloseSubModal}
        type={modalType}
        formation={formation}
        onSubmitReject={onSubmitReject}
      />
    </>
  );
});

export { Compare };
