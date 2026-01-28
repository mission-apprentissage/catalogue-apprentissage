import intersection from "lodash.intersection";

export const isUserAdmin = (auth) => !!auth?.isAdmin || !!auth?.permissions?.isAdmin;

export const hasRightToEditEtablissement = (etablissement, auth) => {
  return hasAcademyRight(auth, etablissement?.num_academie);
};

export const hasRightToEditFormation = (formation, auth) => {
  return hasAcademyRight(auth, formation?.num_academie);
};

export const hasOneOfRoles = (auth, roles) => {
  return intersection(auth.roles, roles).length > 0;
};

export const hasAccessTo = (auth, aclRef) => {
  return isUserAdmin(auth) || auth.acl?.includes(aclRef);
};

export const hasAccessToAtLeastOneOf = (auth, aclRefs) => {
  return isUserAdmin(auth) || aclRefs.some((aclRef) => auth.acl?.includes(aclRef));
};

export const hasAllAcademiesRight = (auth) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return isUserAdmin(auth) || listAcademies?.includes(-1);
};

export const hasAcademyRight = (auth, num_academie) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return hasAllAcademiesRight(auth) || listAcademies?.includes(Number(num_academie));
};

export const hasOnlyOneAcademyRight = (auth) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return !hasAllAcademiesRight(auth) && listAcademies?.length === 1;
};
