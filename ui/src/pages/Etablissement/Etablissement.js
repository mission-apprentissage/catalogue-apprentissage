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
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../common/hooks/useAuth";
import { _get, _post, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { hasOneOfRoles } from "../../common/utils/rolesUtils";
// import "./etablissement.css";
import { NavLink } from "react-router-dom";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";
import { ArrowDropRightLine, ExternalLinkLine, ArrowRightLine, Edit2Fill } from "../../theme/components/icons/";

const sleep = (m) => new Promise((r) => setTimeout(r, m));

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const EditSection = ({ edition, onEdit, handleSubmit }) => {
  return (
    <div className="sidebar-section info sidebar-section-edit">
      {edition && (
        <>
          <Button mb={3} colorScheme="blue" onClick={handleSubmit} isFullWidth>
            Valider
          </Button>
          <Button
            colorScheme="blue"
            variant="outline"
            isFullWidth
            onClick={() => {
              onEdit();
            }}
          >
            Annuler
          </Button>
        </>
      )}
      {!edition && (
        <>
          <Button
            colorScheme="blue"
            variant="outline"
            isFullWidth
            onClick={() => {
              onEdit();
            }}
          >
            Modifier
          </Button>
        </>
      )}
    </div>
  );
};

const Etablissement = ({ etablissement, edition, onEdit, handleChange, handleSubmit, values, countFormations }) => {
  const [auth] = useAuth();
  const hasRightToEdit = hasOneOfRoles(auth, ["admin"]);

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
    <Grid templateColumns="repeat(12, 1fr)" gap={4}>
      <GridItem colSpan="7" border="1px solid #000091" mt={5}>
        <Box ml="2rem" mt={5}>
          <Heading textStyle="h4" color="grey.800">
            Caractéritiques de l’établissement
          </Heading>
          <Box mb={4}>
            {etablissement.onisep_url !== "" && etablissement.onisep_url !== null && (
              <Link
                href={etablissement.onisep_url}
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
          <Box textStyle="rf-text">
            <Text mb={4} mt={4}>
              Enseigne : <strong> {etablissement.enseigne} </strong>
              <InfoTooltip description={helpText.etablissement.enseigne} />
            </Text>
            <Text mb={4}>
              Siret : <strong> {etablissement.siret}</strong> <InfoTooltip description={helpText.etablissement.siret} />
            </Text>
            <Text mb={4}>
              Siren : <strong> {etablissement.siren} </strong>
              <InfoTooltip description={helpText.etablissement.siren} />
            </Text>
            <Text mb={4}>
              Code NAF : <strong> {etablissement.naf_code} </strong>
              <InfoTooltip description={helpText.etablissement.naf_code} />
            </Text>
            <Text mb={4}>
              Libellé NAF : <strong> {etablissement.naf_libelle}</strong>
              <InfoTooltip description={helpText.etablissement.naf_libelle} />
            </Text>
            <Text mb={4}>
              Date de création : <strong> {creationDate}</strong>
              <InfoTooltip description={helpText.etablissement.date_creation} />
            </Text>
            <Text mb={4}>
              Adresse : <strong> {etablissement.adresse}</strong>
              <InfoTooltip description={helpText.etablissement.adresse} />
            </Text>
          </Box>
        </Box>
      </GridItem>
      <GridItem colSpan="5">
        <Container className="sidebar-section info">
          <Heading textStyle="h4" color="grey.800">
            À Informations complémentaires
          </Heading>
          <Box mb={4}>
            {etablissement.onisep_url !== "" && etablissement.onisep_url !== null && (
              <Link
                href={etablissement.onisep_url}
                mt={3}
                textDecoration="underline"
                color="bluefrance"
                textStyle="rf-text"
                isExternal
              >
                voir les 2 formations associés à cet organisme
              </Link>
            )}
            <ArrowRightLine w="9px" h="9px" ml={2} />
          </Box>

          <Box textStyle="rf-text">
            <Text mb={4}>
              Type : {etablissement.computed_type} <InfoTooltip description={helpText.etablissement.type} />
            </Text>
            <Text mb={4}>
              <Edit2Fill w="16px" h="16px" color="bluefrance" mr="8px" mb="7px" /> UAI :
              {!edition && (
                <>
                  {etablissement.uai} <InfoTooltip description={helpText.etablissement.uai} />
                </>
              )}
              {edition && <Input type="text" name="uai" onChange={handleChange} value={values.uai} />}
            </Text>
            <Text mb={4}>
              Conventionné : <strong>{etablissement.computed_conventionne}</strong>
              <InfoTooltip description={helpText.etablissement.conventionne} />
            </Text>
            <Text mb={4}>
              Déclaré en préfecture : <strong>{etablissement.computed_declare_prefecture} </strong>
              <InfoTooltip description={helpText.etablissement.declare_prefecture} />
            </Text>
            <Text mb={4}>
              Certification qualité : <strong>{etablissement.computed_info_datadock}</strong>
              <InfoTooltip description={helpText.etablissement.datadock} />
            </Text>
            <Text mb={4}>
              Code postal : <strong> {etablissement.code_postal}</strong>
              <InfoTooltip description={helpText.etablissement.code_postal} />
            </Text>
            <Text mb={4}>
              Code commune : <strong>{etablissement.code_insee_localite}</strong>
              <InfoTooltip description={helpText.etablissement.code_insee_localite} />
            </Text>
            <Text mb={4}>
              Académie :{" "}
              <strong>
                {etablissement.nom_academie} ({etablissement.num_academie})
              </strong>
              <InfoTooltip description={helpText.etablissement.academie} />
            </Text>
          </Box>
          {countFormations > 0 ? (
            <Link
              as={NavLink}
              to={linkFormations}
              textDecoration="underline"
              color="blue.500"
              fontWeight="bold"
              isExternal
            >
              Voir les {countFormations} formations trouvées pour cet établissement
            </Link>
          ) : (
            <Text>Aucune formation trouvée pour cet établissement</Text>
          )}
        </Container>
        {!etablissement.siege_social && (
          <div className="sidebar-section info">
            <h2>Siége social</h2>
            <div>
              {etablissement.entreprise_raison_sociale && (
                <div className="field">
                  <h3>Raison sociale</h3>
                  <p>{etablissement.entreprise_raison_sociale}</p>
                </div>
              )}
              {etablissement.etablissement_siege_siret && (
                <div className="field">
                  <h3>Siret</h3>
                  <p>{etablissement.etablissement_siege_siret}</p>
                </div>
              )}
              <Box className="field field-button" mt={3}>
                <a href="#siege">
                  <Button colorScheme="blue">Voir le siége social</Button>
                </a>
              </Box>
            </div>
          </div>
        )}
      </GridItem>
      <GridItem colSpan="5">
        <Box>
          <Link textStyle="rf-text" color="bluefrance" flex="1">
            <ArrowRightLine w="9px" h="9px" mr={2} /> Demander des corrections sur les données sur votre organisme
          </Link>
        </Box>
      </GridItem>
      <Box h="300px" />
    </Grid>
  );
};

export default ({ match }) => {
  const [etablissement, setEtablissement] = useState(null);
  const [edition, setEdition] = useState(false);
  const [gatherData, setGatherData] = useState(0);
  const [modal, setModal] = useState(false);
  const [countFormations, setCountFormations] = useState(0);

  // const dispatch = useDispatch();

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      uai: "",
    },
    onSubmit: ({ uai }, { setSubmitting }) => {
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
                  {etablissement.entreprise_raison_sociale}
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
