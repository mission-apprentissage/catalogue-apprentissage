import { intersection } from "lodash";

export const isUserAdmin = (auth) => auth && auth.permissions && auth.permissions.isAdmin;

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

export const hasAllAcademiesRight = (auth) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return isUserAdmin(auth) || listAcademies?.includes(-1);
};

export const hasAcademyRight = (auth, num_academie) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return isUserAdmin(auth) || listAcademies?.includes(-1) || listAcademies?.includes(Number(num_academie));
};
