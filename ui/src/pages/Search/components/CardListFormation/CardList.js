/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import "./cardList.css";
import { hasOneOfRoles } from "../../../../common/utils/rolesUtils";
import useAuth from "../../../../common/hooks/useAuth";
import { StatusBadge } from "../../../../common/components/StatusBadge";
import { Flex, Box } from "@chakra-ui/react";

const CardList = ({ data }) => {
  let [auth] = useAuth();

  const niv = data.niveau.replace(/\D/g, "");

  return (
    <Link
      to={`/formation/${data._id}`}
      className="list-card-formation"
      style={{ textDecoration: "none" }}
      target="_blank"
    >
      <div className="list-card-container">
        <div className="list-card-left">
          <h3>
            {data.intitule_long} (Niv. {niv})
          </h3>
          <div>
            <p>{data.etablissement_formateur_enseigne}</p>
            <p>{data.etablissement_gestionnaire_entreprise_raison_sociale}</p>
            <p>
              {data.code_postal} {data.nom_academie}
            </p>
            <Box display={["block", "none"]}>
              <small>Code diplôme: {data.cfd}</small>
            </Box>
            {hasOneOfRoles(auth, ["admin", "instructeur"]) && data.etablissement_reference_catalogue_published && (
              <Flex mt={15} wrap="wrap">
                <StatusBadge source="Parcoursup" status={data.parcoursup_statut} mr={[0, 2]} />
                <StatusBadge source="Affelnet" status={data.affelnet_statut} mt={[2, 0]} />
              </Flex>
            )}
          </div>
        </div>

        <Flex display={["none", "flex"]}>
          <small>Code diplôme: {data.cfd}</small>
        </Flex>
      </div>
    </Link>
  );
};

export default CardList;
