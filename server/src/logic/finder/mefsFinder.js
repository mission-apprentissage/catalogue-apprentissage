const computeMefs = async (fields) => {
  let bcn_mefs_10 = fields.bcn_mefs_10;
  let duree_incoherente = false;
  let annee_incoherente = false;

  // filter bcn_mefs_10 with data received from RCO
  const duree = fields.duree;
  if (duree && duree !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.duree === duree;
    });

    duree_incoherente =
      !!fields.bcn_mefs_10.length &&
      fields.bcn_mefs_10.every(({ modalite }) => {
        return modalite.duree !== duree;
      });
  }

  const annee = fields.annee;
  if (annee && annee !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.annee === annee;
    });

    annee_incoherente =
      !!fields.bcn_mefs_10.length &&
      fields.bcn_mefs_10.every(({ modalite }) => {
        return modalite.annee !== annee;
      });
  }

  return {
    bcn_mefs_10,
    duree_incoherente,
    annee_incoherente,
  };
};

module.exports = { computeMefs };
