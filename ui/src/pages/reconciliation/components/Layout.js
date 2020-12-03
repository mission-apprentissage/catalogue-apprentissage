import React from "react";
import { Grid } from "@material-ui/core";

export default ({ children }) => (
  <Grid container direction="column" justify="center" alignItems="center">
    {children}
  </Grid>
);
