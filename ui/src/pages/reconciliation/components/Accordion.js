import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionActions from "@material-ui/core/AccordionActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Datatable from "./Datatable";
import AddIcon from "@material-ui/icons/Add";
import { Context } from "../context";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  card: {
    height: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    // color: theme.palette.text.secondary,
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
}));

export default (props) => {
  const classes = useStyles();
  const { data } = props;
  const { handlePopup } = React.useContext(Context);

  const sameUai = new Set([data.uai_affilie, data.uai_composante, data.uai_gestionnaire]).size === 1 ? true : false;
  const sameEtab = new Set([data.libelle_uai_affilie, data.libelle_uai_composante]).size === 1 ? true : false;

  return (
    <Accordion className={classes.root} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
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
            <>
              <Typography>Affilié : {data.uai_affilie}</Typography>
              <Typography>Composante : {data.uai_composante}</Typography>
              <Typography>Gestionnaire : {data.uai_gestionnaire}</Typography>
            </>
          )}
          <Typography className={classes.heading}>Code formation : {data.code_cfd}</Typography>
        </div>
        <div>
          <Typography className={classes.secondaryHeading}>{data.libelle_formation}</Typography>
          <Typography className={classes.secondaryHeading}>{data.libelle_specialite}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} alignItems="stretch">
          <DetailFormation data={data} sameEtab={sameEtab} sameUai={sameUai} />
        </Grid>
      </AccordionDetails>
      {/* <AccordionDetails> */}
      <Box m={2}>
        {data && data.matching_mna_etablissement.length > 0 && <Etablissement data={data.matching_mna_etablissement} />}
      </Box>
      {/* </AccordionDetails> */}
      <Divider />
      <AccordionActions>
        <Button color="primary" variant="outlined" startIcon={<AddIcon />} onClick={() => handlePopup()}>
          Nouvel établissement
        </Button>
        <Button variant="contained" color="primary">
          Valider
        </Button>
      </AccordionActions>
    </Accordion>
  );
};

const DetailFormation = ({ data, sameEtab, sameUai }) => {
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
};

const Etablissement = ({ data }) => {
  const columns = [
    {
      id: "",
      label: "Action",
      maxWidth: 40,
      align: "left",
    },
    {
      id: "matched_uai",
      label: "Matching",
      maxWidth: 40,
      align: "left",
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
      // minWidth: 10,
      align: "left",
    },
    {
      id: "naf_libelle",
      label: "Nature",
      // maxWidth: 10,
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
};
