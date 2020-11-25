import React, { useEffect } from "react";
import { Site, Nav } from "tabler-react";
import useAuth from "../common/hooks/useAuth";
import { useHistory } from "react-router-dom";
import { _post } from "../common/httpClient";

export default (props) => {
  let [auth, setAuth] = useAuth();
  let history = useHistory();
  let logout = () => {
    setAuth(null);
    history.push("/login");
  };

  useEffect(() => {
    async function run() {
      if (auth.sub !== "anonymous") {
        if (auth.account_status === "FORCE_RESET_PASSWORD") {
          let { token } = await _post("/api/password/forgotten-password?noEmail=true", { username: auth.sub });
          history.push(`/reset-password?passwordToken=${token}`);
        }
      }
    }
    run();
  }, [auth, history]);

  return (
    <Site>
      <Site.Header>
        Catalogue Apprentissage App
        <div className="d-flex order-lg-2 ml-auto">
          <Nav.Item hasSubNav value={auth.sub} icon="user">
            {auth && auth.permissions.isAdmin && (
              <a href="/admin/users" className="dropdown-item">
                Utilisateurs
              </a>
            )}
            <a href="/" className="dropdown-item" onClick={logout}>
              Déconnexion
            </a>
          </Nav.Item>
        </div>
      </Site.Header>
      {props.children}
    </Site>
  );
};
