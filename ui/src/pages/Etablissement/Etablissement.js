import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Input, Modal, ModalHeader, ModalBody, Badge } from "reactstrap";
//import { useSelector, useDispatch } from "react-redux";
//import { API } from "aws-amplify";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faCheck } from "@fortawesome/free-solid-svg-icons";
// import { push } from "connected-react-router";
import { _get } from "../../common/httpClient";
import Layout from "../layout/Layout";

//import Section from "./components/Section";
// import routes from "../../routes.json";

import "./etablissement.css";

const sleep = (m) => new Promise((r) => setTimeout(r, m));

const ENV_NAME = "dev";
const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://r7mayzn08d.execute-api.eu-west-3.amazonaws.com/dev"
    : "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

const checkIfHasRightToEdit = (item, userAcm) => {
  let hasRightToEdit = userAcm.all;
  if (!hasRightToEdit) {
    hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
  }
  return hasRightToEdit;
};

const EditSection = ({ edition, onEdit, handleSubmit }) => {
  return (
    <div className="sidebar-section info sidebar-section-edit">
      {edition && (
        <>
          <Button className="mb-3" color="success" onClick={handleSubmit}>
            Valider
          </Button>
          <Button
            color="danger"
            onClick={() => {
              onEdit();
            }}
          >
            Annuler
          </Button>
        </>
      )}
      {!edition && (
        <>
          <Button
            className=""
            color="warning"
            onClick={() => {
              onEdit();
            }}
          >
            Modifier
          </Button>
        </>
      )}
    </div>
  );
};

const Etablissement = ({ etablissement, edition, onEdit, handleChange, handleSubmit, values }) => {
  // const { acm: userAcm } = useSelector((state) => state.user);
  const hasRightToEdit = false; // checkIfHasRightToEdit(etablissement, userAcm);

  return (
    <Row>
      <Col md="7">
        <div className="notice-details">
          <h2 className="small">Détails</h2>
          <div className="field">
            <h3>Enseigne</h3>
            <p>{etablissement.enseigne}</p>
          </div>
          <div className="field">
            <h3>Siret</h3>
            <p>{etablissement.siret}</p>
          </div>
          <div className="field">
            <h3>Siren</h3>
            <p>{etablissement.siren}</p>
          </div>
          <div className="field">
            <h3>
              Code NAF
              <p>{etablissement.naf_code}</p>
            </h3>
          </div>
          <div className="field">
            <h3>Libellé NAF</h3>
            <p>{etablissement.naf_libelle}</p>
          </div>
          <div className="field">
            <h3>Date de création</h3>
            <p>{etablissement.date_creation}</p>
          </div>
          <div className="field">
            <h3>Adresse</h3>
            <p>{etablissement.adresse}</p>
          </div>
        </div>
      </Col>
      <Col md="5">
        {hasRightToEdit && <EditSection edition={edition} onEdit={onEdit} handleSubmit={handleSubmit} />}
        <div className="sidebar-section info">
          <h2>À propos</h2>
          <div>
            <div className="field pills">
              <h3>Tags</h3>
              {etablissement.tags.map((tag, i) => (
                <Badge color="success" key={i}>
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="field multiple">
              <div>
                <h3>Type</h3>
                <p>{etablissement.computed_type}</p>
              </div>
              <div>
                <h3>UAI{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
                <p>
                  {!edition && <>{etablissement.uai}</>}
                  {edition && <Input type="text" name="uai" onChange={handleChange} value={values.uai} />}
                </p>
              </div>
            </div>
            <div className="field">
              <h3>Conventionné ?</h3>
              <p>{etablissement.computed_conventionne}</p>
            </div>
            <div className="field">
              <h3>Déclaré en préfecture ?</h3>
              <p>{etablissement.computed_declare_prefecture}</p>
            </div>
            <div className="field">
              <h3>Certifié 2015 - datadock ?</h3>
              <p>{etablissement.computed_info_datadock}</p>
            </div>
            <div className="field multiple">
              <div>
                <h3>Code postal</h3>
                <p>{etablissement.code_postal}</p>
              </div>
              <div>
                <h3>Code commune</h3>
                <p>{etablissement.code_insee_localite}</p>
              </div>
            </div>
            <div className="field">
              <h3>Académie{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
              <p>
                {!edition && (
                  <>
                    {etablissement.nom_academie} ({etablissement.num_academie})
                  </>
                )}
                {edition && (
                  <>
                    {etablissement.nom_academie}{" "}
                    <Input type="text" name="num_academie" onChange={handleChange} value={values.num_academie} />
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        {!etablissement.siege_social && (
          <div className="sidebar-section info">
            <h2>Siége social</h2>
            <div>
              {etablissement.entreprise_raison_sociale && (
                <div className="field">
                  <h3>Raison sociale</h3>
                  <p>{etablissement.entreprise_raison_sociale}</p>
                </div>
              )}
              {etablissement.etablissement_siege_siret && (
                <div className="field">
                  <h3>Siret</h3>
                  <p>{etablissement.etablissement_siege_siret}</p>
                </div>
              )}
              <div className="field field-button mt-3">
                <a href="#siege">
                  <Button color="primary">Voir le siége social</Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default ({ match }) => {
  const [etablissement, setEtablissement] = useState(null);
  const [edition, setEdition] = useState(false);
  const [gatherData, setGatherData] = useState(0);
  const [modal, setModal] = useState(false);
  // const dispatch = useDispatch();

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      uai: "",
      num_academie: "",
    },
    onSubmit: ({ uai, num_academie }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        const body = { uai, num_academie };

        let result = null;
        //if (uai !== etablissement.uai) {
        setModal(true);
        setGatherData(1);
        // result = await API.put("api", `/etablissement/${etablissement._id}`, { body });
        // await API.get("api", `/services?job=etablissement&id=${result._id}`);
        // result = await API.get("api", `/etablissement/${result._id}`);
        setGatherData(2);
        await sleep(500);

        setModal(false);
        //}

        if (result) {
          setEtablissement(result);
          setFieldValue("uai", result.uai);
          setFieldValue("num_academie", result.num_academie);
        }

        setEdition(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    async function run() {
      try {
        // const eta = await API.get("api", `/etablissement/${match.params.id}`);
        const eta = await _get(`${endpointNewFront}/etablissement/${match.params.id}`, false);
        setEtablissement(eta);

        setFieldValue("uai", eta.uai);
        setFieldValue("num_academie", eta.num_academie);
      } catch (e) {
        // dispatch(push(routes.NOTFOUND));
      }
    }
    run();
  }, [match, setFieldValue]);

  const onEdit = () => {
    setEdition(!edition);
  };

  if (!etablissement) {
    return (
      <div className="page etablissement">
        <Spinner color="secondary" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="page etablissement">
        <div className="notice">
          <Container>
            <h1 className="heading">{etablissement.entreprise_raison_sociale}</h1>
            <Etablissement
              etablissement={etablissement}
              edition={edition}
              onEdit={onEdit}
              values={values}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
            />
            <Modal isOpen={modal}>
              <ModalHeader>Merci ne pas fermer cette page</ModalHeader>
              <ModalBody>
                {gatherData !== 0 && (
                  <div>
                    <div>
                      Mise à jour des informations {gatherData === 1 && <Spinner color="secondary" />}
                      {gatherData > 1 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                    </div>
                  </div>
                )}
              </ModalBody>
            </Modal>
          </Container>
        </div>
      </div>
    </Layout>
  );
};
