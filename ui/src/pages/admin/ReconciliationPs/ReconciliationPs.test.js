import React from "react";
import ReconciliationPs from "./ReconciliationPs";
import useAuth from "../../../common/hooks/useAuth";
import { renderWithRouter } from "../../../common/utils/testUtils";

import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { fireEvent, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

const server = setupServer(
  rest.get("/api/parcoursup/reconciliation/result/:id", (req, res, ctx) => {
    console.log("--------------");
    return res(
      ctx.json({
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
            etablissement_gestionnaire_type: "CFA",
            etablissement_gestionnaire_conventionne: "NON",
            etablissement_gestionnaire_declare_prefecture: "OUI",
            etablissement_gestionnaire_datadock: "datadocké",
            etablissement_gestionnaire_published: true,
            etablissement_gestionnaire_catalogue_published: true,
            etablissement_gestionnaire_adresse: "16 RUE DUFOUR",
            etablissement_gestionnaire_code_postal: "44000",
            etablissement_gestionnaire_code_commune_insee: "44109",
            etablissement_gestionnaire_localite: "NANTES",
            etablissement_gestionnaire_complement_adresse: null,
            etablissement_gestionnaire_cedex: "44042",
            etablissement_gestionnaire_entreprise_raison_sociale: "LYCEE GENERAL ET TECHNOLOGIQUE LIVET",
            rncp_etablissement_gestionnaire_habilite: true,
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
            etablissement_formateur_type: "CFA",
            etablissement_formateur_conventionne: "NON",
            etablissement_formateur_declare_prefecture: "OUI",
            etablissement_formateur_datadock: "datadocké",
            etablissement_formateur_published: true,
            etablissement_formateur_catalogue_published: true,
            etablissement_formateur_adresse: "16 RUE DUFOUR",
            etablissement_formateur_code_postal: "44000",
            etablissement_formateur_code_commune_insee: "44109",
            etablissement_formateur_localite: "NANTES",
            etablissement_formateur_complement_adresse: null,
            etablissement_formateur_cedex: "44042",
            etablissement_formateur_entreprise_raison_sociale: "LYCEE GENERAL ET TECHNOLOGIQUE LIVET",
            rncp_etablissement_formateur_habilite: true,
            etablissement_formateur_region: "Pays de la Loire",
            etablissement_formateur_num_departement: "44",
            etablissement_formateur_nom_departement: "Loire-Atlantique",
            etablissement_formateur_nom_academie: "Nantes",
            etablissement_formateur_num_academie: "17",
            etablissement_formateur_siren: "194400297",
            etablissement_formateur_date_creation: "1970-01-08T00:45:57.600Z",
            etablissement_reference: "gestionnaire",
            etablissement_reference_type: "CFA",
            etablissement_reference_conventionne: "NON",
            etablissement_reference_declare_prefecture: "OUI",
            etablissement_reference_datadock: "datadocké",
            etablissement_reference_published: true,
            etablissement_reference_catalogue_published: true,
            rncp_etablissement_reference_habilite: true,
            etablissement_reference_date_creation: null,
            cfd: "36T31502",
            cfd_specialite: null,
            cfd_outdated: false,
            cfd_date_fermeture: "2026-08-31T00:00:00.000Z",
            mef_10_code: null,
            mefs_10: null,
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
            onisep_url: "http://www.onisep.fr/http/redirection/formation/identifiant/33848",
            onisep_intitule: null,
            onisep_libelle_poursuite: null,
            onisep_lien_site_onisepfr: null,
            onisep_discipline: null,
            onisep_domaine_sousdomaine: null,
            rncp_code: "RNCP35030",
            rncp_intitule: "Assistant ressources humaines",
            rncp_eligible_apprentissage: true,
            rncp_details: {
              date_fin_validite_enregistrement: "05/11/2025",
              active_inactive: "ACTIVE",
              etat_fiche_rncp: "Publiée",
              niveau_europe: "niveau5",
              code_type_certif: "TP",
              type_certif: "Titre professionnel",
              ancienne_fiche: ["RNCP6161"],
              nouvelle_fiche: null,
              demande: 0,
              certificateurs: [
                {
                  certificateur: "Ministère du travail",
                  siret_certificateur: "11000007200014",
                },
              ],
              nsf_code: "315m",
              nsf_libelle: "Ressources humaines, gestion de l'emploi",
              partenaires: [
                {
                  Nom_Partenaire: "GRETA DES YVELINES",
                  Siret_Partenaire: "19782587000052",
                  Habilitation_Partenaire: "HABILITATION_ORGA_FORM",
                },
              ],
              romes: [
                {
                  rome: "M1502",
                  libelle: "Développement des ressources humaines",
                },
                {
                  rome: "M1501",
                  libelle: "Assistanat en ressources humaines",
                },
              ],
              blocs_competences: [],
              voix_acces: null,
            },
            rome_codes: ["M1502", "M1501"],
            periode: '["2021-10"]',
            capacite: null,
            duree: null,
            annee: null,
            parcoursup_reference: false,
            parcoursup_a_charger: false,
            parcoursup_statut: "à publier",
            parcoursup_statut_history: [],
            parcoursup_error: null,
            parcoursup_ids: [],
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
            lieu_formation_adresse: "44 boulevard Jean Moulin Immeuble Bellevue - Jean Moulin",
            lieu_formation_siret: null,
            id_rco_formation: "21_133656|21_133656|81506",
            id_formation: "21_133656",
            id_action: "21_133656",
            ids_action: ["21_133656"],
            id_certifinfo: "81506",
            tags: ["2021"],
            libelle_court: "TH3-T",
            niveau_formation_diplome: "36T",
            affelnet_infos_offre: null,
            affelnet_code_nature: null,
            affelnet_secteur: null,
            affelnet_raison_depublication: null,
            bcn_mefs_10: [],
            editedFields: null,
            parcoursup_raison_depublication: null,
            lieu_formation_geo_coordonnees: "47.2057587,-1.6016692000001",
            geo_coordonnees_etablissement_gestionnaire: "47.225241,-1.54471",
            geo_coordonnees_etablissement_formateur: "47.225241,-1.54471",
            idea_geo_coordonnees_etablissement: "47.2057587,-1.6016692000001",
            created_at: "2021-08-08T01:41:53.862Z",
            last_update_at: "2021-10-11T17:26:23.610Z",
            distance_lieu_formation_etablissement_formateur: 4817,
            etablissement_formateur_nda: "52440417944",
            etablissement_gestionnaire_nda: "52440417944",
            to_update: false,
            lieu_formation_adresse_computed: "44 Boulevard Jean Moulin, 44100 Nantes",
          },
        ],
        matching_mna_etablissement: [
          {
            _id: "5e8df92020ff3b2161268710",
            siege_social: false,
            etablissement_siege_siret: "19440029700017",
            siret: "19440029700025",
            siren: "194400297",
            naf_code: "8559A",
            naf_libelle: "Formation continue d'adultes",
            date_creation: "1970-01-08T00:45:57.600Z",
            date_mise_a_jour: "1970-01-19T11:59:03.250Z",
            enseigne: "GRETA LOIRE-ATLANTIQUE",
            adresse:
              "LYCEE GENERAL ET TECHNOLOGIQUE LIVET\r\nGRETA LOIRE-ATLANTIQUE\r\n16 RUE DUFOUR\r\nBP 94225\r\n44042 NANTES CEDEX 1\r\nFRANCE",
            numero_voie: "16",
            type_voie: "RUE",
            nom_voie: "DUFOUR",
            complement_adresse: null,
            code_postal: "44000",
            num_departement: "44",
            localite: "NANTES",
            code_insee_localite: "44109",
            cedex: "44042",
            date_fermeture: "1970-01-01T00:00:00.000Z",
            ferme: false,
            region_implantation_code: "52",
            region_implantation_nom: "Pays de la Loire",
            commune_implantation_code: "44109",
            commune_implantation_nom: "Nantes",
            num_academie: 17,
            nom_academie: "Nantes",
            uai: "0441975H",
            entreprise_siren: "194400297",
            entreprise_enseigne: null,
            entreprise_raison_sociale: "LYCEE GENERAL ET TECHNOLOGIQUE LIVET",
            entreprise_nom_commercial: "",
            entreprise_date_creation: "1969-12-30T07:03:18.000Z",
            entreprise_date_radiation: null,
            entreprise_siret_siege_social: "19440029700017",
            created_at: "2020-02-29T17:35:39.246Z",
            last_update_at: "2021-10-10T01:22:40.723Z",
            entreprise_tranche_effectif_salarie: {
              de: 250,
              a: 499,
              code: "32",
              date_reference: "2018",
              intitule: "250 à 499 salariés",
            },
            etablissement_siege_id: "5ec4bd2b68445bbb317602a5",
            matched_uai: ["UAI_FORMATION", "UAI_FORMATEUR", "UAI_GESTIONNAIRE"],
            id_mna_etablissement: "5e8df92020ff3b2161268710",
          },
        ],
        matching_mna_parcoursup_statuts: ["à publier"],
        etat_reconciliation: true,
        statut_reconciliation: "AUTOMATIQUE",
        id_reconciliation: "6138ac992e5f18469236f169",
        matching_rejete_updated: false,
        matching_rejete_raison: null,
        statuts_history: [
          {
            from: {
              matching_type: null,
              matching_mna_formation: [],
              etat_reconciliation: false,
              statut_reconciliation: "INCONNU",
              id_reconciliation: null,
            },
            to: {
              matching_type: "7",
              etat_reconciliation: true,
              statut_reconciliation: "AUTOMATIQUE",
              id_reconciliation: "6138ac992e5f18469236f169",
            },
            updated_at: 1633964751330,
          },
        ],
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
      })
    );
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

test("renders basic tree", async () => {
  const { result } = renderHook(() => useAuth());

  act(() => {
    // eslint-disable-next-line no-unused-vars
    const [auth, setAuth] = result.current;
    setAuth({
      permissions: { isAdmin: true },
      sub: "test",
      email: "test@apprentissage.beta.gouv.fr",
      academie: "-1",
      account_status: "CONFIRMED",
      roles: ["admin", "user"],
      acl: [],
    });
  });

  const { getAllByText, getByText, getAllByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <ReconciliationPs location={{ search: { defaultMode: "simple" } }} />
    </QueryClientProvider>
  );
  const match = getAllByText(/^Rapprochement des bases Parcoursup et Carif-Oref$/i);
  expect(match).toHaveLength(2);

  await waitFor(() => getByText(/Pour réaliser le rapprochement des bases,/i));
  await waitFor(() => getByText(/FILTRER/i));
  await waitFor(() => getByText(/Exporter/i));

  const cardPsNodes = getAllByTestId("cardps");
  expect(cardPsNodes).toHaveLength(8);

  cardPsNodes.forEach((cardPsNode, index) => {
    expect(cardPsNode).toBeVisible();
  });
});

test("opens rapprochement modal", async () => {
  const { result } = renderHook(() => useAuth());

  act(() => {
    // eslint-disable-next-line no-unused-vars
    const [auth, setAuth] = result.current;
    setAuth({
      permissions: { isAdmin: true },
      sub: "test",
      email: "test@apprentissage.beta.gouv.fr",
      academie: "-1",
      account_status: "CONFIRMED",
      roles: ["admin", "user"],
      acl: [],
    });
  });

  const { getAllByText, getByText, getAllByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <ReconciliationPs location={{ search: { defaultMode: "simple" } }} />
    </QueryClientProvider>
  );
  const match = getAllByText(/^Rapprochement des bases Parcoursup et Carif-Oref$/i);
  expect(match).toHaveLength(2);

  await waitFor(() => getByText(/Pour réaliser le rapprochement des bases,/i));
  await waitFor(() => getByText(/FILTRER/i));
  await waitFor(() => getByText(/Exporter/i));

  const cardPsNodes = getAllByTestId("cardps");
  expect(cardPsNodes).toHaveLength(8);

  fireEvent(
    cardPsNodes[0],
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  // await waitFor(() => getByText(/yooo!/i));
  //   await waitFor(() => getByText(/^Vérifier la similitude des informations$/i));

  //   const closeButton = getByText(/^fermer$/i);
  //   expect(closeButton).toBeInTheDocument();

  // fireEvent(
  //   closeButton,
  //   new MouseEvent("click", {
  //     bubbles: true,
  //     cancelable: true,
  //   })
  // );
});
