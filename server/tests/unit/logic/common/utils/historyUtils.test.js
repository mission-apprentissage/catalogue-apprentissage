const assert = require("assert");
const {
  findLastStatutUpdateDate,
  findLastStatutUpdateDateForPlatform,
} = require("../../../../../src/common/utils/historyUtils");

describe(__filename, () => {
  const formation = {
    parcoursup_statut: "hors périmètre",
    parcoursup_statut_history: [
      {
        parcoursup_statut: "à publié",
        date: "2022-03-05T05:48:44.313Z",
      },
      {
        parcoursup_statut: "publié",
        date: "2022-03-06T05:38:10.003Z",
      },
      {
        parcoursup_statut: "hors périmètre",
        date: "2022-03-05T05:48:44.313Z",
      },
      {
        parcoursup_statut: "hors périmètre",
        date: "2022-03-06T05:38:10.003Z",
      },
      {
        parcoursup_statut: "hors périmètre",
        date: "2022-03-07T06:06:51.574Z",
      },
      {
        parcoursup_statut: "hors périmètre",
        date: "2022-03-08T07:16:46.845Z",
      },
      {
        parcoursup_statut: "hors périmètre",
        date: "2022-03-08T13:41:55.179Z",
      },
      {
        parcoursup_statut: "hors périmètre",
        date: "2022-03-09T05:15:47.034Z",
      },
      {
        parcoursup_statut: "hors périmètre",
        date: "2022-03-10T06:19:09.312Z",
      },
    ],
    affelnet_statut: "en attente de publication",
    affelnet_statut_history: [
      {
        affelnet_statut: "à publier",
        date: "2022-02-28T05:57:05.105Z",
      },
      {
        affelnet_statut: "à publier",
        date: "2022-03-01T05:49:12.695Z",
      },
      {
        affelnet_statut: "à publier",
        date: "2022-03-02T06:21:41.313Z",
      },
      {
        affelnet_statut: "à publier",
        date: "2022-03-03T06:04:39.568Z",
      },
      {
        affelnet_statut: "à publier",
        date: "2022-03-04T06:07:51.906Z",
      },
      {
        affelnet_statut: "en attente de publication",
        date: "2022-03-05T06:12:57.161Z",
      },
      {
        affelnet_statut: "en attente de publication",
        date: "2022-03-07T06:18:25.262Z",
      },
      {
        affelnet_statut: "en attente de publication",
        date: "2022-03-08T07:39:33.311Z",
      },
      {
        affelnet_statut: "en attente de publication",
        date: "2022-03-08T13:38:42.377Z",
      },
      {
        affelnet_statut: "en attente de publication",
        date: "2022-03-09T05:37:42.527Z",
      },
      {
        affelnet_statut: "en attente de publication",
        date: "2022-03-10T06:41:44.897Z",
      },
    ],
    published: true,
    updates_history: [
      {
        from: {
          affelnet_statut: "à publier",
          affelnet_infos_offre: "CAP en 2 ans",
          affelnet_raison_depublication: null,
        },
        to: {
          affelnet_statut: "en attente de publication",
          affelnet_infos_offre: "CAP en 2 ans",
          affelnet_raison_depublication: null,
          last_update_who: "saio-affectation@ac-lyon.fr",
        },
        updated_at: 1646392555416.0,
      },
    ],
    last_update_who: "saio-affectation@ac-lyon.fr",
    affelnet_published_date: null,
    parcoursup_published_date: null,
  };

  // describe("findPublishedDate", () => {});

  describe("findLastStatutUpdateDateForPlatform", () => {
    it("should find last afflenet statut update", () => {
      const lastStatutUpdateDate = findLastStatutUpdateDateForPlatform(formation, "affelnet");

      assert.strictEqual(lastStatutUpdateDate, "2022-03-05T06:12:57.161Z");
    });

    it("should find last parcoursup statut update", () => {
      const lastStatutUpdateDate = findLastStatutUpdateDateForPlatform(formation, "parcoursup");

      assert.strictEqual(lastStatutUpdateDate, "2022-03-05T05:48:44.313Z");
    });
  });

  describe("findLastStatutUpdateDate", () => {
    it("should find last statut update (both parcoursup and affelnet)", () => {
      const lastStatutUpdateDate = findLastStatutUpdateDate(formation);

      assert.strictEqual(lastStatutUpdateDate, "2022-03-05T06:12:57.161Z");
    });
  });
});
