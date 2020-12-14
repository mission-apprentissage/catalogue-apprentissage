const assert = require("assert");
const createReferentiel = require("../importer/referentiel");

describe(__filename, async () => {
  const referentiel = await createReferentiel();

  it("Vérifie qu'il est possible de trouver un code IDCC pour un code EN", async () => {
    const idcssTestFound = referentiel.findIdccsFromCodeEn("56X22101");
    assert.deepStrictEqual(idcssTestFound.includes("1266"), true);
  });

  it("Vérifie qu'on ne trouve pas de code IDCC pour un mauvais code EN", async () => {
    assert.deepStrictEqual(referentiel.findIdccsFromCodeEn("UNKNOWN"), []);
  });

  it("Vérifie qu'on trouve un OPCO valide pour un code IDCC valide", async () => {
    assert.deepStrictEqual(referentiel.findOpcosFromIdccs(["83"]), [
      {
        IDCC: "83",
        Libellé:
          "Convention collective nationale des menuiseries charpentes et constructions industrialisées et des portes planes",
        obs: "",
        Opérateurdecompétences: "OPCO 2i",
      },
    ]);
  });

  it("Vérifie qu'on trouve une liste d'OPCOs valides pour une liste de codes IDCC valides", async () => {
    assert.deepStrictEqual(referentiel.findOpcosFromIdccs(["83", "86"]), [
      {
        IDCC: "83",
        Libellé:
          "Convention collective nationale des menuiseries charpentes et constructions industrialisées et des portes planes",
        obs: "",
        Opérateurdecompétences: "OPCO 2i",
      },
      {
        IDCC: "86",
        Libellé: "Convention collective nationale des entreprises de publicité et assimilées",
        obs: "",
        Opérateurdecompétences: "AFDAS",
      },
    ]);
  });

  it("Vérifie qu'on trouve une liste d'OPCOs valides pour une liste de codes IDCC valides et invalides", async () => {
    assert.deepStrictEqual(referentiel.findOpcosFromIdccs(["83", "UNKNOWN"]), [
      {
        IDCC: "83",
        Libellé:
          "Convention collective nationale des menuiseries charpentes et constructions industrialisées et des portes planes",
        obs: "",
        Opérateurdecompétences: "OPCO 2i",
      },
    ]);
  });

  it("Vérifie qu'on ne trouve pas de liste d'OPCOs pour une liste de codes IDCC invalides", async () => {
    assert.deepStrictEqual(referentiel.findOpcosFromIdccs(["UNKNOWN", "KO"]), []);
  });

  it("Vérifie qu'on ne trouve pas de liste d'OPCOs pour un code EN invalide", async () => {
    assert.deepStrictEqual(await referentiel.findOpcosFromCodeEn("UNKNOWN"), []);
  });

  it("Vérifie qu'on trouve un OPCO valide pour un code EN valide", async () => {
    assert.deepStrictEqual(await referentiel.findOpcosFromCodeEn("56X22101"), [
      {
        IDCC: "1266",
        Libellé: "Convention collective nationale du personnel des entreprises de restauration de collectivités",
        obs: "",
        Opérateurdecompétences: "OPCO entreprises et salariés des services à forte intensité de main-d'œuvre",
      },
    ]);
  });
});
