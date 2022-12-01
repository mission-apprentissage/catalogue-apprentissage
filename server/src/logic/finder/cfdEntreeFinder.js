const cfdEntreeMap = {
  32033422: ["32033423", "32033424", "32033425"],
  32022316: ["32022317", "32022318"],
  32032209: ["32032210", "32032211"],
  32033606: ["32033603", "32033604", "32033605"],
  32032612: ["32032613", "32032614"],
  32022310: ["32022311", "32022312"],
};

const getCfdEntree = (cfd) => {
  const entry = Object.entries(cfdEntreeMap).find(([, values]) => values.includes(cfd));
  return entry ? entry[0] : cfd;
};

module.exports = {
  getCfdEntree,
};
