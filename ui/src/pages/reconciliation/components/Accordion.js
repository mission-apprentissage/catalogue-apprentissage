/**
 * TODO :
 * Ajouter information manquante
 * CRUD backoffice mise à jour de la psformation
 * Récupérer le libelle CFD BCN
 * Mettre la dropdown d'action sur les établissements
 * Mettre le flag de la formation à vérifier (save state)
 */

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Accordion,
  AccordionSummary,
  AccordionActions,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from "@material-ui/core";

import { ExpandMore, Add } from "@material-ui/icons";

import Datatable from "./Datatable";
import { Context } from "../context";
import { blueGrey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  card: {
    height: "100%",
    backgroundColor: blueGrey["200"],
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  column: {
    flexBasis: "33.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default (props) => {
  const classes = useStyles();
  const { data } = props;
  const { handlePopup, mapping } = React.useContext(Context);

  const sameUai = new Set([data.uai_affilie, data.uai_composante, data.uai_gestionnaire]).size === 1 ? true : false;
  const sameEtab = new Set([data.libelle_uai_affilie, data.libelle_uai_composante]).size === 1 ? true : false;

  return (
    <Accordion className={classes.root}>
      <EnteteFormation data={data} sameUai={sameUai} />
      <AccordionDetails>
        <Grid container spacing={2} alignItems="stretch">
          <DetailFormation data={data} sameEtab={sameEtab} sameUai={sameUai} />
        </Grid>
      </AccordionDetails>
      <Box m={2}>
        {data && data.matching_mna_etablissement.length > 0 && <Etablissement data={data.matching_mna_etablissement} />}
      </Box>
      <Divider />
      <AccordionActions>
        <Button color="primary" variant="outlined" startIcon={<Add />} onClick={() => handlePopup()}>
          Nouvel établissement
        </Button>
        <Button variant="contained" color="primary">
          Valider
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

const EnteteFormation = React.memo(({ data, sameUai }) => {
  const classes = useStyles();
  return (
    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1a-content" id="panel1a-header">
      <FormControlLabel
        aria-label="Acknowledge"
        onClick={(event) => event.stopPropagation()}
        onFocus={(event) => event.stopPropagation()}
        control={<Checkbox />}
        label=""
      />
      <div className={classes.column}>
        <Typography className={classes.heading}>{data.libelle_uai_affilie}</Typography>
        {sameUai ? (
          <Typography>UAI : {data.uai_affilie}</Typography>
        ) : (
          <Typography>
            <Typography>Affilié : {data.uai_affilie}</Typography>
            <Typography>Composante : {data.uai_composante}</Typography>
            <Typography>Gestionnaire : {data.uai_gestionnaire}</Typography>
          </Typography>
        )}
        <Typography className={classes.heading}>Code formation : {data.code_cfd}</Typography>
      </div>
      <div>
        <Typography className={classes.secondaryHeading}>{data.libelle_formation}</Typography>
        <Typography className={classes.secondaryHeading}>{data.libelle_specialite}</Typography>
        <Typography className={classes.secondaryHeading}>
          {data.libelle_commune} - {data.code_postal}
        </Typography>
      </div>
    </AccordionSummary>
  );
});

const DetailFormation = React.memo(({ data, sameEtab, sameUai }) => {
  const classes = useStyles();
  return (
    <>
      <Grid item xs={3}>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.details} color="textSecondary" gutterBottom>
              Unité administrative immatriculée
            </Typography>
            {sameUai ? (
              <Typography>{data.uai_affilie}</Typography>
            ) : (
              <>
                <Typography>Affilié : {data.uai_affilie}</Typography>
                <Typography>Composante : {data.uai_composante}</Typography>
                <Typography>Gestionnaire : {data.uai_gestionnaire}</Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.details} color="textSecondary" gutterBottom>
              Code formation diplôme
            </Typography>
            <Typography>CFD : {data.code_cfd}</Typography>
            <Typography>Libellé long BCN</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.details} color="textSecondary" gutterBottom>
              Etablissements
            </Typography>
            {sameEtab ? (
              <Typography>{data.libelle_uai_affilie}</Typography>
            ) : (
              <>
                <Typography>Affilié : {data.libelle_uai_affilie}</Typography>
                <Typography>Composante : {data.libelle_uai_composante}</Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.details} color="textSecondary" gutterBottom>
              Lieu de formation
            </Typography>
            <Typography>{data.libelle_commune}</Typography>
            <Typography>{data.code_postal}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
});

const Option = (props) => {
  const classes = useStyles();
  const { updateMapping } = React.useContext(Context);

  const handleChange = (e) => updateMapping({ type: e.target.value, id: props.id });

  return (
    <FormControl className={classes.formControl}>
      <Select
        variant="outlined"
        // value={age}
        onChange={handleChange}
        displayEmpty
        className={classes.selectEmpty}
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value="" disabled>
          <em>Options :</em>
        </MenuItem>
        <MenuItem value="gestionnaire">Gestionnaire</MenuItem>
        <MenuItem value="formateur">Formateur</MenuItem>
        <MenuItem value="formateur-gestionnaire">Formateur & Gestionnaire</MenuItem>
        <MenuItem disabled>
          <Divider />
        </MenuItem>
        <MenuItem value="supprimer">Supprimer</MenuItem>
      </Select>
    </FormControl>
  );
};

const Etablissement = React.memo(({ data }) => {
  const columns = [
    {
      id: "id_mna_etablissement",
      label: "Action",
      maxWidth: 40,
      align: "left",
      format: (value) => <Option id={value} />,
    },
    {
      id: "matched_uai",
      label: "Matching",
      maxWidth: 40,
      align: "left",
      format: (value) => {
        switch (value) {
          case "UAI_FORMATION":
            return <Chip label={value} color="primary" />;

          case "UAI_FORMATEUR":
            return <Chip label={value} />;

          case "UAI_GESTIONNAIRE":
            return <Chip label={value} color="secondary" />;

          default:
            break;
        }
      },
    },
    {
      id: "uai",
      label: "Uai",
      maxWidth: 40,
      align: "left",
    },
    {
      id: "siret",
      label: "Siret",
      maxWidth: 70,
      align: "left",
    },
    {
      id: "raison_sociale",
      label: "Raison Social",
      maxWidth: 500,
      align: "left",
      // format: (value) => (value ? <CheckCircle color="primary" /> : <Cancel color="secondary" />),
    },
    {
      id: "enseigne",
      label: "Enseigne",
      maxWidth: 100,
      align: "left",
    },
    {
      id: "adresse",
      label: "Adresse",
      maxWidth: 500,
      align: "left",
    },
    {
      id: "naf_libelle",
      label: "Nature",
      maxWidth: 100,
      align: "left",
    },
    {
      id: "siege_social",
      label: "Siège social",
      maxWidth: 10,
      align: "center",
      format: (value) => (value === true ? "Oui" : "Non"),
    },
  ];

  return <Datatable headers={columns} data={data} title="Liste des établissements :" />;
});
