require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});

const router = require("./sitemap-routes").default;
const Sitemap = require("react-router-sitemap").default;

new Sitemap(router).build("https://catalogue.apprentissage.education.gouv.fr").save("./public/sitemap.xml");
