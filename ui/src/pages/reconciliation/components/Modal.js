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
import { _post } from "../../../common/httpClient";
import { Loading } from ".";

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
  etablissement: {
    margin: theme.spacing(3),
  },
}));

export default function TransitionsModal() {
  const classes = useStyles();
  const { handlePopup, popup, handlePopupSubmit } = React.useContext(Context);
  const [etablissement, setEtablissement] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState(false);
  const [values, setValues] = React.useState({
    uai: "",
    siret: "",
    type: "gestionnaire",
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (values.siret === "" || values.siret.length !== 14) {
      setErrors(true);
      return;
    }
    setLoading(true);
    const response = await _post("/api/coverage/etablissement", values);
    console.log(response);
    if (response) {
      setEtablissement(response);
      setLoading(false);
    }
  };

  console.log(values);

  const handleSubmit = () => handlePopupSubmit({ etablissement, type: values.type });

  const handleChange = (e) => {
    setErrors(false);
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
            <form className={classes.root} noValidate autoComplete="off" onSubmit={handleSearch}>
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
                    error={errors}
                    helperText={errors && "Siret obligatoire (14 chiffres)"}
                  />
                </Grid>
                <Grid item>
                  <Button type="submit" variant="contained" color="primary">
                    Rechercher
                  </Button>
                </Grid>
              </Grid>
              {loading && (
                <Grid className={classes.etablissement}>
                  <Loading height="10%" size="1em" />
                </Grid>
              )}
              {etablissement && (
                <Paper>
                  <Grid container className={classes.etablissement}>
                    <Grid item xs={12}>
                      <Typography variant="h6">Etablissement :</Typography>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="body2">{etablissement.entreprise_raison_sociale}</Typography>
                      <Typography variant="body2">{etablissement.adresse}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}
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
            <Button onClick={handlePopupSubmit} size="small" color="primary" variant="contained">
              Créer l'établissement
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Modal>
  );
}
