import React, { useState } from "react";
import { Box, Container, Heading } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
// import { hasAccessTo } from "../../common/utils/rolesUtils";
// import useAuth from "../../common/hooks/useAuth";
import { Organismes } from "./Organismes";
import { Diplome } from "./Diplome";
import { LieuFormation } from "./LieuFormation";

export default () => {
  const title = "Collecte de l'offre de formation";
  setTitle(title);
  // let [auth] = useAuth();
  const [organismes, setOrganismes] = useState();
  const [lieuDeFormation, setLieuDeFormation] = useState(null);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5} mb={5}>
            Ajouter une offre de formation
          </Heading>
          <Organismes
            onSubmited={(orga) => {
              setOrganismes(orga);
            }}
          />
          {organismes && (
            <>
              <LieuFormation onSubmited={(lieu) => setLieuDeFormation(lieu)} formateur={organismes.formateur} />
              {lieuDeFormation && <Diplome />}
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
