import React, { Suspense, lazy, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Redirect, Route, BrowserRouter as Router, Switch, useHistory } from "react-router-dom";
import ScrollToTop from "./common/components/ScrollToTop";
import useAuth from "./common/hooks/useAuth";
import { _get, _post } from "./common/httpClient";
import { hasAccessTo } from "./common/utils/rolesUtils";

// Route-based code splitting @see https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
// const DashboardPage = lazy(() => import("./pages/Dashboard"));
const ResetPasswordPage = lazy(() => import("./pages/password/ResetPasswordPage"));
const ForgottenPasswordPage = lazy(() => import("./pages/password/ForgottenPasswordPage"));
const Users = lazy(() => import("./pages/admin/Users"));
const Roles = lazy(() => import("./pages/admin/Roles"));
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
const ReglesPerimetre = lazy(() => import("./pages/ReglesPerimetre/ReglesPerimetre"));
const ReglesPerimetrePlateforme = lazy(() => import("./pages/ReglesPerimetre/Plateforme"));
const ConsolesPilotage = lazy(() => import("./pages/ConsolesPilotage"));
const ConsolesPilotageAffelnet = lazy(() => import("./pages/ConsolesPilotage/Affelnet"));
const ConsolesPilotageParcoursup = lazy(() => import("./pages/ConsolesPilotage/Parcoursup"));

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
                {/* Authentification */}
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/reset-password" component={ResetPasswordPage} />
                <Route exact path="/forgotten-password" component={ForgottenPasswordPage} />

                {/* Administration */}
                {auth && hasAccessTo(auth, "page_gestion_utilisateurs") && (
                  <PrivateRoute exact path="/admin/users" component={Users} />
                )}
                {auth && hasAccessTo(auth, "page_gestion_roles") && (
                  <PrivateRoute exact path="/admin/roles" component={Roles} />
                )}
                {auth && hasAccessTo(auth, "page_message_maintenance") && (
                  <PrivateRoute exact path="/admin/alert" component={Alert} />
                )}

                {auth && hasAccessTo(auth, "page_upload") && (
                  <PrivateRoute exact path="/admin/upload">
                    <UploadFiles />
                  </PrivateRoute>
                )}

                {/* Formations */}
                <PrivateRoute exact path="/" component={HomePage} />
                <PrivateRoute exact path="/recherche/formations" component={Catalogue} />
                <PrivateRoute exact path={`/formation/:id`} component={Formation} />

                {/* Organismes */}
                <PrivateRoute exact path="/recherche/etablissements" component={Organismes} />
                <PrivateRoute exact path={`/etablissement/:id`} component={Etablissement} />

                {/* Consoles de pilotage */}
                {auth &&
                  (hasAccessTo(auth, "page_console") ||
                    hasAccessTo(auth, "page_console/parcoursup") ||
                    hasAccessTo(auth, "page_console/affelnet")) && (
                    <PrivateRoute exact path="/consoles-pilotage" component={ConsolesPilotage} />
                  )}

                {auth && hasAccessTo(auth, "page_console/parcoursup") && (
                  <PrivateRoute exact path="/consoles-pilotage/parcoursup" component={ConsolesPilotageParcoursup} />
                )}

                {auth && hasAccessTo(auth, "page_console/affelnet") && (
                  <PrivateRoute exact path="/consoles-pilotage/affelnet" component={ConsolesPilotageAffelnet} />
                )}

                {/* Règles de périmètre */}
                {auth &&
                  (hasAccessTo(auth, "page_perimetre") ||
                    hasAccessTo(auth, "page_perimetre/parcoursup") ||
                    hasAccessTo(auth, "page_perimetre/affelnet")) && (
                    <PrivateRoute exact path="/regles-perimetre" component={ReglesPerimetre} />
                  )}

                {auth && hasAccessTo(auth, "page_perimetre/parcoursup") && (
                  <PrivateRoute
                    exact
                    path="/regles-perimetre/parcoursup"
                    render={(props) => <ReglesPerimetrePlateforme {...props} plateforme="parcoursup" />}
                  />
                )}

                {auth && hasAccessTo(auth, "page_perimetre/affelnet") && (
                  <PrivateRoute
                    exact
                    path="/regles-perimetre/affelnet"
                    render={(props) => <ReglesPerimetrePlateforme {...props} plateforme="affelnet" />}
                  />
                )}

                {/* Statistiques */}
                {/* <PrivateRoute exact path="/stats" component={DashboardPage} /> */}

                {/* Autres pages */}
                <PrivateRoute exact path="/guide-reglementaire">
                  <Catalogue guide />
                </PrivateRoute>
                <PrivateRoute exact path="/changelog" component={Journal} />
                <PrivateRoute exact path="/contact" component={Contact} />
                <PrivateRoute exact path="/cookies" component={Cookies} />
                <PrivateRoute exact path="/donnees-personnelles" component={DonneesPersonnelles} />
                <PrivateRoute exact path="/mentions-legales" component={MentionsLegales} />
                <PrivateRoute exact path="/accessibilite" component={Accessibilite} />

                {/* Erreur */}
                <PrivateRoute component={NotFoundPage} />
              </Switch>
            </ResetPasswordWrapper>
          </Suspense>
        </Router>
      </div>
    </QueryClientProvider>
  );
};
