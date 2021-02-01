const { formation: formatFormation } = require("../common/utils/formater");
const { PsFormation, ConvertedFormation } = require("../../common/model");
const { paginator } = require("../common/utils/paginator");
const { cfd, uai } = require("./queries");

const updateMatchedFormation = async (matching) => {
  let {
    formation: { _id },
  } = matching;

  let { matching_strength, data } = matching.match[0];

  await PsFormation.findByIdAndUpdate(_id, { matching_type: matching_strength, matching_mna_formation: data });
};

const getMatch = (query) => ConvertedFormation.find(query);

module.exports = async () => {
  await paginator(PsFormation, { filter: { code_cfd: { $ne: null } }, lean: true, limit: 10 }, async (formation) => {
    let buffer = {
      formation,
      match: [],
    };

    for (let i = 0; i < cfd.length; i++) {
      let { query, strength } = cfd[i];

      let result = await getMatch(query(formation));

      if (result.length > 0) {
        buffer.match.push({
          matching_strength: strength,
          data_length: result.length,
          data: formatFormation(result),
        });

        break;
      }
    }

    if (buffer.match.length === 0) {
      for (let i = 0; i < uai.length; i++) {
        let { query, strength } = uai[i];

        let result = await getMatch(query(formation));

        if (result.length > 0) {
          buffer.match.push({
            matching_strength: strength,
            data_length: result.length,
            data: formatFormation(result),
          });

          break;
        }
      }
    }

    if (buffer.match.length === 0) return;

    await updateMatchedFormation(buffer);
  });
};
