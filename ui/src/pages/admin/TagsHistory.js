import React, { useEffect, useState } from "react";
import { _get } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Container, Heading } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import StatGrid from "../../common/components/StatGrid";

//
// const ACADEMIES = [
//   "01",
//   "02",
//   "03",
//   "04",
//   "06",
//   "07",
//   "08",
//   "09",
//   "10",
//   "11",
//   "12",
//   "13",
//   "14",
//   "15",
//   "16",
//   "17",
//   "18",
//   "19",
//   "20",
//   "22",
//   "23",
//   "24",
//   "25",
//   "27",
//   "28",
//   "31",
//   "32",
//   "33",
//   "43",
//   "70",
// ];

const affelnetStatuses = [
  "hors périmètre",
  "à publier (soumis à validation)",
  "à publier",
  "en attente de publication",
  "publié",
  "non publié",
];

const parcoursupStatuses = [
  "hors périmètre",
  "à publier (vérifier accès direct postbac)",
  "à publier (soumis à validation Recteur)",
  "à publier",
  "en attente de publication",
  "publié",
  "non publié",
];

export default () => {
  // const [academie, setAcademie] = useState(ACADEMIES[0]);

  const [data, setData] = useState({});

  useEffect(
    () => {
      async function run() {
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
            `/api/entity/formations2021/count?query={"published":true,"affelnet_statut":"${status}"}`
          );
          afToday.push({ title: `Affelnet - ${status}`, value: countToday });

          const countJ1 = await _get(
            `/api/entity/formations2021/count?query={"published":true,"affelnet_statut_history":{"$elemMatch":{"date":{"$gte":${startJ1},"$lte":${endJ1}},"affelnet_statut":"${status}"}}}`
          );
          afJ1.push({ title: `Affelnet - ${status}`, value: countJ1 });

          const countJ2 = await _get(
            `/api/entity/formations2021/count?query={"published":true,"affelnet_statut_history":{"$elemMatch":{"date":{"$gt":${startJ2},"$lte":${endJ2}},"affelnet_statut":"${status}"}}}`
          );

          afJ2.push({ title: `Affelnet - ${status}`, value: countJ2 });
        }

        for (let status of parcoursupStatuses) {
          const countToday = await _get(
            `/api/entity/formations2021/count?query={"published":true,"parcoursup_statut":"${status}"}`
          );
          psToday.push({ title: `Parcoursup - ${status}`, value: countToday });

          const countJ1 = await _get(
            `/api/entity/formations2021/count?query={"published":true,"parcoursup_statut_history":{"$elemMatch":{"date":{"$gte":${startJ1},"$lte":${endJ1}},"parcoursup_statut":"${status}"}}}`
          );
          psJ1.push({ title: `Parcoursup - ${status}`, value: countJ1 });

          const countJ2 = await _get(
            `/api/entity/formations2021/count?query={"published":true,"parcoursup_statut_history":{"$elemMatch":{"date":{"$gt":${startJ2},"$lte":${endJ2}},"parcoursup_statut":"${status}"}}}`
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
    },
    [
      /*academie*/
    ]
  );

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
