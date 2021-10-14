import { Box, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Section } from "./Section";

import InfoTooltip from "../../../../common/components/InfoTooltip";
import helpText from "../../../../locales/helpText.json";

const getEtablissementFields = (mnaFormation, type, diff, code_commune_insee) => {
  return {
    adresse: mnaFormation[`etablissement_${type}_adresse`],
    catalogue_published: mnaFormation[`etablissement_${type}_catalogue_published`],
    cedex: mnaFormation[`etablissement_${type}_cedex`],
    code_commune_insee: mnaFormation[`etablissement_${type}_code_commune_insee`],
    code_postal: mnaFormation[`etablissement_${type}_code_postal`],
    complement_adresse: mnaFormation[`etablissement_${type}_complement_adresse`],
    conventionne: mnaFormation[`etablissement_${type}_conventionne`],
    datadock: mnaFormation[`etablissement_${type}_datadock`],
    date_creation: mnaFormation[`etablissement_${type}_date_creation`],
    declare_prefecture: mnaFormation[`etablissement_${type}_declare_prefecture`],
    enseigne: mnaFormation[`etablissement_${type}_enseigne`],
    entreprise_raison_sociale: mnaFormation[`etablissement_${type}_entreprise_raison_sociale`],
    _id: mnaFormation[`etablissement_${type}_id`],
    localite: mnaFormation[`etablissement_${type}_localite`],
    nom_academie: mnaFormation[`etablissement_${type}_nom_academie`],
    nom_departement: mnaFormation[`etablissement_${type}_nom_departement`],
    num_academie: mnaFormation[`etablissement_${type}_num_academie`],
    num_departement: mnaFormation[`etablissement_${type}_num_departement`],
    published: mnaFormation[`etablissement_${type}_published`],
    region: mnaFormation[`etablissement_${type}_region`],
    siren: mnaFormation[`etablissement_${type}_siren`],
    siret: mnaFormation[`etablissement_${type}_siret`],
    type: mnaFormation[`etablissement_${type}_type`],
    uai: mnaFormation[`etablissement_${type}_uai`],
    siret_match: diff?.siret[`etablissement_${type}_siret`].match,
    uai_match: diff?.uai[`etablissement_${type}_uai`].match,
    academie_match: diff?.nom_academie,
    code_commune_match: mnaFormation[`etablissement_${type}_code_commune_insee`] === code_commune_insee,
  };
};

const identicalColor = "galt"; // "greensoft.300";
const diffColor = "galt"; //"orangesoft.300";
const neutralColor = "galt";

