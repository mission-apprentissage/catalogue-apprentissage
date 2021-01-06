/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
import { Badge } from "reactstrap";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faPen } from "@fortawesome/free-solid-svg-icons";
//import { Button } from "reactstrap";
//import { API } from "aws-amplify";
import "./cardList.css";

//import image_preview from "./noimage.png";

// const checkIfHasRightToEdit = (item, userAcm) => {
//   let hasRightToEdit = userAcm.all;
//   if (!hasRightToEdit) {
//     hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
//   }
//   return hasRightToEdit;
// };

const CardList = ({ data }) => {
  // const { acm: userAcm } = useSelector((state) => state.user);

  const hasRightToEdit = false; //checkIfHasRightToEdit(data, userAcm);

  // const onDeleteClicked = async e => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   // eslint-disable-next-line no-restricted-globals
  //   const areYousure = confirm("Souhaitez-vous vraiment supprimer cette formation ?");
  //   if (areYousure) {
  //     //await API.del("api", `/formation/${data._id}`);
  //     window.location.reload();
  //   }
  // };
  // const onEditClicked = async e => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   // DO STUFF
  // };

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
              data.tags.map((tag, i) => (
                <Badge color="success" key={i}>
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
            <span className="edition-btns">
              {hasRightToEdit && (
                <>
                  {/* <Button outline color="warning" onClick={onEditClicked}>
                    <FontAwesomeIcon icon={faPen} size="xs" />
                  </Button> */}
                  {/* <Button outline color="danger" onClick={onDeleteClicked}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button> */}
                </>
              )}
            </span>
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

export default CardList;
