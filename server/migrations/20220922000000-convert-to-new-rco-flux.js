module.exports = {
  async up(db) {
    await db.collection("rcoformations").drop();
    await db.collection("conventionfiles").drop();
    await db.collection("bcnnmefs").drop();
    await db.collection("bcnformationdiplomes").drop();
    await db.collection("bcnlettrespecialites").drop();
    await db.collection("bcnndispositifformations").drop();
    await db.collection("bcnnniveauformationdiplomes").drop();
    await db.collection("ficherncps").drop();
    await db.collection("oniseps").drop();
    await db.collection("sandboxformations").drop();

    const formations = db.collection("formations");
    await formations.updateMany({}, [
      {
        $unset: ["rco_published", "to_update", "update_error"],
      },
    ]);

    const etablissements = db.collection("etablissements");
    await etablissements.updateMany({}, [
      {
        $unset: [
          "date_mise_a_jour",
          "ds_id_dossier",
          "ds_questions_ask_for_certificaton_date",
          "ds_questions_declaration_code",
          "ds_questions_email",
          "ds_questions_has_2020_training",
          "ds_questions_has_agrement_cfa",
          "ds_questions_has_ask_for_certificaton",
          "ds_questions_has_certificaton_2015",
          "ds_questions_nom",
          "ds_questions_siren",
          "ds_questions_uai",
          "entreprise_categorie",
          "entreprise_code_effectif_entreprise",
          "entreprise_capital_social",
          "entreprise_forme_juridique",
          "entreprise_forme_juridique_code",
          "formations_n3",
          "formations_n4",
          "formations_n5",
          "formations_n6",
          "formations_n7",
          "pays_implantation_code",
          "pays_implantation_nom",
          "tranche_effectif_salarie",
          "uais_potentiels",
          "update_error",
        ],
      },
    ]);
  },

  async down() {
    // can't restore previous state
    return Promise.resolve("ok");
  },
};
