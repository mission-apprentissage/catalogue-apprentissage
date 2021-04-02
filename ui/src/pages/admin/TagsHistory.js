import React, { useEffect, useState } from "react";
import { _get } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Container, Heading, Select } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import StatGrid from "../../common/components/StatGrid";
import { academies } from "../../constants/academies";
// import { useQuery } from "react-query";

const affelnetStatuses = [
  "publié",
  "en attente de publication",
  "non publié",
  "à publier",
  "à publier (soumis à validation)",
  "hors périmètre",
];

const parcoursupStatuses = [
  "publié",
  "en attente de publication",
  "non publié",
  "à publier",
  "à publier (vérifier accès direct postbac)",
  "à publier (soumis à validation Recteur)",
  "hors périmètre",
];

export default () => {
  const [academie, setAcademie] = useState("");

  const [data, setData] = useState({});

  // TODO useQueries for each day affelnet & psup

  // const { data, isLoading, isError } = useQuery(
  //   ["coverage", { type: matching.type, page: matching.page }],
  //   ({ queryKey }) => {
  //     return _get(`/api/affelnet?type=${queryKey[1].type}&page=${queryKey[1].page}`);
  //   },
  //   {
  //     refetchOnWindowFocus: false,
  //   }
  // );

  useEffect(() => {
    async function run() {
      let academieQuery = "";
      if (academie) {
        academieQuery = `,"num_academie":"${academie}"`;
      }

      const d = new Date();
      d.setHours(0, 0, 0, 0);
      const endJ1 = d.getTime();

      d.setDate(d.getDate() - 1);
      const startJ1 = d.getTime();

      const endJ2 = startJ1;
      d.setDate(d.getDate() - 1);
      const startJ2 = d.getTime();

      const afToday = [];
      const afJ1 = [];
      const afJ2 = [];

      const psToday = [];
      const psJ1 = [];
      const psJ2 = [];

      for (let status of affelnetStatuses) {
        const countToday = await _get(
          `/api/entity/formations2021/count?query={"published":true,"affelnet_statut":"${status}"${academieQuery}}`
        );
        afToday.push({ title: `Affelnet - ${status}`, value: countToday });

        const countJ1 = await _get(
          `/api/entity/formations2021/count?query={"published":true,"affelnet_statut_history":{"$elemMatch":{"date":{"$gte":${startJ1},"$lte":${endJ1}},"affelnet_statut":"${status}"}}${academieQuery}}`
        );
        afJ1.push({ title: `Affelnet - ${status}`, value: countJ1 });

        const countJ2 = await _get(
          `/api/entity/formations2021/count?query={"published":true,"affelnet_statut_history":{"$elemMatch":{"date":{"$gt":${startJ2},"$lte":${endJ2}},"affelnet_statut":"${status}"}}${academieQuery}}`
        );

        afJ2.push({ title: `Affelnet - ${status}`, value: countJ2 });
      }

      for (let status of parcoursupStatuses) {
        const countToday = await _get(
          `/api/entity/formations2021/count?query={"published":true,"parcoursup_statut":"${status}"${academieQuery}}`
        );
        psToday.push({ title: `Parcoursup - ${status}`, value: countToday });

        const countJ1 = await _get(
          `/api/entity/formations2021/count?query={"published":true,"parcoursup_statut_history":{"$elemMatch":{"date":{"$gte":${startJ1},"$lte":${endJ1}},"parcoursup_statut":"${status}"}}${academieQuery}}`
        );
        psJ1.push({ title: `Parcoursup - ${status}`, value: countJ1 });

        const countJ2 = await _get(
          `/api/entity/formations2021/count?query={"published":true,"parcoursup_statut_history":{"$elemMatch":{"date":{"$gt":${startJ2},"$lte":${endJ2}},"parcoursup_statut":"${status}"}}${academieQuery}}`
        );

        psJ2.push({ title: `Parcoursup - ${status}`, value: countJ2 });
      }

      setData({
        affelnet: {
          today: afToday,
          j1: afJ1,
          j2: afJ2,
        },
        parcoursup: {
          today: psToday,
          j1: psJ1,
          j2: psJ2,
        },
      });
    }
    run();
  }, [academie]);

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
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Historique des statuts Affelnet/Parcoursup</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Box bg="secondaryBackground" w="100%" minH="100vh" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Heading as="h1" mb={8} mt={2}>
            Historique des statuts Affelnet/Parcoursup
          </Heading>

          <Select
            value={academie}
            bg="white"
            w="30%"
            mb={8}
            onChange={(e) => {
              setAcademie(e.target.value);
            }}
          >
            <option value="">Toutes les académies</option>
            {Object.values(academies).map(({ nom_academie, num_academie }) => (
              <option key={num_academie} value={num_academie}>
                {nom_academie}
              </option>
            ))}
          </Select>

          {data?.affelnet && (
            <>
              <Heading as="h2" fontSize="gamma" mb={4}>
                Affelnet
              </Heading>
              <Heading as="h3" fontSize="epsilon" mb={2}>
                Aujourd'hui
              </Heading>
              <StatGrid data={data.affelnet.today} />
              <Heading as="h3" fontSize="epsilon" mb={2}>
                Hier
              </Heading>
              <StatGrid data={data.affelnet.j1} background="bluesoft.600" />
              <Heading as="h3" fontSize="epsilon" mb={2}>
                Avant-hier
              </Heading>
              <StatGrid data={data.affelnet.j2} background="bluesoft.400" />
            </>
          )}

          {data?.parcoursup && (
            <>
              <Heading as="h2" fontSize="gamma" mb={4}>
                Parcoursup
              </Heading>
              <Heading as="h3" fontSize="epsilon" mb={2}>
                Aujourd'hui
              </Heading>
              <StatGrid data={data.parcoursup.today} />
              <Heading as="h3" fontSize="epsilon" mb={2}>
                Hier
              </Heading>
              <StatGrid data={data.parcoursup.j1} background="bluesoft.600" />
              <Heading as="h3" fontSize="epsilon" mb={2}>
                Avant-hier
              </Heading>
              <StatGrid data={data.parcoursup.j2} background="bluesoft.400" />
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
