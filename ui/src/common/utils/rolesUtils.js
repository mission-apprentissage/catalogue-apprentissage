import { some, intersection } from "lodash";

export const isUserInRole = (auth, role) =>
  auth && auth.permissions && some(auth.permissions, (item) => role.includes(item));

export const isUserAdmin = (auth) => auth && auth.permissions && auth.permissions.isAdmin;

export const hasRightToEditFormation = (formation, auth) => {
  const listAcademies = auth?.academie?.split(",")?.map((academieStr) => Number(academieStr));
  return isUserAdmin(auth) || listAcademies?.includes(-1) || listAcademies?.includes(Number(formation?.num_academie));
};

export const hasOneOfRoles = (auth, roles) => {
  return intersection(auth.roles, roles).length > 0;
};
