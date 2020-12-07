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
              <Grid container justify="center" alignItems="center" spacing={1}>
                <Grid item xs>
                  <TextField variant="outlined" name="uai" label="Uai" value={values.uai} onChange={handleChange} />
                </Grid>
                <Grid item xs>
                  <TextField
                    variant="outlined"
                    name="siret"
                    label="Siret"
                    value={values.siret}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary">
                    Rechercher
                  </Button>
                </Grid>
              </Grid>
              <FormControl>
                <FormLabel>Sélectionner le type d'établissement :</FormLabel>
                <RadioGroup name="type" value={values.type} onChange={handleChange}>
                  <Grid container alignContent="space-around">
                    <Grid item xs>
                      <FormControlLabel value="gestionnaire" control={<Radio />} label="Gestionnaire" />
                    </Grid>
                    <Grid item xs>
                      <FormControlLabel value="formateur" control={<Radio />} label="Formateur" />
                    </Grid>
                    <Grid item xs>
                      <FormControlLabel
                        value="formateur-gestionnaire"
                        control={<Radio />}
                        label="Formateur et gestionnaire"
                      />
                    </Grid>
                  </Grid>
                </RadioGroup>
              </FormControl>
            </form>
          </CardContent>
          <CardActions>
            <Button onClick={() => handlePopup()} size="small" color="primary">
              Annuler
            </Button>
            <Button size="small" color="primary" variant="contained">
              Créer l'établissement
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Modal>
  );
}
