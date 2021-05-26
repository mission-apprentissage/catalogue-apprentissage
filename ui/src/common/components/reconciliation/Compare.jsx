import { Box, Button, Flex, Heading, Text, useDisclosure, Stack } from "@chakra-ui/react";
// import { StatusBadge } from "../StatusBadge";
import { InfoBadge } from "../InfoBadge";
import React, { useState } from "react";
import { useFormik } from "formik";
// import { _put } from "../../httpClient";
// import useAuth from "../../hooks/useAuth";
// import { buildUpdatesHistory } from "../../utils/formationUtils";
// import * as Yup from "yup";
import InfoTooltip from "../InfoTooltip";
import { SubModal } from "./SubModal";
import { Table } from "./Table";
import { ValidateIcon, RejectIcon } from "../../../theme/components/icons";

const fixture = [
  {
    indice: 1,
    uai: "0754679D",
    siret: "13002087800240",
    enseigne: null,
    raison_sociale: null,
    adresse: "SARL GUINOT-MARY COHR L'ACADEMIE 52-52 52 B RUE LAFFITTE 75009 PARIS 9 FRANCE",
    nature_activite: "Formation continue d'adultes",
    estSiege: false,
    information_similaire: ["uai_formation", "uai_formateur", "uai_gestionnaire"],
  },
  {
    indice: 2,
    uai: "0922778V",
    siret: "53150773900013",
    enseigne: "AFMEE ILE DE FRANCE",
    raison_sociale: null,
    adresse:
      "ASS FORMATION AUX METIERS DES ENERGIES ELECTRIQUES ILE DE FRANCE 45 RUE KLEBER 92300 LEVALLOIS-PERRET FRANCE",
    nature_activite: "Autres enseignements",
    estSiege: false,
    information_similaire: ["uai_formation", "uai_formateur", "uai_gestionnaire"],
  },
  {
    indice: 3,
    uai: "0922778V",
    siret: "53150773900013",
    enseigne: "AFMEE ILE DE FRANCE",
    raison_sociale: null,
    adresse:
      "ASS FORMATION AUX METIERS DES ENERGIES ELECTRIQUES ILE DE FRANCE 45 RUE KLEBER 92300 LEVALLOIS-PERRET FRANCE",
    nature_activite: "Formation continue d'adultes",
    estSiege: false,
    information_similaire: ["uai_formation", "uai_formateur", "uai_gestionnaire"],
  },
];

