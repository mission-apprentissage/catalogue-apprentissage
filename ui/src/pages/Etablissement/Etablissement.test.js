import React from "react";
import { renderWithRouter, grantAnonymousAccess, setupMswServer } from "../../common/utils/testUtils";
import { rest } from "msw";
import Etablissement from "./Etablissement";
import { waitFor } from "@testing-library/react";
import * as api from "../../common/api/organisme";
import userEvent from "@testing-library/user-event";

jest.setTimeout(20000);

const etablissement = {
  _id: "5e8df88020ff3b2161267970",
  siege_social: true,
  etablissement_siege_siret: "49917930700024",
  siret: "49917930700024",
  siren: "499179307",
  nda: "76310960131",
  naf_code: "8559A",
  naf_libelle: "Etablissement continue d'adultes",
  date_creation: "2010-02-28T23:00:00.000Z",
  date_mise_a_jour: "2021-10-27T06:37:51.000Z",
  diffusable_commercialement: true,
  enseigne: null,
  onisep_nom: null,
  onisep_url: null,
  onisep_code_postal: null,
  adresse: "MIDISUP\r\nINPT BAT INTER UNIVERSITAIRE\r\n118 RTE DE NARBONNE\r\nBP142093\r\n31400 TOULOUSE\r\nFRANCE",
  numero_voie: "118",
  type_voie: "RTE",
  nom_voie: "DE NARBONNE",
  complement_adresse: "INPT BAT INTER UNIVERSITAIRE",
  code_postal: "31400",
  num_departement: "31",
  nom_departement: "Haute-Garonne",
  localite: "TOULOUSE",
  code_insee_localite: "31555",
  cedex: null,
  date_fermeture: "1970-01-01T00:00:00.000Z",
  ferme: false,
  region_implantation_code: "76",
  region_implantation_nom: "Occitanie",
  commune_implantation_code: "31555",
  commune_implantation_nom: "Toulouse",
  pays_implantation_code: "FR",
  pays_implantation_nom: "FRANCE",
  num_academie: 16,
  nom_academie: "Toulouse",
  uai: "0312755B",
  uais_potentiels: [],
  info_datagouv_ofs: 1,
  info_datagouv_ofs_info: "Ok",
  info_qualiopi_info: "OUI",
  api_entreprise_reference: true,
  entreprise_siren: "499179307",
  entreprise_procedure_collective: false,
  entreprise_enseigne: null,
  entreprise_numero_tva_intracommunautaire: "FR38499179307",
  entreprise_code_effectif_entreprise: "12",
  entreprise_forme_juridique_code: "9220",
  entreprise_forme_juridique: "Association déclarée",
  entreprise_raison_sociale: "MIDISUP",
  entreprise_nom_commercial: "",
  entreprise_capital_social: null,
  entreprise_date_creation: "2007-02-13T23:00:00.000Z",
  entreprise_date_radiation: null,
  entreprise_naf_code: "8559A",
  entreprise_naf_libelle: "Etablissement continue d'adultes",
  entreprise_date_fermeture: null,
  entreprise_ferme: false,
  entreprise_siret_siege_social: "49917930700024",
  entreprise_nom: null,
  entreprise_prenom: null,
  entreprise_categorie: "PME",
  formations_attachees: true,
  formations_ids: [
    "5e8df9ad20ff3b2161268e5a",
    "5e8df9bb20ff3b2161268f06",
    "5e8df9e320ff3b216126911e",
    "5e8dfc3420ff3b216126af80",
    "5e8dfc4420ff3b216126b054",
    "5e8dfc6d20ff3b216126b262",
    "5e8dfc9d20ff3b216126b482",
    "5e8dfdb020ff3b216126bee2",
    "5e8dffca20ff3b216126d032",
    "5e8dffd420ff3b216126d07e",
    "5e8dffcb20ff3b216126d038",
    "5e8e006a20ff3b216126d4e2",
    "5e8e029f20ff3b216126e2ba",
    "5e8e032920ff3b216126e5d8",
    "5e8e033720ff3b216126e622",
    "5e8e02cf20ff3b216126e3d2",
    "5e8e030920ff3b216126e528",
    "5e8e034420ff3b216126e670",
    "5e8e03c820ff3b216126e964",
    "5e8e060220ff3b216126f602",
    "5e8e062320ff3b216126f6b2",
    "5e8e05d520ff3b216126f502",
    "5e8e05ab20ff3b216126f416",
    "5e8e05d720ff3b216126f50a",
    "5e8e0b3620ff3b21612712b8",
    "5e8e0b5020ff3b2161271352",
    "5e8e0c9b20ff3b2161271ace",
    "5e8e0c2520ff3b2161271820",
    "5e8e0cd120ff3b2161271c06",
    "5e8e0d3820ff3b2161271e66",
    "5e8e0e2820ff3b21612723ec",
    "5e8e0e4d20ff3b21612724d2",
    "5e8e0e4a20ff3b21612724c2",
    "5f15a58ed2bf3a00082726e8",
  ],
  formations_uais: [
    "0312241T",
    "0811293R",
    "0811332H",
    "0312390E",
    "0312755B",
    "0312353P",
    "0310105W",
    "0310152X",
    "0311382J",
    "0312169P",
    "0310120M",
    "0342299P",
    "0811200P",
    "0650048Z",
  ],
  formations_n3: false,
  formations_n4: false,
  formations_n5: true,
  formations_n6: true,
  formations_n7: true,
  ds_id_dossier: "1184586",
  ds_questions_siren: "499179307",
  ds_questions_nom: "TAILLEFER Audrey",
  ds_questions_email: "audrey.taillefer@midisup.com",
  ds_questions_uai: "0312755B",
  ds_questions_has_agrement_cfa: "true",
  ds_questions_has_certificaton_2015: "true",
  ds_questions_has_ask_for_certificaton: "false",
  ds_questions_ask_for_certificaton_date: null,
  ds_questions_declaration_code: "76310960131",
  ds_questions_has_2020_training: "true",
  catalogue_published: true,
  published: true,
  updates_history: [],
  update_error: "error: Siren non trouvé.",
  tags: ["2020", "2022"],
  rco_uai: "0312755B",
  rco_adresse: null,
  rco_code_postal: "31100",
  rco_code_insee_localite: "31555",
  idcc: 1516,
  opco_nom: "AKTO / Opco entreprises et salariés des services à forte intensité de main d'oeuvre",
  opco_siren: "853000982",
  created_at: "2020-02-29T17:33:07.263Z",
  last_update_at: "2021-12-08T22:46:49.026Z",
  __v: 0,
  entreprise_tranche_effectif_salarie: {
    de: 20,
    a: 49,
    code: "12",
    date_reference: "2019",
    intitule: "20 à 49 salariés",
  },
  etablissement_siege_id: null,
  tranche_effectif_salarie: {
    de: 20,
    a: 49,
    code: "12",
    date_reference: "2019",
    intitule: "20 à 49 salariés",
  },
  geo_coordonnees: "43.561566,1.463029",
  rco_geo_coordonnees: null,
};

