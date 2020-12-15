import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Layout from "./pages/Layout";
import "tabler-react/dist/Tabler.css";
import DashboardPage from "./pages/DashboardPage";
import useAuth from "./common/hooks/useAuth";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/password/ResetPasswordPage";
import ForgottenPasswordPage from "./pages/password/ForgottenPasswordPage";
import Users from "./pages/admin/Users";
import PageReconciliation from "./pages/reconciliation";
import ReportPage from "./pages/ReportPage";
import { ChakraProvider } from "@chakra-ui/react";
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

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <div className="App">
          <Router>
            <Switch>
              <PrivateRoute exact path="/">
                <Layout>{auth && auth.permissions.isAdmin ? <DashboardPage /> : <HomePage />}</Layout>
              </PrivateRoute>
              {auth && auth.permissions.isAdmin && (
                <PrivateRoute exact path="/admin/users">
                  <Layout>
                    <Users />
                  </Layout>
                </PrivateRoute>
              )}
              <Route exact path="/login" component={LoginPage} />
              <Route exact path="/reset-password" component={ResetPasswordPage} />
              <Route exact path="/forgotten-password" component={ForgottenPasswordPage} />
              <Route exact path="/report" component={ReportPage} />
              <Route exact path="/coverage" component={PageReconciliation} />
            </Switch>
          </Router>
        </div>
      </ChakraProvider>
    </QueryClientProvider>
  );
};
