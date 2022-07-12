const assert = require("assert");
const {
  getEstablishmentAddress,
  isHabiliteRncp,
  getAttachedEstablishments,
  getEtablissementReference,
  getGeoloc,
  mapEtablissementKeys,
  isInCatalogGeneral,
  etablissementsMapper,
} = require("../../../../src/logic/mappers/etablissementsMapper");
const { connectToMongoForTests, cleanAll } = require("../../../../tests/utils/testUtils.js");
const { Etablissement } = require("../../../../src/common/model/index");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongoForTests();
  });

  after(async () => {
    await cleanAll();
  });

  describe("getEstablishmentAddress", () => {
    it("should return null if called without arguments", () => {
      const result = getEstablishmentAddress();
      assert.deepStrictEqual(result, null);
    });

    it("should concatenate values if called with arguments", () => {
      const result = getEstablishmentAddress({ numero_voie: "20", type_voie: "avenue", nom_voie: "de Ségur" });
      assert.deepStrictEqual(result, "20 avenue de Ségur");
    });
  });

  describe("isHabiliteRncp", () => {
    it("should return true if is the default list", () => {
      let result = isHabiliteRncp(
        { partenaires: [], certificateurs: [{ certificateur: "Ministère du travail" }] },
        "123456789"
      );
      assert.deepStrictEqual(result, true);
      result = isHabiliteRncp(
        { partenaires: [], certificateurs: [{ certificateur: "Ministère chargé de l'Emploi" }] },
        "123456789"
      );
      assert.deepStrictEqual(result, true);

      result = isHabiliteRncp(
        {
          certificateurs: [
            {
              certificateur:
                "Ministère du Travail - Délégation Générale à l'Emploi et à la Formation Professionnelle (DGEFP)",
            },
          ],
        },
        "123456789"
      );
      assert.deepStrictEqual(result, true);
    });

    it("should return true if siret is in partenaire & habilite", () => {
      let result = isHabiliteRncp(
        { partenaires: [{ Siret_Partenaire: "123456789", Habilitation_Partenaire: "HABILITATION_ORGA_FORM" }] },
        "123456789"
      );
      assert.deepStrictEqual(result, true);
    });

    it("should return true if siret is in certificateurs", () => {
      let result = isHabiliteRncp(
        { certificateurs: [{ siret_certificateur: "123456789" }], partenaires: null },
        "123456789"
      );
      assert.deepStrictEqual(result, true);
    });

    it("should return false if not in certificateurs & not in partenaires", () => {
      let result = isHabiliteRncp({ certificateurs: [{ siret_certificateur: "12345678" }] }, "123456789");
      assert.deepStrictEqual(result, false);

      result = isHabiliteRncp(
        { partenaires: [{ Siret_Partenaire: "123456789", Habilitation_Partenaire: "NOPE" }], certificateurs: null },
        "123456789"
      );
      assert.deepStrictEqual(result, false);
    });
  });

  describe("getAttachedEstablishments", () => {
    before(async () => {
      await Etablissement.deleteMany({});
      await new Etablissement({ siret: "12345678" }).save();
    });

    it("should not find etablissements in DB", async () => {
      let result = await getAttachedEstablishments("1234", "1234");
      assert.deepStrictEqual(result.formateur, null);
      assert.deepStrictEqual(result.gestionnaire, null);
    });

    it("should find etablissements in DB", async () => {
      let result = await getAttachedEstablishments("12345678", "12345678");
      assert.deepStrictEqual(result.formateur.siret, "12345678");
      assert.deepStrictEqual(result.gestionnaire.siret, "12345678");
    });

    it("should find gestionnaire and not formateur in DB", async () => {
      let result = await getAttachedEstablishments("12345678", "1234");
      assert.deepStrictEqual(result.gestionnaire.siret, "12345678");
      assert.deepStrictEqual(result.formateur, null);
    });
  });

  describe("getEtablissementReference", () => {
    it("should return null if no gestionnaire and formateur", async () => {
      let result = getEtablissementReference({}, {});
      assert.deepStrictEqual(result, null);
    });

    it("should return gestionnaire", async () => {
      const expected = {
        etablissement_reference: "gestionnaire",
        referenceEstablishment: {
          _id: "test",
        },
      };
      let result = getEtablissementReference({ gestionnaire: { _id: "test" }, formateur: { _id: "test2" } }, {});
      assert.deepStrictEqual(result, expected);
    });

    it("should return formateur", async () => {
      const expected = {
        etablissement_reference: "formateur",
        referenceEstablishment: {
          _id: "test2",
        },
      };
      let result = getEtablissementReference(
        {
          gestionnaire: null,
          formateur: { _id: "test2" },
        },
        {}
      );
      assert.deepStrictEqual(result, expected);
    });

    it("should return formateur when conventionne", async () => {
      const expected = {
        etablissement_reference: "formateur",
        referenceEstablishment: {
          _id: "test2",
          computed_conventionne: "OUI",
        },
      };
      let result = getEtablissementReference(
        {
          gestionnaire: { _id: "test" },
          formateur: { _id: "test2", computed_conventionne: "OUI" },
        },
        {}
      );
      assert.deepStrictEqual(result, expected);
    });
  });

  it("should return gestionnaire if habilite", async () => {
    const expected = {
      etablissement_reference: "gestionnaire",
      referenceEstablishment: {
        _id: "test",
        siret: "123456789",
      },
    };
    let result = getEtablissementReference(
      {
        gestionnaire: { _id: "test", siret: "123456789" },
        formateur: { _id: "test2", computed_conventionne: "OUI" },
      },
      {
        code_type_certif: "TP",
        partenaires: [{ Siret_Partenaire: "123456789", Habilitation_Partenaire: "HABILITATION_ORGA_FORM" }],
      }
    );
    assert.deepStrictEqual(result, expected);
  });

  it("should return formateur if habilite", async () => {
    const expected = {
      etablissement_reference: "formateur",
      referenceEstablishment: {
        _id: "test2",
        siret: "12345678",
      },
    };
    let result = getEtablissementReference(
      {
        gestionnaire: { _id: "test", siret: "123456789" },
        formateur: { _id: "test2", siret: "12345678" },
      },
      {
        code_type_certif: "TP",
        partenaires: [{ Siret_Partenaire: "12345678", Habilitation_Partenaire: "HABILITATION_ORGA_FORM" }],
      }
    );
    assert.deepStrictEqual(result, expected);
  });

  it("should return gestionnaire if none habilite & none conventionne", async () => {
    const expected = {
      etablissement_reference: "gestionnaire",
      referenceEstablishment: {
        _id: "test",
        siret: "123456789",
      },
    };
    let result = getEtablissementReference(
      {
        gestionnaire: { _id: "test", siret: "123456789" },
        formateur: { _id: "test2", siret: "12345678" },
      },
      {
        code_type_certif: "TP",
        partenaires: [{ Siret_Partenaire: "12345", Habilitation_Partenaire: "HABILITATION_ORGA_FORM" }],
      }
    );
    assert.deepStrictEqual(result, expected);
  });

  describe("getGeoloc", () => {
    it("should extract nothing when data is missing", () => {
      const expected = {
        geo_coordonnees_etablissement_formateur: null,
        geo_coordonnees_etablissement_gestionnaire: null,
      };
      const result = getGeoloc({ gestionnaire: {}, formateur: {} });
      assert.deepStrictEqual(result, expected);
    });

    it("should extract geoloc when data is provided", () => {
      const expected = {
        geo_coordonnees_etablissement_formateur: "48.85053461447283, 2.3083430674498158",
        geo_coordonnees_etablissement_gestionnaire: "48.85053461447283, 2.3083430674498158",
      };
      const result = getGeoloc({
        gestionnaire: { geo_coordonnees: "48.85053461447283, 2.3083430674498158" },
        formateur: { geo_coordonnees: "48.85053461447283, 2.3083430674498158" },
      });
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("mapEtablissementKeys", () => {
    it("should fill default values", () => {
      const expected = {
        etablissement_gestionnaire_adresse: "",
        etablissement_gestionnaire_num_academie: null,
      };
      const result = mapEtablissementKeys({});
      assert.deepStrictEqual(result.etablissement_gestionnaire_adresse, expected.etablissement_gestionnaire_adresse);
      assert.deepStrictEqual(
        result.etablissement_gestionnaire_num_academie,
        expected.etablissement_gestionnaire_num_academie
      );
    });

    it("should convert num academie & id to string ", () => {
      const expected = {
        etablissement_formateur_adresse: "",
        etablissement_formateur_num_academie: "12",
        etablissement_formateur_id: "35",
      };
      const result = mapEtablissementKeys({ num_academie: 12, _id: 35 }, "etablissement_formateur");
      assert.deepStrictEqual(result.etablissement_formateur_adresse, expected.etablissement_formateur_adresse);
      assert.deepStrictEqual(
        result.etablissement_formateur_num_academie,
        expected.etablissement_formateur_num_academie
      );
      assert.deepStrictEqual(result.etablissement_formateur_id, expected.etablissement_formateur_id);
    });
  });

  describe("isInCatalogGeneral", () => {
    // Test disabled since currently we show non-qualiopi formations in catalogue général
    // it("should return false if etablissement not published", () => {
    //   const result = isInCatalogGeneral({ siret: "1234" }, { siret: "1234" }, {});
    //   assert.deepStrictEqual(result, false);
    // });

    it("should return false if etablissement doesn't have quality certification and formation is a Titre or TP", () => {
      const result = isInCatalogGeneral(
        { siret: "1234", info_qualiopi_info: "NON" },
        { siret: "1234", info_qualiopi_info: "NON" },
        { code_type_certif: "TP", rncp_eligible_apprentissage: true }
      );
      assert.deepStrictEqual(result, false);
    });

    it("should return false if etablissement is not rncp_eligible_apprentissage and formation is a Titre or TP", () => {
      const result = isInCatalogGeneral(
        { siret: "1234", info_qualiopi_info: "OUI" },
        { siret: "1234", info_qualiopi_info: "OUI" },
        {
          code_type_certif: "TP",
          partenaires: [],
          certificateurs: [{ certificateur: "Ministère du travail" }],
          rncp_eligible_apprentissage: false,
        }
      );
      assert.deepStrictEqual(result, false);
    });

    it("should return true if etablissement has quality certification and formation is a Titre or TP", () => {
      const result = isInCatalogGeneral(
        { siret: "1234", info_qualiopi_info: "OUI" },
        { siret: "1234", info_qualiopi_info: "OUI" },
        {
          code_type_certif: "TP",
          partenaires: [],
          certificateurs: [{ certificateur: "Ministère du travail" }],
          rncp_eligible_apprentissage: true,
        }
      );
      assert.deepStrictEqual(result, true);
    });

    it("should return true if etablissement is published and formation is not Titre or TP", () => {
      const result = isInCatalogGeneral(
        { siret: "1234", info_qualiopi_info: "OUI" },
        { siret: "1234", info_qualiopi_info: "OUI" },
        {}
      );
      assert.deepStrictEqual(result, true);
    });
  });

  describe("etablissementsMapper", () => {
    before(async () => {
      await Etablissement.deleteMany({});
      await new Etablissement({ siret: "12345678", uai: "0551031X" }).save();
      await new Etablissement({ siret: "123456789", ferme: true }).save();
    });

    it("should return an error when no siret provided", async () => {
      const expected = {
        messages: {
          error: "Error: etablissementsMapper gestionnaire_siret, formateur_siret must be provided",
        },
        result: null,
      };
      const result = await etablissementsMapper();
      assert.deepStrictEqual(result, expected);
    });

    it("should return an error when gestionnaire and formateur are not found", async () => {
      const expected = {
        messages: {
          error: "Error: Unable to retrieve neither gestionnaire and formateur, both are null",
        },
        result: null,
      };
      const result = await etablissementsMapper("1234", "12345");
      assert.deepStrictEqual(result, expected);
    });

    it("should return an error when gestionnaire not found", async () => {
      const expected = {
        messages: {
          error: "Error: Établissement gestionnaire introuvable 12345678",
        },
        result: null,
      };
      const result = await etablissementsMapper("1234", "12345678");
      assert.deepStrictEqual(result, expected);
    });

    it("should return an error when formateur not found", async () => {
      const expected = {
        messages: {
          error: "Error: Établissement formateur introuvable 12345",
        },
        result: null,
      };
      const result = await etablissementsMapper("12345678", "12345");
      assert.deepStrictEqual(result, expected);
    });

    it("should return an error when gestionnaire is closed", async () => {
      const expected = {
        messages: {
          error: "Error: Établissement gestionnaire fermé 123456789",
        },
        result: null,
      };
      const result = await etablissementsMapper("123456789", "12345678");
      assert.deepStrictEqual(result, expected);
    });

    it("should return an error when formateur is closed", async () => {
      const expected = {
        messages: {
          error: "Error: Établissement formateur fermé 123456789",
        },
        result: null,
      };
      const result = await etablissementsMapper("12345678", "123456789");
      assert.deepStrictEqual(result, expected);
    });

    it("should get result when gestionnaire is found", async () => {
      const expected = {
        result: {
          etablissement_formateur_uai: "0551031X",
          etablissement_gestionnaire_uai: "0551031X",
        },
      };
      const result = await etablissementsMapper("12345678", "12345678", {});
      assert.deepStrictEqual(result.etablissement_formateur_uai, expected.etablissement_formateur_uai);
      assert.deepStrictEqual(result.etablissement_gestionnaire_uai, expected.etablissement_gestionnaire_uai);
    });
  });
});
