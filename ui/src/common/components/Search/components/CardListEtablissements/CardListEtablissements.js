import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@chakra-ui/react";
import "./cardListEtablissements.css";

export const CardListEtablissements = ({ data }) => {
  return (
    <Link to={`/etablissement/${data._id}`} className="list-card" style={{ textDecoration: "none" }} target="_blank">
      <div className="list-card-container ">
        <div className="thumbnail">
          <div className="field grow-1" />
          <div className="field grow-1">
            <p>UAI: {data.uai}</p>
            <p>Localité: {data.localite}</p>
          </div>
          <div className="field pills">
            {data.tags &&
              data.tags
                .sort((a, b) => a - b)
                .map((tag, i) => (
                  <Badge variant="solid" colorScheme="green" key={i} className="badge">
                    {tag}
                  </Badge>
                ))}
          </div>
        </div>
        <div className="content">
          <div style={{ display: "flex" }}>
            <h2>
              {data.entreprise_raison_sociale}
              <br />
              <small>{data.enseigne}</small>
            </h2>
          </div>
          <div>
            <p>{data.nom_academie}</p>
            <p>{data.code_postal}</p>
            <p>{data.adresse}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};
