import { createGlobalState } from "react-hooks-global-state";
import decodeJWT from "./utils/decodeJWT";

const anonymous = { sub: "anonymous", permissions: {} };
let token = sessionStorage.getItem("catalogue_apprentissage:token");

const { useGlobalState, getGlobalState } = createGlobalState({
  auth: token ? decodeJWT(token) : anonymous,
});

export const getAuth = () => getGlobalState("auth");
export const useAuthState = () => useGlobalState("auth");
export { anonymous };
