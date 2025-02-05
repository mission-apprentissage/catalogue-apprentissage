const hasOneOfRoles = (user, roles) => {
  return !!user.roles?.map((role) => roles.includes(role)).length;
};

const isUserAdmin = (user) => !!user?.isAdmin;

const hasAccessTo = (user, aclRef) => {
  return isUserAdmin(user) || user.acl?.includes(aclRef);
};

const hasAllAcademiesRight = (auth) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return isUserAdmin(auth) || listAcademies?.includes(-1);
};

const hasAcademyRight = (auth, num_academie) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return hasAllAcademiesRight(auth) || listAcademies?.includes(Number(num_academie));
};

module.exports = { hasOneOfRoles, isUserAdmin, hasAccessTo, hasAllAcademiesRight, hasAcademyRight };
