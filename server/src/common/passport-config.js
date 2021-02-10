const passport = require("passport");
const { User } = require("./model");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(({ _id }, done) => {
  User.findById(_id)
    .then((userDoc) => {
      done(null, userDoc);
    })
    .catch((err) => done(err));
});
