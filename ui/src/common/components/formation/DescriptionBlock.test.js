import React from "react";
import { DescriptionBlock } from "./DescriptionBlock";
import { render, waitFor } from "@testing-library/react";

const formation = {
  _id: "5fc6166e712d48a988133449",
  etablissement_gestionnaire_id: "5e8df8b220ff3b2161267d90",
  etablissement_gestionnaire_siret: "34958609900021",
  etablissement_gestionnaire_enseigne: "CFAI",
  etablissement_gestionnaire_uai: "0542221W",
  etablissement_gestionnaire_type: "CFA",
  etablissement_gestionnaire_conventionne: "OUI",
  etablissement_gestionnaire_declare_prefecture: "OUI",
  etablissement_gestionnaire_datadock: "pas datadocké",
  etablissement_gestionnaire_published: true,
  etablissement_gestionnaire_catalogue_published: true,
  etablissement_gestionnaire_adresse: "10 RUE ALFRED KASTLER",
  etablissement_gestionnaire_code_postal: "54320",
  etablissement_gestionnaire_code_commune_insee: "54357",
  etablissement_gestionnaire_localite: "MAXEVILLE",
  etablissement_gestionnaire_complement_adresse: "SITE TECHNOLOGIQUE ST JACQUES II",
  etablissement_gestionnaire_cedex: null,
  etablissement_gestionnaire_entreprise_raison_sociale: "ASS APPRENTISSAGE INDUSTRIEL",
  rncp_etablissement_gestionnaire_habilite: false,
  etablissement_gestionnaire_region: "Grand Est",
  etablissement_gestionnaire_num_departement: "54",
  etablissement_gestionnaire_nom_departement: "Meurthe-et-Moselle",
  etablissement_gestionnaire_nom_academie: "Nancy-Metz",
  etablissement_gestionnaire_num_academie: "12",
  etablissement_gestionnaire_siren: "349586099",
  etablissement_gestionnaire_date_creation: "1970-01-10T17:36:50.400Z",
  etablissement_formateur_id: "5e8df8b220ff3b2161267d90",
  etablissement_formateur_siret: "34958609900021",
  etablissement_formateur_enseigne: "CFAI",
  etablissement_formateur_uai: "0542221W",
  etablissement_formateur_type: "CFA",
  etablissement_formateur_conventionne: "OUI",
  etablissement_formateur_declare_prefecture: "OUI",
  etablissement_formateur_datadock: "pas datadocké",
  etablissement_formateur_published: true,
  etablissement_formateur_catalogue_published: true,
  etablissement_formateur_adresse: "10 RUE ALFRED KASTLER",
  etablissement_formateur_code_postal: "54320",
  etablissement_formateur_code_commune_insee: "54357",
  etablissement_formateur_localite: "MAXEVILLE",
  etablissement_formateur_complement_adresse: "SITE TECHNOLOGIQUE ST JACQUES II",
  etablissement_formateur_cedex: null,
  etablissement_formateur_entreprise_raison_sociale: "ASS APPRENTISSAGE INDUSTRIEL",
  rncp_etablissement_formateur_habilite: false,
  etablissement_formateur_region: "Grand Est",
  etablissement_formateur_num_departement: "54",
  etablissement_formateur_nom_departement: "Meurthe-et-Moselle",
  etablissement_formateur_nom_academie: "Nancy-Metz",
  etablissement_formateur_num_academie: "12",
  etablissement_formateur_siren: "349586099",
  etablissement_formateur_date_creation: "1970-01-10T17:36:50.400Z",
  etablissement_reference: "gestionnaire",
  etablissement_reference_type: "CFA",
  etablissement_reference_conventionne: "OUI",
  etablissement_reference_declare_prefecture: "OUI",
  etablissement_reference_datadock: "pas datadocké",
  etablissement_reference_published: true,
  etablissement_reference_catalogue_published: true,
  rncp_etablissement_reference_habilite: false,
  etablissement_reference_date_creation: null,
  cfd: "40025411",
  cfd_specialite: null,
  cfd_outdated: false,
  cfd_date_fermeture: null,
  mef_10_code: null,
  mefs_10: [{ mef10: "2472541131", modalite: { duree: "3", annee: "1" } }],
  nom_academie: "Nancy-Metz",
  num_academie: "12",
  code_postal: "57450",
  code_commune_insee: "57316",
  num_departement: "57",
  nom_departement: "Moselle",
  region: "Grand Est",
  localite: "Henriville",
  uai_formation: "0573690B",
  nom: null,
  intitule_long: "TECHNICIEN EN CHAUDRONNERIE INDUSTRIELLE (BAC PRO)",
  intitule_court: "TECH.CHAUDRONNERIE INDUSTRIELLE",
  diplome: "BAC PROFESSIONNEL",
  niveau: "4 (BAC...)",
  onisep_url: "http://www.onisep.fr/http/redirection/formation/identifiant/4671",
  onisep_intitule: "bac pro Technicien en chaudronnerie industrielle",
  onisep_libelle_poursuite:
    "BTS Conception et industrialisation en construction navale ; BTS Conception et réalisation en chaudronnerie industrielle ; BTS Architectures en métal : conception et réalisation ; BP Menuisier aluminium-verre ; MC Technicien(ne) en soudage ; MC Technicien(ne) en chaudronnerie aéronautique et spatiale ; MC Technicien(ne) en tuyauterie ; BTS Conception et réalisation de carrosseries",
  onisep_lien_site_onisepfr: "http://www.onisep.fr/http/redirection/formation/slug/FOR.582",
  onisep_discipline: "construction métallique ; chaudronnerie ; métallurgie ; soudage",
  onisep_domaine_sousdomaine:
    "matières premières, fabrication, industries/métallurgie sidérurgie ; mécanique/travail des métaux",
  rncp_code: "RNCP29885",
  rncp_intitule: "Technicien en chaudronnerie industrielle",
  rncp_eligible_apprentissage: true,
  rncp_details: {
    date_fin_validite_enregistrement: "01/01/2024",
    active_inactive: "ACTIVE",
    etat_fiche_rncp: "Publiée",
    niveau_europe: "niveau4",
    code_type_certif: "BAC PRO",
    type_certif: "Baccalauréat professionnel",
    ancienne_fiche: ["RNCP7140"],
    nouvelle_fiche: null,
    demande: 0,
    nsf_code: "254",
    nsf_libelle: "Structures métalliques (y.c. soudure, carrosserie, coque bateau, cellule avion)",
    partenaires: null,
    romes: [
      { rome: "H2902", libelle: "Chaudronnerie - tôlerie" },
      { rome: "I1606", libelle: "Réparation de carrosserie" },
      { rome: "H2914", libelle: "Réalisation et montage en tuyauterie" },
      { rome: "H2913", libelle: "Soudage manuel" },
    ],
    blocs_competences: [
      {
        numero_bloc: "RNCP29885BC05",
        intitule: "U34 : Prévention-Santé-Environnement",
        liste_competences:
          "<p>Conduire une démarche d'analyse de situations en appliquant la démarche de résolution de problème.<br />Analyser une situation professionnelle en appliquant différentes démarches : analyse par le risque, par le travail, par l'accident.<br />Mobiliser des connaissances scientifiques, juridiques et économiques.<br />Proposer et justifier les mesures de prévention adaptées.<br />Proposer des actions permettant d’intervenir efficacement face à une situation d'urgence.</p>",
        modalites_evaluation: null,
      },
    ],
    voix_acces: null,
  },
  rome_codes: ["H2902", "I1606", "H2914", "H2913"],
  periode:
    '["2021-09", "2021-10", "2021-11", "2021-12", "2022-01", "2022-02", "2022-03", "2022-04", "2022-05", "2022-06", "2022-07", "2022-08"]',
  capacite: null,
  duree: "3",
  annee: "1",
  parcoursup_reference: false,
  parcoursup_a_charger: false,
  parcoursup_statut: "hors périmètre",
  parcoursup_statut_history: [],
  parcoursup_ids: [],
  affelnet_reference: true,
  affelnet_a_charger: false,
  affelnet_statut: "publié",
  affelnet_statut_history: [],
  source: "WS RCO",
  commentaires: null,
  opcos: null,
  info_opcos: 0,
  info_opcos_intitule: "Non trouvés",
  published: true,
  rco_published: true,
  draft: false,
  updates_history: [],
  last_update_who: null,
  to_verified: false,
  update_error: null,
  lieu_formation_adresse: "Zone Megazone de Moselle Est Parc d'Activités du district de Freyming-Merlebach",
  lieu_formation_siret: null,
  id_rco_formation: "01_GE108189|01_GE506980|97049",
  id_formation: "01_GE108189",
  id_action: "01_GE506980",
  ids_action: ["01_GE506980"],
  id_certifinfo: "97049",
  tags: ["2021", "2022"],
  libelle_court: "BAC PRO",
  niveau_formation_diplome: "400",
  affelnet_infos_offre: "BAC PRO en 3 ans",
  affelnet_code_nature: "620",
  affelnet_secteur: "PR",
  affelnet_raison_depublication: null,
  bcn_mefs_10: [
    { mef10: "2472541131", modalite: { duree: "3", annee: "1" } },
    { mef10: "2472541133", modalite: { duree: "3", annee: "3" } },
    { mef10: "2472541132", modalite: { duree: "3", annee: "2" } },
  ],
  editedFields: { uai_formation: "0573690B" },
  parcoursup_raison_depublication: null,
  lieu_formation_geo_coordonnees: "49.103334,6.855078",
  geo_coordonnees_etablissement_gestionnaire: "48.705054,6.12883",
  geo_coordonnees_etablissement_formateur: "48.705054,6.12883",
  idea_geo_coordonnees_etablissement: "49.103334,6.855078",
  created_at: "2021-08-06T23:49:25.696Z",
  last_update_at: "2021-10-08T00:22:45.551Z",
  distance_lieu_formation_etablissement_formateur: 69130,
  etablissement_formateur_nda: "44540379354",
  etablissement_gestionnaire_nda: "44540379354",
  to_update: false,
  lieu_formation_adresse_computed: "57 Rue de la Paix, 57450 Henriville",
};

