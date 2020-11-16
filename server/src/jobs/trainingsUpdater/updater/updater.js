const axios = require("axios");
const { MnaFormation } = require("../../../common/model/index");
const { asyncForEach } = require("../../../common/utils/asyncUtils");

const run = async (filter = {}) => {
  const trainings = await MnaFormation.find(filter);

  await asyncForEach(trainings, async (trainingItem) => {
    let updatedTraining = {
      ...trainingItem._doc,
    };

    const {
      data: { result },
    } = await axios.post(" https://tables-correspondances.apprentissage.beta.gouv.fr/api/cfd", {
      cfd: updatedTraining.educ_nat_code,
    });

    console.log("result received", result);

    updatedTraining = {
      ...updatedTraining,
      intitule_long: result.intitule_long,
      intitule_court: result.intitule_court,
      diplome: result.diplome,
    };

    console.log("updated training", updatedTraining);

    /*
      cfd: '50321405',
      specialite: null,
      niveau: '3 (CAP...)',
      intitule_long: 'JARDINIER PAYSAGISTE (CAPA)',
      intitule_court: 'JARDINIER PAYSAGISTE',
      diplome: "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES",
      rncp: {
        code_rncp: 'RNCP24928',
        intitule_diplome: 'Jardinier paysagiste',
        date_fin_validite_enregistrement: '01/01/2024',
        active_inactive: 'ACTIVE',
        etat_fiche_rncp: 'Publiée',
        niveau_europe: 'niveau3',
        code_type_certif: 'CAPA',
        type_certif: "Certificat d'aptitude professionnelle agricole",
        ancienne_fiche: 'RNCP2756',
        nouvelle_fiche: '',
        demande: '0',
        certificateurs: [Array],
        nsf_code: '214',
        nsf_libelle: 'Aménagement paysager (parcs, jardins, espaces verts, terrains de sport)',
        romes: [Array],
        blocs_competences: [Array],
        voix_acces: [Array],
        cfd: '50321405'
    },
    mefs: { mefs10: [Array], mefs8: [Array], mefs_aproximation: [] }*/

    /* if (!updatedNeeded) {
      console.info(`Training ${trainingItem._id} nothing to do`);
      return;
    }

    try {
      updatedTraining.last_update_at = Date.now();
      await Formation.findOneAndUpdate({ _id: trainingItem._id }, updatedTraining, { new: true });
      console.info(`Training ${trainingItem._id} has been updated`);
      // Add trainings
      if (!updateOnly) {
        await asyncForEach(trainingsToCreate, async trainingToAdd => {
          delete trainingToAdd._id;
          const doc = new Formation(trainingToAdd);
          await doc.save();
          logger.info(`Training ${doc._id} has been added`);
        });
      }
    } catch (error) {
      console.error(error);
    }*/
  });
};

module.exports = { run };
