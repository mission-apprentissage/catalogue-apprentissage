const assert = require("assert");
const { parser } = require("../parser");

describe(__filename, () => {
  it("should transform nothing", async () => {
    const obj = {
      cfd: "1234",
      cfd_outdated: 0,
      cfd_date_fermeture: "2022-10-01",
      periode: "2022-09##2022-10|2023-01|2023-02",
      niveau: "3",
      capacite: "",
    };

    const newObj = parser(obj, {
      rncp_code: "nullable",
    });

    const expectedObj = {
      cfd: "1234",
      cfd_outdated: 0,
      cfd_date_fermeture: "2022-10-01",
      periode: "2022-09##2022-10|2023-01|2023-02",
      niveau: "3",
      capacite: "",
    };
    assert.deepStrictEqual(newObj, expectedObj);
  });

  it("should transform the fields if necessary", async () => {
    const obj = {
      cfd: "1234",
      cfd_outdated: 0,
      cfd_date_fermeture: "2022-10-01",
      periode: "2022-09##2022-10|2023-01|2023-02",
      niveau: "3",
      capacite: "15",
      distance: "987",
    };

    const newObj = parser(obj, {
      cfd_outdated: "boolean",
      cfd_date_fermeture: "date",
      periode: "periode",
      niveau: "niveau",
      capacite: "nullable",
      distance: "number",
    });

    const expectedObj = {
      cfd: "1234",
      cfd_outdated: false,
      cfd_date_fermeture: new Date("2022-09-30T22:00:00.000Z"),
      periode: [new Date("2022-09"), new Date("2022-10"), new Date("2023-01"), new Date("2023-02")],
      niveau: "3 (CAP...)",
      capacite: "15",
      distance: 987,
    };
    assert.deepStrictEqual(newObj, expectedObj);
  });

  it("should handle default transform, and fallbacks", async () => {
    const obj = {
      cfd: "1234",
      cfd_outdated: 0,
      cfd_date_fermeture: undefined,
      periode: ["2022-09##2022-10|2023-01|2023-02"],
      niveau: "3",
      capacite: "",
      distance: "NAN",
    };

    const newObj = parser(obj);

    const expectedObj = {
      cfd: "1234",
      cfd_outdated: false,
      cfd_date_fermeture: null,
      periode: [new Date("2022-09"), new Date("2022-10"), new Date("2023-01"), new Date("2023-02")],
      niveau: "3 (CAP...)",
      capacite: null,
      distance: null,
    };
    assert.deepStrictEqual(newObj, expectedObj);
  });
});