const Compare = ({ formation, onClose }) => {
  console.log(formation);

  const { isOpen: isOpenSubModal, onOpen: onOpenSubModal, onClose: onCloseSubModal } = useDisclosure();
  const [modalType, setModalType] = useState("validate");

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, errors } = useFormik({
    initialValues: {
      //affelnet: getPublishRadioValue(formation?.affelnet_statut),
      //parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
      affelnet_infos_offre: formation?.affelnet_infos_offre ?? "",
      affelnet_raison_depublication: formation?.affelnet_raison_depublication ?? "",
      parcoursup_raison_depublication: formation?.parcoursup_raison_depublication ?? "",
    },
    // validationSchema: Yup.object().shape({
    //   affelnet_raison_depublication: isAffelnetUnpublishFormOpen
    //     ? Yup.string().nullable().required("Veuillez saisir la raison")
    //     : Yup.string().nullable(),
    //   parcoursup_raison_depublication: isParcoursupUnpublishFormOpen
    //     ? Yup.string().nullable().required("Veuillez saisir la raison")
    //     : Yup.string().nullable(),
    // }),
    onSubmit: ({
      affelnet,
      parcoursup,
      affelnet_infos_offre,
      affelnet_raison_depublication,
      parcoursup_raison_depublication,
    }) => {
      return new Promise(async (resolve) => {
        // Do stuff
        setModalType("validate");
        onOpenSubModal();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  return (
    <>
      <Box px={[4, 16]}>
        <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance">
          1. Vérifier la similitude des informations
        </Heading>
      </Box>
      <Flex px={[4, 16]} pb={[4, 16]} flexGrow="1">
        <Box border="1px solid" borderColor="bluefrance" p={8} w="50%">
          <Heading as="h3" fontSize="1.5rem" mb={3}>
            Informations Parcoursup
          </Heading>
          <Flex flexDirection="column">
            <Box mb={4} mt={4}>
              Libellé formation : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.libelle_formation}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Code formation diplôme : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.codes_cfd_mna.join(",")}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Codes UAI collectés : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.uai_gestionnaire}
                <InfoBadge text="Gestionnaire" variant="published" />
              </Text>
              <Text as="span" variant="highlight">
                {formation.uai_composante}
                <InfoBadge text="Composante" variant="published" />
              </Text>
              <Text as="span" variant="highlight">
                {formation.uai_affilie}
                <InfoBadge text="Affilié" variant="published" />
              </Text>
            </Box>
            <Box mb={4} mt={4}>
              Siret : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.siret_cerfa}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Nom de l’établissement : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.libelle_uai_composante}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Adresse : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.complement_adresse_1}
              </Text>{" "}
            </Box>
          </Flex>
        </Box>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="50%" borderLeft="none">
          <Heading as="h3" fontSize="1.5rem" mb={3}>
            Informations Catalogue 2021
          </Heading>
          <Flex flexDirection="column">
            <Box mb={4} mt={4}>
              Libellé formation : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.libelle_formation}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Code formation diplôme BCN : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.codes_cfd_mna.join(",")}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Code UAI du lieu de formation : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.uai_gestionnaire}
                <InfoBadge text="Formation" variant="published" />
              </Text>
            </Box>
            <Box mb={4} mt={4}>
              Code UAI rattaché au SIRET : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.uai_gestionnaire}
                <InfoBadge text="Formateur" variant="published" />
              </Text>
            </Box>
            <Box mb={4} mt={4}>
              Siret Organisme : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.siret_cerfa}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Lieu de la formation : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.complement_adresse_1}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Enseigne : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.complement_adresse_1}
              </Text>{" "}
            </Box>
            <Box mb={4} mt={4}>
              Adresse de l’organisme : <InfoTooltip description={"tooltip"} />
              <Text as="span" variant="highlight">
                {formation.complement_adresse_1}
              </Text>{" "}
            </Box>
          </Flex>
        </Box>
      </Flex>
      {formation.statut_reconciliation === "A_VERIFIER" && (
        <Box px={[4, 16]} mb="8">
          <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance">
            <Stack direction="row">
              <Text>2. Sélectionner le ou les organisme (s) liés à l’offre de formation</Text>{" "}
              <Text color="tomato">*</Text>
            </Stack>
          </Heading>
          <Box border="1px solid" borderColor="bluefrance" p={8}>
            <Box w="full" overflow="hidden">
              <Box overflowX="scroll" w="full">
                <Table data={fixture} />
              </Box>
              <Button
                variant="unstyled"
                onClick={() => {
                  setModalType("etablissement");
                  onOpenSubModal();
                }}
              >
                ajouter un organisme à la liste
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            variant="secondary"
            onClick={() => {
              //setFieldValue("affelnet", getPublishRadioValue(formation?.affelnet_statut));
              //setFieldValue("parcoursup", getPublishRadioValue(formation?.parcoursup_statut));
              onClose();
            }}
            mr={[0, 4]}
            px={8}
            mb={[3, 0]}
          >
            Annuler
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setModalType("reject");
              onOpenSubModal();
            }}
            mr={[0, 4]}
            px={8}
            mb={[3, 0]}
            color="redmarianne"
            borderColor="redmarianne"
          >
            <RejectIcon width="14px" height="14px" color="redmarianne" mr="2" />
            Rejeter
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enregistrement des modifications"
          >
            <ValidateIcon width="14px" height="14px" color="white" mr="2" />
            Valider
          </Button>
        </Flex>
      </Box>
      <SubModal isOpen={isOpenSubModal} onClose={onCloseSubModal} type={modalType} />
    </>
  );
};

export { Compare };
