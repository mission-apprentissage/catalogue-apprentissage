import React, { Fragment, useEffect, useState } from "react";
import {
  Alert,
  Badge,
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
import {
  ArrowDropRightLine,
  ArrowRightLine,
  Edit2Fill,
  ExternalLinkLine,
  MapPin2Fill,
  Parametre,
} from "../../theme/components/icons/";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

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
          borderTop="1px solid"
          borderColor="grey.300"
        >
          <Button
            variant="secondary"
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
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enregistrement des modifications"
          >
            Enregistrer les modifications
          </Button>
        </Flex>
      )}
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
      {hasRightToEdit && (
        <EditSection edition={edition} onEdit={onEdit} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}
      {pendingFormation && (
        <Alert status="info" justifyContent="center">
          <Box mr={1}>
            <InfoIcon />
          </Box>
          Cette formation a été {pendingFormation.published ? "éditée" : "supprimée"} et est en attente de traitement
        </Alert>
      )}
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 7]} bg="white" p={8} border="1px solid" borderColor="bluefrance">
          <Box mb={16}>
            <Heading textStyle="h4" color="grey.800">
              Description
            </Heading>
            <Box mb={4}>
              {formation.onisep_url !== "" && formation.onisep_url !== null && (
                <Link
                  href={formation.onisep_url}
                  mt={3}
                  textDecoration="underline"
                  color="bluefrance"
                  textStyle="rf-text"
                  isExternal
                >
                  voir la fiche descriptive Onisep <ExternalLinkLine w="9px" h="9px" />.
                </Link>
              )}
            </Box>
            <Text mb={4} mt={4}>
              Intitulé court de la formation :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.intitule_court}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.intitule_court} />
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
              {!edition && (
                <>
                  <Text as="span" variant="highlight">
                    {displayedFormation.cfd}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.cfd} />
                </>
              )}
              {edition && <Input variant="edition" type="text" name="cfd" onChange={handleChange} value={values.cfd} />}
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
              {!edition && (
                <>
                  <FormationPeriode periode={displayedFormation.periode} />{" "}
                  <InfoTooltip description={helpText.formation.periode} />
                </>
              )}
              {edition && (
                <Input variant="edition" type="text" name="periode" onChange={handleChange} value={values.periode} />
              )}
            </Text>
            <Text mb={4}>
              Lieu de la formation :{" "}
              {!edition && (
                <>
                  <Text as="span" variant="highlight">
                    {displayedFormation.lieu_formation_adresse}, {displayedFormation.code_postal}{" "}
                    {displayedFormation.localite}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.adresse} />
                </>
              )}
              {edition && (
                <>
                  <Input
                    variant="edition"
                    type="text"
                    name="lieu_formation_adresse"
                    onChange={handleChange}
                    value={values.lieu_formation_adresse}
                  />
                  <Input
                    variant="edition"
                    type="text"
                    name="code_postal"
                    onChange={handleChange}
                    value={values.code_postal}
                    mt={2}
                  />
                </>
              )}
            </Text>
            <Text mb={4}>
              Capacite d'accueil :{" "}
              {!edition && (
                <>
                  <Text as="span" variant="highlight">
                    {formation.capacite ?? "N/A"}
                  </Text>{" "}
                  <InfoTooltip ml="10px" description={helpText.formation.capacite} />
                </>
              )}
              {edition && (
                <Input variant="edition" type="text" name="capacite" onChange={handleChange} value={values.capacite} />
              )}
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
          </Box>
          <Box mb={16}>
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
                      ?.filter(({ certificateur, siret_certificateur }) => certificateur || siret_certificateur)
                      ?.map(
                        ({ certificateur, siret_certificateur }) =>
                          `${certificateur} (siret : ${siret_certificateur ?? "n/a"})`
                      )
                      .join(", ")}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.certificateurs} />
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
        <GridItem colSpan={[12, 5]} p={8}>
          <Box mb={16}>
            <Heading textStyle="h4" color="grey.800">
              <MapPin2Fill w="12px" h="15px" mr="5px" mb="5px" />
              Lieu de la formation
            </Heading>
            <Link
              href={getLBAUrl(formation)}
              textStyle="rf-text"
              color="bluefrance"
              textDecoration="underline"
              isExternal
            >
              voir sur un plan <ExternalLinkLine w="9px" h="9px" />.
            </Link>
            <Text mb={4} mt={4}>
              Type :{" "}
              <Text as="span" variant="highlight">
                {formation.etablissement_reference_type}
              </Text>
            </Text>
            <Text mb={4}>
              <Edit2Fill w="16px" h="16px" color="bluefrance" mr="8px" mb="7px" />
              UAI du lieu de formation :{" "}
              {!edition && (
                <>
                  <Text as="span" variant="highlight">
                    {formation.uai_formation}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.uai_formation} />
                </>
              )}
              {edition && (
                <Input
                  variant="edition"
                  type="text"
                  name="uai_formation"
                  onChange={handleChange}
                  value={values.uai_formation}
                />
              )}
            </Text>
            <Text mb={4}>
              Établissement conventionné ? :{" "}
              <Text as="span" variant="highlight">
                {formation.etablissement_reference_conventionne}
              </Text>{" "}
              <InfoTooltip description={helpText.etablissement.conventionne} />
            </Text>
            <Text mb={4}>
              Établissement déclaré en préfecture ?{" "}
              <Text as="span" variant="highlight">
                {formation.etablissement_reference_declare_prefecture}
              </Text>{" "}
              <InfoTooltip description={helpText.etablissement.declare_prefecture} />
            </Text>
            <Text mb={4}>
              Certification qualité de l'organisme :{" "}
              <Text as="span" variant="highlight">
                {formation.etablissement_reference_datadock}
              </Text>{" "}
              <InfoTooltip description={helpText.etablissement.datadock} />
            </Text>
            <Text mb={4}>
              Académie :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.nom_academie} ({displayedFormation.num_academie})
              </Text>{" "}
              <InfoTooltip description={helpText.formation.academie} />
            </Text>
            <Text mb={4}>
              <Edit2Fill w="16px" h="16px" color="bluefrance" mr="5px" mb="7px" /> Code postal :{" "}
              {!edition && (
                <>
                  <Text as="span" variant="highlight">
                    {displayedFormation.code_postal}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.code_postal} />
                </>
              )}
              {edition && (
                <Input
                  variant="edition"
                  type="text"
                  name="code_postal"
                  onChange={handleChange}
                  value={values.code_postal}
                />
              )}
            </Text>
            <Text mb={4}>
              Code commune :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.code_commune_insee}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.code_commune_insee} />
            </Text>
          </Box>
          <Box mb={16}>
            <Heading textStyle="h4" color="grey.800" mb={4}>
              Organisme(s) associé(s)
            </Heading>

            {!oneEstablishment && (
              <>
                <Text textStyle="rf-text" color="grey.700" fontWeight="700" mb={3}>
                  Gestionnaire
                </Text>
                <Box as={NavLink} to={`/etablissement/${formation.etablissement_gestionnaire_id}`}>
                  <Container p={5} bg="#F9F8F6">
                    <Box>
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
                          <Flex>
                            {tagsGestionnaire &&
                              tagsGestionnaire
                                .sort((a, b) => a - b)
                                .map((tag, i) => (
                                  <Badge variant="year" mr="10px" mt={3} key={i}>
                                    {tag}
                                  </Badge>
                                ))}
                            <ArrowRightLine alignSelf="center" color="bluefrance" flex="1" ml="13.4rem" />
                          </Flex>
                        </Box>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              </>
            )}

            {!oneEstablishment && (
              <Text textStyle="rf-text" color="grey.700" fontWeight="700" my={5}>
                Formateur
              </Text>
            )}

            <Box as={NavLink} to={`/etablissement/${formation.etablissement_formateur_id}`}>
              <Container p={5} bg="#F9F8F6">
                <Box>
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
                      <Flex>
                        {tagsFormateur &&
                          tagsFormateur
                            .sort((a, b) => a - b)
                            .map((tag, i) => (
                              <Badge variant="year" mr="10px" mt={3} key={i}>
                                {tag}
                              </Badge>
                            ))}
                        <ArrowRightLine alignSelf="center" color="bluefrance" flex="1" ml="13.4rem" />
                      </Flex>
                    </Box>
                  </Box>
                </Box>
              </Container>
            </Box>
          </Box>
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
      <Box w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb separator={<ArrowDropRightLine color="grey.600" />} textStyle="xs">
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/" color="grey.600" textDecoration="underline">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/recherche/formations-2021" color="grey.600" textDecoration="underline">
                Catalogue des formations en apprentissage 2021
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
      <Box w="100%" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          {!formation && (
            <Box align="center" p={2}>
              <Spinner />
            </Box>
          )}

          {formation && (
            <>
              <Box mb={8}>
                <Heading textStyle="h2" color="grey.800">
                  {pendingFormation?.intitule_long ?? formation?.intitule_long}
                  <InfoTooltip description={helpText.formation.intitule_long} />
                </Heading>
                {hasRightToEdit && formation.etablissement_reference_catalogue_published && (
                  <>
                    <Flex
                      justify="space-between"
                      alignItems={["center", "baseline"]}
                      flexDirection={["column", "row"]}
                      mt={5}
                    >
                      <Box>
                        <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />
                        <StatusBadge source="Affelnet" status={formation.affelnet_statut} mt={[1, 0]} />
                      </Box>
                      <Flex flexDirection="column">
                        <Button
                          textStyle="sm"
                          variant="primary"
                          mt={[8, 0]}
                          onClick={() => {
                            onOpenPublishModal();
                          }}
                        >
                          <Parametre mr={2} />
                          Gérer les publications
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            onEdit();
                          }}
                          disabled={edition}
                          mt={6}
                        >
                          {edition ? "en cours de modification..." : "Modifier les informations"}
                        </Button>
                      </Flex>
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
