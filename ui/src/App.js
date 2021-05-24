import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from "react-router-dom";
import useAuth from "./common/hooks/useAuth";
import { _post, _get } from "./common/httpClient";
import ScrollToTop from "./common/components/ScrollToTop";
import { QueryClient, QueryClientProvider } from "react-query";

// Route-based code splitting @see https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const ResetPasswordPage = lazy(() => import("./pages/password/ResetPasswordPage"));
const ForgottenPasswordPage = lazy(() => import("./pages/password/ForgottenPasswordPage"));
const Users = lazy(() => import("./pages/admin/Users"));
const ReconciliationParcoursup = lazy(() => import("./pages/reconciliation-parcoursup"));
const ReconciliationAffelnet = lazy(() => import("./pages/reconciliation-affelnet"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const NotFoundPage = lazy(() => import("./pages/404"));
const Catalogue = lazy(() => import("./pages/Catalogue/Catalogue"));
const Organismes = lazy(() => import("./pages/Organismes/Organismes"));
const Formation = lazy(() => import("./pages/Formation"));
const Etablissement = lazy(() => import("./pages/Etablissement"));
const Journal = lazy(() => import("./pages/Journal/Journal"));
const TagsHistory = lazy(() => import("./pages/admin/TagsHistory"));
const UploadFiles = lazy(() => import("./pages/admin/UploadFiles"));

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
          <Suspense fallback={<div></div>}>
            <ResetPasswordWrapper>
              <ScrollToTop />
              <Switch>
                {/* <PrivateRoute exact path="/stats">
                {auth && auth.permissions.isAdmin ? <DashboardPage /> : <HomePage />}
              </PrivateRoute> */}
                <Route exact path="/stats" component={DashboardPage} />
                {auth && auth.permissions.isAdmin && (
                  <PrivateRoute exact path="/admin/users">
                    <Users />
                  </PrivateRoute>
                )}
                <Route exact path="/" component={HomePage} />
                <Route exact path="/recherche/formations-2021" component={Catalogue} />
                <Route exact path="/recherche/etablissements" component={Organismes} />
                <Route exact path={`/formation/:id`} component={Formation} />
                <Route exact path={`/etablissement/:id`} component={Etablissement} />

                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/reset-password" component={ResetPasswordPage} />
                <Route exact path="/forgotten-password" component={ForgottenPasswordPage} />
                <Route exact path="/report" component={ReportPage} />
                <Route exact path="/couverture-parcoursup" component={ReconciliationParcoursup} />
                <Route exact path="/couverture-affelnet" component={ReconciliationAffelnet} />
                <Route exact path="/changelog" component={Journal} />

                {auth && auth.permissions.isAdmin && (
                  <PrivateRoute exact path="/tags-history">
                    <TagsHistory />
                  </PrivateRoute>
                )}

                {auth && auth.permissions.isAdmin && (
                  <PrivateRoute exact path="/admin/upload">
                    <UploadFiles />
                  </PrivateRoute>
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
