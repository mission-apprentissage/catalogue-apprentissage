const { AfFormation, ConvertedFormation } = require("../../common/model");
const { oleoduc, writeData } = require("oleoduc");
const logger = require("../../common/logger");
const { formation } = require("./mapper");

const updateMatchedFormation = async ({ formation, matching_cfd }) => {
  let { matching_strengh, data } = matching_cfd;

  logger.info(`update ${formation._id} — strengh: ${matching_strengh}`);

  await AfFormation.findByIdAndUpdate(formation._id, {
    matching_type: matching_strengh,
    matching_mna_formation: data,
  });
};

const formatResult = (strengh, data) => {
  return {
    matching_strengh: strengh,
    data_length: data.length,
    data: formation(data),
  };
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

module.exports = async (tableCorrespondance) => {
  logger.info(`--- START FORMATION COVERAGE ---`);

  await oleoduc(
    AfFormation.find({ code_cfd: { $ne: null }, matching_mna_formation: { $eq: [] } })
      .lean()
      .cursor(),
    writeData(
      async (formation) => {
        const { messages, result } = await tableCorrespondance.getCpInfo(formation.code_postal);

        if (
          messages?.cp === "Ok" ||
          messages?.cp === `Update: Le code ${formation.code_postal} est un code commune insee`
        ) {
          formation.code_postal = result.code_postal;
        }

        let { code_cfd, code_postal } = formation;
        let dept = code_postal.substring(0, 2);

        const m3 = await match3(code_cfd, dept, code_postal);

        if (m3.length === 1) {
          let matching_cfd = formatResult("3", m3);
          await updateMatchedFormation({ formation, matching_cfd });
        } else {
          const m2 = await match2(code_cfd, dept);

          if (m2.length === 1) {
            let matching_cfd = formatResult("2", m2);
            await updateMatchedFormation({ formation, matching_cfd });
          } else {
            const m1 = await match1(code_cfd);

            if (m1.length > 0) {
              let matching_cfd = formatResult("1", m1);
              await updateMatchedFormation({ formation, matching_cfd });
            }
          }
        }
      },
      { parallel: 5 }
    )
  );
  logger.info(`--- END FORMATION COVERAGE ---`);
};
