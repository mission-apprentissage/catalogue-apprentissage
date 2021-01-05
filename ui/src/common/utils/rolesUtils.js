import { some } from "lodash";

export const isUserInRole = (auth, role) =>
  auth && auth.permissions && some(auth.permissions, (item) => role.includes(item));

export const isUserAdmin = (auth) => auth && auth.permissions && auth.permissions.isAdmin;

export const roles = {
  role1: "role1",
  role2: "role2",
  administrator: "administrator",
};

export const hasRightToEditFormation = (formation, auth) => {
  return auth.academie.split(",").includes(`${formation.num_academie}`);
};
