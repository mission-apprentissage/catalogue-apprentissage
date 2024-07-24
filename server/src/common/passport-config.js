const passport = require("passport");
const { User } = require("./models");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(({ email }, done) => {
  User.findOne({ email })
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err));
});
