module.exports = (siret) => {
  if (!siret || !/^[0-9]{14}$/g.test(siret.trim())) {
    return false;
  }

  return true;
};