const server = setupMswServer(
  rest.get(/\/api\/v1\/entity\/etablissement\/1/, (req, res, ctx) => {
    return res(ctx.json({ ...etablissement, uai_valide: true }));
  }),
  rest.get(/\/api\/v1\/entity\/etablissement\/2/, (req, res, ctx) => {
    return res(ctx.json({ ...etablissement, uai_valide: false }));
  }),
  rest.get(/\/api\/v1\/entity\/formations\/count/, (req, res, ctx) => {
    return res(ctx.json(etablissement.formations_ids?.length ?? 0));
  }),
  rest.get(/\/api\/v1\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("renders a training page", async () => {
  const { queryAllByText, getByText, getAllByText } = renderWithRouter(<Etablissement match={{ params: { id: 1 } }} />);

  await waitFor(() => getAllByText("MIDISUP"));
  await waitFor(() => getByText(/voir les 34 formations associées à cet organisme/));

  const title = queryAllByText("MIDISUP");
  expect(title.length).toBeGreaterThan(0);
});

test("display an error when uai is invalid", async () => {
  grantAnonymousAccess({ acl: ["page_organisme"] });

  const { getByText, queryByText, queryByTestId } = renderWithRouter(<Etablissement match={{ params: { id: 2 } }} />);

  await waitFor(() => getByText(/UAI rattaché au SIRET/), { timeout: 10000 });
  await waitFor(() => getByText(/voir les 34 formations associées à cet organisme/));

  const uai = queryByText("0312755B");
  expect(uai).toBeInTheDocument();

  const warning = queryByTestId("uai-warning");
  expect(warning).toBeInTheDocument();
});

test("don't display an error when uai is valid", async () => {
  grantAnonymousAccess({ acl: ["page_organisme"] });

  const { getByText, queryByText, queryByTestId } = renderWithRouter(<Etablissement match={{ params: { id: 1 } }} />);

  await waitFor(() => getByText(/UAI rattaché au SIRET/), { timeout: 10000 });
  await waitFor(() => getByText(/voir les 34 formations associées à cet organisme/));

  const uai = queryByText("0312755B");
  expect(uai).toBeInTheDocument();

  const warning = queryByTestId("uai-warning");
  expect(warning).not.toBeInTheDocument();
});
