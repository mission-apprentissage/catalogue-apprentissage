module.exports = {
  async up(db) {
    const reports = db.collection("dualcontrolreports");

    await reports.insertOne({
      totalFormation: 50781,
      totalDualControlFormation: 55127,
      totalNotFound: 6466,
      date: new Date("2022-03-30T13:15:52.260Z"),
      fields: {
        id_rco_formation: 48661,
        id_formation: 1030,
        id_action: 4000,
        id_certifinfo: 0,
        periode: 13337,
        duree: 0,
        capacite: 0,
        annee: 0,
        etablissement_gestionnaire_siret: 0,
        etablissement_gestionnaire_uai: 2519,
        etablissement_formateur_siret: 0,
        etablissement_formateur_uai: 10892,
        etablissement_formateur_siren: 48202,
        intitule_rco: 180,
        cfd: 1636,
        cfd_outdated: 3853,
        rncp_code: 348,
        cfd_date_fermeture: 11085,
        cfd_specialite: 0,
        niveau: 10573,
        intitule_court: 19207,
        intitule_long: 24187,
        diplome: 11729,
      },
    });

    await reports.insertOne({
      totalFormation: 51066,
      totalDualControlFormation: 51456,
      totalNotFound: 187,
      date: new Date("2022-04-06T16:44:32.071Z"),
      fields: {
        id_rco_formation: 5049,
        id_formation: 27,
        id_action: 46,
        id_certifinfo: 0,
        periode: 10399,
        duree: 0,
        capacite: 0,
        annee: 0,
        etablissement_gestionnaire_siret: 0,
        etablissement_gestionnaire_uai: 2571,
        etablissement_formateur_siret: 0,
        etablissement_formateur_uai: 10465,
        etablissement_formateur_siren: 50885,
        intitule_rco: 70,
        cfd: 1737,
        cfd_outdated: 48817,
        rncp_code: 18921,
        cfd_date_fermeture: 13529,
        cfd_specialite: 0,
        niveau: 11182,
        intitule_court: 20161,
        intitule_long: 19505,
        diplome: 12175,
        lieu_formation_adresse: 1140,
        code_postal: 1298,
        lieu_formation_geo_coordonnees: 1246,
        code_commune_insee: 752,
        lieu_formation_siret: 0,
        lieu_formation_adresse_computed: 51228,
        lieu_formation_geo_coordonnees_computed: 51269,
        distance: 51100,
        onisep_url: 33750,
        onisep_intitule: 15547,
        onisep_libelle_poursuite: 15547,
        onisep_lien_site_onisepfr: 15547,
        onisep_discipline: 15547,
        onisep_domaine_sousdomaine: 15547,
      },
    });
  },

  async down(db) {
    const reports = db.collection("dualcontrolreports");
    await reports.deleteOne({ date: new Date("2022-03-30T13:15:52.260Z") });
    await reports.deleteOne({ date: new Date("2022-04-06T16:44:32.071Z") });
  },
};
