import React from "react";
import ReconciliationPs from "./ReconciliationPs";
import { renderWithRouter, setupMswServer } from "../../../common/utils/testUtils";
import { QueryClient, QueryClientProvider } from "react-query";
import { waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";

import * as api from "../../../common/api/rapprochement";
import * as useAuth from "../../../common/hooks/useAuth";
import * as search from "../../../common/hooks/useSearch";

import { rest } from "msw";
import { PARCOURSUP_STATUS } from "../../../constants/status";

const server = setupMswServer(
  rest.post(/\/api\/es\/search\/parcoursupformations\/_msearch/, (req, res, ctx) => {
    return res(
      ctx.json({
        took: 73,
        responses: [
          {
            took: 72,
            timed_out: false,
            _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
            hits: {
              total: { value: 3730, relation: "eq" },
              max_score: null,
              hits: [
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad41e928101d8615201",
                  _score: null,
                  _source: {
                    code_postal: "45100",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
                        intitule_court: "MANAGEMENT COMMERC. OPERATIONNEL",
                        _id: "5fd2c73a5d44ea18bbe39425",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0451551S",
                    nom_academie: "Orléans-Tours",
                    id_parcoursup: "32083",
                    uai_affilie: "0451551S",
                    siret_cerfa: "85294311700030",
                    libelle_specialite: "Management Commercial Opérationnel - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Orléans",
                    libelle_uai_composante: "CFA C3 CVL",
                    matching_type: "7",
                    uai_gestionnaire: "0451551S",
                    libelle_formation: "BTS - Services",
                    codes_cfd_mna: ["32031213"],
                  },
                  sort: ["6138bad41e928101d8615201"],
                },
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad41e928101d8615205",
                  _score: null,
                  _source: {
                    code_postal: "45100",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
                        intitule_court: "NEGO. ET DIGITAL. RELATION CLIENT",
                        _id: "5fd24e7cc67da3c3e6bc3bb1",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0451551S",
                    nom_academie: "Orléans-Tours",
                    id_parcoursup: "32084",
                    uai_affilie: "0451551S",
                    siret_cerfa: "85294311700030",
                    libelle_specialite: "Négociation et digitalisation de la Relation Client - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Orléans",
                    libelle_uai_composante: "CFA C3 CVL",
                    matching_type: "7",
                    uai_gestionnaire: "0451551S",
                    libelle_formation: "BTS - Services",
                    codes_cfd_mna: ["32031212"],
                  },
                  sort: ["6138bad41e928101d8615205"],
                },
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad41e928101d861520d",
                  _score: null,
                  _source: {
                    code_postal: "45100",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
                        intitule_court: "SUPPORT A L'ACTION MANAGERIALE",
                        _id: "5fd24e95c67da3c3e6bc3dd1",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0451551S",
                    nom_academie: "Orléans-Tours",
                    id_parcoursup: "32087",
                    uai_affilie: "0451551S",
                    siret_cerfa: "85294311700030",
                    libelle_specialite: "Support à l'action managériale - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Orléans",
                    libelle_uai_composante: "CFA C3 CVL",
                    matching_type: "7",
                    uai_gestionnaire: "0451551S",
                    libelle_formation: "BTS - Services",
                    codes_cfd_mna: ["32032409"],
                  },
                  sort: ["6138bad41e928101d861520d"],
                },
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad51e928101d8615215",
                  _score: null,
                  _source: {
                    code_postal: "37000",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
                        intitule_court: "COMMUNICATION",
                        _id: "5fc62847712d48a988156c7a",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0371495Z",
                    nom_academie: "Orléans-Tours",
                    id_parcoursup: "32093",
                    uai_affilie: "0371495Z",
                    siret_cerfa: "42879133900057",
                    libelle_specialite: "Communication - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Tours",
                    libelle_uai_composante: "I.S.C.B. - Institut Supérieur de Commerce et de Bureautique",
                    matching_type: "7",
                    uai_gestionnaire: "0371495Z",
                    libelle_formation: "BTS - Services",
                    codes_cfd_mna: ["32032002"],
                  },
                  sort: ["6138bad51e928101d8615215"],
                },
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad51e928101d8615221",
                  _score: null,
                  _source: {
                    code_postal: "77420",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
                        intitule_court: "NEGO. ET DIGITAL. RELATION CLIENT",
                        _id: "60ca89081f12d18c038ee291",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0772890Y",
                    nom_academie: "Créteil",
                    id_parcoursup: "32108",
                    uai_affilie: "0772890Y",
                    siret_cerfa: "37754911800034",
                    libelle_specialite: "Négociation et digitalisation de la Relation Client - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Champs-sur-Marne",
                    libelle_uai_composante: "CFA COGEFI Formation SA",
                    matching_type: "7",
                    uai_gestionnaire: "0772890Y",
                    libelle_formation: "BTS - Services",
                    codes_cfd_mna: ["32031212"],
                  },
                  sort: ["6138bad51e928101d8615221"],
                },
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad51e928101d8615225",
                  _score: null,
                  _source: {
                    code_postal: "42000",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
                        intitule_court: "MAINTEN.SYST. OPT.A SYST.PRODUCT",
                        _id: "61315d178d0fa4e9373f1a83",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.HORS_PERIMETRE],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0420976H",
                    nom_academie: "Lyon",
                    id_parcoursup: "33615",
                    uai_affilie: "0420976H",
                    siret_cerfa: "77639490000042",
                    libelle_specialite: "Maintenance des systèmes - option A Systèmes de production - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Saint-Etienne",
                    libelle_uai_composante: "Lycée La Salle",
                    matching_type: "6",
                    uai_gestionnaire: "0420976H",
                    libelle_formation: "BTS - Production",
                    codes_cfd_mna: ["32025010"],
                  },
                  sort: ["6138bad51e928101d8615225"],
                },
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad51e928101d8615229",
                  _score: null,
                  _source: {
                    code_postal: "69363",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
                        intitule_court: "GESTION DE LA PME",
                        _id: "608c910155952bac89d9cb76",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0690651H",
                    nom_academie: "Lyon",
                    id_parcoursup: "33641",
                    uai_affilie: "0690651H",
                    siret_cerfa: "50304921500026",
                    libelle_specialite: "Gestion de la PME - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Lyon 7e  Arrondissement",
                    libelle_uai_composante: "Lycée professionnel Saint Joseph",
                    matching_type: "7",
                    uai_gestionnaire: "0690651H",
                    libelle_formation: "BTS - Services",
                    codes_cfd_mna: ["32031409"],
                  },
                  sort: ["6138bad51e928101d8615229"],
                },
                {
                  _index: "parcoursupformations",
                  _type: "_doc",
                  _id: "6138bad51e928101d861522d",
                  _score: null,
                  _source: {
                    code_postal: "69005",
                    matching_mna_formation: [
                      {
                        parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
                        intitule_court: "BATIMENT",
                        _id: "5fd255dac67da3c3e6bd019b",
                      },
                    ],
                    matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
                    statut_reconciliation: "AUTOMATIQUE",
                    uai_composante: "0694179T",
                    nom_academie: "Lyon",
                    id_parcoursup: "33676",
                    uai_affilie: "0694179T",
                    siret_cerfa: "50417168700024",
                    libelle_specialite: "Bâtiment - en apprentissage",
                    complement_adresse_1: null,
                    libelle_commune: "Lyon 5e  Arrondissement",
                    libelle_uai_composante: "Centre de formation continue Bâtiment Travaux Publics FORMA BTP",
                    matching_type: "7",
                    uai_gestionnaire: "0694179T",
                    libelle_formation: "BTS - Production",
                    codes_cfd_mna: ["32023012"],
                  },
                  sort: ["6138bad51e928101d861522d"],
                },
              ],
            },
            aggregations: {
              "statut_reconciliation.keyword": {
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0,
                buckets: [{ key: "AUTOMATIQUE", doc_count: 3730 }],
              },
            },
            status: 200,
          },
        ],
      })
    );
  }),
  rest.get(/\/api\/v1\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.setTimeout(50000);

test("opens rapprochement modal", async () => {
  jest.spyOn(search, "useSearch").mockImplementation(() => ({
    loaded: true,
    base: "parcoursupformations",
    isBaseFormations: false,
    isBaseReconciliationPs: true,
    endpoint: "http://localhost/api",
    countReconciliationPs: {
      countTotal: 6068,
      countAutomatique: 3241,
      countAVerifier: 769,
      countInconnu: 2058,
      countRejete: 0,
      countValide: 0,
    },
    countEtablissement: 0,
    countCatalogueGeneral: null,
    countCatalogueNonEligible: null,
  }));

  jest.spyOn(useAuth, "default").mockImplementation(() => [
    {
      permissions: { isAdmin: true },
      sub: "test",
      email: "test@apprentissage.beta.gouv.fr",
      academie: "-1",
      account_status: "CONFIRMED",
      roles: ["admin", "user"],
      acl: [],
    },
    () => {},
  ]);

  jest.spyOn(api, "getResult").mockImplementation(() => {
    return {
      _id: "616450e9b4ad29922f7785bf",
      uai_gestionnaire: "0441975H",
      uai_composante: "0441975H",
      uai_affilie: "0441975H",
      libelle_uai_composante: "GRETA-CFA LOIRE-ATLANTIQUE",
      libelle_uai_affilie: "GRETA-CFA LOIRE-ATLANTIQUE",
      code_commune_insee: "44109",
      libelle_commune: "Nantes",
      code_postal: "44042",
      nom_academie: "Nantes",
      code_ministere: "6",
      libelle_ministere: "Ministère de l'Education nationale et de la Jeunesse",
      type_etablissement: "Lycée à classe postbac",
      code_formation: "68",
      libelle_formation: "Formation professionnelle",
      code_specialite: "691033",
      libelle_specialite: "Assistant Ressources Humaines (Bac +2) - en apprentissage",
      code_formation_initiale: "690033",
      code_mef_10: null,
      code_cfd: null,
      code_cfd_2: null,
      code_cfd_3: null,
      matching_type: "7",
      matching_mna_formation: [
        {
          _id: "605be5a4adff09dbe46f8508",
          etablissement_gestionnaire_id: "5e8df92020ff3b2161268710",
          etablissement_gestionnaire_siret: "19440029700025",
          etablissement_gestionnaire_enseigne: "GRETA LOIRE-ATLANTIQUE",
          etablissement_gestionnaire_uai: "0441975H",
          etablissement_gestionnaire_adresse: "16 RUE DUFOUR",
          etablissement_gestionnaire_code_postal: "44000",
          etablissement_gestionnaire_code_commune_insee: "44109",
          etablissement_gestionnaire_localite: "NANTES",
          etablissement_gestionnaire_complement_adresse: null,
          etablissement_gestionnaire_cedex: "44042",
          etablissement_gestionnaire_entreprise_raison_sociale: "LYCEE GENERAL ET TECHNOLOGIQUE LIVET",
          etablissement_gestionnaire_habilite_rncp: true,
          etablissement_gestionnaire_region: "Pays de la Loire",
          etablissement_gestionnaire_num_departement: "44",
          etablissement_gestionnaire_nom_departement: "Loire-Atlantique",
          etablissement_gestionnaire_nom_academie: "Nantes",
          etablissement_gestionnaire_num_academie: "17",
          etablissement_gestionnaire_siren: "194400297",
          etablissement_gestionnaire_date_creation: "1970-01-08T00:45:57.600Z",
          etablissement_formateur_id: "5e8df92020ff3b2161268710",
          etablissement_formateur_siret: "19440029700025",
          etablissement_formateur_enseigne: "GRETA LOIRE-ATLANTIQUE",
          etablissement_formateur_uai: "0441975H",
          etablissement_formateur_adresse: "16 RUE DUFOUR",
          etablissement_formateur_code_postal: "44000",
          etablissement_formateur_code_commune_insee: "44109",
          etablissement_formateur_localite: "NANTES",
          etablissement_formateur_complement_adresse: null,
          etablissement_formateur_cedex: "44042",
          etablissement_formateur_entreprise_raison_sociale: "LYCEE GENERAL ET TECHNOLOGIQUE LIVET",
          etablissement_formateur_habilite_rncp: true,
          etablissement_formateur_region: "Pays de la Loire",
          etablissement_formateur_num_departement: "44",
          etablissement_formateur_nom_departement: "Loire-Atlantique",
          etablissement_formateur_nom_academie: "Nantes",
          etablissement_formateur_num_academie: "17",
          etablissement_formateur_siren: "194400297",
          cfd: "36T31502",
          nom_academie: "Nantes",
          num_academie: "17",
          code_postal: "44100",
          code_commune_insee: "44109",
          num_departement: "44",
          nom_departement: "Loire-Atlantique",
          region: "Pays de la Loire",
          localite: "Nantes",
          uai_formation: "0441975H",
          nom: null,
          intitule_long: "ASSISTANT RESSOURCES HUMAINES (TP)",
          intitule_court: "ASSISTANT RESSOURCES HUMAINES",
          diplome: "TH DE NIV 3 MINISTERE DU TRAVAIL - AFPA",
          niveau: "5 (BTS, DEUST...)",
          rncp_code: "RNCP35030",
          rncp_intitule: "Assistant ressources humaines",
          rncp_eligible_apprentissage: true,
          periode: ["2021-10"],
          capacite: null,
          duree: null,
          annee: null,
          parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
          parcoursup_statut_history: [],
          lieu_formation_adresse: "44 boulevard Jean Moulin Immeuble Bellevue - Jean Moulin",
          lieu_formation_siret: null,
          id_formation: "21_133656",
          id_action: "21_133656",
          ids_action: ["21_133656"],
          id_certifinfo: "81506",
          tags: ["2021"],
          libelle_court: "TH3-T",
          niveau_formation_diplome: "36T",
          editedFields: null,
          parcoursup_raison_depublication: null,
          to_update: false,
          lieu_formation_adresse_computed: "44 Boulevard Jean Moulin, 44100 Nantes",
        },
      ],
      matching_mna_etablissement: [],
      matching_mna_parcoursup_statuts: [PARCOURSUP_STATUS.A_PUBLIER],
      etat_reconciliation: true,
      statut_reconciliation: "AUTOMATIQUE",
      matching_rejete_updated: false,
      matching_rejete_raison: null,
      id_parcoursup: "33639",
      uai_cerfa: "0441975H",
      uai_insert_jeune: "0441975H",
      uai_map: "0441975H",
      siret_cerfa: "19440029700025",
      siret_map: "19440029700025",
      codediplome_map: "36T31502",
      code_formation_inscription: "33639",
      code_formation_accueil: "33639",
      latitude: "47.2184",
      longitude: "-1.55362",
      complement_adresse: null,
      complement_adresse_1: null,
      complement_adresse_2: null,
      complement_code_postal: null,
      complement_commune: null,
      libelle_insert_jeune: null,
      complement_cedex: null,
      adresse_etablissement_l1: "16 rue Dufour",
      adresse_etablissement_l2: null,
      codes_cfd_mna: ["36T31502", "36X31501", "36X31507", "36C3150B", "36X31503"],
      codes_rncp_mna: ["RNCP13070", "RNCP35030", "RNCP35103", "RNCP35165", "RNCP27095"],
      codes_romes_mna: ["M1501"],
      type_rapprochement_mna: "MANUEL",
      diff: [
        {
          uai: {
            uai_formation: {
              uai_affilie: true,
              uai_gestionnaire: true,
              uai_composante: true,
              uai_insert_jeune: true,
              uai_cerfa: true,
              match: true,
            },
            etablissement_formateur_uai: {
              uai_affilie: true,
              uai_gestionnaire: true,
              uai_composante: true,
              uai_insert_jeune: true,
              uai_cerfa: true,
              match: true,
            },
            etablissement_gestionnaire_uai: {
              uai_affilie: true,
              uai_gestionnaire: true,
              uai_composante: true,
              uai_insert_jeune: true,
              uai_cerfa: true,
              match: true,
            },
            uai_affilie: true,
            uai_composante: true,
            uai_gestionnaire: true,
            uai_insert_jeune: true,
            uai_cerfa: true,
          },
          siret: {
            lieu_formation_siret: {
              siret_cerfa: false,
              siret_map: false,
              match: false,
            },
            etablissement_formateur_siret: {
              siret_cerfa: true,
              siret_map: true,
              match: true,
            },
            etablissement_gestionnaire_siret: {
              siret_cerfa: true,
              siret_map: true,
              match: true,
            },
            siret_cerfa: true,
            siret_map: true,
          },
          cfd: true,
          rncp_code: true,
          code_commune_insee: true,
          nom_academie: true,
          lieu_formation_adresse: false,
        },
      ],
    };
  });

  await act(async () => {
    const { getAllByText, getByText, getAllByTestId } = renderWithRouter(
      <QueryClientProvider client={queryClient}>
        <ReconciliationPs location={{ search: { defaultMode: "simple" } }} />
      </QueryClientProvider>
    );

    const match = getAllByText(/^Rapprochement des bases Parcoursup et Carif-Oref$/i);
    expect(match).toHaveLength(2);

    await waitFor(() => getByText(/Pour réaliser le rapprochement des bases,/i));
    await waitFor(() => getByText(/FILTRER/i));
    await waitFor(() => getByText(/Exporter/i), { timeout: 40000 });

    const cardPsNodes = getAllByTestId("cardps");
    expect(cardPsNodes).toHaveLength(8);

    userEvent.click(cardPsNodes[0]);

    await waitFor(() => getByText(/^Vérifier la similitude des informations$/i));

    const closeButton = getByText(/^fermer$/i);
    expect(closeButton).toBeInTheDocument();

    userEvent.click(closeButton);
  });
});
