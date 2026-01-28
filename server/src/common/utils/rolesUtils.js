const hasOneOfRoles = (auth, roles) => {
  return !!auth.roles?.map((role) => roles.includes(role)).length;
};

const isUserAdmin = (auth) => !!auth?.isAdmin;

/**
 * Détermine si un utilisateur {auth} a le droit d'accéder à la ressource {aclRef}.
 * Si une académie {academy} est passée, vérifie que l'utilisateur possèdent le droit et est bien enregistré sur cette académie.
 *
 * @warning Le auth passé est à récupérer de la requête via la session : req.session.passport.user.
 * Sinon la liste des droits de l'utilisateur ne prendra pas en compte les rôles associés à celui-ci.
 *
 * @param {*} auth
 * @param {String} aclRef
 * @param {String|Number} academy
 * @returns
 */
const hasAccessTo = (auth, aclRef, academy) => {
  if (!auth) return false;

  return (isUserAdmin(auth) || auth.acl?.includes(aclRef)) && (academy ? hasAcademyRight(auth, academy) : true);
};

const hasAcademyRight = (auth, num_academie) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return hasAllAcademiesRight(auth) || listAcademies?.includes(Number(num_academie));
};

const hasAllAcademiesRight = (auth) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return listAcademies?.includes(-1);
};

module.exports = { hasOneOfRoles, isUserAdmin, hasAccessTo, hasAllAcademiesRight, hasAcademyRight };
