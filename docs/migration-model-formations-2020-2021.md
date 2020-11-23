# Migration de modèle mna Formation 2020->2021

## Légende 

### Modifiée
en orange soit le nom de la clé à changée soit le type de valeur à changé
```diff
{
! oldKey: value,
+ newKey: value,
}
```

### Ajoutée
en vert les nouvelles clés
```diff
{
+ newKey: value,
}
```

### Supprimée
en rouge les clés définitivement supprimées
```diff
{
- oldKey: value,
}
```

## Schéma 

```diff
{
  etablissement_formateur_id: '5e8df90e20ff3b2161268550',
  etablissement_formateur_siret: '18530044900013',
  etablissement_formateur_enseigne: null,
  etablissement_formateur_uai: '0531054H',
  etablissement_formateur_type: 'CFA',
  etablissement_formateur_conventionne: 'OUI',
  etablissement_formateur_declare_prefecture: 'NON',
  etablissement_formateur_datadock: 'datadocké',
  etablissement_formateur_published: true,
  etablissement_formateur_catalogue_published: false,
  etablissement_formateur_adresse: '12 RUE DE VERDUN',
  etablissement_formateur_code_postal: '53000',
  etablissement_formateur_localite: 'LAVAL',
  etablissement_formateur_complement_adresse: null,
  etablissement_formateur_cedex: null,
  etablissement_formateur_entreprise_raison_sociale: 'CHAMBRE COMMERCE ET INDUSTRIE LA MAYENNE',
  rncp_etablissement_formateur_habilite: false,
  geo_coordonnees_etablissement_formateur: '48.070416,-0.771807',
  
+  etablissement_formateur_region: String
+  etablissement_formateur_num_departement: String
+  etablissement_formateur_nom_departement: String
+  etablissement_formateur_nom_academie: String
+  etablissement_formateur_num_academie: String
+  etablissement_formateur_siren: String


! etablissement_responsable_id: '5e8df90e20ff3b2161268550',
+ etablissement_gestionnaire_id: '5e8df90e20ff3b2161268550',
! etablissement_responsable_siret: '18530044900013',
+ etablissement_gestionnaire_siret: '18530044900013',
! etablissement_responsable_enseigne: null,
+ etablissement_gestionnaire_enseigne: null,
! etablissement_responsable_uai: '0531054H',
+ etablissement_gestionnaire_uai: '0531054H',
! etablissement_responsable_type: 'CFA',
+ etablissement_gestionnaire_type: 'CFA',
! etablissement_responsable_conventionne: 'OUI',
+ etablissement_gestionnaire_conventionne: 'OUI',
! etablissement_responsable_declare_prefecture: 'NON',
+ etablissement_gestionnaire_declare_prefecture: 'NON',
! etablissement_responsable_datadock: 'datadocké',
+ etablissement_gestionnaire_datadock: 'datadocké',
! etablissement_responsable_published: true,
+ etablissement_gestionnaire_published: true,
! etablissement_responsable_catalogue_published: false,
+ etablissement_gestionnaire_catalogue_published: false,
! etablissement_responsable_adresse: '12 RUE DE VERDUN',
+ etablissement_gestionnaire_adresse: '12 RUE DE VERDUN',
! etablissement_responsable_code_postal: '53000',
+ etablissement_gestionnaire_code_postal: '53000',
! etablissement_responsable_localite: 'LAVAL',
+ etablissement_gestionnaire_localite: 'LAVAL',
! etablissement_responsable_complement_adresse: null,
+ etablissement_gestionnaire_complement_adresse: null,
! etablissement_responsable_cedex: null,
+ etablissement_gestionnaire_cedex: null,
! etablissement_responsable_entreprise_raison_sociale: 'CHAMBRE COMMERCE ET INDUSTRIE LA MAYENNE',
+ etablissement_gestionnaire_entreprise_raison_sociale: 'CHAMBRE COMMERCE ET INDUSTRIE LA MAYENNE',
! rncp_etablissement_responsable_habilite: false,
+ rncp_etablissement_gestionnaire_habilite: false,
! geo_coordonnees_etablissement_responsable: '48.070416,-0.771807',
+ geo_coordonnees_etablissement_gestionnaire: '48.070416,-0.771807',

+ etablissement_gestionnaire_region: String
+ etablissement_gestionnaire_num_departement: String
+ etablissement_gestionnaire_nom_departement: String
+ etablissement_gestionnaire_nom_academie: String
+ etablissement_gestionnaire_num_academie: String
+ etablissement_gestionnaire_siren: String


  etablissement_reference: 'responsable',
  etablissement_reference_type: 'CFA',
  etablissement_reference_conventionne: 'OUI',
  etablissement_reference_declare_prefecture: 'NON',
  etablissement_reference_datadock: 'datadocké',
  etablissement_reference_published: true,
  etablissement_reference_catalogue_published: true,
- etablissement_reference_id: '5e8df90e20ff3b2161268550',
- etablissement_reference_adresse: '12 RUE DE VERDUN',
- etablissement_reference_code_postal: '53000',
- etablissement_reference_localite: 'LAVAL',
- etablissement_reference_cedex: null,
- etablissement_reference_complement_adresse: null,
- rncp_etablissement_reference_habilite: false,
- etablissement_reference_localisation_coordonnees_lat: 48.070416,
- etablissement_reference_localisation_coordonnees_lon: -0.771807,
- etablissement_reference_localisation_geojson: { type: 'FeatureCollection', features: [ [Object] ] },
- geo_coordonnees_etablissement_reference: '48.070416,-0.771807',

idea_geo_coordonnees_etablissement: '48.070416,-0.771807'

-  entreprise_raison_sociale: 'CHAMBRE COMMERCE ET INDUSTRIE LA MAYENNE',
-  siren: '185300449',

  nom_academie: 'Nantes',
  num_academie: 17,
- nom_academie_siege: null,
- num_academie_siege: 17,
  code_postal: '53000',
  code_commune_insee: '53130',
  num_departement: '53',
+ nom_departement: String
+ region: String
+ localite: : String

-  ds_id_dossier: '1351112',
  uai_formation: '0531054H',
  nom: null,
-  intitule: 'COMMERCE',
  intitule_long: 'COMMERCE (BAC PRO)',
  intitule_court: 'COMMERCE',
  diplome: 'BAC PROFESSIONNEL',
  niveau: '4 (Bac...)',
! educ_nat_code: '40031202',
+ cfd: '40031202',
!  educ_nat_specialite_lettre: null,
!  educ_nat_specialite_libelle: null,
!  educ_nat_specialite_libelle_court: null,
+ cfd_specialite: {}
  mef_10_code: null,
-  mef_10_codes: [
-    '2463120221',
-    '2463120222',
-    '2453120211',
-    '2473120232',
-    '2473120233',
-    '2473120231'
-  ],
-  mef_10_code_updated: false,
-  mef_8_code: null,
-  mef_8_codes: [
-    '24631202',
-    '24631202',
-    '24531202',
-    '24731202',
-    '24731202',
-    '24731202'
-  ],
  onisep_url: '',
  rncp_code: 'RNCP759',
  rncp_intitule: 'Commerce',
  rncp_eligible_apprentissage: true,

  rome_codes: [ 'D1212', 'D1408', 'D1211', 'D1214' ],
  periode: '["Septembre"]',
  capacite: '25',
  duree: '2',
  annee: '1',
  email: 'CCI53-CFA@MAYENNE.CCI.FR',

! parcoursup_reference: 'NON',
+ parcoursup_reference: false,
  parcoursup_a_charger: true,

! affelnet_reference: 'Non trouvé',
+ affelnet_reference: false,
  affelnet_a_charger: true,
  
-  info_bcn_code_en: 2,
-  info_bcn_intitule: 1,
-  info_bcn_intitule_court: 1,
-  info_bcn_intitule_long: 1,
-  info_bcn_niveau: 1,
-  info_bcn_diplome: 1,
-  info_bcn_mef: 2,
-  computed_bcn_code_en: 'Trouvé',
-  computed_bcn_intitule: 'Ok',
-  computed_bcn_intitule_long: 'Ok',
-  computed_bcn_intitule_court: 'Ok',
-  computed_bcn_niveau: 'Ok',
-  computed_bcn_diplome: 'Ok',
-  computed_bcn_mef: 'Ok',
  source: 'DS',
  commentaires: null,
  opcos: [],
  info_opcos: 0,
  info_opcos_intitule: null,

  published: true,
  draft: false,
! last_modification: null, // String
+ last_update_who: null, // String

  to_verified: false,

-  published_old: true,
  
  created_at: '2020-02-29T21:09:39.947Z',
  last_update_at: '2020-09-21T15:28:49.430Z',
}
```
