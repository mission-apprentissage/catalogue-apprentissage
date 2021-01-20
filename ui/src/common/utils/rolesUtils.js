import { some, intersection } from "lodash";

export const isUserInRole = (auth, role) =>
  auth && auth.permissions && some(auth.permissions, (item) => role.includes(item));

export const isUserAdmin = (auth) => auth && auth.permissions && auth.permissions.isAdmin;

export const hasRightToEditFormation = (formation, auth) => {
  return (
    isUserAdmin(auth) ||
    auth?.academie?.split(",")?.includes(`-1`) ||
    auth?.academie?.split(",")?.includes(`${formation?.num_academie}`)
  );
};

export const hasOneOfRoles = (auth, roles) => {
  return intersection(auth.roles, roles).length > 0;
};
