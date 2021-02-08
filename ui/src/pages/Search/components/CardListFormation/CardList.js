/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import "./cardList.css";
import { hasOneOfRoles } from "../../../../common/utils/rolesUtils";
import useAuth from "../../../../common/hooks/useAuth";
import { StatusBadge } from "../../../../common/components/StatusBadge";

const CardList = ({ data, f2021 }) => {
  let [auth] = useAuth();

  const niv = data.niveau.replace(/\D/g, "");

  return (
    <Link
      to={f2021 ? `/formation/${data._id}` : `/formation/${data._id}?source=mna`}
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
            {hasOneOfRoles(auth, ["admin", "instructeur"]) && data.etablissement_reference_catalogue_published && (
              <div className="pills-statuts">
                <StatusBadge source="Parcoursup" status={data.parcoursup_statut} mr={2} />
                <StatusBadge source="Affelnet" status={data.affelnet_statut} />
              </div>
            )}
          </div>
        </div>
        <div className="list-card-right">
          <small>Code diplôme: {data.cfd}</small>
        </div>
      </div>
    </Link>
  );
};

export default CardList;
