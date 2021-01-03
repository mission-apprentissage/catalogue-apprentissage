import React from "react";
import { NavLink } from "react-router-dom";
import { Site } from "tabler-react";

const NavigationMenu = () => {
  return (
    <Site.Nav>
      <div className="header collapse d-lg-flex p-0" id="headerMenuCollapse">
        <div className="container">
          <div className="row row align-items-center">
            <div className="col-lg-3 ml-auto"></div>
            <div className="col col-lg order-lg-first">
              <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/" exact={true} activeClassName="active">
                    <i className="fe fe-home"></i> Accueil
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/recherche/formations-2021" activeClassName="active">
                    <i className="fe fe-box"></i> Formations 2021
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/recherche/formations-2020" activeClassName="active">
                    <i className="fe fe-box"></i> Formations 2020
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/recherche/etablissements" activeClassName="active">
                    <i className="fe fe-box"></i> Établissements
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Site.Nav>
  );
};

export default NavigationMenu;
