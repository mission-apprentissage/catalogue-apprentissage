module.exports = (cfd) => {
  if (!cfd || !/^[0-9A-Z]{8}[A-Z]?$/g.test(cfd.trim())) {
    return false;
  }

  return true;
};
