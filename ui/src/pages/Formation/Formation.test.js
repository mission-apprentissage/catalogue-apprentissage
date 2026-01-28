import { renderWithRouter, grantAnonymousAccess, setupMswServer } from "../../common/utils/testUtils";
import { waitFor } from "@testing-library/react";
import { rest } from "msw";
import Formation from "./Formation";
import { AFFELNET_STATUS, PARCOURSUP_STATUS } from "../../constants/status";

jest.setTimeout(20000);

const formation = {
  _id: "5fc6166e712d48a988133449",
  cle_ministere_educatif: "cle_1",
  // etablissement_gestionnaire_id: "5e8df8b220ff3b2161267d90",
  etablissement_gestionnaire_siret: "34958609900021",
  etablissement_gestionnaire_enseigne: "CFAI",
  etablissement_gestionnaire_uai: "0542221W",
  etablissement_gestionnaire_published: true,
  etablissement_gestionnaire_catalogue_published: true,
  etablissement_gestionnaire_adresse: "10 RUE ALFRED KASTLER",
  etablissement_gestionnaire_code_postal: "54320",
  etablissement_gestionnaire_code_commune_insee: "54357",
  etablissement_gestionnaire_localite: "MAXEVILLE",
  etablissement_gestionnaire_complement_adresse: "SITE TECHNOLOGIQUE ST JACQUES II",
  etablissement_gestionnaire_cedex: null,
  etablissement_gestionnaire_entreprise_raison_sociale: "ASS APPRENTISSAGE INDUSTRIEL",
  etablissement_gestionnaire_habilite_rncp: false,
  etablissement_gestionnaire_region: "Grand Est",
  etablissement_gestionnaire_num_departement: "54",
  etablissement_gestionnaire_nom_departement: "Meurthe-et-Moselle",
  etablissement_gestionnaire_nom_academie: "Nancy-Metz",
  etablissement_gestionnaire_num_academie: "12",
  etablissement_gestionnaire_siren: "349586099",
  etablissement_gestionnaire_date_creation: "1970-01-10T17:36:50.400Z",
  // etablissement_formateur_id: "5e8df8b220ff3b2161267d90",
  etablissement_formateur_siret: "34958609900021",
  etablissement_formateur_enseigne: "CFAI",
  etablissement_formateur_uai: "0542221W",
  etablissement_formateur_published: true,
  etablissement_formateur_catalogue_published: true,
  etablissement_formateur_adresse: "10 RUE ALFRED KASTLER",
  etablissement_formateur_code_postal: "54320",
  etablissement_formateur_code_commune_insee: "54357",
  etablissement_formateur_localite: "MAXEVILLE",
  etablissement_formateur_complement_adresse: "SITE TECHNOLOGIQUE ST JACQUES II",
  etablissement_formateur_cedex: null,
  etablissement_formateur_entreprise_raison_sociale: "ASS APPRENTISSAGE INDUSTRIEL",
  etablissement_formateur_habilite_rncp: false,
  etablissement_formateur_region: "Grand Est",
  etablissement_formateur_num_departement: "54",
  etablissement_formateur_nom_departement: "Meurthe-et-Moselle",
  etablissement_formateur_nom_academie: "Nancy-Metz",
  etablissement_formateur_num_academie: "12",
  etablissement_formateur_siren: "349586099",
  etablissement_formateur_date_creation: "1970-01-10T17:36:50.400Z",
  etablissement_reference: "gestionnaire",
  etablissement_reference_published: true,
  etablissement_reference_catalogue_published: true,
  etablissement_reference_habilite_rncp: false,
  etablissement_reference_date_creation: null,
  cfd: "40025411",
  cfd_specialite: null,
  cfd_outdated: false,
  cfd_date_fermeture: null,
  affelnet_mefs_10: [{ mef10: "2472541131", modalite: { duree: "3", annee: "1" } }],
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
  onisep_discipline: "construction métallique ; chaudronnerie ; métallurgie ; soudage",
  onisep_domaine_sousdomaine:
    "matières premières, fabrication, industries/métallurgie sidérurgie ; mécanique/travail des métaux",
  rncp_code: "RNCP29885",
  rncp_intitule: "Technicien en chaudronnerie industrielle",
  rncp_eligible_apprentissage: true,
  rncp_details: {
    date_fin_validite_enregistrement: new Date("01-01-2024"),
    active_inactive: "ACTIVE",
    etat_fiche_rncp: "Publiée",
    niveau_europe: "niveau4",
    code_type_certif: "BAC PRO",
    type_certif: "Baccalauréat professionnel",
    ancienne_fiche: ["RNCP7140"],
    nouvelle_fiche: null,
    certificateurs: [
      {
        certificateur: "Ministère de l'Education nationale et de la jeunesse",
        siret_certificateur: "11004301500012",
      },
      {
        certificateur: "MINISTERE DE L EDUCATION NATIONALE, DE LA JEUNESSE ET DES SPORTS",
        siret_certificateur: "11004301500012",
      },
    ],
    nsf_code: "254",
    partenaires: null,
    romes: [
      { rome: "H2902", libelle: "Chaudronnerie - tôlerie" },
      { rome: "I1606", libelle: "Réparation de carrosserie" },
      { rome: "H2914", libelle: "Réalisation et montage en tuyauterie" },
      { rome: "H2913", libelle: "Soudage manuel" },
    ],
  },
  periode: [
    "2021-09",
    "2021-10",
    "2021-11",
    "2021-12",
    "2022-01",
    "2022-02",
    "2022-03",
    "2022-04",
    "2022-05",
    "2022-06",
    "2022-07",
    "2022-08",
  ],
  capacite: null,
  duree: "3",
  annee: "1",
  parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  parcoursup_statut_history: [],
  affelnet_statut: AFFELNET_STATUS.PUBLIE,
  affelnet_statut_history: [],
  published: true,
  rco_published: true,
  updates_history: [{ from: { uai_formation: "" }, to: { uai_formation: "0573690B" }, updated_at: new Date() }],
  last_update_who: null,
  lieu_formation_adresse: "Zone Megazone de Moselle Est Parc d'Activités du district de Freyming-Merlebach",
  etablissement_lieu_formation_siret: null,
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
  created_at: "2021-08-06T23:49:25.696Z",
  last_update_at: "2021-10-08T00:22:45.551Z",
  distance_lieu_formation_etablissement_formateur: 69130,
  etablissement_formateur_nda: "44540379354",
  etablissement_gestionnaire_nda: "44540379354",
  to_update: false,
  lieu_formation_adresse_computed: "57 Rue de la Paix, 57450 Henriville",
};

