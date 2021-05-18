import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Grid,
  GridItem,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Heading,
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
import { ArrowDropRightLine, ExternalLinkLine, ArrowRightLine, Edit2Fill } from "../../theme/components/icons/";
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
      <Grid templateColumns="repeat(12, 1fr)" gap={4}>
        <GridItem colSpan="7" border="1px solid" borderColor="bluefrance" mt={5}>
          <Box ml="2rem" pt={5} pr={5}>
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
                Enseigne : <strong> {etablissement.enseigne ?? "N/A"} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.enseigne} />
              </Text>
              <Text mb={4}>
                Siret : <strong> {etablissement.siret} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.siret} />
              </Text>
              <Text mb={4}>
                Siren : <strong> {etablissement.siren} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.siren} />
              </Text>
              <Text mb={4}>
                Code NAF : <strong> {etablissement.naf_code} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.naf_code} />
              </Text>
              <Text mb={4}>
                Libellé NAF : <strong> {etablissement.naf_libelle} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.naf_libelle} />
              </Text>
              <Text mb={4}>
                Date de création : <strong> {creationDate} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.date_creation} />
              </Text>
              <Text mb={4}>
                Adresse : <strong> {etablissement.adresse} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.adresse} />
              </Text>
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan="5" mt={16}>
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
                Type : {etablissement.computed_type} <InfoTooltip description={helpText.etablissement.type} />
              </Text>
              <Text mb={4}>
                {hasRightToEdit && !edition && (
                  <Button onClick={onEdit} variant="unstyled" _focus={{ boxShadow: "none", outlineWidth: 0 }}>
                    <Edit2Fill w="16px" h="16px" color="bluefrance" mr="8px" mb="7px" />
                  </Button>
                )}
                UAI :{" "}
                {!edition && (
                  <>
                    {etablissement.uai} <InfoTooltip description={helpText.etablissement.uai} />
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
                Conventionné : <strong> {etablissement.computed_conventionne} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.conventionne} />
              </Text>
              <Text mb={4}>
                Déclaré en préfecture : <strong> {etablissement.computed_declare_prefecture} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.declare_prefecture} />
              </Text>
              <Text mb={4}>
                Certification qualité : <strong> {etablissement.computed_info_datadock} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.datadock} />
              </Text>
              <Text mb={4}>
                Code postal : <strong> {etablissement.code_postal} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.code_postal} />
              </Text>
              <Text mb={4}>
                Code commune : <strong> {etablissement.code_insee_localite} </strong>{" "}
                <InfoTooltip description={helpText.etablissement.code_insee_localite} />
              </Text>
              <Text mb={4}>
                Académie :{" "}
                <strong>
                  {etablissement.nom_academie} ({etablissement.num_academie})
                </strong>{" "}
                <InfoTooltip description={helpText.etablissement.academie} />
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
                      Raison sociale : <strong> {etablissement.entreprise_raison_sociale} </strong>{" "}
                    </Text>
                  )}
                  {etablissement.etablissement_siege_siret && (
                    <Text mb={4}>
                      Siret : <strong> {etablissement.etablissement_siege_siret} </strong>{" "}
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
        <GridItem colSpan="5">
          <Box>
            <Link textStyle="rf-text" color="bluefrance" flex="1" onClick={onOpen}>
              <ArrowRightLine w="9px" h="9px" mr={2} /> Demander des corrections sur les données sur votre organisme
            </Link>
          </Box>
        </GridItem>
        <Box h="300px" />
      </Grid>
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
      <div className="etablissement">
        <div className="notice">
          <Container maxW="xl">
            {!etablissement && (
              <Box align="center" p={2}>
                <Spinner />
              </Box>
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
                        <Badge
                          variant="solid"
                          bg="greenmedium.300"
                          borderRadius="16px"
                          color="grey.800"
                          textStyle="sm"
                          px="15px"
                          mr="10px"
                          mt={3}
                          key={i}
                        >
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
                        <div>
                          <div>
                            Mise à jour des informations {gatherData === 1 && <Spinner />}
                            {gatherData > 1 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                          </div>
                        </div>
                      )}
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </>
            )}
          </Container>
        </div>
      </div>
    </Layout>
  );
};
