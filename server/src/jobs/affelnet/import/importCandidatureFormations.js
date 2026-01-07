const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const csvToJson = require("convert-csv-to-json");
const { CandidatureFormation } = require("../../../common/models");
const { DateTime } = require("luxon");

const FILE_PATH = "/data/uploads/export-candidature-formations.csv";

const afImportCandidatureFormations = async () => {
  logger.info({ type: "job" }, " -- AFFELNET | IMPORT CANDIDATURE FORMATIONS : ⏳ -- ");

  try {
    const data = csvToJson.trimHeaderFieldWhiteSpace(false).supportQuotedField(true).getJsonFromCsv(FILE_PATH);

    let count = 0;

    logger.info({ type: "job" }, `${data.length} formations récupérées du fichier excel, début de l'enregistrement...`);

    await CandidatureFormation.deleteMany({});

    await asyncForEach(data, async (item, index) => {
      try {
        // console.log(item);
        const academie_formation = item["Académie de la formation"];
        const code_offre_formation = item["Code offre de la formation"];

        const academie_responsable = item["Académie de l’organisme responsable"];
        const siret_responsable = item["Siret de l'établissement responsable"];
        const uai_responsable =
          item["UAI de l'établissement responsable"] !== '"' ? item["UAI de l'établissement responsable"] : null;
        const url_responsable = item["Url du responsable"];
        const raison_sociale_responsable = item["Raison sociale de l’organisme responsable"];
        const localite_responsable = item["Localité responsable"];
        const email_responsable =
          item["Email de contact de l’organisme responsable"]?.trim() !== '"'
            ? item["Email de contact de l’organisme responsable"]?.trim()
            : null;

        const academie_formateur = item["Académie de l’organisme formateur"];
        const siret_formateur = item["Siret de l'établissement formateur"];
        const uai_formateur =
          item["UAI de l'établissement formateur"] !== '"' ? item["UAI de l'établissement formateur"] : null;
        const raison_sociale_formateur = item["Localité formateur"];

        const localite_formation = item["Localité de l'établissement d'accueil"];
        const uai_formation = item["UAI de l'établissement d'accueil"];

        const active_delegue = item["Délégation autorisée"] === "Oui";
        const email_delegue = item["Email du délégué"]?.trim() !== '"' ? item["Email du délégué"]?.trim() : null;
        const statut_creation = item["Statut de création du compte"];
        const statut_diffusion = item["Statut de diffusion des candidatures"];
        const statut_diffusion_generique = item["Statut générique"];

        const nombre_voeux = +item["Nombre de vœux"];
        const last_import_voeux =
          item["Date du dernier import de vœux"] !== '"'
            ? DateTime.fromFormat(item["Date du dernier import de vœux"], "dd/MM/yyyy").toJSDate()
            : null;
        const telechargement = item["Téléchargement"] === "Oui";
        const telechargement_date =
          item["Date du dernier téléchargement"] !== '"'
            ? DateTime.fromFormat(item["Date du dernier téléchargement"], "dd/MM/yyyy").toJSDate()
            : null;
        const nombre_voeux_telecharges = +item["Vœux téléchargés par le destinataire principal"];
        const nombre_voeux_a_retelecharges = +item["Vœux à télécharger pour mise à jour"];
        const nombre_voeux_jamais_telecharges = +item["Vœux jamais téléchargés par le destinataire principal"];
        const admin_intervention =
          item["Intervention par un administrateur"] !== '"' ? item["Intervention par un administrateur"] : null;

        logger.debug(
          { type: "job" },
          `${academie_formation}/${code_offre_formation} (${siret_responsable} / ${siret_formateur})`
        );

        await CandidatureFormation.create({
          affelnet_id: `${academie_formation}/${code_offre_formation}`,
          academie_formation,
          code_offre_formation,
          localite_formation,
          uai_formation,

          academie_responsable,
          siret_responsable,
          uai_responsable,
          url_responsable,
          raison_sociale_responsable,
          localite_responsable,
          email_responsable,

          academie_formateur,
          siret_formateur,
          uai_formateur,
          raison_sociale_formateur,

          active_delegue,
          email_delegue,

          statut_creation,
          statut_diffusion,
          statut_diffusion_generique,

          nombre_voeux,
          last_import_voeux,
          telechargement,
          telechargement_date,
          nombre_voeux_telecharges,
          nombre_voeux_a_retelecharges,
          nombre_voeux_jamais_telecharges,

          admin_intervention,
        });

        count++;
      } catch (error) {
        logger.error({ type: "job" }, error);
      }
    });

    logger.info({ type: "job" }, `${count} formations importées !`);
    logger.info({ type: "job" }, " -- AFFELNET | IMPORT CANDIDATURE FORMATIONS : ✅ -- ");
  } catch (error) {
    logger.error({ type: "job" }, " -- AFFELNET | IMPORT CANDIDATURE FORMATIONS : ❌ -- ");
  }
};

module.exports = { afImportCandidatureFormations };
