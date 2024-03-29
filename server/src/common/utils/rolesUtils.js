const hasOneOfRoles = (user, roles) => {
  return !!user.roles?.map((role) => roles.includes(role)).length;
};

const isUserAdmin = (user) => !!user?.isAdmin;

const hasAccessTo = (user, aclRef) => {
  return isUserAdmin(user) || user.acl?.includes(aclRef);
};

module.exports = { hasOneOfRoles, isUserAdmin, hasAccessTo };
