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

        let reglesInTree = [];

        const niveauxTree = Object.entries(niveaux).map(([niveau, diplomes]) => {
          return {
            niveau,
            diplomes: diplomes.map((diplome) => {
              const filteredRegles = regles.filter(
                ({ niveau: niv, diplome: dip }) => niveau === niv && diplome === dip
              );
              reglesInTree = [...reglesInTree, ...filteredRegles.map(({ _id }) => _id)];
              return {
                diplome,
                regles: filteredRegles,
              };
            }),
          };
        });

        const obsoleteRegles = regles.filter(({ _id }) => !reglesInTree.includes(_id));
        if (obsoleteRegles.length > 0) {
          console.error("Des règles obsolètes ont été trouvées :", obsoleteRegles);
          // This rules should probably be deleted
        }
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
            {niveaux.map(({ niveau, diplomes }) => {
              return (
                <Box key={niveau} mb={8}>
                  <Box>{niveau}</Box>
                  <UnorderedList>
                    {diplomes.map(({ diplome, regles }) => (
                      <ListItem key={`${niveau}-${diplome}`}>
                        <Box>{diplome}</Box>
                        {regles?.length > 0 && (
                          <>
                            <Box>Règles :</Box>
                            <UnorderedList>
                              {regles.map(({ _id, statut, regle_complementaire }) => (
                                <ListItem key={_id}>
                                  {statut} : {regle_complementaire}
                                </ListItem>
                              ))}
                            </UnorderedList>
                          </>
                        )}
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
