const { User } = require("../model/index");
const sha512Utils = require("../utils/sha512Utils");
const { pick } = require("lodash");

const rehashPassword = (user, password) => {
  user.password = sha512Utils.hash(password);
  return user.save();
};

module.exports = async () => {
  return {
    authenticate: async (username, password) => {
      const user = await User.findOne({ username });
      if (!user) {
        return null;
      }

      const current = user.password;
      if (sha512Utils.compare(password, current)) {
        if (sha512Utils.isTooWeak(current)) {
          await rehashPassword(user, password);
        }
        return user.toObject();
      }
      return null;
    },
    getUser: async (username) => await User.findOne({ username }),
    getUsers: async () => await User.find({}).lean(),
    createUser: async (username, password, options = {}) => {
      const hash = options.hash || sha512Utils.hash(password);
      const permissions = options.permissions || {};

      const user = new User({
        username,
        password: hash,
        isAdmin: !!permissions.isAdmin,
        email: options.email || "",
        academie: options.academie || "0",
        roles: options.roles || ["user"],
      });

      await user.save();
      return user.toObject();
    },
    removeUser: async (username) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error(`Unable to find user ${username}`);
      }

      return await user.deleteOne({ username });
    },
    updateUser: async (username, data) => {
      let user = await User.findOne({ username });
      if (!user) {
        throw new Error(`Unable to find user ${username}`);
      }

      const result = await User.findOneAndUpdate({ _id: user._id }, data, { new: true });

      return result.toObject();
    },
    changePassword: async (username, newPassword) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error(`Unable to find user ${username}`);
      }

      if (user.account_status === "FORCE_RESET_PASSWORD") {
        user.account_status = "CONFIRMED";
      }

      user.password = sha512Utils.hash(newPassword);
      await user.save();

      return user.toObject();
    },
    structureUser: (user) => {
      const permissions = pick(user, ["isAdmin"]);
      const structure = {
        permissions,
        sub: user.username,
        email: user.email,
        academie: user.academie,
        account_status: user.account_status,
        roles: permissions.isAdmin ? ["admin", ...user.roles] : user.roles,
      };
      return structure;
    },
  };
};
