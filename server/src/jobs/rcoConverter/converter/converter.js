const { RcoFormation } = require("../../../common/model/index");
const { updateFormationFromCfd } = require("../../../logic/updaters/fromCfdUpdater");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const run = async () => {
  // TODO @EPT filter rco formations which :
  //  - are not converted yet
  //  - have a cfd !!!
  const rcoFormations = await RcoFormation.find({});

  const invalidRcoFormations = [];
  const convertedRcoFormations = [];

  await asyncForEach(rcoFormations, async (rcoFormation) => {
    const result = await updateFormationFromCfd(rcoFormation._doc);
    console.log("updated with cfd table  : ", result);

    // errors ? ---> report

    // no error ---> convert / flag / insert

    // insert report
  });

  /*rco formation : 
  {
    "_id" : ObjectId("5fad4a965311a6d2ff1016bd"),
    "id_formation" : "24_205687",
    "id_action" : "24_1457546",
    "id_certifinfo" : "82792",
    "etablissement_gestionnaire_siret" : "87979300800019",
    "etablissement_gestionnaire_uai" : null,
    "etablissement_gestionnaire_adresse" : null,
    "etablissement_gestionnaire_code_postal" : "06150",
    "etablissement_gestionnaire_code_insee" : "06029",
    "etablissement_formateur_siret" : "87979300800019",
    "etablissement_formateur_uai" : null,
    "etablissement_formateur_adresse" : null,
    "etablissement_formateur_code_postal" : "06150",
    "etablissement_formateur_code_insee" : "06029",
    "etablissement_lieu_formation_siret" : null,
    "etablissement_lieu_formation_uai" : null,
    "etablissement_lieu_formation_adresse" : "4 allée des Cormorans Space Camp",
    "etablissement_lieu_formation_code_postal" : "06150",
    "etablissement_lieu_formation_code_insee" : "06029",
    "cfd" : "32033607",
    "rncp_code" : "RNCP20687",
    "capacite" : null,
    "periode" : [
    "2021-09"
  ],
    "email" : "direction@ifpcannes.fr",
    "updates_history" : [
    {
      "updated_at" : 1605259201120.0
    }
  ],
    "published" : true,
    "etablissement_gestionnaire_geo_coordonnees" : null,
    "etablissement_formateur_geo_coordonnees" : null,
    "etablissement_lieu_formation_geo_coordonnees" : "43.5549,6.96938",
    "created_at" : ISODate("2020-11-12T14:45:42.816Z"),
    "last_update_at" : ISODate("2020-11-13T09:20:01.120Z"),
    "__v" : 0
  }*/

  /*  Mna formation :
  {
    "_id" : ObjectId("5e8df93d20ff3b21612688c0"),
    "etablissement_gestionnaire_id" : "5e8df8a520ff3b2161267c70",
    "etablissement_gestionnaire_siret" : "13001727000310",
    "etablissement_gestionnaire_enseigne" : "SUP DE VENTE",
    "etablissement_gestionnaire_uai" : "0781981E",
    "etablissement_gestionnaire_type" : "CFA",
    "etablissement_gestionnaire_conventionne" : "OUI",
    "etablissement_gestionnaire_declare_prefecture" : "OUI",
    "etablissement_gestionnaire_datadock" : "datadocké",
    "etablissement_gestionnaire_published" : true,
    "etablissement_gestionnaire_catalogue_published" : false,
    "etablissement_gestionnaire_adresse" : "26 RUE D HENNEMONT",
    "etablissement_gestionnaire_code_postal" : "78100",
    "etablissement_gestionnaire_localite" : "SAINT-GERMAIN-EN-LAYE",
    "etablissement_gestionnaire_complement_adresse" : null,
    "etablissement_gestionnaire_cedex" : null,
    "etablissement_gestionnaire_entreprise_raison_sociale" : "CHAMBRE DE COMMERCE ET D INDUSTRIE DE REGION PARIS ILE DE FRANCE",
    "rncp_etablissement_gestionnaire_habilite" : false,
    "etablissement_gestionnaire_nom_academie" : null,
    "etablissement_gestionnaire_num_academie" : 0,
    "etablissement_gestionnaire_siren" : null,
    "etablissement_formateur_id" : "5e8df8a520ff3b2161267c70",
    "etablissement_formateur_siret" : "13001727000310",
    "etablissement_formateur_enseigne" : "SUP DE VENTE",
    "etablissement_formateur_uai" : "0781981E",
    "etablissement_formateur_type" : "CFA",
    "etablissement_formateur_conventionne" : "OUI",
    "etablissement_formateur_declare_prefecture" : "OUI",
    "etablissement_formateur_datadock" : "datadocké",
    "etablissement_formateur_published" : true,
    "etablissement_formateur_catalogue_published" : false,
    "etablissement_formateur_adresse" : "26 RUE D HENNEMONT",
    "etablissement_formateur_code_postal" : "78100",
    "etablissement_formateur_localite" : "SAINT-GERMAIN-EN-LAYE",
    "etablissement_formateur_complement_adresse" : null,
    "etablissement_formateur_cedex" : null,
    "etablissement_formateur_entreprise_raison_sociale" : "CHAMBRE DE COMMERCE ET D INDUSTRIE DE REGION PARIS ILE DE FRANCE",
    "rncp_etablissement_formateur_habilite" : false,
    "etablissement_formateur_nom_academie" : null,
    "etablissement_formateur_num_academie" : 0,
    "etablissement_formateur_siren" : null,
    "cfd" : "36C3120V",
    "cfd_specialite" : null,
    "mef_10_code" : null,
    "nom_academie" : "Versailles",
    "num_academie" : 25,
    "code_postal" : "78100",
    "code_commune_insee" : "78551",
    "num_departement" : "78",
    "uai_formation" : "0781516Z",
    "nom" : "Gestionnaire d'unité commerciale (ACFCI - RESEAU NEGOVENTIS)",
    "intitule_long" : "Gestionnaire d'unité commerciale (ACFCI - RESEAU NEGOVENTIS)",
    "intitule_court" : null,
    "diplome" : "TH DE NIV 3 DES CCI ET MINISTERE COMMERCE ARTISANAT PME",
    "niveau" : "5 (BTS, DUT...)",
    "onisep_url" : "http://www.onisep.fr/http/redirection/formation/identifiant/4278",
    "rncp_code" : "RNCP23827",
    "rncp_intitule" : "Gestionnaire d'unité commerciale, option généraliste - option spécialisée",
    "rncp_eligible_apprentissage" : true,
    "rncp_details" : null,
    "rome_codes" : [
    "D1401",
    "D1503",
    "D1301",
    "D1502"
  ],
    "periode" : "[\"Janvier\"]",
    "capacite" : "",
    "duree" : null,
    "annee" : null,
    "email" : null,
    "parcoursup_reference" : false,
    "parcoursup_a_charger" : false,
    "affelnet_reference" : false,
    "affelnet_a_charger" : false,
    "source" : "Fichier CCI Paris",
    "commentaires" : null,
    "opcos" : [],
    "info_opcos" : 0,
    "info_opcos_intitule" : null,
    "published" : true,
    "draft" : false,
    "updates_history" : [],
    "last_update_who" : null,
    "to_verified" : false,
    "geo_coordonnees_etablissement_gestionnaire" : "48.900986,2.085456",
    "geo_coordonnees_etablissement_formateur" : "48.900986,2.085456",
    "idea_geo_coordonnees_etablissement" : "48.900986,2.085456",
    "created_at" : ISODate("2020-02-29T21:13:03.837Z"),
    "last_update_at" : ISODate("2020-09-21T15:07:05.708Z"),
    "__v" : 0
  }*/
};

module.exports = { run };
