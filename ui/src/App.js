import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import useAuth from "./common/hooks/useAuth";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/password/ResetPasswordPage";
import ForgottenPasswordPage from "./pages/password/ForgottenPasswordPage";
import Users from "./pages/admin/Users";
import ReconciliationParcoursup from "./pages/reconciliation-parcoursup";
import ReconciliationAffelnet from "./pages/reconciliation-affelnet";
import ReportPage from "./pages/ReportPage";
import NotFoundPage from "./pages/404";
import Search from "./pages/Search/Search";
import Formation from "./pages/Formation";
import Etablissement from "./pages/Etablissement";
import Journal from "./pages/Journal/Journal";
import HowToReglement from "./pages/HowToReglement";
import HowToModif from "./pages/HowToModif";
import HowToSignal from "./pages/HowToSignal";
import { _post, _get } from "./common/httpClient";
import ScrollToTop from "./common/components/ScrollToTop";

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

const ResetPasswordWrapper = ({ children }) => {
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

  return <>{children}</>;
};

const queryClient = new QueryClient();

export default () => {
  let [auth, setAuth] = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        let user = await _get("/api/auth/current-session");

        if (user) {
          setAuth(user);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <div />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router>
          <ResetPasswordWrapper>
            <ScrollToTop />
            <Switch>
              <PrivateRoute exact path="/stats">
                {auth && auth.permissions.isAdmin ? <DashboardPage /> : <HomePage />}
              </PrivateRoute>
              {auth && auth.permissions.isAdmin && <PrivateRoute exact path="/admin/users" component={Users} />}
              <Route exact path="/" component={HomePage} />
              {/* <Route exact path="/recherche/formations-2020" component={Search} /> */}
              <Route exact path="/recherche/formations-2021" component={Search} />
              <Route exact path="/recherche/etablissements" component={Search} />
              <Route exact path={`/formation/:id`} component={Formation} />
              <Route exact path={`/etablissement/:id`} component={Etablissement} />

              <Route exact path="/guide-reglementaire" component={HowToReglement} />
              <Route exact path="/guide-modification" component={HowToModif} />
              <Route exact path="/guide-signalements" component={HowToSignal} />

              <Route exact path="/login" component={LoginPage} />
              <Route exact path="/reset-password" component={ResetPasswordPage} />
              <Route exact path="/forgotten-password" component={ForgottenPasswordPage} />
              <Route exact path="/report" component={ReportPage} />
              <Route exact path="/couverture-parcoursup" component={ReconciliationParcoursup} />
              <Route exact path="/couverture-affelnet" component={ReconciliationAffelnet} />
              <Route exact path="/changelog" component={Journal} />

              <Route component={NotFoundPage} />
            </Switch>
          </ResetPasswordWrapper>
        </Router>
      </div>
    </QueryClientProvider>
  );
};
