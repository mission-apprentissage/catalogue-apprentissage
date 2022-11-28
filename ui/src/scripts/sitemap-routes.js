import React from "react";
import { Route } from "react-router-dom";

export default (
  <Route>
    <Route exact path="/stats" />

    <Route exact path="/" />
    <Route exact path="/recherche/formations" />
    <Route exact path="/guide-reglementaire" />
    <Route exact path="/recherche/etablissements" />
    <Route exact path={`/formation/:id`} />
    <Route exact path={`/etablissement/:id`} />

    <Route exact path="/login" />
    <Route exact path="/reset-password" />
    <Route exact path="/forgotten-password" />
    <Route exact path="/report" />
    <Route exact path="/changelog" />

    <Route exact path="/mes-actions" />
    <Route exact path="/perimetre-parcoursup" />
    <Route exact path="/perimetre-affelnet" />

    <Route exact path="/contact" />
    <Route exact path="/cookies" />
    <Route exact path="/donnees-personnelles" />
    <Route exact path="/mentions-legales" />
    <Route exact path="/accessibilite" />
  </Route>
);
