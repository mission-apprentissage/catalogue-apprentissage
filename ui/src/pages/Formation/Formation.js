import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Input, Modal, ModalHeader, ModalBody, Alert } from "reactstrap";
// import { useSelector, useDispatch } from "react-redux";
// import { API } from "aws-amplify";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faCheck } from "@fortawesome/free-solid-svg-icons";
// import { push } from "connected-react-router";
import { _get } from "../../common/httpClient";
import Layout from "../layout/Layout";

import Section from "./components/Section";
// import routes from "../../routes.json";

import "./formation.css";

// import { getEnvName } from "../../config";
const sleep = (m) => new Promise((r) => setTimeout(r, m));
const ENV_NAME = "dev"; // getEnvName();
const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://catalogue-recette.apprentissage.beta.gouv.fr/api"
    : "https://catalogue.apprentissage.beta.gouv.fr/api";

// const checkIfHasRightToEdit = (item, userAcm) => {
//   let hasRightToEdit = userAcm.all;
//   if (!hasRightToEdit) {
//     hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
//   }
//   return hasRightToEdit;
// };

const EditSection = ({ edition, onEdit, handleSubmit, onDeleteClicked }) => {
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
            className="mb-3"
            color="warning"
            onClick={() => {
              onEdit();
            }}
          >
            Modifier
          </Button>
          <Button color="danger" onClick={onDeleteClicked}>
            Supprimer
          </Button>
        </>
      )}
    </div>
  );
};

