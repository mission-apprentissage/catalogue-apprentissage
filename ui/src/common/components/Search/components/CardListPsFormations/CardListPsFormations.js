/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import "./cardList.css";
import { StatusBadge } from "../../../StatusBadge";
import { Flex, Box } from "@chakra-ui/react";
import { ArrowRightLine, DoubleArrows } from "../../../../../theme/components/icons";
import { InfoBadge } from "../../../InfoBadge";

export const CardListPsFormations = ({ data, onCardClicked }) => {
  // console.log(data);

  return (
    <div className="list-card-formation" style={{ textDecoration: "none" }} onClick={onCardClicked}>
      <div className="list-card-container">
        <div className="list-card-left">
          <h3>
            {data.libelle_formation} - {data.libelle_specialite}
            {data.statut_reconciliation === "REJETE" && (
              <InfoBadge text="Rejeté" variant="published" bg="redmarianne" color="white" />
            )}
          </h3>
          <div>
            <p>
              {data.libelle_commune} - {data.code_postal} - académie de {data.nom_academie}
            </p>
            <Box display={["block", "none"]}>
              <small>Code diplôme: {data.codes_cfd_mna.join(",")}</small>
            </Box>
            {data.matching_mna_formation.map((mnaF, i) => (
              <Box mt={5} key={i}>
                {mnaF.intitule_court}
                <DoubleArrows width="12px" height="14px" color="grey.800" mx={5} />
                <StatusBadge source="Parcoursup" status={mnaF.parcoursup_statut} mr={[0, 2]} />
              </Box>
            ))}
            {data.matching_mna_formation.length === 0 && (
              <Box mt={5}>
                <DoubleArrows width="12px" height="14px" color="grey.800" mx={5} />
                N.A
              </Box>
            )}
          </div>
        </div>

        <Flex display={["none", "flex"]}>
          <small>Code diplôme: {data.codes_cfd_mna.join(",")}</small>
          <ArrowRightLine alignSelf="center" mt="4rem" color="bluefrance" />
        </Flex>
      </div>
    </div>
  );
};
