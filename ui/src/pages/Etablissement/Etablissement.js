import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../common/hooks/useAuth";
import { _get, _post, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { hasOneOfRoles } from "../../common/utils/rolesUtils";
import { NavLink } from "react-router-dom";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";
import { ArrowDropRightLine, ArrowRightLine, Edit2Fill, ExternalLinkLine } from "../../theme/components/icons/";
import { HowToFixModal } from "../../common/components/organisme/HowToFixModal";

const sleep = (m) => new Promise((r) => setTimeout(r, m));

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const Etablissement = ({ etablissement, edition, onEdit, handleChange, handleSubmit, values, countFormations }) => {
  const [auth] = useAuth();
  const hasRightToEdit = hasOneOfRoles(auth, ["admin"]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const query = [
    {
      field: "etablissement_formateur_siret.keyword",
      operator: "===",
      value: etablissement.siret,
      combinator: "AND",
      index: 0,
    },
    {
      field: "etablissement_gestionnaire_siret.keyword",
      operator: "===",
      value: etablissement.siret,
      combinator: "OR",
      index: 1,
    },
  ];
  const linkFormations = `/recherche/formations-2021?qb=${encodeURIComponent(
    JSON.stringify(query)
  )}&defaultMode="advanced"`;

  let creationDate = "";
  try {
    creationDate = new Date(new Date(etablissement.date_creation).getTime() * 1000).toLocaleDateString();
  } catch (e) {
    console.error("can't display creation date ", etablissement.date_creation);
  }

  return (
    <>
      <Grid templateColumns="repeat(12, 1fr)" mt={8}>
        <GridItem colSpan={[12, 7]} border="1px solid" borderColor="bluefrance" p={8}>
          <Box>
            <Heading textStyle="h4" color="grey.800">
              Caractéristiques de l’établissement
            </Heading>
            {etablissement.onisep_url !== "" && etablissement.onisep_url !== null && (
              <Box mb={4}>
                <Link
                  href={`https://${etablissement.onisep_url}`}
                  mt={3}
                  textDecoration="underline"
                  color="bluefrance"
                  textStyle="rf-text"
                  isExternal
                >
                  voir la fiche descriptive Onisep <ExternalLinkLine w="9px" h="9px" />
                </Link>
                .
              </Box>
            )}
            <Box textStyle="rf-text">
              <Text mb={4} mt={4}>
                Enseigne :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.enseigne ?? "N/A"}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.enseigne} />
              </Text>
              <Text mb={4}>
                Siret :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.siret}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.siret} />
              </Text>
              <Text mb={4}>
                Siren :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.siren}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.siren} />
              </Text>
              <Text mb={4}>
                Code NAF :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.naf_code}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.naf_code} />
              </Text>
              <Text mb={4}>
                Libellé NAF :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.naf_libelle}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.naf_libelle} />
              </Text>
              <Text mb={4}>
                Date de création :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {creationDate}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.date_creation} />
              </Text>
              <Text mb={4}>
                Adresse :{" "}
                <Text as="span" variant="highlight">
                  {etablissement.numero_voie} {etablissement.type_voie} {etablissement.nom_voie}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.adresse} />
              </Text>
              <Text mb={4}>
                Complément d'adresse :{" "}
                <Text as="span" variant="highlight">
                  {etablissement.complement_adresse ?? "N/A"}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.complement_adresse} />
              </Text>
              <Text mb={4}>
                Code postal :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.code_postal}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.code_postal} />
              </Text>
              <Text mb={4}>
                Commune :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.localite}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.localite} />
              </Text>
              <Text mb={4}>
                Code commune INSEE :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.code_insee_localite}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.code_insee_localite} />
              </Text>
              <Text mb={4}>
                Département :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.nom_departement}{" "}
                </Text>
              </Text>
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={[12, 5]} p={8}>
          <Container>
            <Heading textStyle="h4" color="grey.800">
              Informations complémentaires
            </Heading>
            <Box mb={4}>
              {countFormations > 0 ? (
                <Link
                  as={NavLink}
                  to={linkFormations}
                  textDecoration="underline"
                  color="bluefrance"
                  textStyle="rf-text"
                  isExternal
                >
                  Voir les {countFormations} formations associées à cet organisme <ArrowRightLine w="9px" h="9px" />
                </Link>
              ) : (
                <Text>Aucune formation associée à cet organisme</Text>
              )}
            </Box>

            <Box textStyle="rf-text">
              <Text mb={4}>
                {hasRightToEdit && !edition && (
                  <Button onClick={onEdit} variant="unstyled" aria-label="Modifier l'UAI">
                    <Edit2Fill w="16px" h="16px" color="bluefrance" mr="8px" mb="7px" />
                  </Button>
                )}
                UAI rattaché au SIRET :{" "}
                {!edition && (
                  <>
                    <Text as="span" variant="highlight">
                      {etablissement.uai}
                    </Text>{" "}
                    <InfoTooltip description={helpText.etablissement.uai} />
                  </>
                )}
                {edition && (
                  <Input type="text" variant="edition" name="uai" onChange={handleChange} value={values.uai} />
                )}
                {edition && (
                  <>
                    <Button
                      mt={2}
                      mr={2}
                      variant="secondary"
                      onClick={() => {
                        onEdit();
                      }}
                    >
                      Annuler
                    </Button>
                    <Button mt={2} variant="primary" onClick={handleSubmit}>
                      Valider
                    </Button>
                  </>
                )}
              </Text>
              <Text mb={4}>
                Type :{" "}
                <Text as="span" variant="highlight">
                  {etablissement.computed_type}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.type} />
              </Text>
              <Text mb={4}>
                Académie :{" "}
                <Text as="span" variant="highlight">
                  {etablissement.nom_academie} ({etablissement.num_academie})
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.academie} />
              </Text>

              <Text mb={4}>
                Conventionné :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.computed_conventionne}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.conventionne} />
              </Text>
              <Text mb={4}>
                Déclaré en préfecture : <strong> {etablissement.computed_declare_prefecture} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.declare_prefecture} />
              </Text>
              <Text mb={4}>
                Certification qualité :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.computed_info_datadock}{" "}
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.datadock} />
              </Text>
            </Box>

            {!etablissement.siege_social && (
              <Box>
                <Heading textStyle="h4" color="grey.800">
                  Siège social
                </Heading>
                <Box>
                  {etablissement.entreprise_raison_sociale && (
                    <Text mb={4}>
                      Raison sociale :{" "}
                      <Text as="span" variant="highlight">
                        {" "}
                        {etablissement.entreprise_raison_sociale}{" "}
                      </Text>{" "}
                    </Text>
                  )}
                  {etablissement.etablissement_siege_siret && (
                    <Text mb={4}>
                      Siret :{" "}
                      <Text as="span" variant="highlight">
                        {" "}
                        {etablissement.etablissement_siege_siret}{" "}
                      </Text>{" "}
                    </Text>
                  )}
                  <Box mt={3}>
                    <Link
                      as={NavLink}
                      to={`/etablissement/${etablissement.etablissement_siege_id}`}
                      textDecoration="underline"
                      color="bluefrance"
                      textStyle="rf-text"
                      isExternal
                    >
                      Voir le siége social <ArrowRightLine w="9px" h="9px" />
                    </Link>
                  </Box>
                </Box>
              </Box>
            )}
          </Container>
        </GridItem>
      </Grid>
      <Box mt={8} mb={16}>
        <Button variant={"unstyled"} textStyle="rf-text" color="bluefrance" flex="1" onClick={onOpen}>
          <ArrowRightLine w="9px" h="9px" mr={2} /> Demander des corrections sur les données sur votre organisme
        </Button>
      </Box>
      <HowToFixModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default ({ match }) => {
  const [etablissement, setEtablissement] = useState(null);
  const [edition, setEdition] = useState(false);
  const [gatherData, setGatherData] = useState(0);
  const [modal, setModal] = useState(false);
  const [countFormations, setCountFormations] = useState(0);

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      uai: "",
    },
    onSubmit: ({ uai }) => {
      return new Promise(async (resolve, reject) => {
        let result = null;
        if (uai !== etablissement.uai) {
          setModal(true);
          setGatherData(1);
          try {
            const up = await _post(`${endpointTCO}/services/etablissement`, { ...etablissement, uai });
            result = await _put(`${endpointNewFront}/entity/etablissement/${match.params.id}`, { ...up });
          } catch (err) {
            console.error(err);
          }
          setGatherData(2);
          await sleep(500);

          setModal(false);
        }

        if (result) {
          setEtablissement(result);
          setFieldValue("uai", result.uai);
        }

        setEdition(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    async function run() {
      try {
        const eta = await _get(`${endpointTCO}/entity/etablissement/${match.params.id}`, false);
        setEtablissement(eta);
        setFieldValue("uai", eta.uai);

        const query = {
          published: true,
          $or: [{ etablissement_formateur_siret: eta.siret }, { etablissement_gestionnaire_siret: eta.siret }],
        };

        const count = await _get(
          `${endpointNewFront}/entity/formations2021/count?query=${JSON.stringify(query)}`,
          false
        );

        setCountFormations(count);
      } catch (e) {
        // dispatch(push(routes.NOTFOUND));
      }
    }
    run();
  }, [match, setFieldValue]);

  const onEdit = () => {
    setEdition(!edition);
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
              <BreadcrumbLink as={NavLink} to="/recherche/etablissements" color="grey.600" textDecoration="underline">
                Établissements
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{etablissement?.entreprise_raison_sociale}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Box>
        <Box>
          <Container maxW="xl">
            {!etablissement && (
              <Center h="70vh">
                <Spinner />
              </Center>
            )}
            {etablissement && (
              <>
                <Heading textStyle="h2" color="grey.800" mt={6}>
                  {etablissement.entreprise_raison_sociale}{" "}
                  <InfoTooltip description={helpText.etablissement.raison_sociale} />
                </Heading>
                <Box mb={2}>
                  {etablissement.tags &&
                    etablissement.tags
                      .sort((a, b) => a - b)
                      .map((tag, i) => (
                        <Badge variant="year" mr="10px" mt={3} key={i}>
                          {tag}
                        </Badge>
                      ))}
                </Box>
                <Etablissement
                  etablissement={etablissement}
                  edition={edition}
                  onEdit={onEdit}
                  values={values}
                  handleSubmit={handleSubmit}
                  handleChange={handleChange}
                  countFormations={countFormations}
                />
                <Modal isOpen={modal}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Merci ne pas fermer cette page</ModalHeader>
                    <ModalBody>
                      {gatherData !== 0 && (
                        <Box>
                          <Box>
                            Mise à jour des informations {gatherData === 1 && <Spinner />}
                            {gatherData > 1 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                          </Box>
                        </Box>
                      )}
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </>
            )}
          </Container>
        </Box>
      </Box>
    </Layout>
  );
};
