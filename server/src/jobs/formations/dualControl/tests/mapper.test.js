const assert = require("assert");
const { mapper } = require("../mapper");

describe(__filename, () => {
  it("should create a new object with renamed keys", async () => {
    const obj = { code_diplome: "1234", title: "Ingénieur du son", cp: "67110", academie: "15" };
    const newObj = mapper(obj, {
      code_diplome: "cfd",
      title: "intitule_long",
      cp: "code_postal",
      academie: "num_academie",
    });

    const expectedObj = { cfd: "1234", intitule_long: "Ingénieur du son", code_postal: "67110", num_academie: "15" };
    assert.deepStrictEqual(newObj, expectedObj);
  });

  it("should keep keys if not renamed", async () => {
    const obj = { code_diplome: "1234", title: "Ingénieur du son", code_postal: "67110", num_academie: "15" };
    const newObj = mapper(obj, {
      code_diplome: "cfd",
      title: "intitule_long",
    });

    const expectedObj = { cfd: "1234", intitule_long: "Ingénieur du son", code_postal: "67110", num_academie: "15" };
    assert.deepStrictEqual(newObj, expectedObj);
  });

  it("should not modify original object", async () => {
    const obj = { code_diplome: "1234", title: "Ingénieur du son", code_postal: "67110", num_academie: "15" };
    mapper(obj, {
      code_diplome: "cfd",
      title: "intitule_long",
    });

    const expectedObj = { code_diplome: "1234", title: "Ingénieur du son", code_postal: "67110", num_academie: "15" };
    assert.deepStrictEqual(obj, expectedObj);
  });

  it("should remove keys if excluded", async () => {
    const obj = { code_diplome: "1234", title: "Ingénieur du son", code_postal: "67110", num_academie: "15" };
    const newObj = mapper(obj, {
      code_diplome: "cfd",
      title: 0,
    });

    const expectedObj = { cfd: "1234", code_postal: "67110", num_academie: "15" };
    assert.deepStrictEqual(newObj, expectedObj);
  });

  it("should handle defaults", async () => {
    const obj = {
      intitule_formation: "CAP Patisserie",
      rco_cfd: "123456789",
      etablissement_lieu_formation_code_insee: "93088",
    };
    const newObj = mapper(obj);

    const expectedObj = { intitule_rco: "CAP Patisserie", code_commune_insee: "93088" };
    assert.deepStrictEqual(newObj, expectedObj);
  });
});