const Rapprochement = React.memo(({ formation, currentMnaFormation }) => {
  const [mnaFormation, setMnaFormation] = useState(null);
  const [formationDiff, setFormationDiff] = useState(null);
  const [etablissements, setEtablissements] = useState({
    gestionnaire: null,
    formateur: null,
  });

  useEffect(() => {
    const mnaF = formation.matching_mna_formation[currentMnaFormation];
    if (mnaF) {
      const fDiff = formation.diff[currentMnaFormation];
      setMnaFormation(mnaF);
      setFormationDiff(fDiff);
      setEtablissements({
        gestionnaire: getEtablissementFields(mnaF, "gestionnaire", fDiff, formation.code_commune_insee),
        formateur: getEtablissementFields(mnaF, "formateur", fDiff, formation.code_commune_insee),
      });
    }
  }, [currentMnaFormation, formation]);

  if (!mnaFormation) {
    return null;
  }

  return (
    <>
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Identifiant RCO :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" variant="highlight" color="grey.500">
              N.A
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text>{mnaFormation.id_rco_formation}</Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Période
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" variant="highlight" color="grey.500">
              N.A
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text>{mnaFormation.periode}</Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Libellé formation :<Text as="span" variant="highlight" mt="1" display="inline-block"></Text>
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text> {formation.libelle_specialite}</Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text>{mnaFormation.intitule_long}</Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code diplôme :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${formationDiff.cfd ? identicalColor : diffColor}`}
              mt="1"
              display="inline-block"
            >
              {formation.codes_cfd_mna.join(",")}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${formationDiff.cfd ? identicalColor : neutralColor}`}
              mt="1"
              display="inline-block"
            >
              {mnaFormation.cfd}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code RNCP :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${formationDiff.rncp_code ? identicalColor : diffColor}`}
              mt="1"
              display="inline-block"
            >
              {formation.codes_rncp_mna.join(",")}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${formationDiff.rncp_code ? identicalColor : neutralColor}`}
              mt="1"
              display="inline-block"
            >
              {mnaFormation.rncp_code}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${
                formationDiff.uai.uai_composante ||
                formationDiff.uai.etablissement_gestionnaire_uai.uai_composante ||
                formationDiff.uai.etablissement_formateur_uai.uai_composante
                  ? identicalColor
                  : diffColor
              }`}
              mt="1"
              display="inline-block"
            >
              {formation.uai_composante} (de référencement ParcourSup)
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${formationDiff.uai.uai_formation.match ? identicalColor : neutralColor}`}
              mt="1"
              display="inline-block"
            >
              {mnaFormation.uai_formation ?? "N.A"} (lieu de formation)
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" variant="highlight" color="grey.500">
              N.A
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${formationDiff.uai.etablissement_formateur_uai.match ? identicalColor : neutralColor}`}
              mt="1"
              display="inline-block"
            >
              {mnaFormation.etablissement_formateur_uai ?? "N.A"} (formateur)
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" variant="highlight" color="grey.500">
              N.A
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${formationDiff.uai.etablissement_gestionnaire_uai.match ? identicalColor : neutralColor}`}
              mt="1"
              display="inline-block"
            >
              {mnaFormation.etablissement_gestionnaire_uai ?? "N.A"} (gestionnaire)
            </Text>
          </Box>
        }
      />
      {formationDiff.uai.uai_cerfa ||
        formationDiff.uai.etablissement_gestionnaire_uai.uai_cerfa ||
        (formationDiff.uai.etablissement_formateur_uai.uai_cerfa && (
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Code UAI
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text variant="highlight" bg={`${identicalColor}`} mt="1" display="inline-block">
                  {formation.uai_cerfa} (cerfa)
                </Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text as="span" variant="highlight" color="grey.500">
                  N.A
                </Text>
              </Box>
            }
          />
        ))}
      {formationDiff.uai.uai_insert_jeune ||
        formationDiff.uai.etablissement_gestionnaire_uai.uai_insert_jeune ||
        (formationDiff.uai.etablissement_formateur_uai.uai_insert_jeune && (
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Code UAI :
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text variant="highlight" bg={`${identicalColor}`} mt="1" display="inline-block">
                  {formation.uai_insert_jeune} (insertjeune)
                </Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text as="span" variant="highlight" color="grey.500">
                  N.A
                </Text>
              </Box>
            }
          />
        ))}
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Lieu de la formation :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.lieu_formation_adresse ? identicalColor : neutralColor}`}
              color={`${formation.adresse_etablissement_l1 ? "inherit" : "grey.500"}`}
            >
              {formation.adresse_etablissement_l1
                ? `${formation.adresse_etablissement_l1} ${formation.adresse_etablissement_l2 ?? ""}`
                : "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${formationDiff.lieu_formation_adresse ? identicalColor : neutralColor}`}
            >
              {mnaFormation.lieu_formation_adresse}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Commune :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${formation.libelle_commune === mnaFormation.localite ? identicalColor : neutralColor}`}
            >
              {formation.libelle_commune ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${formation.libelle_commune === mnaFormation.localite ? identicalColor : neutralColor}`}
            >
              {mnaFormation.localite}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code Commune Insee :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${formation.code_commune_insee === mnaFormation.code_commune_insee ? identicalColor : neutralColor}`}
            >
              {formation.code_commune_insee ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${formation.code_commune_insee === mnaFormation.code_commune_insee ? identicalColor : neutralColor}`}
            >
              {mnaFormation.code_commune_insee}
            </Text>
          </Box>
        }
      />
      <br /> <br />
      <Section
        withBorder
        left={<Box mb={4} mt={4}></Box>}
        middle={
          <Box mb={4} mt={4} fontSize="20px">
            Etablissement Formateur ou Gestionnaire
          </Box>
        }
        right={
          <Box mb={4} mt={4} fontSize="20px">
            Organisme formateur
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Siret :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              color={`${formation.siret_cerfa ? "inherit" : "grey.500"}`}
              variant="highlight"
              bg={`${formation.siret_cerfa === etablissements.formateur.siret ? identicalColor : neutralColor}`}
            >
              {formation.siret_cerfa ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${formation.siret_cerfa === etablissements.formateur.siret ? identicalColor : neutralColor}`}
            >
              {etablissements.formateur.siret ?? "N.A"}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            UAI :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              color={`${formation.uai_cerfa ? "inherit" : "grey.500"}`}
              bg={`${formation.uai_cerfa === etablissements.formateur.uai ? identicalColor : neutralColor}`}
              variant="highlight"
            >
              {formation.uai_cerfa ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              color={`${etablissements.formateur.uai ? "inherit" : "grey.500"}`}
              bg={`${formation.uai_cerfa === etablissements.formateur.uai ? identicalColor : neutralColor}`}
              variant="highlight"
            >
              {etablissements.formateur.uai ?? "N.A"}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Nom de l’organisme : <InfoTooltip description={helpText.rapprochement.parcoursup.nom_organisme} />
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text>{formation.libelle_uai_composante}</Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text>{etablissements.formateur.entreprise_raison_sociale}</Text>
          </Box>
        }
      />
      <br /> <br />
      <Section
        withBorder
        left={<Box mb={4} mt={4}></Box>}
        middle={
          <Box mb={4} mt={4} fontSize="20px">
            {" "}
          </Box>
        }
        right={
          <Box mb={4} mt={4} fontSize="20px">
            Organisme gestionnaire
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Siret :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text color="grey.500" variant="highlight" as="span">
              N.A
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            {etablissements.gestionnaire.siret}
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            UAI :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text color="grey.500" variant="highlight" as="span">
              N.A
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            {etablissements.gestionnaire.uai}
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Nom de l’organisme : <InfoTooltip description={helpText.rapprochement.parcoursup.nom_organisme} />
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text color="grey.500" variant="highlight" as="span">
              N.A
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text>{etablissements.gestionnaire.entreprise_raison_sociale}</Text>
          </Box>
        }
      />
    </>
  );
});

export { Rapprochement };
