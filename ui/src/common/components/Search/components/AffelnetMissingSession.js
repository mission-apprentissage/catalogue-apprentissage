import { Box, Flex, Link } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { AFFELNET_STATUS } from "../../../../constants/status";
import { DateContext } from "../../../../DateContext";
import helpText from "../../../../locales/helpText.json";
import { _get } from "../../../httpClient";
import { InfoTooltip } from "../../InfoTooltip";
import { CATALOGUE_API } from "../constantsFormations";

export const AffelnetMissingSession = () => {
  const [count, setCount] = useState(0);
  const { sessionStartDate, sessionEndDate } = useContext(DateContext);

  const [countPublishedLastSession, setCountPublishedLastSession] = useState(0);
  const mountedRef = useRef(undefined);
  const [searchParams] = useSearchParams();
  const nom_academie = JSON.parse(searchParams.get("nom_academie"));
  const link = `/recherche/formations?affelnet_perimetre=${encodeURIComponent(
    JSON.stringify(["Oui"])
  )}&affelnet_session=${encodeURIComponent(JSON.stringify(["Non"]))}&affelnet_previous_session=${encodeURIComponent(
    JSON.stringify(["Oui"])
  )}&affelnet_previous_statut=${encodeURIComponent(JSON.stringify([AFFELNET_STATUS.PUBLIE]))}${
    nom_academie ? "&nom_academie=" + encodeURIComponent(JSON.stringify(nom_academie)) : ""
  }`;

  useEffect(() => {
    async function run() {
      try {
        const count = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...(nom_academie?.length ? { nom_academie: { $in: nom_academie } } : {}),
            affelnet_perimetre: true,
            affelnet_session: false,
            affelnet_previous_session: true,
            affelnet_previous_statut: AFFELNET_STATUS.PUBLIE,
          })}`,
          false
        );

        const countPublishedLastSession = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...(nom_academie?.length ? { nom_academie: { $in: nom_academie } } : {}),
            affelnet_previous_statut: AFFELNET_STATUS.PUBLIE,
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
  }, [searchParams, nom_academie]);

  return (
    <Flex style={{ background: "#E2E8F0" }} padding={4}>
      <Box>
        <Box mb={2}>
          {Math.round((count * 100) / countPublishedLastSession)}% des formations publiées en{" "}
          {sessionStartDate?.getFullYear() - 1} n’ont pas été renouvelées pour {sessionEndDate?.getFullYear() - 1}.
        </Box>

        <Link as={NavLink} variant="unstyled" fontStyle={"italic"} textDecoration={"underline"} to={link}>
          Voir la liste
        </Link>
      </Box>
      <Flex alignContent={"center"} m={"auto"} ml={4}>
        <InfoTooltip description={helpText.search.affelnet_session_manquante} />
      </Flex>
    </Flex>
  );
};