const Formation = ({ formation, edition, onEdit, handleChange, handleSubmit, values }) => {
  // const { acm: userAcm } = useSelector((state) => state.user);
  const oneEstablishment = formation.etablissement_gestionnaire_siret === formation.etablissement_formateur_siret;
  const hasRightToEdit = false; // checkIfHasRightToEdit(formation, userAcm);

  // const dispatch = useDispatch();
  const onDeleteClicked = async (e) => {
    // eslint-disable-next-line no-restricted-globals
    const areYousure = confirm("Souhaitez-vous vraiment supprimer cette formation ?");
    if (areYousure) {
      // await API.del("api", `/formation/${formation._id}`);
      // dispatch(push(routes.SEARCH_FORMATIONS));
    }
  };

  return (
    <Row>
      <Col md="7">
        <div className="notice-details">
          <h2 className="small">Détails</h2>
          <div className="field">
            <h3>Intitulé court de la formation</h3>
            <p>{formation.intitule_court}</p>
          </div>
          <div className="field">
            <h3>Diplôme ou titre visé</h3>
            <p>{formation.diplome}</p>
          </div>
          <div className="field">
            <h3>Niveau de la formation</h3>
            <p>{formation.niveau}</p>
          </div>
          <div className="field">
            <h3>
              Code diplôme (Éducation Nationale)
              {hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}
            </h3>
            <p>
              {!edition && <>{formation.cfd}</>}
              {edition && <Input type="text" name="cfd" onChange={handleChange} value={values.cfd} />}
            </p>
          </div>
          <div className="field">
            <h3>Code MEF 10 caractères</h3>
            <p>{formation.mef_10_code}</p>
          </div>
          <div className="field">
            <h3>
              Période d'inscription{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}
            </h3>
            <p>
              {!edition && <>{formation.periode}</>}
              {edition && <Input type="text" name="periode" onChange={handleChange} value={values.periode} />}
            </p>
          </div>
          <div className="field">
            <h3>
              Capacite d'accueil{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}
            </h3>
            <p>
              {!edition && <>{formation.capacite}</>}
              {edition && <Input type="text" name="capacite" onChange={handleChange} value={values.capacite} />}
            </p>
          </div>
          <div className="field">
            <h3>Durée de la formation</h3>
            <p>{formation.duree}</p>
          </div>
          <div className="field">
            <h3>Année</h3>
            <p>{formation.annee}</p>
          </div>
        </div>
        {/* <Section title="Information ParcourSup">
          <div className="field">
            <h3>Référencé dans ParcourSup</h3>
            <p>{formation.parcoursup_reference ? "OUI" : "NON"}</p>
          </div>
          <div className="field">
            <h3>À charger dans ParcourSup</h3>
            <p>{formation.parcoursup_a_charger ? "OUI" : "NON"}</p>
          </div>
        </Section>
        <Section title="Information Affelnet">
          <div className="field">
            <h3>Référencé dans Affelnet</h3>
            <p>{formation.affelnet_reference ? "OUI" : "NON"}</p>
          </div>
          <div className="field">
            <h3>À charger dans Affelnet</h3>
            <p>{formation.affelnet_a_charger ? "OUI" : "NON"}</p>
          </div>
        </Section> */}
        <Section title="Information RNCP">
          <div className="field">
            {!formation.rncp_code && (
              <>
                <h3>Code RNCP {hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
                <p>
                  {!edition && <>{formation.rncp_code}</>}
                  {edition && <Input type="text" name="rncp_code" onChange={handleChange} value={values.rncp_code} />}
                </p>
              </>
            )}
            {formation.rncp_code && (
              <>
                <h3>Code RNCP</h3>
                <p>{formation.rncp_code}</p>
              </>
            )}
          </div>
          <div className="field">
            <h3>Organisme Habilité (RNCP)</h3>
            <p>{formation.rncp_etablissement_reference_habilite}</p>
          </div>
          <div className="field">
            <h3>Éligible apprentissage (RNCP)</h3>
            <p>{formation.rncp_eligible_apprentissage}</p>
          </div>
          <div className="field">
            <h3>Intitulé RNCP</h3>
            <p>{formation.rncp_intitule}</p>
          </div>
        </Section>
        <Section title="Information ROME">
          <div className="field">
            <h3>Codes ROME</h3>
            <p>{formation.rome_codes}</p>
          </div>
        </Section>
        {/* <Section title="Information OPCOs">
          <div className="field">
            {formation.opcos && formation.opcos.length === 0 && (
              <>
                <h3>Aucun OPCO rattaché</h3>
              </>
            )}
            {formation.opcos && formation.opcos.length > 0 && (
              <>
                <h3>OPCOs liés à la formation</h3>
                {formation.opcos.map(x => (
                  <p>{x}</p>
                ))}
              </>
            )}
          </div>
        </Section> */}
      </Col>
      <Col md="5">
        {hasRightToEdit && (
          <EditSection
            edition={edition}
            onEdit={onEdit}
            handleSubmit={handleSubmit}
            onDeleteClicked={onDeleteClicked}
          />
        )}
        <div className="sidebar-section info">
          <h2>À propos</h2>
          <div>
            <div className="field multiple">
              <div>
                <h3>Type</h3>
                <p>{formation.etablissement_reference_type}</p>
              </div>
              <div>
                <h3>UAI{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
                <p>
                  {!edition && <>{formation.uai_formation}</>}
                  {edition && (
                    <Input type="text" name="uai_formation" onChange={handleChange} value={values.uai_formation} />
                  )}
                </p>
              </div>
            </div>
            <div className="field">
              <h3>Établissement conventionné ?</h3>
              <p>{formation.etablissement_reference_conventionne}</p>
            </div>
            <div className="field">
              <h3>Établissement déclaré en préfecture ?</h3>
              <p>{formation.etablissement_reference_declare_prefecture}</p>
            </div>
            <div className="field">
              <h3>Organisme certifié 2015 - datadock ?</h3>
              <p>{formation.etablissement_reference_datadock}</p>
            </div>
            <div className="field">
              <h3>Académie{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
              <p>
                {!edition && (
                  <>
                    {formation.nom_academie} ({formation.num_academie})
                  </>
                )}
                {edition && (
                  <>
                    {formation.nom_academie}{" "}
                    <Input type="text" name="num_academie" onChange={handleChange} value={values.num_academie} />
                  </>
                )}
              </p>
            </div>
            <div className="field multiple">
              <div>
                <h3>Code postal{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
                <p>
                  {!edition && <>{formation.code_postal}</>}
                  {edition && (
                    <Input type="text" name="code_postal" onChange={handleChange} value={values.code_postal} />
                  )}
                </p>
              </div>
              <div>
                <h3>Code commune</h3>
                <p>{formation.code_commune_insee}</p>
              </div>
            </div>
            {formation.onisep_url !== "" && formation.onisep_url !== null && (
              <div className="field field-button mt-3">
                <a href={formation.onisep_url} target="_blank" rel="noreferrer noopener">
                  <Button color="primary">Voir la fiche descriptive Onisep</Button>
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="sidebar-section info">
          <h2>Organisme {!oneEstablishment && "Formateur"}</h2>
          <div>
            {formation.etablissement_formateur_entreprise_raison_sociale && (
              <div className="field">
                <h3>Raison sociale</h3>
                <p>{formation.etablissement_formateur_entreprise_raison_sociale}</p>
              </div>
            )}
            {formation.etablissement_formateur_enseigne && (
              <div className="field">
                <h3>Enseigne</h3>
                <p>{formation.etablissement_formateur_enseigne}</p>
              </div>
            )}
            <div className="field">
              <h3>Uai</h3>
              <p>{formation.etablissement_formateur_uai}</p>
            </div>
            <div className="field field-button mt-3">
              <a
                href={`/etablissement/${formation.etablissement_formateur_id}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Button color="primary">Voir l'organisme {!oneEstablishment && "formateur"}</Button>
              </a>
            </div>
          </div>
        </div>
        {!oneEstablishment && (
          <div className="sidebar-section info">
            <h2>Organisme Gestionnaire</h2>
            <div>
              {formation.etablissement_gestionnaire_entreprise_raison_sociale && (
                <div className="field">
                  <h3>Raison sociale</h3>
                  <p>{formation.etablissement_gestionnaire_entreprise_raison_sociale}</p>
                </div>
              )}
              {formation.etablissement_gestionnaire_enseigne && (
                <div className="field">
                  <h3>Enseigne</h3>
                  <p>{formation.etablissement_gestionnaire_enseigne}</p>
                </div>
              )}
              <div className="field">
                <h3>Uai</h3>
                <p>{formation.etablissement_gestionnaire_uai}</p>
              </div>
              <div className="field field-button mt-3">
                <a
                  href={`/etablissement/${formation.etablissement_gestionnaire_id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Button color="primary">Voir l'organisme gestionnaire</Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default ({ match, presetFormation = null }) => {
  const [formation, setFormation] = useState(presetFormation);
  const [gatherData, setGatherData] = useState(0);
  const [edition, setEdition] = useState(presetFormation ? true : false);
  const [modal, setModal] = useState(false);
  // const dispatch = useDispatch();

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      uai_formation: "",
      code_postal: "",
      capacite: "",
      periode: "",
      cfd: "",
      rncp_code: "",
      num_academie: 0,
    },
    onSubmit: ({ uai_formation, code_postal, capacite, periode, cfd, num_academie, rncp_code }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        // const body = { uai_formation, code_postal, capacite, periode, cfd, num_academie, rncp_code };
        let prevStateFormation = formation;
        if (presetFormation) {
          // prevStateFormation = await API.post("api", `/formation`, {
          //   body: {
          //     ...formation,
          //   },
          // });
        }

        let result = null;
        if (
          uai_formation !== prevStateFormation.uai_formation ||
          cfd !== prevStateFormation.cfd ||
          rncp_code !== prevStateFormation.rncp_code ||
          presetFormation
        ) {
          setModal(true);
          setGatherData(1);
          // result = await API.put("api", `/formation/${prevStateFormation._id}`, { body });

          setGatherData(2);
          // await API.get("api", `/services?job=formation-update&id=${result._id}`);
          setGatherData(3);
          if (!prevStateFormation.rncp_code && cfd !== "") {
            // await API.get("api", `/services?job=rncp&id=${result._id}`);
          } else if (!prevStateFormation.cfd && rncp_code !== "") {
            // await API.get("api", `/services?job=rncp-inverse&id=${result._id}`);
          }
          setGatherData(4);
          // await API.get("api", `/services?job=onisep&id=${result._id}`);
          setGatherData(5);
          // result = await API.get("api", `/formation/${result._id}`);
          setGatherData(6);
          await sleep(500);

          setModal(false);
        } else if (
          code_postal !== prevStateFormation.code_postal ||
          capacite !== prevStateFormation.capacite ||
          periode !== prevStateFormation.periode ||
          num_academie !== prevStateFormation.num_academie
        ) {
          // result = await API.put("api", `/formation/${prevStateFormation._id}`, { body });
        }

        if (result) {
          setFormation(result);
          setFieldValue("uai_formation", result.uai_formation);
          setFieldValue("code_postal", result.code_postal);
          setFieldValue("periode", result.periode);
          setFieldValue("capacite", result.capacite);
          setFieldValue("cfd", result.cfd);
          setFieldValue("num_academie", result.num_academie);
          setFieldValue("rncp_code", result.rncp_code);
        }

        if (presetFormation) {
          // dispatch(push(`/formation/${prevStateFormation._id}`));
        }
        setEdition(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    async function run() {
      try {
        let form = null;
        if (!presetFormation) {
          // form = await API.get("api", `/formation/${match.params.id}`);
          form = await _get(`${endpointNewFront}/entity/formation2021/${match.params.id}`, false);
        } else {
          form = presetFormation;
        }
        setFormation(form);

        setFieldValue("uai_formation", form.uai_formation || "");
        setFieldValue("code_postal", form.code_postal || "");
        setFieldValue("periode", form.periode || "");
        setFieldValue("capacite", form.capacite || "");
        setFieldValue("cfd", form.cfd || "");
        setFieldValue("num_academie", form.num_academie || "");
        setFieldValue("rncp_code", form.rncp_code || "");
      } catch (e) {
        // dispatch(push(routes.NOTFOUND));
      }
    }
    run();
  }, [match, setFieldValue, presetFormation]);

  const onEdit = () => {
    setEdition(!edition);
  };

  if (!formation) {
    return (
      <div className="page formation">
        <Spinner color="secondary" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="page formation">
        <div className="notice">
          <Container>
            {presetFormation && (
              <Alert color="info" style={{ fontSize: "1rem", fontWeight: "bolder" }}>
                Cette formation est à l'état de brouillon. <br />
                Pour confirmer vos modifications, veuillez cliquer sur le bouton "Valider".
              </Alert>
            )}
            <h1 className="heading">{formation.intitule_long}</h1>
            <Formation
              formation={formation}
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
                    <div>
                      Recherche des informations générale {gatherData === 2 && <Spinner color="secondary" />}
                      {gatherData > 2 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                    </div>
                    <div>
                      Recherche des informations RNCP{" "}
                      {gatherData === 3 && (
                        <>
                          <Spinner color="secondary" />
                        </>
                      )}
                      {gatherData > 3 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                    </div>
                    <div>
                      Recherche des informations Onisep {gatherData === 4 && <Spinner color="secondary" />}
                      {gatherData > 4 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                    </div>
                    <div>
                      Vérification {gatherData === 5 && <Spinner color="secondary" />}
                      {gatherData > 5 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
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
