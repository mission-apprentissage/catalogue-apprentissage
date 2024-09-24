import { Routes, MemoryRouter, Route } from "react-router-dom";
import { render } from "@testing-library/react";
import { setupServer } from "msw/node";
import * as useAuth from "../hooks/useAuth";
import { rest } from "msw";

export const renderWithRouter = (ui, { route = "/", path = "/" } = { route: "/", path: "/" }) => {
  return {
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    ),
  };
};

export const grantAnonymousAccess = ({ acl, academie }) => {
  jest
    .spyOn(useAuth, "default")
    .mockImplementation(() => [{ username: "anonymous", roles: ["public"], acl, academie }, () => {}]);
};

// export const grantLecteurAccess = ({ acl, academie }) => {
//   jest
//     .spyOn(useAuth, "default")
//     .mockImplementation(() => [{ username: "lecteur", roles: ["lecteur"], acl, academie }, () => {}]);
// };

// export const grantInstructeurAccess = ({ acl, academie }) => {
//   jest
//     .spyOn(useAuth, "default")
//     .mockImplementation(() => [{ username: "instructeur", roles: ["instructeur"], acl, academie }, () => {}]);
// };

// export const grantAdminAccess = ({ acl, academie }) => {
//   jest
//     .spyOn(useAuth, "default")
//     .mockImplementation(() => [
//       { username: "admin", roles: ["admin"], acl, academie, permissions: { isAdmin: true } },
//       () => {},
//     ]);
// };

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
