import React, { Suspense, lazy, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes, useNavigate, Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import ScrollToTop from "./common/components/ScrollToTop";
import useAuth from "./common/hooks/useAuth";
import { _get, _post } from "./common/httpClient";
import { hasAccessTo, hasOnlyOneAcademyRight } from "./common/utils/rolesUtils";
import { DateContext } from "./DateContext";
import { academies } from "./constants/academies";

// Route-based code splitting @see https://reactjs.org/docs/code-splitting.html#route-based-code-splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
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

function RequireAuth({ children }) {
  let [auth] = useAuth();

  const isAuthenticated = auth && auth.sub !== "anonymous";

  return isAuthenticated ? children : <Navigate to={"/login"} />;
}

const ResetPasswordWrapper = ({ children }) => {
  const [auth] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function run() {
      if (auth.sub !== "anonymous") {
        if (auth.account_status === "FORCE_RESET_PASSWORD") {
          let { token } = await _post("/api/password/forgotten-password?noEmail=true", { username: auth.sub });
          navigate(`/reset-password?passwordToken=${token}`);
        }
      }
    }
    run();
  }, [auth, navigate]);

  return <>{children}</>;
};

const queryClient = new QueryClient();

const Root = () => {
  const [auth, setAuth] = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [dates, setDates] = useState({ campagneStartDate: null, sessionStartDate: null, sessionEndDate: null });

  useEffect(() => {
    async function getUser() {
      try {
        let user = await _get("/api/auth/current-session");
        let dates = await _get("/api/constants/dates");

        if (dates) {
          setDates({
            campagneStartDate: new Date(dates.campagneStartDate),
            sessionStartDate: new Date(dates.sessionStartDate),
            sessionEndDate: new Date(dates.sessionEndDate),
          });

          console.log({
            campagneStartDate: new Date(dates.campagneStartDate),
            sessionStartDate: new Date(dates.sessionStartDate),
            sessionEndDate: new Date(dates.sessionEndDate),
          });
        }

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

  let suffixCatalogue = "?";
  if (hasAccessTo(auth, "page_catalogue/voir_filtres_ps") && !hasAccessTo(auth, "page_catalogue/voir_filtres_aff")) {
    suffixCatalogue += `parcoursup_perimetre=%5B"Oui"%5D`;
  } else if (
    hasAccessTo(auth, "page_catalogue/voir_filtres_aff") &&
    !hasAccessTo(auth, "page_catalogue/voir_filtres_ps")
  ) {
    suffixCatalogue += `affelnet_perimetre=%5B"Oui"%5D`;
  }

  if (hasOnlyOneAcademyRight(auth)) {
    suffixCatalogue += `&nom_academie=%5B"${academies[auth.academie]?.nom_academie}"%5D`;
  }

  if (isLoading) {
    return <div />;
  }

  return (
    <DateContext.Provider value={dates}>
      <Suspense fallback={<div></div>}>
        <ResetPasswordWrapper>
          <ScrollToTop />
          <Routes>
            {/* Authentification */}
            <Route path="/login" element={<LoginPage />} />

            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/forgotten-password" element={<ForgottenPasswordPage />} />

            {/* Administration */}
            {auth && hasAccessTo(auth, "page_gestion_utilisateurs") ? (
              <Route
                path="/admin/users"
                element={
                  <RequireAuth>
                    <Users />
                  </RequireAuth>
                }
              ></Route>
            ) : (
              <React.Fragment />
            )}

            {auth && hasAccessTo(auth, "page_gestion_roles") ? (
              <Route
                path="/admin/roles"
                element={
                  <RequireAuth>
                    <Roles />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {auth && hasAccessTo(auth, "page_message_maintenance") ? (
              <Route
                path="/admin/alert"
                element={
                  <RequireAuth>
                    <Alert />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {auth && hasAccessTo(auth, "page_upload") ? (
              <Route
                path="/admin/upload"
                element={
                  <RequireAuth>
                    <UploadFiles />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            <Route
              path="/"
              element={
                <RequireAuth>
                  <Navigate to={`/recherche/formations${suffixCatalogue}`} />
                  {/* <HomePage /> */}
                </RequireAuth>
              }
            />

            {/* Formations */}
            <Route
              path="/recherche/formations"
              element={
                <RequireAuth>
                  <Catalogue />
                </RequireAuth>
              }
            />

            <Route
              path={`/formation/:id`}
              element={
                <RequireAuth>
                  <Formation />
                </RequireAuth>
              }
            />

            {/* Organismes */}
            <Route
              path="/recherche/etablissements"
              element={
                <RequireAuth>
                  <Organismes />
                </RequireAuth>
              }
            />

            <Route
              path={`/etablissement/:id`}
              element={
                <RequireAuth>
                  <Etablissement />
                </RequireAuth>
              }
            />

            {/* Consoles de pilotage */}
            {auth &&
            (hasAccessTo(auth, "page_console") ||
              hasAccessTo(auth, "page_console/parcoursup") ||
              hasAccessTo(auth, "page_console/affelnet")) ? (
              <Route
                path="/consoles-pilotage"
                element={
                  <RequireAuth>
                    <ConsolesPilotage />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {auth && hasAccessTo(auth, "page_console/parcoursup") ? (
              <Route
                path="/consoles-pilotage/parcoursup"
                element={
                  <RequireAuth>
                    <ConsolesPilotageParcoursup />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {auth && hasAccessTo(auth, "page_console/affelnet") ? (
              <Route
                path="/consoles-pilotage/affelnet"
                element={
                  <RequireAuth>
                    <ConsolesPilotageAffelnet />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {/* Règles de périmètre */}
            {auth &&
            (hasAccessTo(auth, "page_perimetre") ||
              hasAccessTo(auth, "page_perimetre/parcoursup") ||
              hasAccessTo(auth, "page_perimetre/affelnet")) ? (
              <Route
                path="/regles-perimetre"
                element={
                  <RequireAuth>
                    <ReglesPerimetre />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {auth && hasAccessTo(auth, "page_perimetre/parcoursup") ? (
              <Route
                path="/regles-perimetre/parcoursup"
                element={
                  <RequireAuth>
                    <ReglesPerimetrePlateforme plateforme="parcoursup" />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {auth && hasAccessTo(auth, "page_perimetre/affelnet") ? (
              <Route
                path="/regles-perimetre/affelnet"
                element={
                  <RequireAuth>
                    <ReglesPerimetrePlateforme plateforme="affelnet" />
                  </RequireAuth>
                }
              />
            ) : (
              <React.Fragment />
            )}

            {/* Statistiques */}
            {/* <Route  path="/stats"><DashboardPage /></Route> */}

            {/* Autres pages */}
            <Route
              path="/guide-reglementaire"
              element={
                <RequireAuth>
                  <Catalogue guide />
                </RequireAuth>
              }
            />
            <Route
              path="/changelog"
              element={
                <RequireAuth>
                  <Journal />
                </RequireAuth>
              }
            />
            <Route
              path="/contact"
              element={
                <RequireAuth>
                  <Contact />
                </RequireAuth>
              }
            />
            <Route
              path="/cookies"
              element={
                <RequireAuth>
                  <Cookies />
                </RequireAuth>
              }
            />
            <Route
              path="/donnees-personnelles"
              element={
                <RequireAuth>
                  <DonneesPersonnelles />
                </RequireAuth>
              }
            />
            <Route
              path="/mentions-legales"
              element={
                <RequireAuth>
                  <MentionsLegales />
                </RequireAuth>
              }
            />
            <Route
              path="/accessibilite"
              element={
                <RequireAuth>
                  <Accessibilite />
                </RequireAuth>
              }
            />

            {/* Erreur */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <NotFoundPage />
                </RequireAuth>
              }
            />
          </Routes>
        </ResetPasswordWrapper>
      </Suspense>
    </DateContext.Provider>
  );
};

const router = createBrowserRouter([{ path: "*", Component: Root }]);

export default () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  );
};
