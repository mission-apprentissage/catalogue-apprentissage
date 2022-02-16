const assert = require("assert");
const { findPublishedDate } = require("../../../../src/common/utils/historyUtils");

describe(__filename, () => {
  it("should return null if formation is not published", () => {
    const formation = {
      affelnet_statut: "à publier",
      affelnet_statut_history: [
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-01T04:53:04.743Z"),
        },
        {
          affelnet_statut: "à publier",
          date: new Date("2022-02-02T03:13:34.469Z"),
        },
        {
          affelnet_statut: "à publier",
          date: new Date("2022-02-03T05:06:13.157Z"),
        },
      ],
    };

    let result = findPublishedDate(formation, "affelnet");
    assert.deepStrictEqual(result, null);
  });

  it("should return first date if  all 'publié'", () => {
    const formation = {
      affelnet_statut: "publié",
      affelnet_statut_history: [
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-01T04:53:04.743Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-02T03:13:34.469Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-03T05:06:13.157Z"),
        },
      ],
    };

    let result = findPublishedDate(formation, "affelnet");
    assert.deepStrictEqual(result, new Date("2022-02-01T04:53:04.743Z"));
  });

  it("should find last published date if is the last element", () => {
    const formation = {
      affelnet_statut: "publié",
      affelnet_statut_history: [
        {
          affelnet_statut: "hors périmètre",
          date: new Date("2022-02-01T04:53:04.743Z"),
        },
        {
          affelnet_statut: "à publier",
          date: new Date("2022-02-02T03:13:34.469Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-03T05:06:13.157Z"),
        },
      ],
    };

    let result = findPublishedDate(formation, "affelnet");
    assert.deepStrictEqual(result, new Date("2022-02-03T05:06:13.157Z"));
  });

  it("should find last published date if is not the last element", () => {
    const formation = {
      affelnet_statut: "publié",
      affelnet_statut_history: [
        {
          affelnet_statut: "hors périmètre",
          date: new Date("2022-02-01T04:53:04.743Z"),
        },
        {
          affelnet_statut: "à publier",
          date: new Date("2022-02-02T03:13:34.469Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-03T05:06:13.157Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-04T05:20:50.577Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-05T06:04:16.935Z"),
        },
      ],
    };

    let result = findPublishedDate(formation, "affelnet");
    assert.deepStrictEqual(result, new Date("2022-02-03T05:06:13.157Z"));
  });

  it("should find last published date even if there are multiple publié at different dates", () => {
    const formation = {
      affelnet_statut: "publié",
      affelnet_statut_history: [
        {
          affelnet_statut: "hors périmètre",
          date: new Date("2022-02-01T04:53:04.743Z"),
        },
        {
          affelnet_statut: "à publier",
          date: new Date("2022-02-02T03:13:34.469Z"),
        },
        {
          affelnet_statut: "à publier",
          date: new Date("2022-02-03T05:06:13.157Z"),
        },
        {
          affelnet_statut: "à publier",
          date: new Date("2022-02-04T05:20:50.577Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-05T06:04:16.935Z"),
        },
        {
          affelnet_statut: "hors périmètre",
          date: new Date("2022-02-06T05:34:39.230Z"),
        },
        {
          affelnet_statut: "hors périmètre",
          date: new Date("2022-02-07T06:09:25.820Z"),
        },
        {
          affelnet_statut: "hors périmètre",
          date: new Date("2022-02-07T16:48:08.954Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-07T16:59:23.703Z"),
        },
        {
          affelnet_statut: "publié",
          date: new Date("2022-02-07T17:07:18.273Z"),
        },
      ],
    };

    let result = findPublishedDate(formation, "affelnet");
    assert.deepStrictEqual(result, new Date("2022-02-07T16:59:23.703Z"));
  });
});
