const formation = (data) => {
  if (data.length === 0) return [];
  return data.map((f) => {
    return {
      etablissement_reference: f.etablissement_reference,
      etablissement_reference_type: f.etablissement_reference_type,
      etablissement_formateur_siret: f.etablissement_formateur_siret,
      etablissement_formateur_enseigne: f.etablissement_formateur_enseigne,
      etablissement_formateur_uai: f.etablissement_formateur_uai,
      etablissement_formateur_adresse: f.etablissement_formateur_adresse,
      etablissement_formateur_code_postal: f.etablissement_formateur_code_postal,
      etablissement_formateur_localite: f.etablissement_formateur_localite,
      etablissement_formateur_complement_adresse: f.etablissement_formateur_complement_adresse,
      etablissement_formateur_entreprise_raison_sociale: f.etablissement_formateur_entreprise_raison_sociale,
      etablissement_formateur_cedex: f.etablissement_formateur_cedex,
      etablissement_formateur_siren: f.etablissement_formateur_siren,
      etablissement_gestionnaire_siret: f.etablissement_gestionnaire_siret,
      etablissement_gestionnaire_enseigne: f.etablissement_gestionnaire_enseigne,
      etablissement_gestionnaire_uai: f.etablissement_gestionnaire_uai,
      etablissement_gestionnaire_adresse: f.etablissement_gestionnaire_adresse,
      etablissement_gestionnaire_code_postal: f.etablissement_gestionnaire_code_postal,
      etablissement_gestionnaire_localite: f.etablissement_gestionnaire_localite,
      etablissement_gestionnaire_complement_adresse: f.etablissement_gestionnaire_complement_adresse,
      etablissement_gestionnaire_cedex: f.etablissement_gestionnaire_cedex,
      etablissement_gestionnaire_entreprise_raison_sociale: f.etablissement_gestionnaire_entreprise_raison_sociale,
      etablissement_gestionnaire_siren: f.etablissement_gestionnaire_siren,
      nom_academie: f.nom_academie,
      num_academie: f.num_academie,
      code_postal: f.code_postal,
      code_commune_insee: f.code_commune_insee,
      num_departement: f.num_departement,
      uai_formation: f.uai_formation,
      nom: f.nom,
      intitule_long: f.intitule_long,
      intitule_court: f.intitule_court,
      diplome: f.diplome,
      niveau: f.niveau,
      cfd: f.cfd,
      mef_10_code: f.mef_10_code,
      rncp_code: f.rncp_code,
      rncp_intitule: f.rncp_intitule,
      parcoursup_reference: f.parcoursup_reference,
      parcoursup_a_charger: f.parcoursup_a_charger,
      affelnet_reference: f.affelnet_reference,
      affelnet_a_charger: f.affelnet_a_charger,
      _id: f._id,
      etablissement_formateur_id: f.etablissement_formateur_id,
      etablissement_gestionnaire_id: f.etablissement_gestionnaire_id,
    };
  });
};

const etablissement = (e) => {
  return {
    siege_social: e.siege_social,
    etablissement_siege_siret: e.etablissement_siege_siret,
    siret: e.siret,
    siren: e.siren,
    naf_code: e.naf_code,
    naf_libelle: e.naf_libelle,
    date_creation: e.date_creation,
    date_mise_a_jour: e.date_mise_a_jour,
    enseigne: e.enseigne,
    adresse: e.adresse,
    numero_voie: e.numero_voie,
    type_voie: e.type_voie,
    nom_voie: e.nom_voie,
    complement_adresse: e.complement_adresse,
    code_postal: e.code_postal,
    num_departement: e.num_departement,
    localite: e.localite,
    code_insee_localite: e.code_insee_localite,
    cedex: e.cedex,
    date_fermeture: e.date_fermeture,
    ferme: e.ferme,
    region_implantation_code: e.region_implantation_code,
    region_implantation_nom: e.region_implantation_nom,
    commune_implantation_code: e.commune_implantation_code,
    commune_implantation_nom: e.commune_implantation_nom,
    num_academie: e.num_academie,
    nom_academie: e.nom_academie,
    uai: e.uai,
    entreprise_siren: e.entreprise_siren,
    entreprise_enseigne: e.entreprise_enseigne,
    entreprise_raison_sociale: e.entreprise_raison_sociale,
    entreprise_nom_commercial: e.entreprise_nom_commercial,
    entreprise_date_creation: e.entreprise_date_creation,
    entreprise_date_radiation: e.entreprise_date_radiation,
    entreprise_siret_siege_social: e.entreprise_siret_siege_social,
    raison_sociale: e.raison_sociale,
    nom_commercial: e.nom_commercial,
    siret_siege_social: e.siret_siege_social,
    uais_formations: e.uais_formations,
    created_at: e.created_at,
    last_update_at: e.last_update_at,
    entreprise_tranche_effectif_salarie: e.entreprise_tranche_effectif_salarie,
    etablissement_siege_id: e.etablissement_siege_id,
    matched_uai: e.matched_uai,
    id_mna_etablissement: e._id,
  };
};

const formatMEF = (mef) => {
  const mef10 = mef.slice(0, -1);
  const isValid = isFinite(parseInt(mef10));

  if (isValid) return mef10;

  return "";
};

module.exports = { formation, etablissement, formatMEF };
