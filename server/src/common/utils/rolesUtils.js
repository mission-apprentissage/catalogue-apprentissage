const hasOneOfRoles = (user, roles) => {
  return !!user.roles?.map((role) => roles.includes(role)).length;
};

module.exports = { hasOneOfRoles };
