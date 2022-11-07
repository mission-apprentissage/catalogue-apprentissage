import React from "react";
import { Box, Container, Heading, Text, Link } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { NavLink } from "react-router-dom";
import { ExternalLinkLine } from "../../theme/components/icons";

export default () => {
  const title = "Mentions Légales";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Heading>
          <Box pt={1} pb={16}>
            <Box>
              <Text>Dernière mise à jour le : 02/06/2021</Text>
              <Box mt={4}>
                <Heading as={"h3"} textStyle="h6" mb={2}>
                  Éditeur du site
                </Heading>
                <Text>
                  Le Catalogue de l’offre de formation en apprentissage est édité par l’Association du Réseau des
                  Carif-Oref, située à l'adresse:
                  <br />
                  10, rue Saint-Étienne
                  <br />
                  45 000 Orléans{" "}
                </Text>
              </Box>
              <Box mt={4}>
                <Heading as={"h3"} textStyle="h6" mb={2}>
                  Directeur de la publication
                </Heading>
                <Text>Président du Réseau des Carif-Oref : Laurent Baudinet</Text>
              </Box>
              <Box mt={4}>
                <Heading as={"h3"} textStyle="h6" mb={2}>
                  Hébergement du site
                </Heading>
                <Text>
                  Ce site est hébergé par OVH :
                  <br />
                  2 rue Kellermann
                  <br />
                  59100 Roubaix
                  <br />
                  Tél. : 09 72 10 10 07
                </Text>
              </Box>
              <Box mt={4}>
                <Heading as={"h3"} textStyle="h6" mb={2}>
                  Responsabilité
                </Heading>
                <Text>
                  Le Catalogue de l’offre de formation en apprentissage diffusé sur le site{" "}
                  <Link
                    href={"https://catalogue-apprentissage.intercariforef.fr"}
                    textDecoration={"underline"}
                    isExternal
                  >
                    https://catalogue-apprentissage.intercariforef.fr
                  </Link>{" "}
                  est réputé fiable, mais le site ne garantit pas qu’il soit exempt de défauts, d’erreurs ou
                  d’omissions.
                  <br />
                  Les informations communiquées sont présentées à titre indicatif et général, sans valeur contractuelle.
                  Malgré des mises à jour régulières, le Catalogue de l’offre de formation en apprentissage diffusé sur
                  le site{" "}
                  <Link
                    href={"https://catalogue-apprentissage.intercariforef.fr"}
                    textDecoration={"underline"}
                    isExternal
                  >
                    https://catalogue-apprentissage.intercariforef.fr
                  </Link>{" "}
                  ne peut être tenu responsable de la modification des dispositions administratives et juridiques
                  survenant après la publication. De même, il ne peut être tenu responsable de l’utilisation et de
                  l’interprétation de ses informations.
                </Text>
              </Box>

              <Box mt={4}>
                <Heading as={"h3"} textStyle="h6" mb={2}>
                  Liens hypertextes
                </Heading>
                <Text>
                  Des liens hypertextes peuvent être présents dans le Catalogue de l’offre de formation en apprentissage
                  diffusé sur le site. L’utilisateur est informé qu’en cliquant sur ces liens, il sortira du site e{" "}
                  <Link
                    href={"https://catalogue-apprentissage.intercariforef.fr"}
                    textDecoration={"underline"}
                    isExternal
                  >
                    https://catalogue-apprentissage.intercariforef.fr
                  </Link>{" "}
                  . Ce dernier n’a pas de contrôle sur les pages web sur lesquelles aboutissent ces liens et ne saurait,
                  en aucun cas, être responsable de leur contenu.
                </Text>
              </Box>
              <Box mt={4}>
                <Heading as={"h3"} textStyle="h6" mb={2}>
                  Sécurité
                </Heading>
                <Text>
                  Le site est protégé par un certificat électronique, matérialisé pour la grande majorité des
                  navigateurs par un cadenas. Cette protection participe à la confidentialité des échanges.
                  <br />
                  En aucun cas les services associés au site ne seront à l’origine d’envoi de courriels pour demander la
                  saisie d’informations personnelles.
                </Text>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};
