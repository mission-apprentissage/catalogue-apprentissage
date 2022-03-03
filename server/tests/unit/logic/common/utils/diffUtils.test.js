const assert = require("assert");
const { diffFormation } = require("../../../../../src/logic/common/utils/diffUtils");

describe(__filename, () => {
  it("should not find update if nothing change", () => {
    const previousFormationP = {};
    const nextFormationP = {};
    let result = diffFormation(previousFormationP, nextFormationP);

    assert.deepStrictEqual(result, { updates: null, keys: [], length: 0 });
  });

  it("should not find update if france competence info doesn't change", () => {
    const previousFormationP = {
      france_competence_infos: {
        fc_is_catalog_general: false,
        fc_is_habilite_rncp: false,
        fc_is_certificateur: false,
        fc_is_certificateur_siren: false,
        fc_is_partenaire: false,
        fc_has_partenaire: true,
      },
    };
    const nextFormationP = {
      france_competence_infos: {
        fc_is_catalog_general: false,
        fc_is_habilite_rncp: false,
        fc_is_certificateur: false,
        fc_is_certificateur_siren: false,
        fc_is_partenaire: false,
        fc_has_partenaire: true,
      },
    };
    let result = diffFormation(previousFormationP, nextFormationP);

    assert.deepStrictEqual(result, { updates: null, keys: [], length: 0 });
  });

  it("should find update if france competence info doesn't change", () => {
    const previousFormationP = {
      france_competence_infos: {
        fc_is_catalog_general: false,
        fc_is_habilite_rncp: false,
        fc_is_certificateur: false,
        fc_is_certificateur_siren: false,
        fc_is_partenaire: false,
        fc_has_partenaire: true,
      },
    };
    const nextFormationP = {
      france_competence_infos: {
        fc_is_catalog_general: false,
        fc_is_habilite_rncp: false,
        fc_is_certificateur: false,
        fc_is_certificateur_siren: true,
        fc_is_partenaire: false,
        fc_has_partenaire: true,
      },
    };
    let result = diffFormation(previousFormationP, nextFormationP);

    assert.deepStrictEqual(result, {
      updates: { france_competence_infos: { fc_is_certificateur_siren: true } },
      keys: ["france_competence_infos"],
      length: 1,
    });
  });
});
