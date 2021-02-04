const { AfFormation, ConvertedFormation } = require("../../common/model");
const { paginator } = require("../common/utils/paginator");
const logger = require("../../common/logger");
const { getCpInfo } = require("@mission-apprentissage/tco-service-node");
const { formation } = require("../common/utils/formater");

const updateMatchedFormation = async (strengh, matching, _id) => {
  let formattedResult = {
    matching_strengh: strengh,
    data: formation(matching),
  };

  let { matching_strengh, data } = formattedResult;

  await AfFormation.findByIdAndUpdate(_id, {
    matching_type: matching_strengh,
    matching_mna_formation: data,
  });
};

const match1 = (cfd) => ConvertedFormation.find({ cfd });
const match2 = (cfd, num_departement) => ConvertedFormation.find({ cfd, num_departement });
const match3 = (cfd, num_departement, code_postal) =>
  ConvertedFormation.find({
    cfd,
    num_departement,
    $and: [
      {
        $or: [
          { etablissement_formateur_code_postal: code_postal },
          { etablissement_gestionnaire_code_postal: code_postal },
          { code_postal },
        ],
      },
    ],
  });

module.exports = async () => {
  logger.info(`--- START FORMATION COVERAGE ---`);

  await paginator(
    AfFormation,
    { filter: { code_cfd: { $ne: null } }, lean: true },
    async ({ _id, code_postal, code_cfd }) => {
      const { messages, result } = await getCpInfo(code_postal);
      let dept = code_postal.substring(0, 2);

      if (messages?.cp === "Ok" || messages?.cp === `Update: Le code ${code_postal} est un code commune insee`) {
        code_postal = result.code_postal;
      }

      const m3 = await match3(code_cfd, dept, code_postal);

      if (m3.length > 0) {
        await updateMatchedFormation("3", m3, _id);
        return;
      }

      const m2 = await match2(code_cfd, dept);

      if (m2.length > 0) {
        await updateMatchedFormation("2", m2, _id);
        return;
      }

      const m1 = await match1(code_cfd);

      if (m1.length > 0) {
        await updateMatchedFormation("1", m1, _id);
        return;
      }
    }
  );

  logger.info(`--- END FORMATION COVERAGE ---`);
};
