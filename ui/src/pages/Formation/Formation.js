import React, { Fragment, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
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
import { _get, _post, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import useAuth from "../../common/hooks/useAuth";
import { hasRightToEditFormation, hasAccessTo } from "../../common/utils/rolesUtils";
import { StatusBadge } from "../../common/components/StatusBadge";
import { ReactComponent as InfoIcon } from "../../theme/assets/info-circle.svg";
import { PublishModal } from "../../common/components/formation/PublishModal";
import { HABILITE_LIST } from "../../constants/certificateurs";
import { buildUpdatesHistory } from "../../common/utils/formationUtils";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";
import { ArrowRightLine, Edit2Fill, ExternalLinkLine, MapPin2Fill, Parametre } from "../../theme/components/icons/";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

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
              {key} : {value.join(", ")}
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

const getLBAUrl = ({ _id = "" }) => {
  return `https://labonnealternance.pole-emploi.fr/recherche-apprentissage?&display=list&page=fiche&type=training&itemId=${_id}`;
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

const EditableField = ({
  formation,
  hasRightToEdit,
  edition,
  onEdit,
  handleSubmit,
  values,
  handleChange,
  fieldName,
  label,
  ...props
}) => {
  return (
    <Text {...props}>
      {hasRightToEdit && edition !== fieldName && (
        <Button
          onClick={() => onEdit(fieldName)}
          variant="unstyled"
          aria-label={`Modifier le champ ${label}`}
          p={0}
          minW={0}
          height="auto"
        >
          <Edit2Fill w="16px" h="16px" color="bluefrance" mr="5px" mb="7px" />
        </Button>
      )}{" "}
      {label} :{" "}
      {edition !== fieldName && (
        <>
          <Text as="span" variant="highlight">
            {formation[fieldName]}
          </Text>{" "}
          <InfoTooltip description={helpText.formation[fieldName]} />
        </>
      )}
      {edition === fieldName && (
        <>
          <Input variant="edition" type="text" name={fieldName} onChange={handleChange} value={values[fieldName]} />
          <Button mt={2} mr={2} variant="secondary" onClick={() => onEdit()}>
            Annuler
          </Button>
          <Button mt={2} variant="primary" onClick={handleSubmit}>
            Valider
          </Button>
        </>
      )}
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
  pendingFormation,
}) => {
  const displayedFormation = pendingFormation ?? formation;
  const oneEstablishment = formation.etablissement_gestionnaire_siret === formation.etablissement_formateur_siret;

  const [tagsFormateur, setTagsFormateur] = useState([]);
  const [tagsGestionnaire, setTagsGestionnaire] = useState([]);

  useEffect(() => {
    async function run() {
      const formateur = await _get(
        `${endpointTCO}/entity/etablissement/${formation.etablissement_formateur_id}`,
        false
      );
      setTagsFormateur(formateur.tags ?? []);

      if (!oneEstablishment) {
        const gestionnaire = await _get(
          `${endpointTCO}/entity/etablissement/${formation.etablissement_gestionnaire_id}`,
          false
        );
        setTagsGestionnaire(gestionnaire.tags ?? []);
      }
    }

    run();
  }, [oneEstablishment, formation, setTagsFormateur, setTagsGestionnaire]);

  const filteredPartenaires = (displayedFormation.rncp_details?.partenaires ?? []).filter(({ Siret_Partenaire }) =>
    [formation.etablissement_gestionnaire_siret, formation.etablissement_formateur_siret].includes(Siret_Partenaire)
  );
  const showPartenaires =
    ["Titre", "TP"].includes(displayedFormation.rncp_details?.code_type_certif) &&
    !(displayedFormation.rncp_details.certificateurs ?? []).some(({ certificateur }) =>
      HABILITE_LIST.includes(certificateur)
    );

  return (
    <Box borderRadius={4}>
      {pendingFormation && (
        <Alert status="info" justifyContent="center">
          <Box mr={1}>
            <InfoIcon />
          </Box>
          Cette formation a été {pendingFormation.published ? "éditée" : "supprimée"} et est en attente de traitement
        </Alert>
      )}
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 12, 7]} bg="white" border="1px solid" borderColor="bluefrance">
          <Box mb={16} pt={8}>
            <Heading textStyle="h4" color="grey.800" px={8}>
              Description
            </Heading>
            {formation.onisep_url !== "" && formation.onisep_url !== null && (
              <Box mt={2} mb={4} px={5}>
                <Link href={formation.onisep_url} mt={3} variant="pill" textStyle="rf-text" isExternal>
                  voir la fiche descriptive Onisep <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
                </Link>
              </Box>
            )}

            <Box px={8}>
              <Text mb={4} mt={4}>
                Intitulé court de la formation :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.intitule_court}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.intitule_court} />
              </Text>
              <Text mb={4} mt={4}>
                Intitulé éditorial :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.onisep_intitule}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.onisep_intitule} />
              </Text>
              <Text mb={4}>
                Diplôme ou titre visé :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.diplome}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.diplome} />
              </Text>
              <Text mb={4}>
                Niveau de la formation :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.niveau}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.niveau} />
              </Text>
              <Text mb={4}>
                Code diplôme (Éducation Nationale) :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.cfd}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.cfd} />
                {displayedFormation.cfd_outdated && (
                  <>
                    <br />
                    Ce diplôme a une date de fin antérieure au 31/08 de l'année en cours
                  </>
                )}
              </Text>
              <Text mb={4}>
                Codes MEF 10 caractères :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.mef_10_code ??
                    displayedFormation?.bcn_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.mef} />
              </Text>
              {displayedFormation?.mefs_10?.length > 0 && (
                <>
                  <Text mb={4}>
                    Codes MEF 10 caractères dans le périmètre <i>Affelnet</i> :{" "}
                    <Text as="span" variant="highlight">
                      {displayedFormation?.mefs_10?.map(({ mef10 }) => mef10).join(", ")}
                    </Text>
                  </Text>
                  {formation?.affelnet_infos_offre && (
                    <Text mb={4}>
                      Informations offre de formation <i>Affelnet</i> :{" "}
                      <Text as="span" variant="highlight">
                        {formation?.affelnet_infos_offre}
                      </Text>
                    </Text>
                  )}
                </>
              )}
              <Text mb={4}>
                Période d'inscription :
                <FormationPeriode periode={displayedFormation.periode} />{" "}
                <InfoTooltip description={helpText.formation.periode} />
              </Text>
              <Text mb={4}>
                Capacite d'accueil :{" "}
                <Text as="span" variant="highlight">
                  {formation.capacite ?? "N/A"}
                </Text>{" "}
                <InfoTooltip ml="10px" description={helpText.formation.capacite} />
              </Text>
              <Text mb={4}>
                Durée de la formation :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.duree ?? "N/A"}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.duree} />
              </Text>
              <Text mb={4}>
                Année :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.annee ?? "N/A"}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.annee} />
              </Text>
              <Text mb={4}>
                Identifiant formation Carif Oref:
                <Text as="span" variant="highlight">
                  {displayedFormation.id_formation ?? "N/A"}
                </Text>
              </Text>
              <Text mb={4}>
                Identifiant actions Carif Oref:
                <Text as="span" variant="highlight">
                  {displayedFormation.ids_action?.join(",") ?? "N/A"}
                </Text>
              </Text>
              <Text mb={4}>
                Code Certif Info:
                <Text as="span" variant="highlight">
                  {displayedFormation.id_certifinfo ?? "N/A"}
                </Text>
              </Text>
            </Box>
          </Box>
          <Box mb={16} px={8}>
            <Heading textStyle="h4" color="grey.800" mb={4} mt={6}>
              Informations RNCP et ROME
            </Heading>
            {displayedFormation.rncp_code && (
              <Text mb={4}>
                Code RNCP :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.rncp_code}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.rncp_code} />
              </Text>
            )}
            <Text mb={4}>
              Intitulé RNCP :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.rncp_intitule}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.rncp_intitule} />
            </Text>
            <Text mb={4}>
              Codes ROME :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.rome_codes.join(", ")}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.rome_codes} />
            </Text>
            <Box>
              {displayedFormation.opcos && displayedFormation.opcos.length === 0 && (
                <Text mb={4}>Aucun OPCO rattaché</Text>
              )}
              {displayedFormation.opcos && displayedFormation.opcos.length > 0 && (
                <Text mb={4}>
                  OPCOs liés à la formation :{" "}
                  <Text as="span" variant="highlight">
                    {displayedFormation.opcos.join(", ")}
                  </Text>
                </Text>
              )}
            </Box>
            {displayedFormation.rncp_details && (
              <>
                <Text mb={4}>
                  Certificateurs :{" "}
                  <Text as="span" variant="highlight">
                    {displayedFormation.rncp_details.certificateurs
                      ?.filter(({ certificateur }) => certificateur)
                      ?.map(({ certificateur }) => certificateur)
                      .join(", ")}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.certificateurs} />
                </Text>
                <Text mb={4}>
                  SIRET Certificateurs :{" "}
                  <Text as="span" variant="highlight">
                    {displayedFormation.rncp_details.certificateurs
                      ?.filter(({ siret_certificateur }) => siret_certificateur)
                      ?.map(({ siret_certificateur }) => siret_certificateur)
                      .join(", ")}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.siret_certificateurs} />
                </Text>
                {showPartenaires && (
                  <Text as="div" mb={4}>
                    Partenaires : <br />
                    {filteredPartenaires.length > 0 ? (
                      <>
                        L'habilitation ORGANISER seule n'ouvre pas les droits
                        <UnorderedList>
                          {filteredPartenaires.map(({ Nom_Partenaire, Siret_Partenaire, Habilitation_Partenaire }) => (
                            <ListItem key={Siret_Partenaire}>
                              <strong>
                                {Nom_Partenaire} (siret : {Siret_Partenaire ?? "n/a"}) :
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
                        SIRET formateur : {formation.etablissement_formateur_siret}, SIRET gestionnaire :
                        {formation.etablissement_gestionnaire_siret}.
                      </>
                    )}
                  </Text>
                )}
              </>
            )}
          </Box>
        </GridItem>
        <GridItem colSpan={[12, 12, 5]} py={8}>
          <Box mb={16}>
            <Heading textStyle="h4" color="grey.800" px={8}>
              <MapPin2Fill w="12px" h="15px" mr="5px" mb="5px" />
              Lieu de la formation
            </Heading>
            <Box mt={2} mb={4} px={5}>
              <Link href={getLBAUrl(formation)} textStyle="rf-text" variant="pill" isExternal>
                voir sur un plan <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
              </Link>
            </Box>

            <Box px={8}>
              <EditableField
                fieldName={"uai_formation"}
                label={"UAI du lieu de formation"}
                formation={formation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                mb={4}
              />
              <Text mb={4}>
                Académie :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.nom_academie} ({displayedFormation.num_academie})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.academie} />
              </Text>
              <EditableField
                fieldName={"lieu_formation_adresse"}
                label={"Adresse"}
                formation={displayedFormation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                mb={4}
              />
              <EditableField
                fieldName={"code_postal"}
                label={"Code postal"}
                formation={displayedFormation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                mb={4}
              />
              <Text mb={4}>
                Commune :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.localite}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.localite} />
              </Text>
              <EditableField
                fieldName={"code_commune_insee"}
                label={"Code commune"}
                formation={displayedFormation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                mb={4}
              />
              <Text mb={4}>
                Département :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.nom_departement} ({displayedFormation.num_departement})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.nom_departement} />
              </Text>
            </Box>
          </Box>
          <Box mb={[0, 0, 16]} px={8}>
            <Heading textStyle="h4" color="grey.800" mb={4}>
              Organisme(s) associé(s)
            </Heading>

            {!oneEstablishment && (
              <>
                <Text textStyle="rf-text" color="grey.700" fontWeight="700" mb={3}>
                  Gestionnaire
                </Text>
                <Link as={NavLink} to={`/etablissement/${formation.etablissement_gestionnaire_id}`} variant="card">
                  <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
                    <Text>Siret : {formation.etablissement_gestionnaire_siret}</Text>
                    <Text>UAI : {formation.etablissement_gestionnaire_uai}</Text>
                  </Flex>
                  <Heading textStyle="h6" color="grey.800" mt={2}>
                    {formation.etablissement_gestionnaire_entreprise_raison_sociale}
                  </Heading>
                  <Box>
                    <Text textStyle="sm">Académie : {formation.etablissement_gestionnaire_nom_academie}</Text>
                    <Box>
                      <Flex justifyContent={"space-between"}>
                        <Box>
                          {tagsGestionnaire &&
                            tagsGestionnaire
                              .sort((a, b) => a - b)
                              .map((tag, i) => (
                                <Badge variant="year" mr="10px" mt={3} key={i}>
                                  {tag}
                                </Badge>
                              ))}
                        </Box>
                        <ArrowRightLine alignSelf="center" color="bluefrance" />
                      </Flex>
                    </Box>
                  </Box>
                </Link>
              </>
            )}

            {!oneEstablishment && (
              <Text textStyle="rf-text" color="grey.700" fontWeight="700" my={5}>
                Formateur
              </Text>
            )}

            <Link as={NavLink} to={`/etablissement/${formation.etablissement_formateur_id}`} variant="card">
              <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
                <Text>Siret : {formation.etablissement_formateur_siret}</Text>
                <Text>UAI: {formation.etablissement_formateur_uai}</Text>
              </Flex>
              <Heading textStyle="h6" color="grey.800" mt={2}>
                {formation.etablissement_formateur_entreprise_raison_sociale}
              </Heading>
              <Box>
                <Text textStyle="sm">Académie : {formation.etablissement_formateur_nom_academie}</Text>
                <Box>
                  <Flex justifyContent={"space-between"}>
                    <Box>
                      {tagsFormateur &&
                        tagsFormateur
                          .sort((a, b) => a - b)
                          .map((tag, i) => (
                            <Badge variant="year" mr="10px" mt={3} key={i}>
                              {tag}
                            </Badge>
                          ))}
                    </Box>
                    <ArrowRightLine alignSelf="center" color="bluefrance" />
                  </Flex>
                </Box>
              </Box>
            </Link>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ({ match }) => {
  const [formation, setFormation] = useState();
  const [pendingFormation, setPendingFormation] = useState();

  const [edition, setEdition] = useState(null);
  let history = useHistory();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  const [user] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(formation, user);

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    initialValues: {
      uai_formation: "",
      code_postal: "",
      lieu_formation_adresse: "",
      code_commune_insee: "",
    },
    onSubmit: (values) => {
      return new Promise(async (resolve) => {
        try {
          const directChangeKeys = ["uai_formation"];
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
              setFieldValue(
                "lieu_formation_adresse",
                result?.lieu_formation_adresse ?? formation.lieu_formation_adresse ?? ""
              );
              setFieldValue("code_commune_insee", result?.code_commune_insee ?? formation.code_commune_insee ?? "");
            }
          }
        } catch (e) {
          console.error("Can't perform update", e);
        } finally {
          setEdition(null);
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
        // FIXME select={"__v" :0} hack to get updates_history
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

        // values from pending rco data
        setFieldValue("code_postal", pendingRCOFormation?.code_postal ?? form.code_postal ?? "");
        setFieldValue(
          "lieu_formation_adresse",
          pendingRCOFormation?.lieu_formation_adresse ?? form.lieu_formation_adresse ?? ""
        );
        setFieldValue("code_commune_insee", pendingRCOFormation?.code_commune_insee ?? form.code_commune_insee ?? "");
      } catch (e) {
        history.push("/404");
      }
    }
    run();
  }, [match, setFieldValue, history]);

  const onEdit = (fieldName = null) => {
    setEdition(fieldName);
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

  const title = `${pendingFormation?.intitule_long ?? formation?.intitule_long}`;
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              {
                title: `Catalogue des formations en apprentissage 2021
                ${
                  formation &&
                  (formation.etablissement_reference_catalogue_published
                    ? " (Catalogue général)"
                    : " (Catalogue non-éligible)")
                }`,
                to: "/recherche/formations-2021",
              },
              { title: title },
            ]}
          />
        </Container>
      </Box>
      <Box w="100%" py={[1, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          {!formation && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}

          {hasAccessTo(user, "page_formation") && formation && (
            <>
              <Box mb={8}>
                <Flex alignItems="center" justify="space-between" flexDirection={["column", "column", "row"]}>
                  <Heading textStyle="h2" color="grey.800" pr={[0, 0, 8]}>
                    {title} <InfoTooltip description={helpText.formation.intitule_long} />
                  </Heading>
                  {hasRightToEdit && formation.etablissement_reference_catalogue_published && (
                    <Button
                      textStyle="sm"
                      variant="primary"
                      px={8}
                      mt={[8, 8, 0]}
                      onClick={() => {
                        onOpenPublishModal();
                      }}
                    >
                      <Parametre mr={2} />
                      Gérer les publications
                    </Button>
                  )}
                </Flex>
                {formation.etablissement_reference_catalogue_published && (
                  <Box mt={5}>
                    {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                      <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />
                    )}
                    {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                      <StatusBadge source="Affelnet" status={formation.affelnet_statut} mt={[1, 0]} />
                    )}
                  </Box>
                )}
              </Box>
              <Formation
                formation={formation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasAccessTo(user, "page_formation/modifier_informations") && hasRightToEdit}
                isSubmitting={isSubmitting}
                onDelete={onDelete}
                pendingFormation={pendingFormation}
              />
              {hasAccessTo(user, "page_formation/supprimer_formation") && !edition && hasRightToEdit && (
                <Flex justifyContent={["center", "flex-end"]} my={[6, 12]}>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    onClick={onDelete}
                    disabled={formation.published === false || pendingFormation?.published === false}
                    px={[8, 8]}
                    mr={[0, 12]}
                    borderRadius="none"
                  >
                    Supprimer la formation
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Container>
      </Box>
      {hasAccessTo(user, "page_formation/gestion_publication") && formation && (
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
