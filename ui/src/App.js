import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from "react-router-dom";
import useAuth from "./common/hooks/useAuth";
import { _post, _get } from "./common/httpClient";
import ScrollToTop from "./common/components/ScrollToTop";
import { QueryClient, QueryClientProvider } from "react-query";
import { hasAccessTo } from "./common/utils/rolesUtils";

// Route-based code splitting @see https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const ResetPasswordPage = lazy(() => import("./pages/password/ResetPasswordPage"));
const ForgottenPasswordPage = lazy(() => import("./pages/password/ForgottenPasswordPage"));
const Users = lazy(() => import("./pages/admin/Users"));
const Roles = lazy(() => import("./pages/admin/Roles"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const NotFoundPage = lazy(() => import("./pages/404"));
const Catalogue = lazy(() => import("./pages/Catalogue/Catalogue"));
const Organismes = lazy(() => import("./pages/Organismes/Organismes"));
const Formation = lazy(() => import("./pages/Formation"));
const Etablissement = lazy(() => import("./pages/Etablissement"));
const Journal = lazy(() => import("./pages/Journal/Journal"));
const UploadFiles = lazy(() => import("./pages/admin/UploadFiles"));
const Alert = lazy(() => import("./pages/admin/Alert"));
const Contact = lazy(() => import("./pages/legal/Contact"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const DonneesPersonnelles = lazy(() => import("./pages/legal/DonneesPersonnelles"));
const MentionsLegales = lazy(() => import("./pages/legal/MentionsLegales"));
const Accessibilite = lazy(() => import("./pages/legal/Accessibilite"));
const ReconciliationPs = lazy(() => import("./pages/admin/ReconciliationPs/ReconciliationPs"));
const ActionsExpertes = lazy(() => import("./pages/ActionsExpertes/ActionsExpertes"));
const Perimetre = lazy(() => import("./pages/perimetre/Perimetre"));
const ConsolePilotageAffelnet = lazy(() => import("./pages/ConsolesPilotage/Affelnet"));
const ConsolePilotageParcoursup = lazy(() => import("./pages/ConsolesPilotage/Parcoursup"));

function PrivateRoute({ component, ...rest }) {
  let [auth] = useAuth();

  if (auth.sub !== "anonymous") {
    return <Route {...rest} component={component} />;
  }

  return (
    <Route
      {...rest}
      render={() => {
        return <Redirect to="/login" />;
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
        console.error(error);
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
          <Suspense fallback={<div></div>}>
            <ResetPasswordWrapper>
              <ScrollToTop />
              <Switch>
                <Route exact path="/stats" component={DashboardPage} />

                {auth && hasAccessTo(auth, "page_gestion_utilisateurs") && (
                  <PrivateRoute exact path="/admin/users" component={Users} />
                )}
                {auth && hasAccessTo(auth, "page_gestion_roles") && (
                  <PrivateRoute exact path="/admin/roles" component={Roles} />
                )}

                {auth && hasAccessTo(auth, "page_reconciliation_ps") && (
                  <PrivateRoute exact path="/couverture-ps" component={ReconciliationPs} />
                )}

                <Route exact path="/" component={HomePage} />
                <Route exact path="/recherche/formations" component={Catalogue} />
                <Route exact path="/guide-reglementaire">
                  <Catalogue guide />
                </Route>

                <Route exact path="/recherche/etablissements" component={Organismes} />
                <Route exact path={`/formation/:id`} component={Formation} />
                <Route exact path={`/etablissement/:id`} component={Etablissement} />

                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/reset-password" component={ResetPasswordPage} />
                <Route exact path="/forgotten-password" component={ForgottenPasswordPage} />
                <Route exact path="/report" component={ReportPage} />

                <Route exact path="/changelog" component={Journal} />
                <Route exact path="/contact" component={Contact} />
                <Route exact path="/cookies" component={Cookies} />
                <Route exact path="/donnees-personnelles" component={DonneesPersonnelles} />
                <Route exact path="/mentions-legales" component={MentionsLegales} />
                <Route exact path="/accessibilite" component={Accessibilite} />

                {auth && hasAccessTo(auth, "page_actions_expertes") && (
                  <PrivateRoute exact path="/mes-actions" component={ActionsExpertes} />
                )}
                {auth && hasAccessTo(auth, "page_actions_expertes") && (
                  <PrivateRoute exact path="/console-pilotage/parcoursup" component={ConsolePilotageParcoursup} />
                )}
                {auth && hasAccessTo(auth, "page_actions_expertes") && (
                  <PrivateRoute exact path="/console-pilotage/affelnet" component={ConsolePilotageAffelnet} />
                )}

                {auth && hasAccessTo(auth, "page_message_maintenance") && (
                  <PrivateRoute exact path="/admin/alert" component={Alert} />
                )}

                {auth && hasAccessTo(auth, "page_upload") && (
                  <PrivateRoute exact path="/admin/upload">
                    <UploadFiles />
                  </PrivateRoute>
                )}

                {auth && hasAccessTo(auth, "page_perimetre_ps") && (
                  <Route
                    exact
                    path="/perimetre-parcoursup"
                    render={(props) => <Perimetre {...props} plateforme="parcoursup" />}
                  />
                )}

                {auth && hasAccessTo(auth, "page_perimetre_af") && (
                  <Route
                    exact
                    path="/perimetre-affelnet"
                    render={(props) => <Perimetre {...props} plateforme="affelnet" />}
                  />
                )}

                <Route component={NotFoundPage} />
              </Switch>
            </ResetPasswordWrapper>
          </Suspense>
        </Router>
      </div>
    </QueryClientProvider>
  );
};
