import React from "react";
import { useHistory } from "react-router-dom";
import { Dropdown, Site } from "tabler-react";
import { NavLink } from "react-router-dom";

import useAuth from "../../../common/hooks/useAuth";
import { isUserAdmin } from "../../../common/utils/rolesUtils";

const Header = () => {
  let [auth, setAuth] = useAuth();
  let history = useHistory();
  let logout = () => {
    setAuth(null);
    history.push("/login");
  };

  let dropdownItems = null;
  if (auth?.sub !== "anonymous") {
    dropdownItems = (
      <React.Fragment>
        <Dropdown.Item icon="home" to="/">
          Accueil
        </Dropdown.Item>
        {isUserAdmin(auth) && (
          <Dropdown.Item icon="users" to="/admin/users">
            Utilisateurs
          </Dropdown.Item>
        )}
        <Dropdown.ItemDivider />
        <Dropdown.Item icon="log-out" to="#" onClick={logout}>
          <span href="#" onClick={logout} role="button">
            Déconnexion
          </span>
        </Dropdown.Item>
      </React.Fragment>
    );
  }

  return (
    <Site.Header>
      {/* Logo */}
      <a className="header-brand" href="/">
        <img src="/brand/catalogue.png" className="header-brand-img" alt="tabler logo" />
      </a>

      {/* User Menu */}
      <div className="d-flex order-lg-2 ml-auto">
        <Dropdown
          arrow
          arrowPosition="right"
          trigger={
            <Dropdown.Trigger arrow toggle={false}>
              <span href="#" className="nav-link pr-0 leading-none" data-toggle="dropdown">
                <span className="avatar" style={{ backgroundImage: "url(/faces/default.png)" }}></span>
                <span className="ml-2 d-none d-lg-block">
                  {auth?.sub === "anonymous" && (
                    <>
                      <span className="text-default">
                        <NavLink className="nav-link" to="/login">
                          Connexion
                        </NavLink>
                      </span>
                    </>
                  )}
                  {auth?.sub !== "anonymous" && (
                    <>
                      <span className="text-default">{auth.sub}</span>
                      <small className="text-muted d-block mt-1">Administrateur</small>
                    </>
                  )}
                </span>
              </span>
            </Dropdown.Trigger>
          }
          position="bottom"
          items={dropdownItems}
        />
      </div>
    </Site.Header>
  );
};

export default Header;
