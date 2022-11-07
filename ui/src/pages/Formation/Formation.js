import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Center,
  Collapse,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { _get } from "../../common/httpClient";
import Layout from "../layout/Layout";
import useAuth from "../../common/hooks/useAuth";
import { hasAccessTo } from "../../common/utils/rolesUtils";
import InfoTooltip from "../../common/components/InfoTooltip";

import helpText from "../../locales/helpText.json";
import { ArrowDownLine, ExternalLinkLine, MapPin2Fill } from "../../theme/components/icons/";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import { getOpenStreetMapUrl } from "../../common/utils/mapUtils";
import { DescriptionBlock } from "../../common/components/formation/DescriptionBlock";
import { OrganismesBlock } from "../../common/components/formation/OrganismesBlock";
import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../constants/catalogueLabels";

const endpointLBA = process.env.REACT_APP_ENDPOINT_LBA || "https://labonnealternance.pole-emploi.fr";

const getLBAUrl = ({ cle_ministere_educatif = "" }) => {
  return `${endpointLBA}/recherche-apprentissage?&display=list&page=fiche&type=training&itemId=${encodeURIComponent(
    cle_ministere_educatif
  )}`;
};

const Formation = ({ formation }) => {
  // Distance tolérer entre l'adresse et les coordonnées transmise par RCO
  const seuilDistance = 100;

  const { isOpen: isComputedAdressOpen, onToggle: onComputedAdressToggle } = useDisclosure(
    formation.distance > seuilDistance
  );
  const { isOpen: isComputedGeoCoordOpen, onToggle: onComputedGeoCoordToggle } = useDisclosure(
    formation.distance > seuilDistance
  );

  const AdresseContainer = React.Fragment;
  // formation.distance < seuilDistance
  //   ? (args) => <WarningBox data-testid={"adress-warning"} {...args} />
  //   : React.Fragment;

  return (
    <Box borderRadius={4}>
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 12, 7]} bg="white">
          <Box border="1px solid" borderColor="bluefrance">
            <DescriptionBlock formation={formation} />
          </Box>
        </GridItem>
        <GridItem colSpan={[12, 12, 5]} py={8} px={[4, 4, 8]}>
          <Box mb={16}>
            <Heading textStyle="h4" color="grey.800">
              <MapPin2Fill w="12px" h="15px" mr="5px" mb="5px" />
              Lieu de la formation
            </Heading>
            <Box mt={2} mb={4} ml={[-2, -2, -3]}>
              {formation.catalogue_published && (
                <Link href={getLBAUrl(formation)} textStyle="rf-text" variant="pill" isExternal>
                  voir sur labonnealternance <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
                </Link>
              )}
            </Box>

            <Box>
              <AdresseContainer>
                <Text mb={4}>
                  Adresse :{" "}
                  <Text as="span" variant="highlight">
                    {formation.lieu_formation_adresse}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.lieu_formation_adresse} />
                </Text>
                <Text mb={4}>
                  Code postal :{" "}
                  <Text as="span" variant="highlight">
                    {formation.code_postal}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.code_postal} />
                </Text>
                <Text mb={4}>
                  Commune :{" "}
                  <Text as="span" variant="highlight">
                    {formation.localite}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.localite} />
                </Text>
                <Text mb={formation?.lieu_formation_geo_coordonnees_computed ? 0 : 4}>
                  Département :{" "}
                  <Text as="span" variant="highlight">
                    {formation.nom_departement} ({formation.num_departement})
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.nom_departement} />
                </Text>
                {formation?.lieu_formation_geo_coordonnees_computed && (
                  <Box mb={4}>
                    <Button
                      onClick={onComputedGeoCoordToggle}
                      variant={"unstyled"}
                      fontSize={"zeta"}
                      fontStyle={"italic"}
                      color={"grey.600"}
                    >
                      Géolocalisation calculée depuis l'adresse{" "}
                      <ArrowDownLine boxSize={5} transform={isComputedGeoCoordOpen ? "rotate(180deg)" : "none"} />
                    </Button>
                    <Collapse in={isComputedGeoCoordOpen} animateOpacity unmountOnExit={true}>
                      <Text>
                        <Text fontSize={"zeta"} color={"grey.600"} as="span">
                          <Link
                            href={getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees_computed)}
                            textStyle="rf-text"
                            variant="pill"
                            title="Voir sur GeoPortail"
                            isExternal
                          >
                            {formation.lieu_formation_geo_coordonnees_computed}
                          </Link>
                        </Text>{" "}
                        <InfoTooltip description={helpText.formation.lieu_formation_geo_coordonnees_computed} />
                      </Text>
                    </Collapse>
                  </Box>
                )}

                <Text mb={formation?.lieu_formation_adresse_computed ? 0 : 4}>
                  Géolocalisation :{" "}
                  <Text as="span" variant="highlight">
                    {formation.lieu_formation_geo_coordonnees}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.lieu_formation_geo_coordonnees} />
                </Text>
                {formation?.lieu_formation_adresse_computed && (
                  <Box mb={4}>
                    <Button
                      onClick={onComputedAdressToggle}
                      variant={"unstyled"}
                      fontSize={"zeta"}
                      fontStyle={"italic"}
                      color={"grey.600"}
                    >
                      Adresse calculée depuis la géolocalisation{" "}
                      <ArrowDownLine boxSize={5} transform={isComputedAdressOpen ? "rotate(180deg)" : "none"} />
                    </Button>
                    <Collapse in={isComputedAdressOpen} animateOpacity unmountOnExit={true}>
                      <Text>
                        <Text fontSize={"zeta"} color={"grey.600"} as="span">
                          <Link
                            href={getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees)}
                            textStyle="rf-text"
                            variant="pill"
                            title="Voir sur GeoPortail"
                            isExternal
                          >
                            {formation.lieu_formation_adresse_computed}
                          </Link>
                        </Text>{" "}
                        <InfoTooltip description={helpText.formation.lieu_formation_adresse_computed} />
                      </Text>
                    </Collapse>
                  </Box>
                )}
              </AdresseContainer>

              <Text mb={4}>
                Code commune :{" "}
                <Text as="span" variant="highlight">
                  {formation.code_commune_insee}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.code_commune_insee} />
              </Text>

              <Text mb={4}>
                Académie de rattachement :{" "}
                <Text as="span" variant="highlight">
                  {formation.nom_academie} ({formation.num_academie})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.academie} />
              </Text>
            </Box>
          </Box>
          <Box mb={16}>
            <OrganismesBlock formation={formation} />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ({ match }) => {
  const [formation, setFormation] = useState();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [user] = useAuth();
  const mountedRef = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const apiURL = `/api/v1/entity/formation/`;
        // FIXME select={"__v" :0} hack to get updates_history
        const form = await _get(`${apiURL}${match.params.id}?select={"__v":0}`, false);

        if (!mountedRef.current) return null;
        // don't display archived formations
        if (!form.published) {
          throw new Error("Cette formation n'est pas publiée dans le catalogue");
        }

        setLoading(false);
        setFormation(form);
      } catch (e) {
        if (!mountedRef.current) return null;
        setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [match]);

  const title = loading ? "" : `${formation?.intitule_long ?? "Formation inconnue"}`;
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              {
                title: `Catalogue des formations en apprentissage
                ${
                  !!formation
                    ? formation.catalogue_published
                      ? ` (${CATALOGUE_GENERAL_LABEL})`
                      : ` (${CATALOGUE_NON_ELIGIBLE_LABEL})`
                    : ""
                }`,
                to: "/recherche/formations",
              },
              ...[loading ? [] : { title: title }],
            ]}
          />
        </Container>
      </Box>
      <Box w="100%" py={[1, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          {loading && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}

          {hasAccessTo(user, "page_formation") && !loading && formation && (
            <>
              <Box mb={8}>
                <Flex alignItems="center" justify="space-between" flexDirection={["column", "column", "row"]}>
                  <Box>
                    <Heading textStyle="h2" color="grey.800" pr={[0, 0, 8]} mb={4}>
                      {title} <InfoTooltip description={helpText.formation.intitule_long} />
                    </Heading>
                  </Box>
                </Flex>
              </Box>
              <Formation formation={formation} />
            </>
          )}
          {hasAccessTo(user, "page_formation") && !loading && !formation && (
            <Box mb={8}>
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
                    history.push("/recherche/formations");
                  }}
                >
                  Retour à la recherche
                </Button>
              </Flex>
              <Box mt={5} mb={8}>
                <Flex>{helpText.formation.not_found}</Flex>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
