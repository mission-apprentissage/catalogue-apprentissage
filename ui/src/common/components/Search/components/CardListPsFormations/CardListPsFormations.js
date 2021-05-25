/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import "./cardList.css";
import { hasOneOfRoles } from "../../../../utils/rolesUtils";
import useAuth from "../../../../hooks/useAuth";
import { StatusBadge } from "../../../StatusBadge";
import { Flex, Box } from "@chakra-ui/react";
import { ArrowRightLine } from "../../../../../theme/components/icons";

export const CardListPsFormations = ({ data, onCardClicked }) => {
  let [auth] = useAuth();
  // console.log(data);

  return (
    <div
      // to={`/formation/${data._id}`}
      className="list-card-formation"
      style={{ textDecoration: "none" }}
      // target="_blank"
      onClick={onCardClicked}
    >
      <div className="list-card-container">
        <div className="list-card-left">
          <h3>{data.libelle_formation}</h3>
          <div>
            <p>{data.etablissement_formateur_enseigne}</p>
            <p>{data.libelle_specialite}</p>
            <p>
              {data.libelle_commune} - {data.code_postal} - académie de {data.nom_academie}
            </p>
            <Box display={["block", "none"]}>
              <small>Code diplôme: {data.codes_cfd_mna.join(",")}</small>
            </Box>
            {hasOneOfRoles(auth, ["admin", "instructeur"]) && data.matching_mna_formation.length === 1 && (
              <>
                <p>{data.matching_mna_formation[0].intitule_long}</p>
                <Flex mt={15} wrap="wrap">
                  <StatusBadge
                    source="Parcoursup"
                    status={data.matching_mna_formation[0].parcoursup_statut}
                    mr={[0, 2]}
                  />
                </Flex>
              </>
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
