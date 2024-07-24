module.exports = {
  session: {
    type: "object",
    properties: {
      permissions: {
        type: "object",
      },
      isAdmin: {
        type: "boolean",
      },
      sub: {
        type: "string",
      },
      email: {
        type: "string",
      },
      academie: {
        type: "string",
      },
      account_status: {
        type: "string",
      },
      roles: {
        type: "array",
        items: {
          type: "string",
        },
      },
      acl: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
};
