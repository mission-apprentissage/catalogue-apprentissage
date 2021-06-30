import React, { useEffect, useState } from "react";
import { Box, Container, Heading, ListItem, UnorderedList } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { _get } from "../../common/httpClient";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export default ({ plateforme }) => {
  const [niveaux, setNiveaux] = useState([]);
  const title = `Périmètre ${plateforme}`;
  setTitle(title);

  useEffect(() => {
    async function run() {
      try {
        const niveauxURL = `${endpointNewFront}/v1/entity/perimetre/niveau`;
        const niveaux = await _get(niveauxURL, false);

        const reglesUrl = `${endpointNewFront}/v1/entity/perimetre/regles`;
        const regles = await _get(`${reglesUrl}?plateforme=${plateforme}`, false);

        const niveauxTree = niveaux.map((niv) => {
          return {
            niveau: niv,
            regles: regles.filter(({ niveau }) => niveau === niv),
          };
        });

        setNiveaux(niveauxTree);
      } catch (e) {
        console.error(e);
      }
    }
    run();
  }, [plateforme]);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Heading>
          <Box mt={4}>
            {niveaux.map(({ niveau, regles }) => {
              return (
                <Box key={niveau} mb={8}>
                  <Box>{niveau}</Box>
                  <UnorderedList>
                    {regles.map(({ diplome, statut }) => (
                      <ListItem key={diplome}>
                        <Box>
                          {diplome} : {statut}
                        </Box>
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};
