const axios = require("axios");
const axiosist = require("axiosist");

const createComponents = require("../../src/common/components/components");
const { connectToMongoForTests, cleanAll } = require("./testUtils.js");
const server = require("../../src/http/server");

const startServer = async () => {
  const { db } = await connectToMongoForTests();
  const components = await createComponents({ db });
  const app = await server(components, false);
  const httpClient = axios.create({
    adapter: axiosist.createAdapter(app),
    withCredentials: true,
    headers: {
      Origin: "https://localhost",
      "Content-type": "application/json",
    },
  });
  // const httpClient = axiosist(app);

  return {
    httpClient,
    components,
    createAndLogUser: async (username, password, options) => {
      await components.users.createUser(username, password, options);
      // console.warn("AUTH", { username, password });

      const response = await httpClient.post(
        "/api/v1/auth/login",
        {
          username: username,
          password: password,
        },
        { withCredentials: true }
      );

      console.warn(response);
      if (response.headers["set-cookie"]) {
        console.warn("COOKIE");
        const [cookie] = response.headers["set-cookie"]; // getting cookie from request
        httpClient.defaults.headers.Cookie = cookie; // attaching cookie to axiosInstance for future requests

        return cookie;
      } else {
        console.warn("NO COOKIE");
        return null;
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
