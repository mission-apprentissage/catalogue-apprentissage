import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Input } from "reactstrap";
import { Spinner, Alert, Box } from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import queryString from "query-string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { _get, _post } from "../../common/httpClient";
import Layout from "../layout/Layout";
import Section from "./components/Section";
import useAuth from "../../common/hooks/useAuth";
import { hasRightToEditFormation } from "../../common/utils/rolesUtils";
import "./formation.css";

const EditSection = ({ edition, onEdit, handleSubmit, onDeleteClicked, isSubmitting, isDeleteDisabled }) => {
  return (
    <div className="sidebar-section info sidebar-section-edit">
      {edition && (
        <>
          <Button className="mb-3" color="success" onClick={handleSubmit} disabled={isSubmitting}>
            Valider {isSubmitting && <Spinner size="xs" />}
          </Button>
          <Button
            color="danger"
            onClick={() => {
              onEdit();
            }}
            disabled={isSubmitting}
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
          <Button color="danger" onClick={onDeleteClicked} disabled={isDeleteDisabled}>
            Supprimer
          </Button>
        </>
      )}
    </div>
  );
};

const Formation = ({
  formation,
  edition,
  onEdit,
  handleChange,
  handleSubmit,
  values,
  isMna,
  isSubmitting,
  onDelete,
}) => {
  const [auth] = useAuth();

  const oneEstablishment = formation.etablissement_gestionnaire_siret === formation.etablissement_formateur_siret;
  const hasRightToEdit = !isMna && hasRightToEditFormation(formation, auth);

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
        <Section title="Information OPCOs">
          <div className="field">
            {formation.opcos && formation.opcos.length === 0 && <h3>Aucun OPCO rattaché</h3>}
            {formation.opcos && formation.opcos.length > 0 && (
              <>
                <h3>OPCOs liés à la formation</h3>
                {formation.opcos.map((x, index) => (
                  <p key={index}>{x}</p>
                ))}
              </>
            )}
          </div>
        </Section>
      </Col>
      <Col md="5">
        {hasRightToEdit && (
          <EditSection
            edition={edition}
            onEdit={onEdit}
            handleSubmit={handleSubmit}
            onDeleteClicked={onDelete}
            isSubmitting={isSubmitting}
            isDeleteDisabled={!formation.published}
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

export default ({ match }) => {
  const [formation, setFormation] = useState();
  const [pendingFormation, setPendingFormation] = useState();
  const displayedFormation = pendingFormation || formation;

  const [edition, setEdition] = useState(false);
  let history = useHistory();
  const { search } = useLocation();
  const { source } = queryString.parse(search);
  const isMna = source === "mna";

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    initialValues: {
      uai_formation: "",
      code_postal: "",
      capacite: "",
      periode: "",
      cfd: "",
      rncp_code: "",
      num_academie: 0,
    },
    onSubmit: (values) => {
      return new Promise(async (resolve) => {
        const updatedFormation = await _post("/api/entity/formation2021/update", { ...displayedFormation, ...values });

        let result = await _post(`/api/entity/pendingRcoFormation`, updatedFormation);
        if (result) {
          setPendingFormation(result);
          setFieldValue("uai_formation", result.uai_formation);
          setFieldValue("code_postal", result.code_postal);
          setFieldValue("periode", result.periode);
          setFieldValue("capacite", result.capacite);
          setFieldValue("cfd", result.cfd);
          setFieldValue("num_academie", result.num_academie);
          setFieldValue("rncp_code", result.rncp_code);
        }

        setEdition(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    async function run() {
      try {
        let pendingRCOFormation;

        const apiURL = isMna ? "/api/entity/formation/" : "/api/entity/formation2021/";
        const form = await _get(`${apiURL}${match.params.id}`, false);
        setFormation(form);

        try {
          pendingRCOFormation = await _get(`/api/entity/pendingRcoFormation/${form.id_rco_formation}`, false);
          setPendingFormation(pendingRCOFormation);
        } catch (err) {
          // no pending formation, do nothing
        }

        const displayedFormation = pendingRCOFormation || form;

        setFieldValue("uai_formation", displayedFormation.uai_formation || "");
        setFieldValue("code_postal", displayedFormation.code_postal || "");
        setFieldValue("periode", displayedFormation.periode || "");
        setFieldValue("capacite", displayedFormation.capacite || "");
        setFieldValue("cfd", displayedFormation.cfd || "");
        setFieldValue("num_academie", displayedFormation.num_academie || "");
        setFieldValue("rncp_code", displayedFormation.rncp_code || "");
      } catch (e) {
        history.push("/404");
      }
    }
    run();
  }, [match, setFieldValue, isMna, history]);

  const onEdit = () => {
    setEdition(!edition);
  };

  const onDelete = async () => {
    // eslint-disable-next-line no-restricted-globals
    const areYousure = confirm("Souhaitez-vous vraiment supprimer cette formation ?");
    if (areYousure) {
      // Update as not published
      let result = await _post(`/api/entity/pendingRcoFormation`, { ...displayedFormation, published: false });
      if (result) {
        setPendingFormation(result);
      }
    }
  };

  return (
    <Layout>
      <div className="page formation">
        <div className="notice">
          <Container>
            {pendingFormation && (
              <Alert status="info" fontWeight={"bold"}>
                Cette formation a été {pendingFormation.published ? "éditée" : "supprimée"} et est en attente de
                traitement
                <br />
              </Alert>
            )}
            {!displayedFormation && (
              <Box align="center" p={2}>
                <Spinner />
              </Box>
            )}
            {displayedFormation && (
              <>
                <h1 className="heading">{displayedFormation.intitule_long}</h1>
                <Formation
                  formation={displayedFormation}
                  edition={edition}
                  onEdit={onEdit}
                  values={values}
                  handleSubmit={handleSubmit}
                  handleChange={handleChange}
                  isMna={isMna}
                  isSubmitting={isSubmitting}
                  onDelete={onDelete}
                />
              </>
            )}
          </Container>
        </div>
      </div>
    </Layout>
  );
};
