import React, { useEffect, useState, useRef } from "react";
import {
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
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import useAuth from "../../common/hooks/useAuth";
import { _get } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { hasAccessTo, hasRightToEditEtablissement } from "../../common/utils/rolesUtils";
import { NavLink } from "react-router-dom";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";
import { ArrowRightLine, Edit2Fill, ExternalLinkLine, Tick } from "../../theme/components/icons/";
import { HowToFixModal } from "../../common/components/organisme/HowToFixModal";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import { QualiteBadge } from "../../common/components/QualiteBadge";
import { etablissementService, updateUaiOrganisme } from "../../common/api/organisme";

const sleep = (m) => new Promise((r) => setTimeout(r, m));

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const Etablissement = ({ etablissement, edition, onEdit, handleChange, handleSubmit, values, countFormations }) => {
  const [user] = useAuth();
  const hasRightToEdit =
    hasAccessTo(user, "page_organisme/modifier_informations") && hasRightToEditEtablissement(etablissement, user);
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
  const linkFormations = `/recherche/formations?qb=${encodeURIComponent(JSON.stringify(query))}&defaultMode="advanced"`;

  let creationDate = "";
  try {
    creationDate = new Date(etablissement.date_creation).toLocaleDateString("fr-FR");
  } catch (e) {
    console.error("can't display creation date ", etablissement.date_creation);
  }

  const UaiContainer = etablissement.uai_valide
    ? React.Fragment
    : (args) => (
        <Box
          data-testid={"uai-warning"}
          bg={"orangesoft.200"}
          p={4}
          mb={4}
          borderLeft={"4px solid"}
          borderColor={"orangesoft.500"}
          w={"full"}
          {...args}
        />
      );

  return (
    <>
      <Grid templateColumns="repeat(12, 1fr)" mt={8}>
        <GridItem colSpan={[12, 12, 7]} bg="white">
          <Box border="1px solid" borderColor="bluefrance" p={8} mb={4}>
            <Heading textStyle="h4" color="grey.800">
              Caractéristiques de l’organisme
            </Heading>
            {etablissement.onisep_url !== "" && etablissement.onisep_url !== null && (
              <Box mt={2} mb={4} ml={-3}>
                <Link
                  href={`https://${etablissement.onisep_url}`}
                  mt={3}
                  variant={"pill"}
                  textStyle="rf-text"
                  isExternal
                >
                  voir la fiche descriptive Onisep <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
                </Link>
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
        <GridItem colSpan={[12, 12, 5]}>
          <Box py={8} px={[4, 4, 8]}>
            <Heading textStyle="h4" color="grey.800">
              Informations complémentaires
            </Heading>
            {countFormations > 0 ? (
              <Box mt={2} mb={4} ml={[-2, -2, -3]}>
                <Link as={NavLink} to={linkFormations} variant={"pill"} textStyle="rf-text" isExternal>
                  voir les {countFormations} formations associées à cet organisme <ArrowRightLine w="9px" h="9px" />
                </Link>
              </Box>
            ) : (
              <Box mt={2} mb={4}>
                <Text>Aucune formation associée à cet organisme</Text>
              </Box>
            )}

            <Box textStyle="rf-text">
              <UaiContainer>
                <Text mb={etablissement?.uai_valide ? 4 : 0}>
                  {hasRightToEdit && !edition && (
                    <Button data-testid="uai-edit" onClick={onEdit} variant="unstyled" aria-label="Modifier l'UAI">
                      <Edit2Fill w="16px" h="16px" color="bluefrance" mr="8px" mb="7px" />
                    </Button>
                  )}
                  UAI rattaché au SIRET : {}
                  {edition ? (
                    <>
                      <Input
                        data-testid="uai-input"
                        type="text"
                        variant="edition"
                        name="uai"
                        onChange={handleChange}
                        value={values.uai}
                      />
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
                  ) : (
                    <>
                      <Text as="span" variant="highlight">
                        {etablissement.uai}
                      </Text>{" "}
                      <InfoTooltip description={helpText.etablissement.uai} />
                    </>
                  )}
                </Text>
              </UaiContainer>

              <Text mb={4}>
                Académie :{" "}
                <Text as="span" variant="highlight">
                  {etablissement.nom_academie} ({etablissement.num_academie})
                </Text>{" "}
                <InfoTooltip description={helpText.etablissement.academie} />
              </Text>

              <Text mb={4}>
                Certification qualité :{" "}
                <Text as="span" variant="highlight">
                  {" "}
                  {etablissement.info_qualiopi_info === "OUI" && "qualiopi OUI"}
                  {etablissement.info_qualiopi_info === "NON" && "qualiopi NON"}
                </Text>
                <InfoTooltip description={helpText.etablissement.qualite} />
              </Text>
            </Box>

            {!etablissement.siege_social && (
              <Box pt={8}>
                <Text textStyle="rf-text" color="grey.700" fontWeight="700" mb={3}>
                  Siège social
                </Text>

                {etablissement.etablissement_siege_id && (
                  <Link as={NavLink} to={`/etablissement/${etablissement.etablissement_siege_id}`} variant="card">
                    {etablissement.entreprise_raison_sociale && (
                      <Text mb={4}>
                        Raison sociale : <Text as="span"> {etablissement.entreprise_raison_sociale} </Text>{" "}
                      </Text>
                    )}
                    {etablissement.etablissement_siege_siret && (
                      <Text mb={4}>
                        Siret : <Text as="span"> {etablissement.etablissement_siege_siret} </Text>{" "}
                      </Text>
                    )}
                    <Flex justifyContent="flex-end">
                      <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
                    </Flex>
                  </Link>
                )}

                {!etablissement.etablissement_siege_id && (
                  <Text variant="card" as="div">
                    <Text mb={4} fontStyle="italic">
                      Données issues de l'API Entreprise
                    </Text>
                    {etablissement.entreprise_raison_sociale && (
                      <Text mb={4}>
                        Raison sociale : <Text as="span"> {etablissement.entreprise_raison_sociale} </Text>{" "}
                      </Text>
                    )}
                    {etablissement.etablissement_siege_siret && (
                      <Text mb={4}>
                        Siret : <Text as="span"> {etablissement.etablissement_siege_siret} </Text>{" "}
                      </Text>
                    )}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
      {hasAccessTo(user, "page_organisme/demandes_corretions") && (
        <Box mt={8} mb={16}>
          <Button variant={"pill"} textStyle="rf-text" onClick={onOpen} whiteSpace="normal">
            <ArrowRightLine w="9px" h="9px" mr={2} /> Demander des corrections sur les données sur votre organisme
          </Button>
        </Box>
      )}

      <HowToFixModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default ({ match }) => {
  const [etablissement, setEtablissement] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [edition, setEdition] = useState(false);
  const [gatherData, setGatherData] = useState(0);
  const [modal, setModal] = useState(false);
  const [countFormations, setCountFormations] = useState(0);
  const [user] = useAuth();
  const toast = useToast();
  const history = useHistory();

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      uai: "",
    },
    onSubmit: ({ uai }) => {
      return new Promise(async (resolve) => {
        let result = null;
        const trimedUai = uai?.trim();

        if (trimedUai !== etablissement.uai) {
          setModal(true);
          setGatherData(1);
          try {
            const { etablissement: updatedEtablissement, error } = await etablissementService({
              body: {
                ...etablissement,
                uai: trimedUai,
              },
            });

            if (error) {
              throw new Error(error);
            }

            result = await updateUaiOrganisme({
              id: match.params.id,
              etablissement,
              body: updatedEtablissement,
              uai: trimedUai,
              user,
            });
          } catch (err) {
            console.error(err);
            const response = await (err?.json ?? {});
            const message = response?.message ?? err?.message;
            toast({
              title: "Error",
              description: message,
              status: "error",
              duration: 10000,
            });
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

  const mountedRef = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const eta = await _get(`${CATALOGUE_API}/entity/etablissement/${match.params.id}`, false);
        setEtablissement(eta);
        setFieldValue("uai", eta.uai);

        if (!mountedRef.current) return null;

        const query = {
          published: true,
          $or: [{ etablissement_formateur_siret: eta.siret }, { etablissement_gestionnaire_siret: eta.siret }],
        };

        const count = await _get(`${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify(query)}`, false);

        if (!mountedRef.current) return null;

        setLoading(false);
        setCountFormations(count);
      } catch (e) {
        if (!mountedRef.current) return null;
        setLoading(false);
        setEtablissement(undefined);
        setCountFormations(0);
      }
    })();
    return () => {
      mountedRef.current = false;
    };
  }, [match, setFieldValue]);

  const onEdit = () => {
    setEdition(!edition);
  };

  const title = loading ? "" : `${etablissement?.entreprise_raison_sociale ?? "Etablissement inconnu"}`;
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              { title: "Liste des organismes", to: "/recherche/etablissements" },
              ...[loading ? [] : { title: title }],
            ]}
          />
        </Container>
      </Box>
      <Box px={[1, 1, 12, 24]}>
        <Box>
          <Container maxW="xl">
            {loading && (
              <Center h="70vh">
                <Spinner />
              </Center>
            )}
            {!loading && !!etablissement && (
              <>
                <Box mt={6} mb={2}>
                  <QualiteBadge value={etablissement.certifie_qualite} my={0} mx={0} />
                  <Heading textStyle="h2" color="grey.800" my={2}>
                    {title} <InfoTooltip description={helpText.etablissement.raison_sociale} />
                  </Heading>
                  {etablissement.tags &&
                    etablissement.tags
                      .sort((a, b) => a - b)
                      .map((tag, i) => (
                        <Badge variant="year" key={i} my={0}>
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
                            {gatherData > 1 && <Tick color={"success"} boxSize={5} />}
                          </Box>
                        </Box>
                      )}
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </>
            )}
            {!loading && !etablissement && (
              <Box mb={8} mt={6}>
                <Flex alignItems="center" justify="space-between" flexDirection={["column", "column", "row"]}>
                  <Heading textStyle="h2" color="grey.800" pr={[0, 0, 8]}>
                    {title}
                  </Heading>
                  <Button
                    textStyle="sm"
                    variant="primary"
                    minW={null}
                    px={8}
                    mt={[8, 8, 0]}
                    onClick={() => {
                      history.push("/recherche/etablissements");
                    }}
                  >
                    Retour à la recherche
                  </Button>
                </Flex>
                <Box mt={5} mb={8}>
                  <Flex>{helpText.etablissement.not_found}</Flex>
                </Box>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </Layout>
  );
};
