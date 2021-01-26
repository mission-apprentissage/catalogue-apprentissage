// const { asyncForEach } = require("../../common/utils/asyncUtils");
const { AfFormation, ConvertedFormation } = require("../../common/model");
const logger = require("../../common/logger");
// const matcher = require("./matcher");
const { oleoduc, writeData } = require("oleoduc");
const { formation } = require("./mapper");

async function updateMatchedFormation({ formation, matching_cfd }) {
  if (matching_cfd.length === 0) return;

  let { matching_strengh, data } = matching_cfd[0];

  logger.info(`update ${formation._id} — strengh: ${matching_strengh}`);

  await AfFormation.findByIdAndUpdate(formation._id, {
    matching_type: matching_strengh,
    matching_mna_formation: data,
  });
}

const formatResult = (strengh, data) => {
  return {
    matching_strengh: strengh,
    data_length: data.length,
    data: formation(data),
  };
};

const match1 = (cfd) => ConvertedFormation.find({ cfd });
const match2 = (cfd, num_departement) => ConvertedFormation.find({ cfd, num_departement });
const match3 = async (cfd, num_departement, code_postal) =>
  await ConvertedFormation.find({
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
  await oleoduc(
    AfFormation.find({ code_cfd: { $ne: null } })
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
          updateMatchedFormation({ formation, matching_cfd });
        } else {
          const m2 = await match2(code_cfd, dept);

          if (m2.length === 1) {
            let matching_cfd = formatResult("2", m2);
            updateMatchedFormation({ formation, matching_cfd });
          } else {
            const m1 = await match1(code_cfd);

            if (m1.length > 0) {
              let matching_cfd = formatResult("1", m1);
              updateMatchedFormation({ formation, matching_cfd });
            }
          }
        }
      },
      { parallel: 5 }
    )
  );
};

// module.exports = async (tableCorrespondance) => {
//   logger.info("Retreiving data from DB ...");

//   const [afFormations, mnaFormations] = await Promise.all([
//     AfFormation.find({ code_cfd: { $ne: null } }).lean(),
//     ConvertedFormation.find().lean(),
//   ]);

//   logger.info(`${afFormations.length} formations to update ...`);

//   await asyncForEach(afFormations, async (formation) => {
//     const { messages, result: resultTco } = await tableCorrespondance.getCpInfo(formation.code_postal);

//     if (
//       messages?.cp === "Ok" ||
//       messages?.cp === `Update: Le code ${formation.code_postal} est un code commune insee`
//     ) {
//       formation.code_postal_modified = { ...resultTco };
//     } else {
//       formation.code_postal_modified = { code_postal: formation.code_postal };
//     }

//     const result = matcher(formation, mnaFormations);
//     logger.info(`Update ${formation._id} - ${formation.code_cfd} `);

//     await updateMatchedFormation(result);
//   });
// };
