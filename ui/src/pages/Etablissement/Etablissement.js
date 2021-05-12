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
} from "@chakra-ui/react";

import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../common/hooks/useAuth";
import { _get, _post, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { hasOneOfRoles } from "../../common/utils/rolesUtils";

import "./etablissement.css";
import { NavLink } from "react-router-dom";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";

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
      <GridItem colSpan="7">
        <div className="notice-details">
          <h2 className="small">Détails</h2>
          <div className="field">
            <h3>Enseigne</h3>
            <p>
              {etablissement.enseigne} <InfoTooltip description={helpText.etablissement.enseigne} />
            </p>
          </div>
          <div className="field">
            <h3>Siret</h3>
            <p>
              {etablissement.siret} <InfoTooltip description={helpText.etablissement.siret} />
            </p>
          </div>
          <div className="field">
            <h3>Siren</h3>
            <p>
              {etablissement.siren} <InfoTooltip description={helpText.etablissement.siren} />
            </p>
          </div>
          <div className="field">
            <h3>
              Code NAF
              <p>
                {etablissement.naf_code} <InfoTooltip description={helpText.etablissement.naf_code} />
              </p>
            </h3>
          </div>
          <div className="field">
            <h3>Libellé NAF</h3>
            <p>
              {etablissement.naf_libelle} <InfoTooltip description={helpText.etablissement.naf_libelle} />
            </p>
          </div>
          <div className="field">
            <h3>Date de création</h3>
            <p>
              {creationDate} <InfoTooltip description={helpText.etablissement.date_creation} />
            </p>
          </div>
          <div className="field">
            <h3>Adresse</h3>
            <p>
              {etablissement.adresse} <InfoTooltip description={helpText.etablissement.adresse} />
            </p>
          </div>
        </div>
      </GridItem>
      <GridItem colSpan="5">
        {hasRightToEdit && <EditSection edition={edition} onEdit={onEdit} handleSubmit={handleSubmit} />}
        <div className="sidebar-section info">
          <h2>À propos</h2>
          <div>
            <div className="field pills">
              <h3>Tags</h3>
              {etablissement.tags &&
                etablissement.tags
                  .sort((a, b) => a - b)
                  .map((tag, i) => (
                    <Badge colorScheme="green" variant="solid" key={i} className="badge">
                      {tag}
                    </Badge>
                  ))}
            </div>
            <div className="field multiple">
              <div>
                <h3>Type</h3>
                <p>
                  {etablissement.computed_type} <InfoTooltip description={helpText.etablissement.type} />
                </p>
              </div>
              <div>
                <h3>UAI</h3>
                <p>
                  {!edition && (
                    <>
                      {etablissement.uai} <InfoTooltip description={helpText.etablissement.uai} />
                    </>
                  )}
                  {edition && <Input type="text" name="uai" onChange={handleChange} value={values.uai} />}
                </p>
              </div>
            </div>
            <div className="field">
              <h3>Conventionné ?</h3>
              <p>
                {etablissement.computed_conventionne} <InfoTooltip description={helpText.etablissement.conventionne} />
              </p>
            </div>
            <div className="field">
              <h3>Déclaré en préfecture ?</h3>
              <p>
                {etablissement.computed_declare_prefecture}{" "}
                <InfoTooltip description={helpText.etablissement.declare_prefecture} />
              </p>
            </div>
            <div className="field">
              <h3>Certification qualité</h3>
              <p>
                {etablissement.computed_info_datadock} <InfoTooltip description={helpText.etablissement.datadock} />
              </p>
            </div>
            <div className="field multiple">
              <div>
                <h3>Code postal</h3>
                <p>
                  {etablissement.code_postal} <InfoTooltip description={helpText.etablissement.code_postal} />
                </p>
              </div>
              <div>
                <h3>Code commune</h3>
                <p>
                  {etablissement.code_insee_localite}{" "}
                  <InfoTooltip description={helpText.etablissement.code_insee_localite} />
                </p>
              </div>
            </div>
            <div className="field">
              <h3>Académie</h3>
              <p>
                {etablissement.nom_academie} ({etablissement.num_academie}){" "}
                <InfoTooltip description={helpText.etablissement.academie} />
              </p>
            </div>
          </div>
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
        </div>
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
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/recherche/etablissements">
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
                <h1 className="heading">
                  {etablissement.entreprise_raison_sociale}{" "}
                  <InfoTooltip description={helpText.etablissement.raison_sociale} />
                </h1>
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
