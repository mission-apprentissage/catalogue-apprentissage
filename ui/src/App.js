import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import "tabler-react/dist/Tabler.css";
import DashboardPage from "./pages/DashboardPage";
import useAuth from "./common/hooks/useAuth";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/password/ResetPasswordPage";
import ForgottenPasswordPage from "./pages/password/ForgottenPasswordPage";
import Users from "./pages/admin/Users";
import PageReconciliation from "./pages/reconciliation";
import ReportPage from "./pages/ReportPage";
import NotFoundPage from "./pages/404";
import Search from "./pages/Search/Search";
import Formation from "./pages/Formation";
import Etablissement from "./pages/Etablissement";
import Journal from "./pages/Journal/Journal";
import HowToReglement from "./pages/HowToReglement";
import HowToModif from "./pages/HowToModif";
import { _post } from "./common/httpClient";
import ScrollToTop from "./common/components/ScrollToTop";
import Layout from "./pages/layout/Layout";

import { QueryClient, QueryClientProvider } from "react-query";

function PrivateRoute({ children, ...rest }) {
  let [auth] = useAuth();

  return (
    <Route
      {...rest}
      render={() => {
        return auth.sub !== "anonymous" ? children : <Redirect to="/login" />;
      }}
    />
  );
}

const queryClient = new QueryClient();

export default () => {
  let [auth] = useAuth();
  let history = useHistory();

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
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router>
          <ScrollToTop />
          <Switch>
            <PrivateRoute exact path="/admin">
              {auth && auth.permissions.isAdmin ? <DashboardPage /> : <HomePage />}
            </PrivateRoute>
            {auth && auth.permissions.isAdmin && (
              <PrivateRoute exact path="/admin/users">
                <Layout>
                  <Users />
                </Layout>
              </PrivateRoute>
            )}
            <Route exact path="/" component={HomePage} />
            <Route exact path="/recherche/formations-2020" component={Search} />
            <Route exact path="/recherche/formations-2021" component={Search} />
            <Route exact path="/recherche/etablissements" component={Search} />
            <Route exact path={`/formation/:id`} component={Formation} />
            <Route exact path={`/etablissement/:id`} component={Etablissement} />

            <Route exact path="/guide-reglementaire" component={HowToReglement} />
            <Route exact path="/guide-modification" component={HowToModif} />

            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/reset-password" component={ResetPasswordPage} />
            <Route exact path="/forgotten-password" component={ForgottenPasswordPage} />
            <Route exact path="/report" component={ReportPage} />
            <Route exact path="/coverage" component={PageReconciliation} />
            <Route exact path="/changelog" component={Journal} />

            <Route component={NotFoundPage} />
          </Switch>
        </Router>
      </div>
    </QueryClientProvider>
  );
};
