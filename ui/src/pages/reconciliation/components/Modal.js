import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Modal,
  Backdrop,
  Fade,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  TextField,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  FormLabel,
  RadioGroup,
  Paper,
} from "@material-ui/core";
import { Context } from "../context";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFormControl-root": {
      margin: theme.spacing(1),
    },
    "& .MuiCardActions-root": {
      justifyContent: "flex-end",
    },
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function TransitionsModal() {
  const classes = useStyles();
  const { handlePopup, popup } = React.useContext(Context);
  const [values, setValues] = React.useState({
    uai: "",
    siret: "",
    type: "gestionnaire",
  });

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  console.log(values);

  return (
    <Modal
      aria-labelledby="Ajouter un établissement"
      aria-describedby="Permet d'ajouter un établissement"
      className={classes.modal}
      open={popup}
      onClose={handlePopup}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={popup}>
        <Card className={classes.root}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Ajouter un établissement
            </Typography>
            <form className={classes.root} noValidate autoComplete="off">
              <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                <Grid item>
                  <TextField variant="outlined" name="uai" label="Uai" value={values.uai} onChange={handleChange} />
                  <TextField
                    variant="outlined"
                    name="siret"
                    label="Siret"
                    value={values.siret}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item>
                  <FormControl>
                    <FormLabel>Type d'établissement :</FormLabel>
                    <RadioGroup name="type" value={values.type} onChange={handleChange}>
                      <FormControlLabel value="gestionnaire" control={<Radio />} label="Gestionnaire" />
                      <FormControlLabel value="formateur" control={<Radio />} label="Formateur" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </CardContent>
          <CardActions>
            <Button onClick={() => handlePopup()} size="small" color="primary">
              Annuler
            </Button>
            <Button size="small" color="primary" variant="contained">
              Valider
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Modal>
  );
}
