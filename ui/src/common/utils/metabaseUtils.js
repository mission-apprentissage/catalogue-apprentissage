import jwt from "jsonwebtoken";

const METABASE_SITE_URL = `${process.env.REACT_APP_METABASE_URL ?? process.env.REACT_APP_BASE_URL}/metabase`;
const METABASE_SECRET_KEY = process.env.REACT_APP_METABASE_SECRET_KEY;

export const getIframeUrl = ({ id }) => {
  const payload = {
    resource: { dashboard: id },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };

  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  return METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=false&titled=false";
};
