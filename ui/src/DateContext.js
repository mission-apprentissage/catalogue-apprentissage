import { createContext } from "react";

export const DateContext = createContext({
  campagneStartDate: null,
  sessionStartDate: null,
  sessionEndDate: null,
});
