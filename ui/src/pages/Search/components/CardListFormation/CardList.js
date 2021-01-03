/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons"; // faPen
import { Button } from "reactstrap";
// import { API } from "aws-amplify";
import "./cardList.css";

//import image_preview from "./noimage.png";

// const checkIfHasRightToEdit = (item, userAcm) => {
//   let hasRightToEdit = userAcm.all;
//   if (!hasRightToEdit) {
//     hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
//   }
//   return hasRightToEdit;
// };

const CardList = ({ data, f2021 }) => {
  // const { acm: userAcm } = useSelector((state) => state.user);
  //const ImageComponent = <img src={image_preview} alt={data.intitule_court} />;

  const hasRightToEdit = false; // checkIfHasRightToEdit(data, userAcm);

  const onDeleteClicked = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    // eslint-disable-next-line no-restricted-globals
    const areYousure = confirm("Souhaitez-vous vraiment supprimer cette formation ?");
    if (areYousure) {
      // await API.del("api", `/formation/${data._id}`);
      window.location.reload();
    }
  };
  // const onEditClicked = async e => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   // DO STUFF
  // };

  return (
    <Link
      to={f2021 ? `/formation2021/${data._id}` : `/formation/${data._id}`}
      className="list-card"
      style={{ textDecoration: "none" }}
      target="_blank"
    >
      <div className="list-card-container ">
        <div className="thumbnail">
          <div className="field">
            <p>Niveau: {data.niveau}</p>
          </div>
          <div className="field">
            <p>Code diplôme: {data.cfd}</p>
          </div>
        </div>
        <div className="content">
          <div style={{ display: "flex" }}>
            <h2>
              {data.intitule_long}
              <br />
              <small>{data.diplome}</small>
            </h2>
            <span className="edition-btns">
              {hasRightToEdit && (
                <>
                  {/* <Button outline color="warning" onClick={onEditClicked}>
                    <FontAwesomeIcon icon={faPen} size="xs" />
                  </Button> */}
                  <Button outline color="danger" onClick={onDeleteClicked}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </>
              )}
            </span>
          </div>
          <div>
            <p>{data.nom_academie}</p>
            <p>{data.code_postal}</p>
            <p>{data.etablissement_gestionnaire_entreprise_raison_sociale}</p>
            <p>{data.etablissement_formateur_enseigne}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardList;
