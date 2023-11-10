import React, { useEffect, useRef, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Box, Flex, Link } from "@chakra-ui/react";
import helpText from "../../../../locales/helpText.json";
import { AFFELNET_STATUS, PARCOURSUP_STATUS } from "../../../../constants/status";
import { _get } from "../../../httpClient";
import { InfoTooltip } from "../../InfoTooltip";
import { CATALOGUE_API } from "../constantsFormations";

export const ParcoursupMissingSession = () => {
  const [count, setCount] = useState(0);
  const [countPublishedLastSession, setCountPublishedLastSession] = useState(0);
  const mountedRef = useRef(undefined);
  const [searchParams] = useSearchParams();
  const nom_academie = JSON.parse(searchParams.get("nom_academie"));
  const link = `/recherche/formations?parcoursup_perimetre=${encodeURIComponent(
    JSON.stringify(["Oui"])
  )}&parcoursup_session=${encodeURIComponent(JSON.stringify(["Non"]))}&parcoursup_previous_session=${encodeURIComponent(
    JSON.stringify(["Oui"])
  )}&parcoursup_previous_statut=${encodeURIComponent(JSON.stringify([AFFELNET_STATUS.PUBLIE]))}${
    nom_academie ? "&nom_academie=" + encodeURIComponent(JSON.stringify(nom_academie)) : ""
  }`;

  useEffect(() => {
    async function run() {
      try {
        const count = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...(nom_academie?.length ? { nom_academie: { $in: nom_academie } } : {}),
            parcoursup_perimetre: true,
            parcoursup_session: false,
            parcoursup_previous_session: true,
            parcoursup_previous_statut: PARCOURSUP_STATUS.PUBLIE,
          })}`,
          false
        );

        const countPublishedLastSession = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...(nom_academie?.length ? { nom_academie: { $in: nom_academie } } : {}),
            parcoursup_previous_statut: PARCOURSUP_STATUS.PUBLIE,
          })}`,
          false
        );

        setCount(count);
        setCountPublishedLastSession(countPublishedLastSession);
      } catch (e) {
        console.error(e);
      }
    }

    if (mountedRef.current !== nom_academie) {
      mountedRef.current = nom_academie;
      run();
    }

    return () => {
      mountedRef.current = undefined;
    };
  }, [nom_academie]);

  return (
    <Flex style={{ background: "#E2E8F0" }} padding={4}>
      <Box>
        <Box mb={2}>
          {Math.round((count * 100) / countPublishedLastSession)}% des formations publiées en 2023 n’ont pas été
          renouvelées pour 2024.
        </Box>
        <Link as={NavLink} variant="unstyled" fontStyle={"italic"} textDecoration={"underline"} to={link}>
          Voir la liste
        </Link>
      </Box>
      <Flex alignContent={"center"} m={"auto"} ml={4}>
        <InfoTooltip description={helpText.search.parcoursup_session_manquante} />
      </Flex>
    </Flex>
  );
};
