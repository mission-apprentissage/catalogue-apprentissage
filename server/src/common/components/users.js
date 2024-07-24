const { User, Role } = require("../models/index");
const sha512Utils = require("../utils/sha512Utils");
const { pick, uniq, escapeRegExp } = require("lodash");

const rehashPassword = (user, password) => {
  user.password = sha512Utils.hash(password);
  return user.save();
};

module.exports = async () => {
  return {
    authenticate: async (username, password) => {
      console.log({ username, password, regexp: new RegExp(`/^${escapeRegExp(username.toLowerCase())}$/i`) });

      const user = await User.findOne({
        $or: [
          { username: new RegExp(`^${escapeRegExp(username.toLowerCase())}$`, "i") },
          { email: new RegExp(`^${escapeRegExp(username.toLowerCase())}$`, "i") },
        ],
      });
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
    getUser: async (username) => {
      return await User.findOne({
        username: new RegExp(`^${escapeRegExp(username.toLowerCase())}$`, "i"),
      });
    },
    getUserByEmail: async (email) => {
      return await User.findOne({
        email: new RegExp(`^${escapeRegExp(email.toLowerCase())}$`, "i"),
      });
    },
    getUsers: async () => await User.find({}, { password: 0, _id: 0, __v: 0 }).sort({ email: 1 }).lean(),
    createUser: async (username, password, options = {}) => {
      const hash = options.hash || sha512Utils.hash(password);
      const permissions = options.permissions || {};

      const user = new User({
        username: username?.toLowerCase().trim(),
        password: hash,
        isAdmin: !!permissions.isAdmin,
        email: options.email?.toLowerCase().trim() || "",
        academie: options.academie || "0",
        roles: options.roles || ["user"],
        tag: options.tag,
        acl: options.acl || [],
      });

      await user.save();
      return user.toObject();
    },
    removeUser: async (username) => {
      const user = await User.findOne({ username: username?.toLowerCase() });
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
    structureUser: async (user) => {
      const permissions = pick(user, ["isAdmin"]);

      const rolesList = await Role.find({ name: { $in: user.roles } }).lean();
      const rolesAcl = rolesList.reduce((acc, { acl }) => [...acc, ...acl], []);

      const structure = {
        permissions,
        isAdmin: !!permissions.isAdmin,
        sub: user.username,
        email: user.email,
        tag: user.tag,
        academie: user.academie,
        account_status: user.account_status,
        roles: permissions.isAdmin ? ["admin", ...user.roles] : user.roles,
        acl: uniq([...rolesAcl, ...user.acl]),
      };
      return structure;
    },
    registerUser: (email) =>
      User.findOneAndUpdate({ email }, { last_connection: new Date(), $push: { connection_history: new Date() } }),
    // addTag: async (username, tag) => {
    //   const user = await User.findOne({ username });
    //   user.tags = uniq([...user.tags, tag]);
    //   return await user.save();
    // },
    // removeTag: async (username, tag) => {
    //   const user = await User.findOne({ username });
    //   user.tags = user.tags.filter((t) => t !== tag);
    //   return await user.save();
    // },
  };
};
