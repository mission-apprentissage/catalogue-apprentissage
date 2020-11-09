import { useAuthState, anonymous } from "../auth";
import decodeJWT from "../utils/decodeJWT";

export default function useAuth() {
  let [auth, setAuth] = useAuthState();

  let setAuthFromToken = (token) => {
    if (!token) {
      sessionStorage.removeItem("catalogue_apprentissage:token");
      setAuth(anonymous);
    } else {
      sessionStorage.setItem("catalogue_apprentissage:token", token);
      setAuth(decodeJWT(token));
    }
  };

  return [auth, setAuthFromToken];
}
