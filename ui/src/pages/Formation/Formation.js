import React, { Fragment, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Link,
  ListItem,
  Spinner,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { NavLink, useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { _get, _post, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import useAuth from "../../common/hooks/useAuth";
import { hasRightToEditFormation } from "../../common/utils/rolesUtils";
import { StatusBadge } from "../../common/components/StatusBadge";
import { ReactComponent as InfoIcon } from "../../theme/assets/info-circle.svg";
import { PublishModal } from "../../common/components/formation/PublishModal";
import { HABILITE_LIST } from "../../constants/certificateurs";
import { buildUpdatesHistory } from "../../common/utils/formationUtils";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const EditSection = ({ edition, onEdit, handleSubmit, isSubmitting }) => {
  return (
    <Box>
      {edition && (
        <Flex
          flexDirection={["column", "row"]}
          position="fixed"
          left={0}
          bottom={0}
          w="full"
          bg="white"
          p={8}
          zIndex={100}
          justifyContent="center"
          boxShadow="0 -2px 5px 0 rgba(215, 215, 215, 0.5)"
        >
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => {
              onEdit();
            }}
            disabled={isSubmitting}
            mr={[0, 8]}
            px={[8, 20]}
            mb={[3, 0]}
          >
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enregistrement des modifications"
          >
            Enregistrer les modifications
          </Button>
        </Flex>
      )}
      <Button
        variant="outline"
        colorScheme="blue"
        onClick={() => {
          onEdit();
        }}
        disabled={edition}
        px={8}
        mt={[6, 0]}
      >
        {edition ? "en cours de modification..." : "Modifier les informations"}
      </Button>
    </Box>
  );
};

const FormationPeriode = ({ periode }) => {
  let displayedPeriode = <strong>periode</strong>;
  try {
    const periodeArr = JSON.parse(periode);

    const periodeObj = periodeArr.reduce((acc, dateStr) => {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleString("fr-FR", { month: "long" });
      const displayedDate = formattedDate === "Invalid Date" ? dateStr : formattedDate;
      acc[date.getFullYear()] = acc[date.getFullYear()] ?? [];
      acc[date.getFullYear()] = [...acc[date.getFullYear()], displayedDate];
      return acc;
    }, {});

    displayedPeriode = Object.entries(periodeObj).map(([key, value]) => {
      return (
        <Fragment key={key}>
          <br />
          <Text as="span">
            <strong>
              {key}: {value.join(", ")}
            </strong>
          </Text>
        </Fragment>
      );
    });
  } catch (e) {
    console.error("unable to parse periode field", periode, e);
  }

  return <>{displayedPeriode}</>;
};

const getGeoportailUrl = ({ lieu_formation_geo_coordonnees = "" }) => {
  const coords = lieu_formation_geo_coordonnees.split(",");
  const reversedCoords = `${coords[1]},${coords[0]}`;

  const ignStyleLayer = "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2::GEOPORTAIL:OGC:WMTS(1)";
  const poiEnseignementSup = "UTILITYANDGOVERNMENTALSERVICES.IGN.POI.ENSEIGNEMENTSUPERIEUR::GEOPORTAIL:OGC:WMS(1)";
  const poiEnseignementSecondaire =
    "UTILITYANDGOVERNMENTALSERVICES.IGN.POI.ENSEIGNEMENTSECONDAIRE::GEOPORTAIL:OGC:WMS(1)";
  return `https://www.geoportail.gouv.fr/carte?c=${reversedCoords}&z=19&l0=${ignStyleLayer}&l1=${poiEnseignementSecondaire}&l2=${poiEnseignementSup}&permalink=yes`;
};

const HabilitationPartenaire = ({ habilitation }) => {
  let color;
  let text = habilitation;
  switch (habilitation) {
    case "HABILITATION_ORGA_FORM":
      color = "green";
      text = "ORGANISER ET FORMER";
      break;
    case "HABILITATION_FORMER":
      color = "green";
      text = "FORMER";
      break;
    case "HABILITATION_ORGANISER":
      color = "red";
      text = "ORGANISER";
      break;
    default:
      break;
  }

  return (
    <Text as="strong" style={{ color }}>
      {text}
    </Text>
  );
};

const Formation = ({
  formation,
  edition,
  onEdit,
  handleChange,
  handleSubmit,
  values,
  hasRightToEdit,
  isSubmitting,
  pendingFormation,
}) => {
  const displayedFormation = pendingFormation ?? formation;
  const oneEstablishment = formation.etablissement_gestionnaire_siret === formation.etablissement_formateur_siret;
  const filteredPartenaires = (displayedFormation.rncp_details?.partenaires ?? []).filter(({ Siret_Partenaire }) =>
    [formation.etablissement_gestionnaire_siret, formation.etablissement_formateur_siret].includes(Siret_Partenaire)
  );
  const showPartenaires =
    ["Titre", "TP"].includes(displayedFormation.rncp_details?.code_type_certif) &&
    !(displayedFormation.rncp_details.certificateurs ?? []).some(({ certificateur }) =>
      HABILITE_LIST.includes(certificateur)
    );

  return (
    <Box bg="#fafbfc" boxShadow="0 2px 2px 0 rgba(215, 215, 215, 0.5)" borderRadius={4}>
      <Flex
        borderRadius="4px 4px 0 0"
        bg="white"
        justifyContent="space-between"
        alignItems="center"
        p={8}
        borderBottom="1px solid"
        borderColor="grey.300"
        flexDirection={["column", "row"]}
      >
        <Heading as="h2" fontSize="beta">
          Description de la formation
        </Heading>
        {hasRightToEdit && (
          <EditSection edition={edition} onEdit={onEdit} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
        )}
      </Flex>
      {pendingFormation && (
        <Alert status="info" justifyContent="center">
          <Box mr={1}>
            <InfoIcon />
          </Box>
          Cette formation a été {pendingFormation.published ? "éditée" : "supprimée"} et est en attente de traitement
        </Alert>
      )}
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 7]} bg="white" p={8} borderBottomLeftRadius={[0, 4]}>
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4}>
              Détails
            </Heading>
            <Text mb={4}>
              Intitulé court de la formation: <strong>{displayedFormation.intitule_court}</strong>{" "}
              <InfoTooltip description={helpText.formation.intitule_court} />
            </Text>
            <Text mb={4}>
              Diplôme ou titre visé: <strong>{displayedFormation.diplome}</strong>{" "}
              <InfoTooltip description={helpText.formation.diplome} />
            </Text>
            <Text mb={4}>
              Niveau de la formation: <strong>{displayedFormation.niveau}</strong>{" "}
              <InfoTooltip description={helpText.formation.niveau} />
            </Text>
            <Text mb={4}>
              Code diplôme (Éducation Nationale):{" "}
              {!edition && (
                <>
                  <strong>{displayedFormation.cfd}</strong> <InfoTooltip description={helpText.formation.cfd} />
                </>
              )}
              {edition && <Input type="text" name="cfd" onChange={handleChange} value={values.cfd} />}
              {displayedFormation.cfd_outdated && (
                <>
                  <br />
                  Ce diplôme a une date de fin antérieure au 31/08 de l'année en cours
                </>
              )}
            </Text>
            <Text mb={4}>
              Codes MEF 10 caractères:{" "}
              <strong>
                {displayedFormation.mef_10_code ??
                  displayedFormation?.bcn_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
              </strong>{" "}
              <InfoTooltip description={helpText.formation.mef} />
            </Text>
            {displayedFormation?.mefs_10?.length > 0 && (
              <>
                <Text mb={4}>
                  Codes MEF 10 caractères dans le périmètre <i>Affelnet</i>:{" "}
                  <strong>{displayedFormation?.mefs_10?.map(({ mef10 }) => mef10).join(", ")}</strong>
                </Text>
                {formation?.affelnet_infos_offre && (
                  <Text mb={4}>
                    Informations offre de formation <i>Affelnet</i>: <strong>{formation?.affelnet_infos_offre}</strong>
                  </Text>
                )}
              </>
            )}
            <Text mb={4}>
              Période d'inscription:{" "}
              {!edition && (
                <>
                  <FormationPeriode periode={displayedFormation.periode} />{" "}
                  <InfoTooltip description={helpText.formation.periode} />
                </>
              )}
              {edition && <Input type="text" name="periode" onChange={handleChange} value={values.periode} />}
            </Text>
            <Text mb={4}>
              Lieu de la formation:{" "}
              {!edition && (
                <>
                  <strong>
                    <Link
                      href={getGeoportailUrl(formation)}
                      textDecoration="underline"
                      color="blue.500"
                      fontWeight="bold"
                      isExternal
                    >
                      {displayedFormation.lieu_formation_adresse}, {displayedFormation.code_postal}{" "}
                      {displayedFormation.localite} <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </Link>
                  </strong>{" "}
                  <InfoTooltip description={helpText.formation.adresse} />
                </>
              )}
              {edition && (
                <>
                  <Input
                    type="text"
                    name="lieu_formation_adresse"
                    onChange={handleChange}
                    value={values.lieu_formation_adresse}
                  />
                  <Input type="text" name="code_postal" onChange={handleChange} value={values.code_postal} mt={2} />
                </>
              )}
            </Text>
            <Text mb={4}>
              Capacite d'accueil:{" "}
              {!edition && (
                <>
                  <strong>{formation.capacite}</strong> <InfoTooltip description={helpText.formation.capacite} />
                </>
              )}
              {edition && <Input type="text" name="capacite" onChange={handleChange} value={values.capacite} />}
            </Text>
            <Text mb={4}>
              Durée de la formation: <strong>{displayedFormation.duree}</strong>{" "}
              <InfoTooltip description={helpText.formation.duree} />
            </Text>
            <Text mb={4}>
              Année: <strong>{displayedFormation.annee}</strong> <InfoTooltip description={helpText.formation.annee} />
            </Text>
          </Box>
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4} mt={6}>
              Informations RNCP et ROME
            </Heading>
            {displayedFormation.rncp_code && (
              <Text mb={4}>
                Code RNCP: <strong>{displayedFormation.rncp_code}</strong>{" "}
                <InfoTooltip description={helpText.formation.rncp_code} />
              </Text>
            )}
            <Text mb={4}>
              Intitulé RNCP: <strong>{displayedFormation.rncp_intitule}</strong>{" "}
              <InfoTooltip description={helpText.formation.rncp_intitule} />
            </Text>
            <Text mb={4}>
              Codes ROME: <strong>{displayedFormation.rome_codes.join(", ")}</strong>{" "}
              <InfoTooltip description={helpText.formation.rome_codes} />
            </Text>
            <Box>
              {displayedFormation.opcos && displayedFormation.opcos.length === 0 && (
                <Text mb={4}>Aucun OPCO rattaché</Text>
              )}
              {displayedFormation.opcos && displayedFormation.opcos.length > 0 && (
                <Text mb={4}>
                  OPCOs liés à la formation: <strong>{displayedFormation.opcos.join(", ")}</strong>
                </Text>
              )}
            </Box>
            {displayedFormation.rncp_details && (
              <>
                <Text mb={4}>
                  Certificateurs:{" "}
                  <strong>
                    {displayedFormation.rncp_details.certificateurs
                      ?.filter(({ certificateur, siret_certificateur }) => certificateur || siret_certificateur)
                      ?.map(
                        ({ certificateur, siret_certificateur }) =>
                          `${certificateur} (siret: ${siret_certificateur ?? "n/a"})`
                      )
                      .join(", ")}
                  </strong>{" "}
                  <InfoTooltip description={helpText.formation.certificateurs} />
                </Text>
                {showPartenaires && (
                  <Text as="div" mb={4}>
                    Partenaires: <br />
                    {filteredPartenaires.length > 0 ? (
                      <>
                        L'habilitation ORGANISER seule n'ouvre pas les droits
                        <UnorderedList>
                          {filteredPartenaires.map(({ Nom_Partenaire, Siret_Partenaire, Habilitation_Partenaire }) => (
                            <ListItem key={Siret_Partenaire}>
                              <strong>
                                {Nom_Partenaire} (siret: {Siret_Partenaire ?? "n/a"}) :{" "}
                              </strong>
                              <HabilitationPartenaire habilitation={Habilitation_Partenaire} />
                            </ListItem>
                          ))}
                        </UnorderedList>
                      </>
                    ) : (
                      <>
                        Aucune habilitation sur la fiche pour ce SIRET.
                        <br />
                        SIRET formateur: {formation.etablissement_formateur_siret}, SIRET gestionnaire:{" "}
                        {formation.etablissement_gestionnaire_siret}.
                      </>
                    )}
                  </Text>
                )}
              </>
            )}
          </Box>
        </GridItem>
        <GridItem colSpan={[12, 5]} bg="#fafbfc" p={8} borderBottomRightRadius={4} borderBottomLeftRadius={[4, 0]}>
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4}>
              À propos
            </Heading>
            <Text mb={4}>
              Type: <strong>{formation.etablissement_reference_type}</strong>
            </Text>
            <Text mb={4}>
              UAI:{" "}
              {!edition && (
                <>
                  <strong>{formation.uai_formation}</strong>{" "}
                  <InfoTooltip description={helpText.formation.uai_formation} />
                </>
              )}
              {edition && (
                <Input type="text" name="uai_formation" onChange={handleChange} value={values.uai_formation} />
              )}
            </Text>
            <Text mb={4}>
              Établissement conventionné ? : <strong>{formation.etablissement_reference_conventionne}</strong>{" "}
              <InfoTooltip description={helpText.etablissement.conventionne} />
            </Text>
            <Text mb={4}>
              Établissement déclaré en préfecture ? :{" "}
              <strong>{formation.etablissement_reference_declare_prefecture}</strong>{" "}
              <InfoTooltip description={helpText.etablissement.declare_prefecture} />
            </Text>
            <Text mb={4}>
              Certification qualité de l'organisme : <strong>{formation.etablissement_reference_datadock}</strong>{" "}
              <InfoTooltip description={helpText.etablissement.datadock} />
            </Text>
            <Text mb={4}>
              Académie:{" "}
              <strong>
                {displayedFormation.nom_academie} ({displayedFormation.num_academie})
              </strong>{" "}
              <InfoTooltip description={helpText.formation.academie} />
            </Text>
            <Text mb={4}>
              Code postal:{" "}
              {!edition && (
                <>
                  <strong>{displayedFormation.code_postal}</strong>{" "}
                  <InfoTooltip description={helpText.formation.code_postal} />
                </>
              )}
              {edition && <Input type="text" name="code_postal" onChange={handleChange} value={values.code_postal} />}
            </Text>
            <Text mb={4}>
              Code commune: <strong>{displayedFormation.code_commune_insee}</strong>{" "}
              <InfoTooltip description={helpText.formation.code_commune_insee} />
            </Text>
            <Box mb={4}>
              {formation.onisep_url !== "" && formation.onisep_url !== null && (
                <Link
                  href={formation.onisep_url}
                  mt={3}
                  textDecoration="underline"
                  color="blue.500"
                  fontWeight="bold"
                  isExternal
                >
                  Voir la fiche descriptive Onisep <FontAwesomeIcon icon={faExternalLinkAlt} />
                </Link>
              )}
            </Box>
          </Box>
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4}>
              Organisme {!oneEstablishment && "Formateur"}
            </Heading>
            <div>
              {formation.etablissement_formateur_entreprise_raison_sociale && (
                <Text mb={4}>
                  Raison sociale: <strong>{formation.etablissement_formateur_entreprise_raison_sociale}</strong>
                </Text>
              )}
              {formation.etablissement_formateur_enseigne && (
                <Text mb={4}>
                  Enseigne: <strong>{formation.etablissement_formateur_enseigne}</strong>
                </Text>
              )}
              <Text mb={4}>
                Uai: <strong>{formation.etablissement_formateur_uai}</strong>
              </Text>
              <Text mb={4}>
                Siret: <strong>{formation.etablissement_formateur_siret}</strong>
              </Text>
              <Box mb={4}>
                <Link
                  as={NavLink}
                  to={`/etablissement/${formation.etablissement_formateur_id}`}
                  target="_blank"
                  mt={3}
                  textDecoration="underline"
                  color="blue.500"
                  fontWeight="bold"
                >
                  Voir l'organisme {!oneEstablishment && "formateur"}
                </Link>
              </Box>
            </div>
          </Box>
          {!oneEstablishment && (
            <Box mb={16}>
              <Heading as="h2" fontSize="beta" mb={4}>
                Organisme Gestionnaire
              </Heading>
              {formation.etablissement_gestionnaire_entreprise_raison_sociale && (
                <Text mb={4}>
                  Raison sociale: <strong>{formation.etablissement_gestionnaire_entreprise_raison_sociale}</strong>
                </Text>
              )}
              {formation.etablissement_gestionnaire_enseigne && (
                <Text mb={4}>
                  Enseigne: <strong>{formation.etablissement_gestionnaire_enseigne}</strong>
                </Text>
              )}
              <Text mb={4}>
                Uai: <strong>{formation.etablissement_gestionnaire_uai}</strong>
              </Text>
              <Text mb={4}>
                Siret: <strong>{formation.etablissement_gestionnaire_siret}</strong>
              </Text>
              <Box mb={4}>
                <Link
                  as={NavLink}
                  to={`/etablissement/${formation.etablissement_gestionnaire_id}`}
                  target="_blank"
                  mt={3}
                  textDecoration="underline"
                  color="blue.500"
                  fontWeight="bold"
                >
                  Voir l'organisme gestionnaire
                </Link>
              </Box>
            </Box>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ({ match }) => {
  const [formation, setFormation] = useState();
  const [pendingFormation, setPendingFormation] = useState();

  const [edition, setEdition] = useState(false);
  let history = useHistory();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  const [user] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(formation, user);

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    initialValues: {
      uai_formation: "",
      code_postal: "",
      capacite: "",
      periode: "",
      cfd: "",
      lieu_formation_adresse: "",
    },
    onSubmit: (values) => {
      return new Promise(async (resolve) => {
        try {
          const directChangeKeys = ["uai_formation", "capacite"];
          const directChangeValues = directChangeKeys.reduce((acc, key) => {
            acc[key] = values[key] || null;
            return acc;
          }, {});
          const actualDirectChangeKeys = directChangeKeys.filter((key) => directChangeValues[key] !== formation[key]);
          const actualDirectChangeValues = actualDirectChangeKeys.reduce((acc, key) => {
            acc[key] = directChangeValues[key];
            return acc;
          }, {});

          if (actualDirectChangeKeys.length > 0) {
            const updatedFormation = await _post(`${endpointNewFront}/entity/formation2021/update`, {
              ...formation,
              ...actualDirectChangeValues,
            });

            const result = await _put(`${endpointNewFront}/entity/formations2021/${formation._id}`, {
              ...updatedFormation,
              last_update_who: user.email,
              last_update_at: Date.now(),
              editedFields: { ...formation?.editedFields, ...actualDirectChangeValues },
              updates_history: buildUpdatesHistory(
                formation,
                { ...actualDirectChangeValues, last_update_who: user.email },
                actualDirectChangeKeys
              ),
            });
            if (result) {
              setFormation(result);
              setFieldValue("uai_formation", result?.uai_formation ?? "");
              setFieldValue("capacite", result?.capacite ?? "");
            }
          }

          const pendingChangeKeys = Object.keys(values).filter((key) => !directChangeKeys.includes(key));
          const pendingChangeValues = pendingChangeKeys.reduce((acc, key) => {
            acc[key] = values[key] || null;
            return acc;
          }, {});
          const actualPendingChangeKeys = pendingChangeKeys.filter(
            (key) => pendingChangeValues[key] !== (pendingFormation ?? formation)[key]
          );
          const actualPendingChangeValues = actualPendingChangeKeys.reduce((acc, key) => {
            acc[key] = pendingChangeValues[key];
            return acc;
          }, {});

          if (actualPendingChangeKeys.length > 0) {
            const updatedFormation = await _post(`${endpointNewFront}/entity/formation2021/update`, {
              ...formation,
              ...pendingChangeValues,
            });

            let result = await _post(`${endpointNewFront}/entity/pendingRcoFormation`, {
              ...updatedFormation,
              last_update_who: user.email,
              last_update_at: Date.now(),
              updates_history: buildUpdatesHistory(
                pendingFormation ?? formation,
                { ...actualPendingChangeValues, last_update_who: user.email },
                actualPendingChangeKeys
              ),
            });
            if (result) {
              setPendingFormation(result);
              setFieldValue("code_postal", result?.code_postal ?? formation.code_postal ?? "");
              setFieldValue("periode", result?.periode ?? formation.periode ?? "");
              setFieldValue("cfd", result?.cfd ?? formation.cfd ?? "");
              setFieldValue(
                "lieu_formation_adresse",
                result?.lieu_formation_adresse ?? formation.lieu_formation_adresse ?? ""
              );
            }
          }
        } catch (e) {
          console.error("Can't perform update", e);
        } finally {
          setEdition(false);
          resolve("onSubmitHandler complete");
        }
      });
    },
  });

  useEffect(() => {
    async function run() {
      try {
        let pendingRCOFormation;

        const apiURL = `${endpointNewFront}/entity/formation2021/`;
        // FIXME select={"__v":0} hack to get updates_history
        const form = await _get(`${apiURL}${match.params.id}?select={"__v":0}`, false);
        setFormation(form);

        try {
          pendingRCOFormation = await _get(
            `${endpointNewFront}/entity/pendingRcoFormation/${form.id_rco_formation}`,
            false
          );
          setPendingFormation(pendingRCOFormation);
        } catch (err) {
          // no pending formation, do nothing
        }

        // values from catalog data
        setFieldValue("uai_formation", form.uai_formation ?? "");
        setFieldValue("capacite", form.capacite ?? "");

        // values from pending rco data
        setFieldValue("code_postal", pendingRCOFormation?.code_postal ?? form.code_postal ?? "");
        setFieldValue("periode", pendingRCOFormation?.periode ?? form.periode ?? "");
        setFieldValue("cfd", pendingRCOFormation?.cfd ?? form.cfd ?? "");
        setFieldValue(
          "lieu_formation_adresse",
          pendingRCOFormation?.lieu_formation_adresse ?? form.lieu_formation_adresse ?? ""
        );
      } catch (e) {
        history.push("/404");
      }
    }
    run();
  }, [match, setFieldValue, history]);

  const onEdit = () => {
    setEdition(!edition);
  };

  const onDelete = async () => {
    // eslint-disable-next-line no-restricted-globals
    const areYousure = confirm("Souhaitez-vous vraiment supprimer cette formation ?");
    if (areYousure) {
      // Update as not published
      let result = await _post(`${endpointNewFront}/entity/pendingRcoFormation`, {
        ...formation,
        published: false,
      });
      if (result) {
        setPendingFormation(result);
      }
    }
  };

  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/recherche/formations-2021">
                Formations 2021
                {formation &&
                  (formation.etablissement_reference_catalogue_published
                    ? " (Catalogue général)"
                    : " (Catalogue non-éligible)")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{pendingFormation?.intitule_long ?? formation?.intitule_long}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Box bg="secondaryBackground" w="100%" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          {!formation && (
            <Box align="center" p={2}>
              <Spinner />
            </Box>
          )}

          {formation && (
            <>
              <Box bg="white" p={10} my={6} boxShadow="0 2px 2px 0 rgba(215, 215, 215, 0.5)" borderRadius={4}>
                <Heading as="h1" fontSize="beta">
                  {pendingFormation?.intitule_long ?? formation?.intitule_long}{" "}
                  <InfoTooltip description={helpText.formation.intitule_long} />
                </Heading>
                {hasRightToEdit && formation.etablissement_reference_catalogue_published && (
                  <>
                    <Text fontSize="gamma" fontWeight="bold" mt={3} mb={[2, 0]}>
                      Statuts et publications de la formation
                    </Text>
                    <Flex justify="space-between" alignItems={["center", "flex-end"]} flexDirection={["column", "row"]}>
                      <Box>
                        <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />
                        <StatusBadge source="Affelnet" status={formation.affelnet_statut} mt={[1, 0]} />
                      </Box>
                      <Button
                        colorScheme="blue"
                        px={[8, 20]}
                        mt={[8, 0]}
                        onClick={() => {
                          onOpenPublishModal();
                        }}
                      >
                        Gérer les publications
                      </Button>
                    </Flex>
                  </>
                )}
              </Box>
              <Formation
                formation={formation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                isSubmitting={isSubmitting}
                onDelete={onDelete}
                pendingFormation={pendingFormation}
              />
              {!edition && hasRightToEdit && (
                <Flex justifyContent={["center", "flex-end"]} my={[6, 12]}>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    onClick={onDelete}
                    disabled={formation.published === false || pendingFormation?.published === false}
                    px={[8, 20]}
                    mr={[0, 12]}
                  >
                    Supprimer la formation
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Container>
      </Box>
      {formation && (
        <PublishModal
          isOpen={isOpenPublishModal}
          onClose={onClosePublishModal}
          formation={formation}
          onFormationUpdate={(updatedFormation) => {
            setFormation(updatedFormation);
          }}
        />
      )}
    </Layout>
  );
};
