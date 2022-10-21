const axios = require("axios");
const axiosist = require("axiosist");
const createComponents = require("../../src/common/components/components");
const { connectToMongoForTests, cleanAll } = require("./testUtils.js");
const server = require("../../src/http/server");

let httpClient;

const startServer = async () => {
  const { db } = await connectToMongoForTests();
  const components = await createComponents({ db });
  const app = await server(components, true);
  httpClient = axiosist(app);

  return {
    httpClient,
    components,
    createAndLogUser: async (username, password, options) => {
      await components.users.createUser(username, password, options);

      const response = await axios.post(
        "/api/v1/auth/login",
        {
          username: username,
          password: password,
        },
        { withCredentials: true }
      );
      console.warn(response);
      if (response.headers["set-cookie"]) {
        console.warn("CCCOOOOOOOKKKIIIIIEEEE");
        const [cookie] = response.headers["set-cookie"]; // getting cookie from request
        httpClient.defaults.headers.Cookie = cookie; // attaching cookie to axiosInstance for future requests
      }
    },
  };
};

module.exports = (desc, cb) => {
  describe(desc, function () {
    cb({ startServer });
    afterEach(cleanAll);
  });
};
