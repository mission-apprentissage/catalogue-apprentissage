import React, { useState } from "react";
import { _get } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { Box, Container, Grid, GridItem, Heading, Select, Spinner } from "@chakra-ui/react";
import { academies } from "../../constants/academies";
import { useQueries } from "react-query";
import StatCard from "../../common/components/StatCard";
import { Breadcrumb } from "../../common/components/Breadcrumb";

const statuses = {
  affelnet: [
    "publié",
    "en attente de publication",
    "non publié",
    "à publier",
    "à publier (soumis à validation)",
    "hors périmètre",
  ],
  parcoursup: [
    "publié",
    "en attente de publication",
    "non publié",
    "à publier",
    "à publier (vérifier accès direct postbac)",
    "à publier (soumis à validation Recteur)",
    "hors périmètre",
  ],
};

const buildQueries = ({ service, academie, day }) => {
  return statuses[service].map((status) => {
    return {
      queryKey: [service, { status, academie, day }],
      queryFn: async ({ queryKey }) => {
        const query = { published: true };
        if (academie) {
          query.num_academie = academie;
        }
        if (day) {
          query[`${service}_statut_history`] = {
            $elemMatch: { date: { $gt: day.start, $lte: day.end }, [`${service}_statut`]: status },
          };
        } else {
          query[`${service}_statut`] = status;
        }
        const count = await _get(`/api/entity/formations2021/count?query=${JSON.stringify(query)}`);
        return { title: `${service} - ${status}`, value: count };
      },
      refetchOnWindowFocus: false,
    };
  });
};

const getProgress = (before = 0, now) => {
  if (now === before || before === 0) {
    return null;
  }
  const progress = Number(((now - before) / before) * 100).toFixed(2);
  return `${progress > 0 ? "+" : ""}${progress}%`;
};

export default () => {
  const [academie, setAcademie] = useState("");

  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const endJ1 = d.getTime();

  d.setDate(d.getDate() - 1);
  const startJ1 = d.getTime();

  const endJ2 = startJ1;
  d.setDate(d.getDate() - 1);
  const startJ2 = d.getTime();

  const resultsAfToday = useQueries(buildQueries({ service: "affelnet", academie }));
  const resultsAfJ1 = useQueries(buildQueries({ service: "affelnet", academie, day: { start: startJ1, end: endJ1 } }));
  const resultsAfJ2 = useQueries(buildQueries({ service: "affelnet", academie, day: { start: startJ2, end: endJ2 } }));
  const resultsPSToday = useQueries(buildQueries({ service: "parcoursup", academie }));
  const resultsPSJ1 = useQueries(
    buildQueries({ service: "parcoursup", academie, day: { start: startJ1, end: endJ1 } })
  );
  const resultsPSJ2 = useQueries(
    buildQueries({ service: "parcoursup", academie, day: { start: startJ2, end: endJ2 } })
  );

  const academieList = Object.values(academies).sort(({ nom_academie: a }, { nom_academie: b }) => (a > b ? 1 : -1));
  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]} color="grey.800">
        <Container maxW="xl">
          <Breadcrumb
            pages={[{ title: "Accueil", to: "/" }, { title: "Historique des statuts Affelnet/Parcoursup" }]}
          />
        </Container>
      </Box>
      <Box w="100%" minH="100vh" px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Heading as="h1" mb={8} mt={6}>
            Historique des statuts Affelnet/Parcoursup
          </Heading>

          <Select
            value={academie}
            bg="white"
            borderRadius={0}
            w="30%"
            mb={8}
            onChange={(e) => {
              setAcademie(e.target.value);
            }}
          >
            <option value="">Toutes les académies</option>
            {academieList.map(({ nom_academie, num_academie }) => (
              <option key={num_academie} value={num_academie}>
                {nom_academie} ({num_academie})
              </option>
            ))}
          </Select>

          <>
            <Heading as="h2" fontSize="gamma" mb={4}>
              Affelnet
            </Heading>
            <Heading as="h3" fontSize="epsilon" mb={2}>
              Aujourd'hui
            </Heading>
            <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
              {resultsAfToday?.map((item, i) => {
                return (
                  <GridItem key={i} colSpan={[6, 3]}>
                    {item.isLoading && <Spinner />}
                    {item.data && (
                      <StatCard
                        label={item.data.title}
                        stat={item.data.value}
                        progress={getProgress(resultsAfJ1[i]?.data?.value, item.data.value)}
                      />
                    )}
                  </GridItem>
                );
              })}
            </Grid>

            <Heading as="h3" fontSize="epsilon" mb={2}>
              Hier
            </Heading>
            <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
              {resultsAfJ1?.map((item, i) => {
                return (
                  <GridItem key={i} colSpan={[6, 3]}>
                    {item.isLoading && <Spinner />}
                    {item.data && (
                      <StatCard
                        background="bluesoft.600"
                        label={item.data.title}
                        stat={item.data.value}
                        progress={getProgress(resultsAfJ2[i]?.data?.value, item.data.value)}
                      />
                    )}
                  </GridItem>
                );
              })}
            </Grid>

            <Heading as="h3" fontSize="epsilon" mb={2}>
              Avant-hier
            </Heading>
            <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
              {resultsAfJ2?.map((item, i) => {
                return (
                  <GridItem key={i} colSpan={[6, 3]}>
                    {item.isLoading && <Spinner />}
                    {item.data && <StatCard background="bluesoft.400" label={item.data.title} stat={item.data.value} />}
                  </GridItem>
                );
              })}
            </Grid>
          </>

          <>
            <Heading as="h2" fontSize="gamma" mb={4}>
              Parcoursup
            </Heading>
            <Heading as="h3" fontSize="epsilon" mb={2}>
              Aujourd'hui
            </Heading>
            <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
              {resultsPSToday?.map((item, i) => {
                return (
                  <GridItem key={i} colSpan={[6, 3]}>
                    {item.isLoading && <Spinner />}
                    {item.data && (
                      <StatCard
                        label={item.data.title}
                        stat={item.data.value}
                        progress={getProgress(resultsPSJ1[i]?.data?.value, item.data.value)}
                      />
                    )}
                  </GridItem>
                );
              })}
            </Grid>
            <Heading as="h3" fontSize="epsilon" mb={2}>
              Hier
            </Heading>
            <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
              {resultsPSJ1?.map((item, i) => {
                return (
                  <GridItem key={i} colSpan={[6, 3]}>
                    {item.isLoading && <Spinner />}
                    {item.data && (
                      <StatCard
                        background="bluesoft.600"
                        label={item.data.title}
                        stat={item.data.value}
                        progress={getProgress(resultsPSJ2[i]?.data?.value, item.data.value)}
                      />
                    )}
                  </GridItem>
                );
              })}
            </Grid>
            <Heading as="h3" fontSize="epsilon" mb={2}>
              Avant-hier
            </Heading>
            <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
              {resultsPSJ2?.map((item, i) => {
                return (
                  <GridItem key={i} colSpan={[6, 3]}>
                    {item.isLoading && <Spinner />}
                    {item.data && <StatCard background="bluesoft.400" label={item.data.title} stat={item.data.value} />}
                  </GridItem>
                );
              })}
            </Grid>
          </>
        </Container>
      </Box>
    </Layout>
  );
};
