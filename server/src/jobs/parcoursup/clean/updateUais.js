const { isValideUAI } = require("@mission-apprentissage/tco-service-node");
const { Formation } = require("../../../common/models");
const { runScript } = require("../../scriptWrapper");

/**
 * Lors du premier envoi vers PSUP, certaines formations sont revenues avec une erreur sur l'UAI lieu de formation ayant changé.
 * Ce script met à jour les formations avec les UAIs retournés par PSUP.
 */
const updateFormationUais = async () => {
  const toUpdate = {
    // "109917P01314281352550004313002975400012-59009#L01": "0597266C",
    // "106905P01111953008190001619530081900016-53130#L01": "0530909A",
    // "087941P01111942004240002719420079600010-42218#L01": "0420079H",
    // "093637P01115030492150002677912879200024-43041#L01": "0430055B",
    // "104239P01214853882010004177746035300017-22278#L01": "0222052L",
    // "083144P01211953008190001619530081900016-53130#L01": "0530909A",
    // "081408P01111969025060005019260791900029-26281#L01": "0261352D",
    // "089753P01111942004240002719420079600010-42218#L01": "0420079H",
    // "020881P01111942121060002619421210600026-42330#L01": "0422326A",
    // "069318P01111969025060005019421210600026-42330#L01": "0422326A",
    // "081348P01117757225720092977572257200929-16113#L01": "0161192J",
    // "106333P01111953008190001619530081900016-53130#L01": "0530909A",
    // "104285P01113029314310001930293143100019-69190#L01": "0692436Y",
    // "100367P01214853882010004177746035300017-22278#L01": "0222052L",
    // "104239P01211901001640002819010017200013-01053#L01": "0010017N",
    // "100367P01211901001640002819010017200013-01053#L01": "0010017N",
    // "078105P012X1969025060005019421078700041-42159#L01": "0421858S",
    // "081408P01111969025060005019421078700041-42170#L01": "0422329D",
  };

  let [ok, ko] = [0, 0];

  for (let [cle_ministere_educatif, uai_formation] of Object.entries(toUpdate)) {
    try {
      if (!cle_ministere_educatif) {
        throw `cle_ministere_educatif non transmise`;
      }

      if (!isValideUAI(uai_formation)) {
        throw `UAI invalide : ${uai_formation}`;
      }

      const formation = await Formation.findOne({ cle_ministere_educatif });

      const editedFields = { ...formation.editedFields, uai_formation };
      const updates_history = [
        ...formation.updates_history,
        {
          from: {
            uai_formation: formation.uai_formation,
          },
          to: {
            uai_formation,
            last_update_who: "Parcoursup",
          },
          updated_at: new Date(),
        },
      ];

      await Formation.updateOne({ cle_ministere_educatif }, { uai_formation, updates_history, editedFields });
      ok++;
    } catch (err) {
      console.error(err);
      ko++;
    }
  }

  console.log({ ok, ko });
};

module.exports = updateFormationUais;

if (process.env.standalone) {
  runScript(async () => await updateFormationUais());
}
