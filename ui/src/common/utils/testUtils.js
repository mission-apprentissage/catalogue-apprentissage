import { BrowserRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { setupServer } from "msw/node";
import * as useAuth from "../hooks/useAuth";
import { rest } from "msw";

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

export const setupMswServer = (...args) => {
  return setupServer(
    ...args,
    rest.get(/\/*/, (req, res, ctx) => {
      console.warn("GET Unhandled request : " + req.url.pathname);
      return res(ctx.json({}));
    }),

    rest.post(/\/*/, (req, res, ctx) => {
      console.warn("POST Unhandled request : " + req.url.pathname);
      return res(ctx.json({}));
    })
  );
};