test("renders the description block of the training", async () => {
  const { queryByText } = render(<DescriptionBlock formation={formation} />);

  const title = queryByText("Description");
  expect(title).toBeInTheDocument();

  const intitule_court = queryByText("TECH.CHAUDRONNERIE INDUSTRIELLE");
  expect(intitule_court).toBeInTheDocument();

  const diplome = queryByText("40025411");
  expect(diplome).toBeInTheDocument();

  const partenaires = queryByText(/^Partenaires/i);
  expect(partenaires).not.toBeInTheDocument();

  const opcos = queryByText(/opco Atlas, opco EP/i);
  expect(opcos).not.toBeInTheDocument();

  const warn = queryByText(/Ce diplôme a une date de fin antérieure au 31\/08 de l'année en cours/i);
  expect(warn).not.toBeInTheDocument();
});

test("show partenaires for titre or tp", async () => {
  const tpFormation = {
    ...formation,
    rncp_details: {
      ...formation.rncp_details,
      code_type_certif: "TP",
      certificateurs: [
        {
          certificateur: "Hello",
          siret_certificateur: "111",
        },
      ],
    },
  };
  const { queryByText } = render(<DescriptionBlock formation={tpFormation} />);

  const partenaires = queryByText(/^Partenaires/i);
  expect(partenaires).toBeInTheDocument();
});

test("dont show partenaires if certificateur is ministere EN for titre or tp", async () => {
  const tpFormation = {
    ...formation,
    rncp_details: {
      ...formation.rncp_details,
      code_type_certif: "TP",
      certificateurs: [
        {
          certificateur: "Ministère du travail",
          siret_certificateur: "111",
        },
      ],
    },
  };
  const { queryByText } = render(<DescriptionBlock formation={tpFormation} />);

  const partenaires = queryByText(/^Partenaires/i);
  expect(partenaires).not.toBeInTheDocument();
});

test("show partenaires", async () => {
  const tpFormation = {
    ...formation,
    rncp_details: {
      ...formation.rncp_details,
      code_type_certif: "TP",
      partenaires: [
        {
          Siret_Partenaire: "34958609900021",
          Nom_Partenaire: "Hello Corp",
          Habilitation_Partenaire: "HABILITATION_ORGA_FORM",
        },
      ],
    },
  };
  const { queryByText } = render(<DescriptionBlock formation={tpFormation} />);

  const partenaires = queryByText(/^Partenaires/i);
  expect(partenaires).toBeInTheDocument();

  const partenaire = queryByText(/^Hello Corp/i);
  expect(partenaire).toBeInTheDocument();
});

test("display a warning for cfd outdated", async () => {
  const testFormation = {
    ...formation,
    cfd_outdated: true,
  };
  const { queryByText } = render(<DescriptionBlock formation={testFormation} />);

  const warn = queryByText(/Ce diplôme a une date de fin antérieure au 31\/08 de l'année en cours/i);
  expect(warn).toBeInTheDocument();
});

test("display OPCOS", async () => {
  const testFormation = {
    ...formation,
    opcos: ["opco Atlas", "opco EP"],
  };
  const { queryByText } = render(<DescriptionBlock formation={testFormation} />);

  const opcos = queryByText(/opco Atlas, opco EP/i);
  expect(opcos).toBeInTheDocument();
});

test("display no OPCOS", async () => {
  const testFormation = {
    ...formation,
    opcos: [],
  };
  const { queryByText } = render(<DescriptionBlock formation={testFormation} />);

  const opcos = queryByText(/opco Atlas, opco EP/i);
  expect(opcos).not.toBeInTheDocument();

  const noOpco = queryByText(/Aucun OPCO rattaché/i);
  expect(noOpco).toBeInTheDocument();
});
