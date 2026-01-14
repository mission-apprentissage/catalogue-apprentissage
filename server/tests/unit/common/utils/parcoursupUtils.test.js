const assert = require("assert");
const {
  findMefsForParcoursup,
  loadMefsAllowedOnParcoursup,
  getParcoursupError,
} = require("../../../../src/common/utils/parcoursupUtils");

const distinctErrors = [
  '400 Erreur lors de la creation : Ce type de formation est marqué "Fermé" dans la BCN. Vous ne pouvez donc pas créer une formation de ce type.31/08/21',
  "400 Impossible de créer : Établissement inconnu",
  "400 L'UAI ne correspond pas à un IUT alors que le type de formation correspond à un BUT",
  "400 La filière n'a pas pu être retrouvée. Le MEF :  correspond à 0 fillières\r\nLe CFD : 01022001 correspond à 0 fillières\r\nLe RNCP : 955 , correspond à 0 fillière(s)\r\n",
  "400 La filière n'a pas pu être retrouvée. Le MEF :  correspond à 0 fillières\r\nLe CFD : 36T32402 correspond à 0 fillières\r\nLe RNCP : 35031 ,\r\n",
  "400 La filière n'a pas pu être retrouvée. Le MEF :  correspond à 0 fillières\r\nLe CFD : 46321220 correspond à 2 fillières\r\nLe RNCP : 34275 , correspond à 2 fillière(s)\r\n",
  "400 Le code RCO 089379P01213904824200002839048242000028-44185#L01 existe dejà sur un autre établissement 0221835A",
  "400 Le code RCO 106905P01111969025060005019010819100015-01053#L01 existe dejà sur un autre établissement 0011444P",
  '401 <!doctype html><html lang="fr"><head><title>État HTTP 401 – Non authorisé</title><style type="text/css">body {font-family:Tahoma,Arial,sans-serif;} h1, h2, h3, b {color:white;background-color:#525D76;} h1 {font-size:22px;} h2 {font-size:16px;} h3 {font-size:14px;} p {font-size:12px;} a {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>État HTTP 401 – Non authorisé</h1><hr class="line" /><p><b>Type</b> Rapport d\'état</p><p><b>description</b> La requête nécessite une authentification HTTP.</p><hr class="line" /><h3>|\\|/-\\!3()() 3B3-888 S.B1</h3></body></html>',
  "403 ",
  "??? erreur de création",
];

describe(__filename, () => {
  before(() => {
    loadMefsAllowedOnParcoursup([
      { MEF: "3112310921" },
      { MEF: "3113121321" },
      { MEF: "3113342621" },
      { MEF: "3113110321" },
    ]);
  });

  describe("findMefsForParcoursup", () => {
    it("should filter mefs for PS", () => {
      const result = findMefsForParcoursup({
        bcn_mefs_10: [{ mef10: "123456" }, { mef10: "3113121321" }, { mef10: "3113121300" }],
      });
      const expected = [{ mef10: "3113121321" }];
      assert.deepStrictEqual(result, expected);
    });

    it("should not find mefs for PS", () => {
      const result = findMefsForParcoursup({
        bcn_mefs_10: [{ mef10: "123456" }, { mef10: "987654" }, { mef10: "3113121300" }],
      });
      assert.deepStrictEqual(result, []);
    });
  });

  describe("getParcoursupError", () => {
    it("should find a descriptor for each 400 errors", () => {
      distinctErrors.forEach((parcoursup_error) => {
        const descriptor = getParcoursupError({ parcoursup_error });
        if (!descriptor) {
          console.error(parcoursup_error);
        }

        if (parcoursup_error.match(/400/)) {
          assert.strictEqual(!!descriptor, true);
        } else {
          assert.strictEqual(!!descriptor, false);
        }
      });
    });
  });

  describe("getParcoursupErrorDescription", () => {
    it("should find a description for each 400 errors", () => {
      distinctErrors.forEach((parcoursup_error) => {
        const descriptor = getParcoursupError({ parcoursup_error });
        if (!descriptor) {
          console.error(parcoursup_error);
        }

        if (parcoursup_error.match(/400/)) {
          assert.strictEqual(!!descriptor, true);
        } else {
          assert.strictEqual(!!descriptor, false);
        }
      });
    });
  });

  describe("getParcoursupErrorAction", () => {
    it("should find an action for each 400 errors", () => {
      distinctErrors.forEach((parcoursup_error) => {
        const descriptor = getParcoursupError({ parcoursup_error });
        if (!descriptor) {
          console.error(parcoursup_error);
        }

        if (parcoursup_error.match(/400/)) {
          assert.strictEqual(!!descriptor, true);
        } else {
          assert.strictEqual(!!descriptor, false);
        }
      });
    });
  });
});
