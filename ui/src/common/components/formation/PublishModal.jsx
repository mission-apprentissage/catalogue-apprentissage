import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { StatusBadge } from "../StatusBadge";
import { Form, useFormik } from "formik";
import useAuth from "../../hooks/useAuth";
import * as Yup from "yup";
import { ArrowRightLine, Close } from "../../../theme/components/icons";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";
import { updateFormation } from "../../api/formation";

export const DEPUBLICATION_TAGS = {
  "N/A": "N/A",
  RCO: "RCO",
  SSA: "SSA",
  DNE: "DNE",
  "SAIO/SRFD": "SAIO/SRFD",
};

const depublicationOptions = [
  {
    label: "Organisme de formation, lieu",
    type: "category",
    parcoursup: true,
    affelnet: true,
    precision: {
      type: "list",
      options: [
        {
          label: "L'adresse du lieu de réalisation est incorrecte",
          parcoursup: true,
          affelnet: true,
          precision: {
            type: "list",
            obligatoire: true,
            label: "Veuillez préciser",
            options: [
              {
                label: "La ville du lieu de réalisation est incorrecte",
                statut: COMMON_STATUS.NON_PUBLIE,
                parcoursup: true,
                affelnet: true,
                tag: DEPUBLICATION_TAGS.RCO,
                precision: {
                  label: "Veuillez indiquer l'adresse attendue",
                  obligatoire: true,
                  type: "text",
                },
              },
              {
                label: "La ville du lieu de réalisation est correcte mais l’adresse a changé",
                statut: COMMON_STATUS.EN_ATTENTE,
                parcoursup: true,
                affelnet: true,
                tag: DEPUBLICATION_TAGS.RCO,
                precision: {
                  label: "Veuillez indiquer l'adresse attendue",
                  obligatoire: true,
                  type: "text",
                },
              },
            ],
          },
        },

        {
          label: "L'organisme responsable ou formateur a changé",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS.RCO,
          precision: {
            label:
              "Veuillez préciser l'organisme formateur et/ou responsable attendu, en indiquant si possible son Siret et UAI",
            type: "text",
            obligatoire: true,
          },
        },

        {
          label: "L'organisme est injoignable",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS.RCO,
        },
        {
          label: "Problème d'UAI",
          parcoursup: true,
          affelnet: true,
          precision: {
            label: "Veuillez préciser",
            type: "list",
            obligatoire: true,
            options: [
              {
                label: "Lieu non immatriculable",
                statut: COMMON_STATUS.EN_ATTENTE,
                parcoursup: true,
                affelnet: true,
                tag: DEPUBLICATION_TAGS.SSA,
              },
              {
                label: "Absence d'UAI sur le formateur et/ou le responsable",
                statut: COMMON_STATUS.EN_ATTENTE,
                parcoursup: true,
                affelnet: true,
                tag: DEPUBLICATION_TAGS.SSA,
              },
              {
                label: "UAI erroné ou fermé",
                statut: COMMON_STATUS.EN_ATTENTE,
                parcoursup: true,
                affelnet: true,
                tag: DEPUBLICATION_TAGS.SSA,
                precision: {
                  label: "Veuillez indiquer l'adresse attendue",
                  obligatoire: true,
                  type: "text",
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    label: "Formation",
    type: "category",
    parcoursup: true,
    affelnet: true,
    precision: {
      type: "list",
      options: [
        {
          label: "L'offre a été annulée",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS.RCO,
        },

        {
          label: "L’organisme n’a pas demandé le référencement de cette offre sur Parcoursup",
          statut: COMMON_STATUS.EN_ATTENTE,
          parcoursup: true,
          affelnet: false,
          tag: DEPUBLICATION_TAGS["N/A"],
        },

        {
          label: "L'organisme ne souhaite pas que cette offre soit affichée",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS["N/A"],
        },

        {
          label: "L'offre est en double",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS.RCO,
          precision: {
            label: "Veuillez renseigner si possible la clé ministères éducatifs ou l'URL de l'autre offre",
            obligatoire: false,
            type: "text",
          },
        },

        {
          label: "Les dates de formation ne correspondent pas à la durée déclarée",
          statut: COMMON_STATUS.EN_ATTENTE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS.RCO,
        },

        {
          label:
            "La durée déclarée et/ou l'année d'entrée en apprentissage est incorrecte, la formation n’est en réalité pas accessible aux élèves de 3e.",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS.RCO,
          precision: {
            label: "Veuillez préciser le paramètre incorrect (année d’entrée et/ou durée)",
            type: "text",
            obligatoire: true,
          },
        },

        {
          label: "Dispositif spécifique, non accessible aux élèves de 3e",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: false,
          affelnet: true,
          tag: DEPUBLICATION_TAGS.DNE,
          precision: {
            label: "Veuillez préciser le dispositif",
            type: "text",
            obligatoire: true,
          },
        },

        {
          label: "Public mixte (scolaires/apprentis)",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS["N/A"],
        },
      ],
    },
  },
  {
    label: "Autre",
    type: "category",
    parcoursup: true,
    affelnet: true,
    precision: {
      type: "list",
      options: [
        {
          label: "Non paramétré dans Parcoursup",
          statut: COMMON_STATUS.EN_ATTENTE,
          parcoursup: true,
          affelnet: false,
          tag: DEPUBLICATION_TAGS["N/A"],
        },

        {
          label: "Autorisation externe en attente (Drafpica, Draaf, Moss, …)",
          statut: COMMON_STATUS.EN_ATTENTE,
          parcoursup: true,
          affelnet: false,
          tag: DEPUBLICATION_TAGS["SAIO/SRFD"],

          precision: {
            label: "Veuillez préciser l’autorisation attendue",
            type: "text",
          },
        },

        {
          label: "Non autorisé (Drafpica, Draaf, Moss, SAIO)",
          statut: COMMON_STATUS.NON_PUBLIE,
          parcoursup: true,
          affelnet: false,
          tag: DEPUBLICATION_TAGS["N/A"],
          precision: {
            label: "Veuillez préciser le décideur et le motif",
            type: "text",
          },
        },

        {
          label: "Motif introuvable ?",
          type: "category",
          statut: COMMON_STATUS.EN_ATTENTE,
          parcoursup: true,
          affelnet: true,
          tag: DEPUBLICATION_TAGS["N/A"],
          precision: {
            label: "Veuillez le préciser ici",
            obligatoire: true,
            type: "text",
          },
        },
      ],
    },
  },
];

const findMotif = (source, label, nodes = depublicationOptions) => {
  for (const node of nodes) {
    if (node.label === label && node[source]) {
      return node;
    }
    if (node.precision) {
      const found = findMotif(
        source,
        label,
        ["list" /*, "select"*/].includes(node.precision.type) ? node.precision.options : [node.precision]
      );
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const findPrecision = (source, label, nodes = depublicationOptions) => {
  for (const node of nodes) {
    if (node.precision) {
      if (["list" /*, "select"*/].includes(node.precision.type)) {
        for (const option of node.precision.options) {
          if (option.label === label && option[source]) {
            return option;
          }
          const found = findPrecision(source, label, option ? [option] : []);
          if (found) {
            return found;
          }
        }
      }
    }
  }

  return null;
};

const DepublicationMotifSelect = ({ name, values, source, setValues, validateForm }) => {
  const [selectedMotif, setSelectedMotif] = useState(null);
  const [selectedMotifLabel, setSelectedMotifLabel] = useState(null);
  const [selectedPrecision, setSelectedPrecision] = useState(null);
  const [selectedPrecisionLabel, setSelectedPrecisionLabel] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedStatut, setSelectedStatut] = useState(null);

  const handleMotifChange = useCallback(
    (value) => {
      // console.log("handleMotifChange", value);

      const motif = findMotif(source, value);
      // console.log("found motif", motif);

      setSelectedMotif(motif);
      setSelectedMotifLabel(motif?.label);
      setSelectedTag(motif?.tag);
      setSelectedPrecision(null);
      setSelectedPrecisionLabel(null);
      setSelectedStatut(motif?.statut);

      setValues(
        {
          ...values,
          [`${name}`]: motif?.label,
          [`${name}_tag`]: motif?.tag ?? null,
          [`${name}_precision`]: null,
          [`${name}_statut`]: motif?.statut ?? null,
        },
        { shouldValidate: true }
      );
    },
    [source, setValues, values, name]
  );

  const handlePrecisionChange = useCallback(
    (value) => {
      setSelectedPrecisionLabel(value);

      const precision = findPrecision(source, value);
      // console.log("found precision", precision);

      if (precision) {
        setSelectedPrecision(precision);
        setSelectedStatut(precision?.statut ?? selectedMotif?.statut ?? null);
        setSelectedTag(precision?.tag ?? selectedMotif?.tag ?? null);

        setValues(
          {
            ...values,
            [`${name}`]: selectedMotif?.label,
            [`${name}_tag`]: precision?.tag ?? selectedMotif?.tag ?? null,
            [`${name}_precision`]: value,
            [`${name}_statut`]: precision?.statut ?? selectedMotif?.statut ?? null,
          },
          { shouldValidate: true }
        );
      } else {
        setValues(
          {
            ...values,
            [`${name}`]: selectedMotif?.label,
            [`${name}_tag`]: selectedMotif?.tag ?? null,
            [`${name}_precision`]: value,
            [`${name}_statut`]: selectedMotif?.statut ?? null,
          },
          { shouldValidate: true }
        );
      }

      validateForm();
    },
    [source, validateForm, selectedMotif?.statut, selectedMotif?.tag, selectedMotif?.label, setValues, values, name]
  );

  useEffect(() => {
    console.log(values[`${name}`]);
    console.log(values[`${name}_tag`]);
    console.log(values[`${name}_precision`]);
    console.log(values[`${name}_statut`]);

    const motif = findMotif(source, values[`${name}`]);
    const precision = findPrecision(source, values[`${name}_precision`]);
    const tag = precision?.tag ?? motif?.tag ?? null;
    const statut = precision?.statut ?? motif?.statut ?? null;

    console.log({ motif, precision, tag, statut });

    setSelectedMotifLabel(values[`${name}`]);
    setSelectedPrecisionLabel(values[`${name}_precision`]);

    motif && setSelectedMotif(motif);
    precision && setSelectedPrecision(precision);

    setSelectedStatut(values[`${name}_statut`]);
    setSelectedTag(values[`${name}_tag`]);
  }, [name, selectedMotif?.statut, source, values]);

  return (
    <Box>
      {depublicationOptions.map((node) => (
        <Item
          key={node.label}
          node={node}
          source={source}
          selectedMotif={selectedMotif}
          selectedPrecision={selectedPrecision}
          handleMotifChange={handleMotifChange}
          handlePrecisionChange={handlePrecisionChange}
        />
      ))}
      {/* <br />
      <br />
      <Text> VALUES : </Text>
      <Text>Label : {values[`${name}`]}</Text>
      <Text>Tag : {values[`${name}_tag`]}</Text>
      <Text>Précision : {values[`${name}_precision`]}</Text>
      <Text>Statut : {values[`${name}_statut`]}</Text>

      <br />
      <br />

      <Text> SELECTED : </Text>

      <Text>Label : {selectedMotifLabel ? selectedMotifLabel : ""}</Text>
      <Text>Tag : {selectedTag ? selectedTag : ""}</Text>
      <Text>Précision : {selectedPrecisionLabel ? selectedPrecisionLabel : ""}</Text>
      <Text>Statut : {selectedStatut ? selectedStatut : ""}</Text> */}
    </Box>
  );
};

const Item = ({ node, source, selectedMotif, selectedPrecision, handleMotifChange, handlePrecisionChange }) => {
  if (!node) return null;

  return (
    <>
      {(() => {
        switch (node?.type) {
          case "category":
            return (
              <Text fontWeight="bold" mt={4} mb={2}>
                {node.label}
              </Text>
            );

          case "list":
            return (
              <RadioGroup value={selectedMotif?.label}>
                <Stack spacing={3}>
                  {node?.options
                    ?.filter((option) => option[source])
                    .map((option, index) => (
                      <React.Fragment key={index}>
                        <Radio
                          key={option.label}
                          value={option.label}
                          checked={
                            selectedMotif?.label === option.label ||
                            option.precision?.options?.find((o) => o.label === selectedMotif?.label)
                          }
                          onChange={() => handleMotifChange(option.label)}
                        >
                          {option.label}
                        </Radio>

                        {option.precision &&
                          (selectedMotif?.label === option.label ||
                            (["list"].includes(option.precision?.type) &&
                              option.precision?.options?.find((o) => o.label === selectedMotif?.label))) && (
                            <>
                              <Box ml={6}>
                                <>
                                  {["list"].includes(option.precision?.type) && option.precision?.label && (
                                    <Text mb={2}>
                                      {option.precision?.label}
                                      <Text as="span" color="red">
                                        {option.precision.obligatoire ? " *" : ""}
                                      </Text>
                                    </Text>
                                  )}
                                  <Item
                                    node={option.precision}
                                    source={source}
                                    selectedMotif={selectedMotif}
                                    selectedPrecision={selectedPrecision}
                                    handleMotifChange={handleMotifChange}
                                    handlePrecisionChange={handlePrecisionChange}
                                  />
                                </>
                              </Box>
                            </>
                          )}
                      </React.Fragment>
                    ))}
                </Stack>
              </RadioGroup>
            );

          // case "select":
          //   return (
          //     <>
          //       <Select
          //         defaultValue={selectedPrecision?.label ?? "DEFAULT"}
          //         onChange={(e) => handlePrecisionChange(e.target.value)}
          //       >
          //         <option value={"DEFAULT"} disabled>
          //           {node.label} {node.obligatoire ? "*" : ""}
          //         </option>
          //         {node.options.map((value) => (
          //           <option key={value.label} value={value.label}>
          //             {value.label}
          //           </option>
          //         ))}
          //       </Select>

          //       {selectedPrecision?.label === node?.label && node.precision && (
          //         <Item
          //           node={node.precision}
          //           source={source}
          //           selectedMotif={selectedMotif}
          //           selectedPrecision={selectedPrecision}
          //           handleMotifChange={handleMotifChange}
          //           handlePrecisionChange={handlePrecisionChange}
          //         />
          //       )}
          //     </>
          //   );

          case "text":
            return (
              <Input
                placeholder={`${node.label} ${node.obligatoire ? "*" : ""}`}
                onChange={(e) => handlePrecisionChange(e.target.value)}
              />
            );

          default:
            return null;
        }
      }).call(this)}

      {node.precision && (
        <Item
          node={node.precision}
          source={source}
          selectedMotif={selectedMotif}
          selectedPrecision={selectedPrecision}
          handleMotifChange={handleMotifChange}
          handlePrecisionChange={handlePrecisionChange}
        />
      )}
    </>
  );
};

const getPublishRadioValue = (status) => {
  if ([COMMON_STATUS.PUBLIE, COMMON_STATUS.PRET_POUR_INTEGRATION].includes(status)) {
    return "true";
  }
  if ([COMMON_STATUS.NON_PUBLIE, COMMON_STATUS.EN_ATTENTE].includes(status)) {
    return "false";
  }

  return undefined;
};

/**
 * Regexp pour validation des urls à destination d'Affelnet.
 *
 *
 * Avec pour académie :
 *
 * paris|aix-marseille|besancon|bordeaux|caen|clermont-ferrand|dijon|grenoble|lille|lyon|montpellier|nancy-metz|poitiers|rennes|strasbourg|toulouse|nantes|orleans-tours|reims|amiens|rouen|limoges|nice|creteil|versailles|corse|reunion|martinique|guadeloupe|guyane|noumea|mayotte|normandie|polynesie|spm
 *
 * Régions académiques :
 *
 * auvergne-rhone-alpes|auvergnerhonealpes|bourgogne-franche-compte|bretagne|centre-val-de-loire|corse|grand-est|guadeloupe|guyane|hauts-de-france|ile-de-france|reunion|martinique|mayotte|normandie|nouvelle-aquitaine|occitanie|pays-de-la-loire|provence-alpes-cote-azur
 *
 *
 * (https?)
 * (
 *   (.+\.ac-<académie>\.(fr|net|eu|nc|pf|pm|wf))|
 *   https://test.ac-aix-marseille.fr/tst
 *
 *   (.+\.ent\.<académie/region-academique>\.(fr|net|eu|nc|pf|pm|wf))|
 *   https://test.ent.aix-marseille.net/tst
 *   https://test.ent.centre-val-de-loire.net/tst
 *
 *   (.+\.region-academique-<region-academique>\.fr)|
 *   https://test.region-academique-bourgogne-franche-compte.fr/test1/test2?test3
 *
 *   (.+\.monbureaunumerique\.fr)|
 *   https://test1.monbureaunumerique.fr/test
 *
 *   (.+\.index-education\.(com|net))|
 *   http://test.index-education.com/test1?test2
 *
 *   ((www\.)?onisep\.fr)/
 *   http://onisep.fr/test1/test2
 *   https://onisep.fr/test1/test2
 *   https://www.onisep.fr/test1/test2
 *   https://bad-test.onisep.fr/test1/test2
 *
 *   ((www\.)?enedis\.fr)/
 *   http://enedis.fr/test1/test2
 *   https://enedis.fr/test1/test2
 *   https://www.enedis.fr/test1/test2
 *   https://bad-test.enedis.fr/test1/test2
 *
 *   (.+\.monavenirdanslenucleaire\.fr)/
 *   https://www.monavenirdanslenucleaire.fr/test
 *
 * )
 * .*
 *
 * https://test.test.net/test
 *
 */
/* cspell:disable-next-line */
const urlRegex =
  /(https?:\/\/)((.+\.ac-(paris|aix-marseille|besancon|bordeaux|caen|clermont-ferrand|dijon|grenoble|lille|lyon|montpellier|nancy-metz|poitiers|rennes|strasbourg|toulouse|nantes|orleans-tours|reims|amiens|rouen|limoges|nice|creteil|versailles|corse|reunion|martinique|guadeloupe|guyane|noumea|mayotte|normandie|polynesie|spm)\.(fr|net|eu|nc|pf|pm|wf))|(.+\.ent\.((paris|aix-marseille|besancon|bordeaux|caen|clermont-ferrand|dijon|grenoble|lille|lyon|montpellier|nancy-metz|poitiers|rennes|strasbourg|toulouse|nantes|orleans-tours|reims|amiens|rouen|limoges|nice|creteil|versailles|corse|reunion|martinique|guadeloupe|guyane|noumea|mayotte|normandie|polynesie|spm)|(auvergne-rhone-alpes|auvergnerhonealpes|bourgogne-franche-compte|bretagne|centre-val-de-loire|corse|grand-est|guadeloupe|guyane|hauts-de-france|ile-de-france|reunion|martinique|mayotte|normandie|nouvelle-aquitaine|occitanie|pays-de-la-loire|provence-alpes-cote-azur))\.(fr|net|eu|nc|pf|pm|wf))|(.+\.region-academique-(auvergne-rhone-alpes|auvergnerhonealpes|bourgogne-franche-compte|bretagne|centre-val-de-loire|corse|grand-est|guadeloupe|guyane|hauts-de-france|ile-de-france|reunion|martinique|mayotte|normandie|nouvelle-aquitaine|occitanie|pays-de-la-loire|provence-alpes-cote-azur)\.fr)|(.+\.monbureaunumerique\.fr)|(.+\.monavenirdanslenucleaire\.fr)|(.+\.index-education\.(com|net))|((www\.)?onisep\.fr)|((www\.)?enedis\.fr)).*/;

const getSubmitBody = ({
  formation,
  affelnet,
  affelnet_infos_offre,
  affelnet_url_infos_offre,
  affelnet_modalites_offre,
  affelnet_url_modalites_offre,
  affelnet_raison_depublication,
  affelnet_raison_depublication_tag,
  affelnet_raison_depublication_precision,
  affelnet_raison_depublication_statut,
  parcoursup,
  parcoursup_raison_depublication,
  parcoursup_raison_depublication_tag,
  parcoursup_raison_depublication_precision,
  parcoursup_raison_depublication_statut,
  date = new Date(),
}) => {
  const body = {};

  // check if can edit depending on the status
  if (affelnet === "true") {
    if (
      [
        AFFELNET_STATUS.NON_PUBLIE,
        AFFELNET_STATUS.EN_ATTENTE,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      ].includes(formation?.affelnet_statut)
    ) {
      body.affelnet_statut = AFFELNET_STATUS.PRET_POUR_INTEGRATION;
      body.last_statut_update_date = date;
      body.affelnet_infos_offre = affelnet_infos_offre;
      body.affelnet_url_infos_offre = affelnet_url_infos_offre;
      body.affelnet_modalites_offre = affelnet_modalites_offre;
      body.affelnet_url_modalites_offre = affelnet_url_modalites_offre;
      body.affelnet_raison_depublication = null;
    } else if ([AFFELNET_STATUS.PUBLIE].includes(formation?.affelnet_statut)) {
      body.affelnet_infos_offre = affelnet_infos_offre;
      body.affelnet_url_infos_offre = affelnet_url_infos_offre;
      body.affelnet_modalites_offre = affelnet_modalites_offre;
      body.affelnet_url_modalites_offre = affelnet_url_modalites_offre;
    }
  } else if (affelnet === "false") {
    if (
      [
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.PUBLIE,
        AFFELNET_STATUS.NON_PUBLIE,
        AFFELNET_STATUS.EN_ATTENTE,
      ].includes(formation?.affelnet_statut)
    ) {
      body.affelnet_raison_depublication = affelnet_raison_depublication;
      body.affelnet_raison_depublication_precision = affelnet_raison_depublication_precision;
      body.affelnet_raison_depublication_tag = affelnet_raison_depublication_tag;
      body.affelnet_statut = affelnet_raison_depublication_statut;
      body.last_statut_update_date = date;
      body.affelnet_published_date = null;
    }
  }

  if (parcoursup === "true") {
    if (
      [
        PARCOURSUP_STATUS.NON_PUBLIE,
        PARCOURSUP_STATUS.EN_ATTENTE,
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        PARCOURSUP_STATUS.A_PUBLIER,
        PARCOURSUP_STATUS.REJETE,
        PARCOURSUP_STATUS.FERME,
      ].includes(formation?.parcoursup_statut)
    ) {
      body.parcoursup_statut = PARCOURSUP_STATUS.PRET_POUR_INTEGRATION;
      body.parcoursup_error = null;
      body.rejection = null;
      body.last_statut_update_date = date;
      body.parcoursup_raison_depublication = null;
    }
  } else if (parcoursup === "false") {
    if (
      [
        PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        PARCOURSUP_STATUS.A_PUBLIER,
        PARCOURSUP_STATUS.PUBLIE,
        PARCOURSUP_STATUS.REJETE,
        PARCOURSUP_STATUS.FERME,
        PARCOURSUP_STATUS.NON_PUBLIE,
        PARCOURSUP_STATUS.EN_ATTENTE,
      ].includes(formation?.parcoursup_statut)
    ) {
      body.parcoursup_raison_depublication = parcoursup_raison_depublication;
      body.parcoursup_raison_depublication_precision = parcoursup_raison_depublication_precision;
      body.parcoursup_raison_depublication_tag = parcoursup_raison_depublication_tag;
      body.parcoursup_statut = parcoursup_raison_depublication_statut;
      body.last_statut_update_date = date;
      body.parcoursup_published_date = null;
    }
  }
  return {
    body,
  };
};

const updateFormationWithCallback = async ({ body, formation, user, onFormationUpdate }) => {
  const updatedFormation = await updateFormation({ formation, body, user });

  onFormationUpdate(updatedFormation);
  return updatedFormation;
};

const PublishModal = ({ isOpen, onClose, formation, onFormationUpdate }) => {
  const [user] = useAuth();

  const affelnetPerimetre = formation?.affelnet_perimetre || false;
  const parcoursupPerimetre = formation?.parcoursup_perimetre || false;

  const [isAffelnetFormOpen, setAffelnetFormOpen] = useState(
    [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION].includes(formation?.affelnet_statut)
  );
  const [isParcoursupFormOpen, setParcoursupFormOpen] = useState(
    [PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.PRET_POUR_INTEGRATION].includes(formation?.parcoursup_statut)
  );

  const [isAffelnetUnpublishFormOpen, setAffelnetUnpublishFormOpen] = useState(
    [COMMON_STATUS.NON_PUBLIE, COMMON_STATUS.EN_ATTENTE].includes(formation?.affelnet_statut)
  );
  const [isParcoursupUnpublishFormOpen, setParcoursupUnpublishFormOpen] = useState(
    [COMMON_STATUS.NON_PUBLIE, COMMON_STATUS.EN_ATTENTE].includes(formation?.parcoursup_statut)
  );

  const {
    values,
    setValues,
    setFieldValue,
    handleChange,
    handleSubmit,
    isSubmitting,
    errors,
    touched,
    validateForm,
    validateField,
    isInvalid,
  } = useFormik({
    // enableReinitialize: true,
    initialValues: {
      affelnet: getPublishRadioValue(formation?.affelnet_statut),
      affelnet_infos_offre: formation?.affelnet_infos_offre ?? "",
      affelnet_url_infos_offre: formation?.affelnet_url_infos_offre ?? "",
      affelnet_modalites_offre: formation?.affelnet_modalites_offre ?? "",
      affelnet_url_modalites_offre: formation?.affelnet_url_modalites_offre ?? "",
      affelnet_raison_depublication: formation?.affelnet_raison_depublication ?? "",
      affelnet_raison_depublication_precision: formation?.affelnet_raison_depublication_precision ?? "",
      affelnet_raison_depublication_tag: formation?.affelnet_raison_depublication_tag ?? "",
      affelnet_raison_depublication_statut: formation?.affelnet_statut,
      parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
      parcoursup_raison_depublication: formation?.parcoursup_raison_depublication ?? "",
      parcoursup_raison_depublication_precision: formation?.parcoursup_raison_depublication_precision ?? "",
      parcoursup_raison_depublication_tag: formation?.parcoursup_raison_depublication_tag ?? "",
      parcoursup_raison_depublication_statut: formation?.parcoursup_statut,
      uai_formation: formation?.uai_formation ?? "",
    },
    validateOnChange: true,
    validationSchema: Yup.object().shape({
      affelnet_infos_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(1000, "Le champ ne doit pas dépasser 1000 caractères.")
        : Yup.string().nullable(),
      affelnet_url_infos_offre: isAffelnetFormOpen
        ? Yup.string()
            .url(
              "La valeur saisie doit être une URL valide : débutant par http:// ou https:// (en minuscules), avec ou sans www, se terminant .fr, .com, .eu, .nc, etc. Méthode recommandée pour l’enregistrement de cette URL : accédez à la page cible souhaitée, et copiez-coller l’adresse de la page."
            )
            .nullable()
            .matches(urlRegex, {
              message:
                "L’URL n’est pas autorisée. Les URL autorisées : sites des académies, régions académiques, monbureaunumerique.fr, index-education (.com ou .fr), onisep.fr.",
              excludeEmptyString: true,
            })
            .max(250, "Le champ ne doit pas dépasser 250 caractères.")
        : Yup.string().nullable(),
      affelnet_modalites_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(1000, "Le champ ne doit pas dépasser 1000 caractères.")
        : Yup.string().nullable(),
      affelnet_url_modalites_offre: isAffelnetFormOpen
        ? Yup.string()
            .url(
              "La valeur saisie doit être une URL valide : débutant par http:// ou https:// (en minuscules), avec ou sans www, se terminant .fr, .com, .eu, .nc, etc. Méthode recommandée pour l’enregistrement de cette URL : accédez à la page cible souhaitée, et copiez-coller l’adresse de la page."
            )
            .nullable()
            .matches(urlRegex, {
              message:
                "L’URL n’est pas autorisée. Les URL autorisées : sites des académies, régions académiques, monbureaunumerique.fr, index-education (.com ou .fr), onisep.fr.",
              excludeEmptyString: true,
            })
            .max(250, "Le champ ne doit pas dépasser 250 caractères.")
        : Yup.string().nullable(),

      affelnet_raison_depublication: isAffelnetUnpublishFormOpen
        ? Yup.string().nullable().required("Veuillez saisir la raison.")
        : Yup.string().nullable(),
      affelnet_raison_depublication_precision: Yup.string().nullable(),
      affelnet_raison_depublication_tag: isAffelnetUnpublishFormOpen
        ? Yup.string()
            .nullable()
            .oneOf(Object.values(DEPUBLICATION_TAGS), "La catégorie cible n'est pas valide.")
            .required("La catégorie cible est requise.")
        : Yup.string().nullable(),
      affelnet_raison_depublication_statut: isAffelnetUnpublishFormOpen
        ? Yup.string()
            .nullable()
            .oneOf([COMMON_STATUS.EN_ATTENTE, COMMON_STATUS.NON_PUBLIE], "Le statut cible n'est pas valide.")
            .required("Le statut cible est requis.")
        : Yup.string().nullable(),

      parcoursup_raison_depublication: isParcoursupUnpublishFormOpen
        ? Yup.string().nullable().required("Veuillez saisir la raison.")
        : Yup.string().nullable(),
      parcoursup_raison_depublication_precision: Yup.string().nullable(),
      parcoursup_raison_depublication_tag: isParcoursupUnpublishFormOpen
        ? Yup.string()
            .nullable()
            .oneOf(Object.values(DEPUBLICATION_TAGS), "La catégorie cible n'est pas valide.")
            .required("La catégorie cible est requise.")
        : Yup.string().nullable(),
      parcoursup_raison_depublication_statut: isParcoursupUnpublishFormOpen
        ? Yup.string()
            .nullable()
            .oneOf([COMMON_STATUS.EN_ATTENTE, COMMON_STATUS.NON_PUBLIE], "Le statut cible n'est pas valide.")
            .required("Le statut cible est requis.")
        : Yup.string().nullable(),

      uai_formation:
        isParcoursupUnpublishFormOpen || isAffelnetUnpublishFormOpen
          ? Yup.string().min(8).max(8).nullable()
          : Yup.string()
              .min(8)
              .max(8)
              .required("L’UAI du lieu de formation doit obligatoirement être édité pour permettre la publication."),
    }),
    onSubmit: ({
      affelnet,
      parcoursup,
      affelnet_infos_offre,
      affelnet_url_infos_offre,
      affelnet_modalites_offre,
      affelnet_url_modalites_offre,
      affelnet_raison_depublication,
      affelnet_raison_depublication_precision,
      affelnet_raison_depublication_tag,
      affelnet_raison_depublication_statut,
      parcoursup_raison_depublication,
      parcoursup_raison_depublication_precision,
      parcoursup_raison_depublication_tag,
      parcoursup_raison_depublication_statut,
    }) => {
      console.log("onSubmit");

      return new Promise(async (resolve) => {
        const result = getSubmitBody({
          formation,
          affelnet,
          affelnet_infos_offre,
          affelnet_url_infos_offre,
          affelnet_modalites_offre,
          affelnet_url_modalites_offre,
          affelnet_raison_depublication,
          affelnet_raison_depublication_precision,
          affelnet_raison_depublication_tag,
          affelnet_raison_depublication_statut,

          parcoursup,
          parcoursup_raison_depublication,
          parcoursup_raison_depublication_precision,
          parcoursup_raison_depublication_tag,
          parcoursup_raison_depublication_statut,
        });

        if (Object.keys(result.body).length > 0) {
          const updatedFormation = await updateFormationWithCallback({
            ...result,
            formation,
            user,
            onFormationUpdate,
          });

          setFieldValue("affelnet", getPublishRadioValue(updatedFormation?.affelnet_statut));
          setFieldValue("parcoursup", getPublishRadioValue(updatedFormation?.parcoursup_statut));
          setFieldValue("affelnet_infos_offre", updatedFormation?.affelnet_infos_offre);
          setFieldValue("affelnet_url_infos_offre", updatedFormation?.affelnet_url_infos_offre);
          setFieldValue("affelnet_modalites_offre", updatedFormation?.affelnet_modalites_offre);
          setFieldValue("affelnet_url_modalites_offre", updatedFormation?.affelnet_url_modalites_offre);
          setFieldValue("affelnet_statut", updatedFormation?.affelnet_statut);
          setFieldValue("affelnet_raison_depublication", updatedFormation?.affelnet_raison_depublication);
          setFieldValue(
            "affelnet_raison_depublication_precision",
            updatedFormation?.affelnet_raison_depublication_precision
          );
          setFieldValue("affelnet_raison_depublication_tag", updatedFormation?.affelnet_raison_depublication_tag);

          setFieldValue("parcoursup_statut", updatedFormation?.parcoursup_statut);
          setFieldValue("parcoursup_raison_depublication", updatedFormation?.parcoursup_raison_depublication);
          setFieldValue(
            "parcoursup_raison_depublication_precision",
            updatedFormation?.parcoursup_raison_depublication_precision
          );
          setFieldValue("parcoursup_raison_depublication_tag", updatedFormation?.parcoursup_raison_depublication_tag);
        }

        onClose();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const isParcoursupPublishDisabled = [PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT].includes(formation?.affelnet_statut);

  const initialRef = React.useRef();

  console.log({ values, errors });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" ref={initialRef}>
        <Button
          display={"flex"}
          alignSelf={"flex-end"}
          color="bluefrance"
          fontSize={"epsilon"}
          onClick={onClose}
          variant="unstyled"
          p={8}
          fontWeight={400}
        >
          fermer{" "}
          <Text as={"span"} ml={2}>
            <Close boxSize={4} />
          </Text>
        </Button>
        <ModalHeader px={[4, 16]} pt={[3, 6]} pb={[3, 6]}>
          <Text as="h4" textStyle="h4" fontSize="1.6rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Gérer les publications
              </Text>
            </Flex>
          </Text>
        </ModalHeader>
        <ModalBody p={0}>
          {/* <Form> */}
          <Flex px={[4, 12]} pb={[4, 12]} flexDirection={{ base: "column", md: "row" }} justifyContent="space-between">
            {affelnetPerimetre && (
              <Box
                border="1px solid"
                borderColor="bluefrance"
                p={8}
                flexBasis={{ base: "100%", md: "100%" }}
                mb={{ base: 2, md: 0 }}
              >
                <Text as="h3" textStyle="h3" fontSize="1.5rem" mb={3}>
                  {formation.intitule_long}
                </Text>
                <Flex flexDirection="column">
                  <Box mb={3}>
                    <StatusBadge source="Affelnet" status={formation?.affelnet_statut} />
                  </Box>

                  <FormControl
                    display="flex"
                    flexDirection="column"
                    w="auto"
                    isDisabled={isAffelnetPublishDisabled}
                    data-testid={"affelnet-form"}
                    aria-disabled={isAffelnetPublishDisabled}
                  >
                    <FormLabel htmlFor="affelnet" mb={3} fontSize="epsilon" fontWeight={400}>
                      Demander la publication Affelnet:
                    </FormLabel>
                    <RadioGroup defaultValue={values.affelnet} id="affelnet" name="affelnet">
                      <Stack spacing={2} direction="column">
                        <Radio
                          mb={0}
                          size="lg"
                          value="true"
                          isDisabled={isAffelnetPublishDisabled}
                          onChange={(evt) => {
                            setAffelnetFormOpen(true);
                            setAffelnetUnpublishFormOpen(false);
                            handleChange(evt);
                          }}
                          data-testid={"af-radio-yes"}
                        >
                          <Text as={"span"} fontSize="zeta">
                            Oui
                          </Text>
                        </Radio>
                        <Radio
                          mb={0}
                          size="lg"
                          value="false"
                          isDisabled={isAffelnetPublishDisabled}
                          onChange={(evt) => {
                            setAffelnetFormOpen(false);
                            setAffelnetUnpublishFormOpen(true);
                            handleChange(evt);
                          }}
                          data-testid={"af-radio-no"}
                        >
                          <Text as={"span"} fontSize="zeta">
                            Non
                          </Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <Box data-testid={"af-publish-form"} style={{ display: isAffelnetFormOpen ? "block" : "none" }}>
                    <br />
                    <Text as="h5" textStyle="h5" fontSize="1.5rem" mb={3}>
                      Informations sur l'offre de formation (facultatif) :
                    </Text>
                    <Text>
                      Ces informations seront intégrées dans Affelnet pour être visibles sur le service en ligne
                      Affectation.
                    </Text>

                    <FormControl isInvalid={errors.affelnet_infos_offre}>
                      <FormLabel htmlFor="affelnet_infos_offre" mb={3} fontSize="epsilon"></FormLabel>

                      <Textarea
                        name="affelnet_infos_offre"
                        value={values.affelnet_infos_offre}
                        onChange={handleChange}
                        placeholder="Exemple :
                      BAC PRO en 3 ans"
                        rows={5}
                      />
                      <FormErrorMessage>{errors.affelnet_infos_offre}</FormErrorMessage>
                    </FormControl>
                    <br />
                    <FormControl isInvalid={errors.affelnet_url_infos_offre}>
                      <FormLabel htmlFor="affelnet_url_infos_offre" mb={3} fontSize="epsilon">
                        Information offre de formation (lien) (facultatif) :
                      </FormLabel>

                      <Textarea
                        name="affelnet_url_infos_offre"
                        value={values.affelnet_url_infos_offre}
                        onChange={handleChange}
                        placeholder="Exemple :
                      http://saio.ac-lyon.fr/spip/IMG/pdf/document_3eme_vers_apprentissage.pdf"
                        rows={2}
                      />
                      <FormErrorMessage>{errors.affelnet_url_infos_offre}</FormErrorMessage>
                    </FormControl>
                    <br />
                    <br />

                    <Text as="h5" textStyle="h5" fontSize="1.5rem" mb={3}>
                      Modalités particulières (facultatif) :
                    </Text>
                    <Text>
                      Ces informations seront intégrées dans Affelnet pour être visibles sur le service en ligne
                      Affectation.
                    </Text>

                    <FormControl isInvalid={errors.affelnet_modalites_offre}>
                      <FormLabel htmlFor="affelnet_modalites_offre" mb={3} fontSize="epsilon"></FormLabel>
                      <Textarea
                        name="affelnet_modalites_offre"
                        value={values.affelnet_modalites_offre}
                        onChange={handleChange}
                        placeholder="Exemple :
                      L'inscription dans une formation en apprentissage est soumise à la signature d'un contrat d'apprentissage avec un employeur.
                      La saisie d'un vœu sous statut d'apprenti ne génère aucune affectation ; il est saisi à titre d'information et de recensement. Il permet aux partenaires de l'apprentissage (CFA, Chambres consulaires, Développeurs de l'apprentissage, Région, CIO, Missions locales, Services rectoraux, DRAAF, DIRRECTE) de disposer de vos coordonnées afin de pouvoir vous accompagner dans vos démarches et recherche d'entreprise."
                        rows={5}
                      />
                      <FormErrorMessage>{errors.affelnet_modalites_offre}</FormErrorMessage>
                    </FormControl>
                    <br />
                    <FormControl isInvalid={errors.affelnet_url_modalites_offre}>
                      <FormLabel htmlFor="affelnet_url_modalites_offre" mb={3} fontSize="epsilon">
                        Modalités particulières (lien) (facultatif) :
                      </FormLabel>

                      <Textarea
                        name="affelnet_url_modalites_offre"
                        value={values.affelnet_url_modalites_offre}
                        onChange={handleChange}
                        placeholder="Exemple :
                        http://saio.ac-lyon.fr/spip/IMG/pdf/document_3eme_vers_apprentissage.pdf"
                        rows={2}
                      />
                      <FormErrorMessage>{errors.affelnet_url_modalites_offre}</FormErrorMessage>
                    </FormControl>
                  </Box>

                  <Box style={{ display: isAffelnetFormOpen ? "block" : "none" }}>
                    <FormControl
                      isRequired
                      isInvalid={errors.uai_formation}
                      display="flex"
                      flexDirection="column"
                      w="auto"
                      mt={3}
                    >
                      {/* <br />
                    {(!formation?.uai_formation ||
                      formation?.uai_formation === "" ||
                      !formation?.uai_formation_valide) && (
                      <DangerBox mb={1}>
                        L’UAI du lieu de formation doit obligatoirement être édité pour permettre l’envoi à Parcoursup
                      </DangerBox>
                    )} */}

                      <Input type="hidden" name="uai_formation" value={values.uai_formation} />
                      <FormErrorMessage>{errors.uai_formation}</FormErrorMessage>
                    </FormControl>
                  </Box>

                  <Box
                    data-testid={"af-unpublish-form"}
                    style={{ display: isAffelnetUnpublishFormOpen ? "block" : "none" }}
                    mt={6}
                  >
                    <FormControl
                      isRequired
                      isInvalid={
                        (errors.affelnet_raison_depublication && touched.affelnet_raison_depublication) ||
                        (errors.affelnet_raison_depublication_precision &&
                          touched.affelnet_raison_depublication_precision) ||
                        (errors.affelnet_raison_depublication_tag && touched.affelnet_raison_depublication_tag) ||
                        (errors.affelnet_raison_depublication_statut && touched.affelnet_raison_depublication_statut)
                      }
                      flexDirection="column"
                      w="auto"
                      mt={6}
                    >
                      <FormLabel
                        htmlFor="affelnet_raison_depublication"
                        mb={3} /* fontSize="epsilon" fontWeight={400}*/
                      >
                        Raison de non publication:
                      </FormLabel>

                      <Box mx={8}>
                        <DepublicationMotifSelect
                          name="affelnet_raison_depublication"
                          values={values}
                          setFieldValue={setFieldValue}
                          setValues={setValues}
                          validateField={validateField}
                          validateForm={validateForm}
                          onChange={handleChange}
                          errors={errors}
                          source="affelnet"
                        />

                        <FormErrorMessage>{errors.affelnet_raison_depublication}</FormErrorMessage>
                        <FormErrorMessage>{errors.affelnet_raison_depublication_precision}</FormErrorMessage>
                        <FormErrorMessage>{errors.affelnet_raison_depublication_tag}</FormErrorMessage>
                        <FormErrorMessage>{errors.affelnet_raison_depublication_statut}</FormErrorMessage>
                      </Box>
                    </FormControl>
                  </Box>
                </Flex>
              </Box>
            )}
            {parcoursupPerimetre && (
              <Box
                border="1px solid"
                borderColor="bluefrance"
                p={8}
                flexBasis={{ base: "100%", md: "100%" }}
                mt={{ base: 2, md: 0 }}
              >
                <Text as="h3" textStyle="h3" fontSize="1.5rem" mb={3}>
                  {formation.intitule_long}
                </Text>
                <Flex flexDirection="column">
                  <Box mb={3}>
                    <StatusBadge source="Parcoursup" status={formation?.parcoursup_statut} />
                  </Box>
                  <FormControl
                    display="flex"
                    flexDirection="column"
                    w="auto"
                    isDisabled={isParcoursupPublishDisabled}
                    data-testid={"parcoursup-form"}
                    aria-disabled={isParcoursupPublishDisabled}
                  >
                    <FormLabel htmlFor="parcoursup" mb={3} fontSize="epsilon" fontWeight={400}>
                      Demander la publication Parcoursup:
                    </FormLabel>

                    <RadioGroup defaultValue={values.parcoursup} id="parcoursup" name="parcoursup" mx={8}>
                      <Stack spacing={2} direction="column">
                        <Radio
                          mb={0}
                          size="lg"
                          value="true"
                          isDisabled={isParcoursupPublishDisabled}
                          onChange={(evt) => {
                            setParcoursupFormOpen(true);
                            setParcoursupUnpublishFormOpen(false);
                            handleChange(evt);
                          }}
                          data-testid={"ps-radio-yes"}
                        >
                          <Text as={"span"} fontSize="zeta">
                            Oui
                          </Text>
                        </Radio>
                        <Radio
                          mb={0}
                          size="lg"
                          value="false"
                          isDisabled={isParcoursupPublishDisabled}
                          onChange={(evt) => {
                            setParcoursupFormOpen(false);
                            setParcoursupUnpublishFormOpen(true);
                            handleChange(evt);
                          }}
                          data-testid={"ps-radio-no"}
                        >
                          <Text as={"span"} fontSize="zeta">
                            Non
                          </Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <Box data-testid={"ps-publish-form"} style={{ display: isParcoursupFormOpen ? "block" : "none" }}>
                    <FormControl
                      isRequired
                      isInvalid={errors.uai_formation}
                      display="flex"
                      flexDirection="column"
                      w="auto"
                      mt={3}
                    >
                      {/* <br />
                    {(!formation?.uai_formation ||
                      formation?.uai_formation === "" ||
                      !formation?.uai_formation_valide) && (
                      <DangerBox mb={1}>
                        L’UAI du lieu de formation doit obligatoirement être édité pour permettre l’envoi à Parcoursup
                      </DangerBox>
                    )} */}

                      <Input type="hidden" name="uai_formation" value={values.uai_formation} />
                      <FormErrorMessage>{errors.uai_formation}</FormErrorMessage>
                    </FormControl>
                  </Box>

                  <Box
                    data-testid={"ps-unpublish-form"}
                    style={{ display: isParcoursupUnpublishFormOpen ? "block" : "none" }}
                    mt={6}
                  >
                    <FormControl
                      isRequired
                      isInvalid={
                        (errors.parcoursup_raison_depublication && touched.parcoursup_raison_depublication) ||
                        (errors.parcoursup_raison_depublication_precision &&
                          touched.parcoursup_raison_depublication_precision) ||
                        (errors.parcoursup_raison_depublication_tag && touched.parcoursup_raison_depublication_tag) ||
                        (errors.parcoursup_raison_depublication_statut &&
                          touched.parcoursup_raison_depublication_statut)
                      }
                      display="flex"
                      flexDirection="column"
                      w="auto"
                      mt={6}
                    >
                      <FormLabel
                        htmlFor="parcoursup_raison_depublication"
                        mb={3} /*fontSize="epsilon" fontWeight={400}*/
                      >
                        Raison de non publication:
                      </FormLabel>
                      <Flex flexDirection="column" w="100%">
                        <Box mx={8}>
                          <DepublicationMotifSelect
                            name="parcoursup_raison_depublication"
                            values={values}
                            setFieldValue={setFieldValue}
                            setValues={setValues}
                            validateField={validateField}
                            validateForm={validateForm}
                            onChange={handleChange}
                            errors={errors}
                            source="parcoursup"
                          />
                          <FormErrorMessage>{errors.parcoursup_raison_depublication}</FormErrorMessage>
                          <FormErrorMessage>{errors.parcoursup_raison_depublication_precision}</FormErrorMessage>
                          <FormErrorMessage>{errors.parcoursup_raison_depublication_tag}</FormErrorMessage>
                          <FormErrorMessage>{errors.parcoursup_raison_depublication_statut}</FormErrorMessage>
                        </Box>
                      </Flex>
                    </FormControl>
                  </Box>
                </Flex>
              </Box>
            )}
          </Flex>
          <Box>
            <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setFieldValue("affelnet", getPublishRadioValue(formation?.affelnet_statut));
                  setFieldValue("parcoursup", getPublishRadioValue(formation?.parcoursup_statut));
                  onClose();
                }}
                mr={[0, 4]}
                px={8}
                mb={[3, 0]}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isInvalid}
                onClick={(evt) => {
                  if (values.parcoursup === "true" && formation.annee === "X") {
                    const isUserSure = window.confirm(
                      "L'année d'entrée en apprentissage n'a pas été collectée par le réseau des Carif-Oref. Nous avons besoin de votre confirmation pour l'exposition sur Parcoursup.\n\n" +
                        "Confirmez-vous que cette formation est accessible en apprentissage en première année post-Bac ?\n\n" +
                        "Si nécessaire, veuillez vérifier ce paramètre auprès de l'organisme."
                    );
                    if (isUserSure) {
                      handleSubmit(evt);
                    }
                  } else {
                    handleSubmit(evt);
                  }
                }}
                isLoading={isSubmitting}
                loadingText="Enregistrement des modifications"
              >
                Enregistrer les modifications
              </Button>
            </Flex>
          </Box>
          {/* </Form> */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { PublishModal, getPublishRadioValue, getSubmitBody, updateFormationWithCallback };
