import React from "react";
import { Box, Text, Heading, UnorderedList, ListItem, Link } from "@chakra-ui/react";
import { REPORT_TYPE } from "../../../constants/report";
import InfoTooltip from "../InfoTooltip";

const Summary = ({ data, reportType, errors, importReportRelatedData, onGoToClicked }) => {
  switch (reportType) {
    case REPORT_TYPE.RCO_IMPORT: {
      const { summary } = data;
      return (
        <>
          <Text fontSize={["epsilon", "gamma"]} mt={3}>
            Ce rapport présente l'état d'évolution de la base RCO-Formation d'un jour à l'autre.
          </Text>
          <Heading textStyle="h4" mt={5} fontWeight="500" as="h3" textDecoration="underline">
            Résumé de l'importation
          </Heading>
          <Box px={5} mt={3}>
            <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
              {summary.addedCount + summary.updatedCount + summary.deletedCount} opérations réalisées aujourd'hui
            </Heading>
            <UnorderedList listStylePosition="inside" mt={1}>
              <ListItem>
                <Text as="span" mr="3">
                  {summary.addedCount} Formation(s) ajoutée(s)
                </Text>
                <InfoTooltip
                  description={`Ces formations seront donc prises en compte dans le script de conversion.`}
                />
              </ListItem>
              <ListItem>
                <Text as="span" mr="3">
                  {summary.updatedCount} Formation(s) mise(s) à jour
                </Text>
                <InfoTooltip
                  description={`Ces formations seront donc prises en compte dans le script de conversion.`}
                />
              </ListItem>
              <ListItem>
                <Text as="span" mr="3">
                  {summary.deletedCount} Formation(s) supprimée(s){" "}
                </Text>
                <InfoTooltip
                  description={
                    "Les formations ont été supprimées d'Offre Info. Dans la base catalogue ces formations sont simplement désactivées afin de garder une historisation."
                  }
                />
              </ListItem>
            </UnorderedList>
            <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem" mt={1}>
              Données reçues du webservice RCO
            </Heading>
            <UnorderedList listStylePosition="inside" mt={1}>
              <ListItem>{summary.formationsJ1Count || 0} Formation(s) présentes hier</ListItem>
              <ListItem>{summary.formationsJCount} Formation(s) présentes aujourd'hui</ListItem>
            </UnorderedList>
          </Box>
          <Heading textStyle="h4" mt={5} fontWeight="500" as="h3" textDecoration="underline">
            État de la base de données des formations RCO
          </Heading>
          <Box px={5} mt={3}>
            <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
              Nombre total de formations présentes en base de données
            </Heading>
            <UnorderedList listStylePosition="inside" mt={1}>
              <ListItem>{summary.publishedCount} Formation(s) publiée(s)</ListItem>
              <ListItem>{summary.deactivatedCount} Formation(s) désactivée(s)</ListItem>
            </UnorderedList>
          </Box>
        </>
      );
    }

    case REPORT_TYPE.RCO_CONVERSION: {
      const { summary } = data;
      return (
        <>
          <Text fontSize={["epsilon", "gamma"]} mt={3}>
            Ce rapport présente l'état de conversion des formations au format RCO (webservice) vers le format MNA.
            <br />
            Des opérations de vérification de la données sont réalisées lors de la conversion.
            <br />
            <br />
            La conversion s'applique sur l'ensemble de la base des formations RCO actives;
            <br />
            C'est à dire également les formations en échec de conversion les jours précedents.
          </Text>
          <Heading textStyle="h4" mt={5} fontWeight="500" as="h3" textDecoration="underline">
            Résumé des conversions sur l'ensemble de la base de données
          </Heading>
          <Box px={5} mt={3}>
            <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
              Nombre total de formations converties
            </Heading>
            <UnorderedList listStylePosition="inside" mt={1}>
              <ListItem>{summary.convertedCount ?? 0} Formation(s) convertie(s)</ListItem>
              <ListItem>{summary.invalidCount ?? errors?.length} Formation(s) en échec de conversion</ListItem>
            </UnorderedList>
          </Box>
          {importReportRelatedData && (
            <>
              <Heading textStyle="h4" mt={5} fontWeight="500" as="h3" textDecoration="underline">
                Résumé des conversions sur les formations importées aujourd'hui
              </Heading>
              <Box px={5} mt={3}>
                <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
                  Rappel des résultats d'importation:
                </Heading>
                <Text fontSize="1.1rem" mt={3} ml={3}>
                  {importReportRelatedData.summary.addedCount + importReportRelatedData.summary.updatedCount} opérations
                  entrant dans le script de conversion
                </Text>
                <UnorderedList listStylePosition="inside" mt={1}>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.summary.addedCount} Formation(s) ajoutée(s)
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.summary.updatedCount} Formation(s) mise(s) à jour
                    </Text>
                  </ListItem>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.summary.deletedCount} Formation(s) supprimée(s)
                    </Text>
                  </ListItem>
                </UnorderedList>
              </Box>
              <Box px={5} mt={3}>
                <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
                  Répartition des {importReportRelatedData.summary.addedCount} formations ajoutée(s):
                </Heading>
                <UnorderedList listStylePosition="inside" mt={1}>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countAddedConverted} Formation(s) convertie(s)
                    </Text>
                    <InfoTooltip
                      description={`Ces formations seront donc prises en compte dans le script de mise à jour.`}
                    />
                  </ListItem>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countAddedErrored} Formation(s) en échec de conversion
                    </Text>
                  </ListItem>
                </UnorderedList>
              </Box>
              <Box px={5} mt={3}>
                <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
                  Répartition des {importReportRelatedData.summary.updatedCount} Formation(s) mise(s) à jour:
                </Heading>
                <UnorderedList listStylePosition="inside" mt={1}>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countUpdatedConverted} Formation(s) convertie(s)
                    </Text>
                    <InfoTooltip
                      description={`Ces formations seront donc prises en compte dans le script de mise à jour.`}
                    />
                  </ListItem>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countUpdatedErrored} Formation(s) en échec de conversion
                    </Text>
                  </ListItem>
                </UnorderedList>
              </Box>

              <Box px={5} mt={3}>
                <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
                  Répartition des {importReportRelatedData.summary.deletedCount} Formation(s) supprimée(s):
                </Heading>
                <UnorderedList listStylePosition="inside" mt={1}>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countDeletedConverted} Formation(s) convertie(s)
                    </Text>
                    <InfoTooltip
                      description={`Ces formations seront donc prises en compte dans le script de mise à jour.`}
                    />
                  </ListItem>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countDeletedErrored} Formation(s) en échec de conversion
                    </Text>
                  </ListItem>
                </UnorderedList>
              </Box>

              <Box px={5} mt={3}>
                <Heading textStyle="h4" fontWeight="500" as="h3" fontSize="1.3rem">
                  Répartition des{" "}
                  {importReportRelatedData.summary.addedCount +
                    importReportRelatedData.summary.updatedCount +
                    importReportRelatedData.summary.deletedCount}{" "}
                  opérations d'importation:
                </Heading>
                <UnorderedList listStylePosition="inside" mt={1}>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countAddedConverted +
                        importReportRelatedData.countUpdatedConverted +
                        importReportRelatedData.countDeletedConverted}{" "}
                      Formation(s) convertie(s)
                    </Text>
                    {importReportRelatedData.countAddedConverted +
                      importReportRelatedData.countUpdatedConverted +
                      importReportRelatedData.countDeletedConverted >
                      0 && (
                      <Link
                        color="pinklight.400"
                        fontStyle="italic"
                        onClick={() => {
                          onGoToClicked(1, "cle_ministere_educatif", importReportRelatedData.convertedIds);
                        }}
                      >
                        Voir les détails
                      </Link>
                    )}
                  </ListItem>
                  <ListItem>
                    <Text as="span" mr="3">
                      {importReportRelatedData.countAddedErrored +
                        importReportRelatedData.countUpdatedErrored +
                        importReportRelatedData.countDeletedErrored}{" "}
                      Formation(s) en échec de conversion
                    </Text>
                    {importReportRelatedData.countAddedErrored +
                      importReportRelatedData.countUpdatedErrored +
                      +importReportRelatedData.countDeletedErrored >
                      0 && (
                      <Link
                        color="pinklight.400"
                        fontStyle="italic"
                        onClick={() => {
                          onGoToClicked(2, "cle_ministere_educatif", importReportRelatedData.erroredIds);
                        }}
                      >
                        Voir les détails
                      </Link>
                    )}
                  </ListItem>
                </UnorderedList>
              </Box>
            </>
          )}
        </>
      );
    }

    case REPORT_TYPE.TRAININGS_UPDATE: {
      const {
        updaterReport: { summary },
        ...related
      } = data;
      return (
        <Text fontSize={["epsilon", "gamma"]}>
          Résumé des mises à jour :<br />
          <br />
          {summary.updatedCount ?? 0} Formation(s) mise(s) à jour
          {summary.notUpdatedCount > 0 && (
            <>
              <br />
              {summary.notUpdatedCount} Formation(s) déjà à jour
            </>
          )}
          <br />
          {summary.invalidCount ?? errors?.length} Formation(s) en échec de mise à jour
          <br />
          {related.addedConvertedUpdatedIds.length} Importé aujourd'hui (Ajoutée), Convertie et Enrichie
          <br />
          {related.addedConvertedErroredIds.length} Importé aujourd'hui (Ajoutée), Convertie, NON enrichie
          <br />
          {related.updatedConvertedUpdatedIds.length} Importé aujourd'hui (Mise à jour) , Convertie et Enrichie
          <br />
          {related.updatedConvertedErroredIds.length} Importé aujourd'hui (Mise à jour) , Convertie, NON enrichie
          <br />
          {related.restConvertedUpdatedIds.length} Anciennement importée, Convertie et Enrichie
          <br />
          {related.restConvertedErroredIds.length} Anciennement importée, Convertie, NON enrichie
        </Text>
      );
    }

    case REPORT_TYPE.PS_REJECT: {
      const { summary } = data;
      return (
        <Text fontSize={["epsilon", "gamma"]}>
          Résumé des rapprochements des bases Parcoursup et Carif-Oref :<br />
          {summary.countTotal ?? 0} Formation(s) Parcoursup
          <br />
          {summary.countAutomatique ?? 0} rapprochements Forts
          <br />
          {summary.countAVerifier ?? 0} rapprochements Faibles
          <br />
          {summary.countInconnu ?? 0} rapprochements Inconnus
          <br />
          {summary.countRejete ?? 0} rapprochements Rejetés
          <br />
          {summary.countValide ?? 0} rapprochements Validés
          <br />
        </Text>
      );
    }

    case REPORT_TYPE.METIER_GRAND_AGE: {
      const { summary } = data;
      return (
        <Text fontSize={["epsilon", "gamma"]}>
          Résumé rapport des métiers du grand-âge :<br />
          <ul>
            <li>{summary.count} Formation(s) ajoutée(s) aujourd'hui</li>
            <li>
              {summary.count40033003} Formation(s) CFD: 40033003
              <br />
              Baccalauréat professionnel | Accompagnement soins et services à la personne option A - à domicile
            </li>
            <li>
              {summary.count01033001} Formation(s) CFD: 01033001
              <br />
              Mention complémentaire de niveau 3 | Aide à domicile
            </li>
            <li>
              {summary.count50033205} Formation(s) CFD: 50033205
              <br />
              Certificat d'aptitude professionnelle | Accompagnant éducatif petite enfance
            </li>
            <li>
              {summary.count40033004} Formation(s) CFD: 40033004
              <br />
              Baccalauréat professionnel | Accompagnement soins et services à la personne option B - en structure
            </li>
            <li>
              {" "}
              {summary.count40033006} Formation(s) CFD: 40033006
              <br />
              {summary.count40033002} Formation(s) CFD: 40033002
              <br />
              Baccalauréat professionnel | Animation - enfance et personnes âgées
            </li>
            <li>
              {summary.count50033411} Formation(s) CFD: 50033411
              <br />
              Certificat d'aptitude professionnelle | Assistant technique en milieux familial et collectif
            </li>
          </ul>
          <Link
            color="pinklight.400"
            fontStyle="italic"
            href="https://catalogue.apprentissage.education.gouv.fr/metabase/public/question/3ca6e33a-1720-4465-b6f4-acf7c25236c0"
            isExternal
          >
            Voir l'ensemble des formations
          </Link>
          <Link
            color="pinklight.400"
            fontStyle="italic"
            href="https://catalogue.apprentissage.education.gouv.fr/metabase/public/question/c0bf84e2-66f4-4640-833f-ef70cda69805"
            isExternal
          >
            Voir l'ensemble des organismes
          </Link>
        </Text>
      );
    }

    default:
      console.warn("unexpected report type", reportType);
      return <></>;
  }
};

export { Summary };
