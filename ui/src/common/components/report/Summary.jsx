import React from "react";
import { Text } from "@chakra-ui/react";
import { REPORT_TYPE } from "../../../constants/report";

const Summary = ({ data, reportType, errors }) => {
  const { summary } = data;

  switch (reportType) {
    case REPORT_TYPE.RCO_CONVERSION:
      return (
        <Text fontSize={["epsilon", "gamma"]}>
          Résumé des conversions de la base RCO vers la base MNA :<br />
          <br />
          {summary.convertedCount ?? 0} Formation(s) convertie(s)
          <br />
          {summary.invalidCount ?? errors?.length} Formation(s) en échec de conversion
        </Text>
      );

    case REPORT_TYPE.TRAININGS_UPDATE:
      return (
        <Text fontSize={["epsilon", "gamma"]}>
          Résumé des mises à jour :<br />
          <br />
          {summary.updatedCount ?? 0} Formation(s) mise(s) à jour
          <br />
          {summary.notUpdatedCount ?? 0} Formation(s) déjà à jour
          <br />
          {summary.invalidCount ?? errors?.length} Formation(s) en échec de mise à jour
        </Text>
      );

    case REPORT_TYPE.RCO_IMPORT:
      return (
        <Text fontSize={["epsilon", "gamma"]}>
          Résumé de l'importation :<br />
          <br />
          Données reçues du webservice RCO :<br />
          {summary.formationsJ1Count} Formation(s) J-1
          <br />
          {summary.formationsJCount} Formation(s) J<br />
          <br />
          Résultat de l'import :<br />
          {summary.addedCount} Formation(s) ajoutée(s)
          <br />
          {summary.updatedCount} Formation(s) mise(s) à jour
          <br />
          {summary.deletedCount} Formation(s) supprimée(s)
          <br />
          <br />
          État de la base de données de formations RCO :<br />
          {summary.publishedCount} Formation(s) publiée(s)
          <br />
          {summary.deactivatedCount} Formation(s) désactivée(s)
          <br />
        </Text>
      );

    default:
      console.warn("unexpected report type", reportType);
      return <></>;
  }
};

export { Summary };