const server = setupMswServer(
  rest.get(/\/api\/entity\/formation\/1/, (req, res, ctx) => {
    return res(ctx.json({ ...formation, uai_formation_valide: true, distance: 0 }));
  }),
  rest.get(/\/api\/entity\/formation\/2/, (req, res, ctx) => {
    return res(ctx.json({ ...formation, uai_formation_valide: false, distance: 150 }));
  }),
  rest.get(/\/api\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("renders a training page", async () => {
  const { queryByText, getByText } = renderWithRouter(<Formation />, {
    route: "/formation/1",
    path: "/formation/:id",
  });

  await waitFor(() => getByText("TECHNICIEN EN CHAUDRONNERIE INDUSTRIELLE (BAC PRO)"));

  const title = queryByText("TECHNICIEN EN CHAUDRONNERIE INDUSTRIELLE (BAC PRO)");
  expect(title).toBeInTheDocument();
});

it("don't display an error when uai is valid", async () => {
  grantAnonymousAccess({ acl: ["page_formation"] });

  const { queryByText, getByTestId } = renderWithRouter(<Formation />, {
    route: "/formation/1",
    path: "/formation/:id",
  });

  await waitFor(() => getByTestId("formation-content"));

  const uai = queryByText("0573690B");
  expect(uai).toBeInTheDocument();

  const ok = getByTestId("uai-ok");
  expect(ok).toBeInTheDocument();
});

it("display an error when uai is invalid", async () => {
  grantAnonymousAccess({ acl: ["page_formation"] });

  const { queryByText, getByTestId } = renderWithRouter(<Formation />, {
    route: "/formation/2",
    path: "/formation/:id",
  });

  await waitFor(() => getByTestId("formation-content"));

  const uai = queryByText("0573690B");
  expect(uai).toBeInTheDocument();

  const warning = getByTestId("uai-warning");
  expect(warning).toBeInTheDocument();
});

// it("don't display an error when adress is same as coordinates", async () => {
//   grantAnonymousAccess({ acl: ["page_formation"] });

//   const { getByText, queryByTestId } = renderWithRouter(<Formation match={{ params: { id: 1 } }} />);

//   await waitFor(() => getByText(/Adresse :/));

//   const warning = queryByTestId("adress-warning");
//   expect(warning).not.toBeInTheDocument();
// });

// it("display an error when adress is not same as coordinates", async () => {
//   grantAnonymousAccess({ acl: ["page_formation"] });

//   const { getByText, queryByTestId } = renderWithRouter(<Formation match={{ params: { id: 2 } }} />);

//   await waitFor(() => getByText(/Adresse :/));

//   const warning = queryByTestId("adress-warning");
//   expect(warning).toBeInTheDocument();
// });
