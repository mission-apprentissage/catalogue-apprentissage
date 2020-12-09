import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function CircularIndeterminate(props) {
  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: props.height ? props.height : "100vh",
    },
  }));
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress size={props.size ? props.size : "4em"} />
    </div>
  );
}
