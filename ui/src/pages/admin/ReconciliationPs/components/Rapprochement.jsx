import { Box, Text, Heading } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Section } from "./Section";
import { CardEtablissements } from "./CardEtablissements";

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

const identicalColor = "greensoft.300";
const diffColor = "orangesoft.300";
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
            Code formation :
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
              {formation.uai_composante} (composante)
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
            <Text
              variant="highlight"
              bg={`${
                formationDiff.uai.uai_affilie ||
                formationDiff.uai.etablissement_gestionnaire_uai.uai_affilie ||
                formationDiff.uai.etablissement_formateur_uai.uai_affilie
                  ? identicalColor
                  : diffColor
              }`}
              mt="1"
              display="inline-block"
            >
              {formation.uai_affilie} (affililié)
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
            <Text
              variant="highlight"
              bg={`${
                formationDiff.uai.uai_gestionnaire ||
                formationDiff.uai.etablissement_gestionnaire_uai.uai_gestionnaire ||
                formationDiff.uai.etablissement_formateur_uai.uai_gestionnaire
                  ? identicalColor
                  : diffColor
              }`}
              mt="1"
              display="inline-block"
            >
              {formation.uai_gestionnaire} (gestionnaire)
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
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code UAI
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text
              variant="highlight"
              bg={`${
                formationDiff.uai.uai_cerfa ||
                formationDiff.uai.etablissement_gestionnaire_uai.uai_cerfa ||
                formationDiff.uai.etablissement_formateur_uai.uai_cerfa
                  ? identicalColor
                  : diffColor
              }`}
              mt="1"
              display="inline-block"
            >
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
                formationDiff.uai.uai_insert_jeune ||
                formationDiff.uai.etablissement_gestionnaire_uai.uai_insert_jeune ||
                formationDiff.uai.etablissement_formateur_uai.uai_insert_jeune
                  ? identicalColor
                  : diffColor
              }`}
              mt="1"
              display="inline-block"
            >
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
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Lieu de la formation :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" variant="highlight" color={`${formation.complement_adresse_1 ? "inherit" : "grey.500"}`}>
              {formation.complement_adresse_1 ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text>{mnaFormation.lieu_formation_adresse}</Text>
          </Box>
        }
      />
      <br /> <br />
      <Section
        withBorder
        left={<Box mb={4} mt={4}></Box>}
        middle={
          <Box mb={4} mt={4} fontSize="20px">
            Etablissement
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
            <Text as="span" color={`${formation.siret_cerfa ? "inherit" : "grey.500"}`} variant="highlight">
              {formation.siret_cerfa ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            {etablissements.formateur.siret}
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
            <Text as="span" color={`${formation.uai_cerfa ? "inherit" : "grey.500"}`} variant="highlight">
              {formation.uai_cerfa ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text as="span" color={`${etablissements.formateur.uai ? "inherit" : "grey.500"}`} variant="highlight">
              {etablissements.formateur.uai ?? "N.A"}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Nom de l’organisme :
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
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Type d’organisme :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text>{formation.type_etablissement}</Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text color="grey.500" variant="highlight" as="span">
              N.A
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Adresse :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" color={`${formation.complement_adresse_1 ? "inherit" : "grey.500"}`} variant="highlight">
              {formation.complement_adresse_1 ?? "N.A"}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text as="span" color={`${etablissements.formateur.adresse ? "inherit" : "grey.500"}`} variant="highlight">
              {etablissements.formateur.adresse ?? "N.A"}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code Commune INSEE:
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`} variant="highlight">
              {formation.code_commune_insee}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : neutralColor}`}>
              {etablissements.formateur.code_commune_insee}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Académie :
          </Box>
        }
        middle={
          <Box mb={4} mt={4}>
            <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`}>
              {formation.nom_academie}
            </Text>
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
            <Text
              as="span"
              variant="highlight"
              bg={`${etablissements.formateur.nom_academie ? identicalColor : neutralColor}`}
            >
              {etablissements.formateur.nom_academie}
            </Text>
          </Box>
        }
      />
      <br />
      <Section
        withBorder
        left={<Box mb={4} mt={4}></Box>}
        middle={
          <Box mb={4} mt={4}>
            N.A
          </Box>
        }
        right={
          <Box mb={4} mt={4}>
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
            Nom de l’organisme :
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
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Type d’organisme :
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
            <Text color="grey.500" variant="highlight" as="span">
              N.A
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Adresse :
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
            <Text as="span" color={`${etablissements.gestionnaire.adresse ? "inherit" : "grey.500"}`}>
              {etablissements.gestionnaire.adresse ?? "N.A"}
            </Text>
          </Box>
        }
      />
      <Section
        withBorder
        left={
          <Box mb={4} mt={4}>
            Code Commune INSEE:
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
            <Text
              as="span"
              variant="highlight"
              bg={`${etablissements.gestionnaire.nom_academie ? identicalColor : neutralColor}`}
            >
              {etablissements.gestionnaire.code_commune_insee}
            </Text>
          </Box>
        }
      />
      <Section
        left={
          <Box mb={4} mt={4}>
            Académie :
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
            <Text
              as="span"
              variant="highlight"
              bg={`${etablissements.gestionnaire.nom_academie ? identicalColor : neutralColor}`}
            >
              {etablissements.gestionnaire.nom_academie}
            </Text>
          </Box>
        }
      />
      {/* {!hasMultiple && (
        <>
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Siret :
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text>{formation.siret_cerfa}</Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text>{mnaFormation.etablissement_gestionnaire_siret}</Text>
              </Box>
            }
          />
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Nom de l’organisme :
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text>{formation.libelle_uai_composante}</Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text>
                  {mnaFormation.etablissement_gestionnaire_entreprise_raison_sociale}
                  {mnaFormation.etablissement_gestionnaire_enseigne}
                </Text>
              </Box>
            }
          />
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Type d’organisme :
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text>{formation.type_etablissement}</Text>
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
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Adresse :
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text
                  as="span"
                  variant="highlight"
                  color={`${formation.complement_adresse_1 ? "inherit" : "grey.500"}`}
                >
                  {formation.complement_adresse_1 ?? "N.A"}
                </Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text>{mnaFormation.etablissement_gestionnaire_adresse}</Text>
              </Box>
            }
          />
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
                  color={`${formation.complement_adresse_1 ? "inherit" : "grey.500"}`}
                >
                  {formation.complement_adresse_1 ?? "N.A"}
                </Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text>{mnaFormation.lieu_formation_adresse}</Text>
              </Box>
            }
          />
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Code Commune :
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`}>
                  {formation.code_commune_insee}
                </Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`}>
                  {mnaFormation.code_commune_insee}
                </Text>
              </Box>
            }
          />
          <Section
            withBorder
            left={
              <Box mb={4} mt={4}>
                Nom académie:
              </Box>
            }
            middle={
              <Box mb={4} mt={4}>
                <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`}>
                  {formation.nom_academie}
                </Text>
              </Box>
            }
            right={
              <Box mb={4} mt={4}>
                <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`}>
                  {mnaFormation.nom_academie}
                </Text>
              </Box>
            }
          />
        </>
      )} */}
      {/* <Section
        withBorder
        left={
          <>
            <Section
              withBorder
              left={
                <Box mb={4} mt={4}>
                  Siret :
                </Box>
              }
              leftWith="2%"
              middle={
                <Box mb={4} mt={4}>
                  <Text
                    variant="highlight"
                    bg={`${formationDiff.siret.siret_cerfa ? identicalColor : diffColor}`}
                    mt="1"
                    display="inline-block"
                  >
                    {formation.siret_cerfa} (cerfa)
                  </Text>
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
              leftWith="2%"
              middle={
                <Box mb={4} mt={4}>
                  <Text
                    variant="highlight"
                    bg={`${formationDiff.siret.siret_map ? identicalColor : diffColor}`}
                    mt="1"
                    display="inline-block"
                  >
                    {formation.siret_map} (apprentissage)
                  </Text>
                </Box>
              }
            />

            <Section
              withBorder
              left={
                <Box mb={4} mt={4}>
                  Lieu de la formation :
                </Box>
              }
              leftWith="2%"
              middle={
                <Box mb={4} mt={4}>
                  <Text
                    as="span"
                    variant="highlight"
                    color={`${formation.complement_adresse_1 ? "inherit" : "grey.500"}`}
                  >
                    {formation.complement_adresse_1 ?? "N.A"}
                  </Text>
                </Box>
              }
            />
            <Section
              withBorder
              left={
                <Box mb={4} mt={4}>
                  Code Commune :
                </Box>
              }
              leftWith="2%"
              middle={
                <Box mb={4} mt={4}>
                  <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`}>
                    {formation.code_commune_insee}
                  </Text>
                </Box>
              }
            />
            <Section
              withBorder
              left={
                <Box mb={4} mt={4}>
                  Nom académie:
                </Box>
              }
              leftWith="2%"
              middle={
                <Box mb={4} mt={4}>
                  <Text as="span" variant="highlight" bg={`${formationDiff.nom_academie ? identicalColor : diffColor}`}>
                    {formation.nom_academie}
                  </Text>
                </Box>
              }
            />
          </>
        }
        right={<Box mb={4} mt={4}></Box>}
      /> */}
      {/*  mnaFormation   {formation.statut_reconciliation === "A_VERIFIER" && (
        <Box px={[4, 16]} my={8}>
          <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance">
            <Stack direction="row">
              <Text>Sélectionner directement le ou les organisme (s) liés à l’offre de formation</Text>
            </Stack>
          </Heading>
          {etablissements.length > 0 && (
            <Box border="1px solid" borderColor="bluefrance" p={8}>
              <Box w="full" overflow="hidden">
                <Box overflowX="scroll" w="full">
                  <Table
                    data={etablissements.map((item) => ({
                      indice: item.matched_uai.length,
                      uai: item.uai,
                      siret: item.siret,
                      enseigne: item.enseigne,
                      raison_sociale: item.raison_sociale,
                      adresse: item.adresse,
                      naf_libelle: item.naf_libelle,
                      siege_social: item.siege_social,
                      matched_uai: item.matched_uai,
                    }))}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )} */}
    </>
  );
});

export { Rapprochement };
