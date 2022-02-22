import { BrowserRouter } from "react-router-dom";
import { render } from "@testing-library/react";

import * as useAuth from "../hooks/useAuth";

// test utils file
export const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);

  return render(ui, { wrapper: BrowserRouter });
};

export const grantAnonymousAccess = ({ acl, academie }) => {
  jest
    .spyOn(useAuth, "default")
    .mockImplementation(() => [{ username: "anonymous", roles: ["public"], acl, academie }, () => {}]);
};
