const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Formation } = require("../../common/models");
const logger = require("../../common/logger");
const Boom = require("boom");
const { sanitize, SAFE_UPDATE_OPERATORS } = require("../../common/utils/sanitizeUtils");
const { hasAccessTo, hasOneOfRoles } = require("../../common/utils/rolesUtils");
const { updateOneTagsHistory } = require("../../logic/updaters/tagsHistoryUpdater");
const { validateUAI } = require("../../common/utils/uaiUtils");

module.exports = () => {
  const router = express.Router();

  const putFormation = tryCatch(async ({ body, user, params }, res) => {
    const sanitizedParams = sanitize(params, SAFE_UPDATE_OPERATORS);
    const payload = sanitize(body, SAFE_UPDATE_OPERATORS);

    const itemId = sanitizedParams.id;

    const formation = await Formation.findById(itemId);
    let hasRightToEdit = user.isAdmin;
    if (!hasRightToEdit) {
      const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
      hasRightToEdit = listAcademie.includes(-1) || listAcademie.includes(Number(formation.num_academie));
    }
    if (!hasRightToEdit) {
      throw Boom.unauthorized();
    }

    logger.info({ type: "http" }, "Updating formation: ", payload);

    if (payload.uai_formation) {
      logger.info(
        { type: "http" },
        `Updating uai_formation ${formation.uai_formation} to ${payload.uai_formation} for ${formation.cle_ministere_educatif}`
      );

      if (!(await validateUAI(payload.uai_formation))) {
        throw Boom.badRequest(`${payload.uai_formation} n'est pas un code UAI valide.`);
      }

      //     if (
      //       formation.etablissement_formateur_code_commune_insee !== formation.code_commune_insee &&
      //       payload.uai_formation.trim() === formation.etablissement_formateur_uai
      //     ) {
      //       /**
      //        * NOTE:
      //        * On autorise les instructeurs à saisir le même UAI que pour le formateur même si le code_commune_insee est différent à partir d'une certaine date.
      //        * Date à modifier chaque année.
      //        */
      //       const parcoursupAllowSameUaiDate = new Date("2023-12-15T00:00:00.000Z");
      //       // TODO : Pour AFFELNET, date en attente de confirmation par la DGESCO.
      //       const affelnetAllowSameUaiDate = new Date("2024-03-14T00:00:00.000Z");

      //       if (
      //         (new Date().getTime() < parcoursupAllowSameUaiDate.getTime() &&
      //           formation.parcoursup_statut !== PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT) ||
      //         (new Date().getTime() < affelnetAllowSameUaiDate.getTime() &&
      //           formation.affelnet_statut !== AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT) ||
      //         (formation.affelnet_statut === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT &&
      //           formation.parcoursup_statut === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT)
      //       ) {
      //         throw Boom.badRequest(
      //           `Le code commune Insee du lieu de formation (${formation.code_commune_insee}, ${formation.localite}) est différent de celui du formateur (${formation.etablissement_formateur_code_commune_insee}, ${formation.etablissement_formateur_localite}). \
      // L'UAI du lieu de formation doit donc être différent de celui du formateur. Il vous appartient de vérifier auprès de l'OFA que le lieu de formation est correct et de saisir l'UAI correspondant. \
      // Si vous pensez qu’il y a une erreur sur l’une de ces données, veuillez vous rapprocher du Carif-Oref.`
      //         );
      //       }
      //     }
    }

    const result = await Formation.findOneAndUpdate(
      { _id: itemId },
      {
        ...payload,
        ...(payload.uai_formation ? { uai_formation: payload.uai_formation.trim(), uai_formation_valide: true } : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
  });

  const handleRejection = tryCatch(async (req, res) => {
    const user = req.session?.passport?.user;
    const sanitizedParams = sanitize(req.params);
    const itemId = sanitizedParams.id;
    const date = new Date();

    const formation = await Formation.findById(itemId);
    let hasRightToEdit = user.isAdmin;
    if (!hasRightToEdit) {
      hasRightToEdit = hasOneOfRoles(user, ["admin", "moss"]);
    }
    if (!hasRightToEdit) {
      const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
      hasRightToEdit =
        (listAcademie.includes(-1) || listAcademie.includes(Number(formation.num_academie))) &&
        !formation?.rejection?.handled_by;
    }
    if (!hasRightToEdit) {
      throw Boom.unauthorized();
    }

    logger.debug({ type: "http" }, `Prise en charge de la formation rejetée ${itemId} par ${user.email}`);

    const result = await Formation.findOneAndUpdate(
      { _id: itemId },
      {
        last_update_who: user.email,
        "rejection.handled_by": user.email,
        "rejection.handled_date": date,
        $push: {
          updates_history: {
            from: { rejection: { handled_by: null, handled_date: null } },
            to: {
              last_update_who: user.email,
              rejection: {
                handled_by: user.email,
                handled_date: date,
              },
            },
            updated_at: date,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
  });

  const unhandleRejection = tryCatch(async (req, res) => {
    const user = req.session?.passport?.user;
    const sanitizedParams = sanitize(req.params);
    const itemId = sanitizedParams.id;

    const formation = await Formation.findById(itemId);
    let hasRightToEdit = user.isAdmin;
    if (!hasRightToEdit) {
      hasRightToEdit = hasOneOfRoles(user, ["admin", "moss"]);
    }
    if (!hasRightToEdit) {
      const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
      hasRightToEdit =
        (listAcademie.includes(-1) || listAcademie.includes(Number(formation.num_academie))) &&
        formation?.rejection?.handled_by === user.email;
    }
    if (!hasRightToEdit) {
      throw Boom.unauthorized();
    }

    logger.debug(
      { type: "http" },
      `Annulation de la prise en charge de la formation rejetée ${itemId} par ${user.email}`
    );

    const result = await Formation.findOneAndUpdate(
      { _id: itemId },
      {
        last_update_who: user.email,
        "rejection.handled_by": null,
        "rejection.handled_date": null,
        $push: {
          updates_history: {
            from: {
              rejection: {
                handled_by: formation?.rejection?.handled_by,
                handled_date: formation?.rejection?.handled_date,
              },
            },
            to: {
              last_update_who: user.email,
              rejection: {
                handled_by: null,
                handled_date: null,
              },
            },
            updated_at: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
  });

  const reinitParcoursupStatut = tryCatch(async (req, res) => {
    const user = req.session?.passport?.user;
    const sanitizedParams = sanitize(req.params);
    const sanitizedBody = sanitize(req.body);
    const itemId = sanitizedParams.id;
    const comment = sanitizedBody.comment;
    const date = new Date();

    const formation = await Formation.findById(itemId);
    let hasRightToEdit = user.isAdmin;
    if (!hasRightToEdit) {
      hasRightToEdit = hasOneOfRoles(user, ["admin", "moss"]);
    }
    if (!hasRightToEdit) {
      hasRightToEdit = hasAccessTo(user, "page_formation/reinit_parcoursup");
    }
    if (!hasRightToEdit) {
      throw Boom.unauthorized();
    }

    logger.debug(
      { type: "http" },
      `Réinitialisation des informations de publication PARCOURSUP de la formation ${itemId} par ${user.email}`
    );

    const update = {
      parcoursup_statut: formation?.parcoursup_statut_initial,
      parcoursup_id: null,
      last_update_who: user.email,
      parcoursup_statut_reinitialisation: {
        user: user.email,
        date,
        comment,
      },
    };

    await Formation.findOneAndUpdate(
      { _id: itemId },
      {
        ...update,
        $push: {
          updates_history: {
            from: {
              parcoursup_statut: formation?.parcoursup_statut,
              parcoursup_id: formation?.parcoursup_id,
              last_update_who: formation?.last_update_who,
              parcoursup_statut_reinitialisation: {
                user: formation?.parcoursup_statut_reinitialisation?.user,
                date: formation?.parcoursup_statut_reinitialisation?.date,
                comment: formation?.parcoursup_statut_reinitialisation?.comment,
              },
            },
            to: {
              ...update,
            },
            updated_at: date,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    await updateOneTagsHistory("parcoursup_statut", itemId);

    const result = await Formation.findOne({ _id: itemId });

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
  });

  /**
   * @swagger
   *
   * /entity/formations/{id}:
   *   put:
   *     summary: Mise à jour d'une formation.
   *     tags:
   *       - Formations
   *     description: >
   *       Cette route vous permet de mettre à jour les informations d'une formation donnée.<br/><br/>
   *       **Seulement sur les champs statut**
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: "5fc6166c712d48a9881333c5"
   *     requestBody:
   *       description: L'objet JSON **doit** contenir la clé **num_academie**.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - num_academie
   *             properties:
   *               num_academie:
   *                 type: string
   *               affelnet_statut:
   *                 type: string
   *                 enum: ["non publiable en l'état", "publié", "non publié", "à publier (soumis à validation)", "à publier", "prêt pour intégration"]
   *               parcoursup_statut:
   *                 type: string
   *                 enum: ["non publiable en l'état", "publié", "non publié", "à publier (sous condition habilitation)", "à publier (vérifier accès direct postbac)", "à publier (soumis à validation Recteur)", "à publier", "prêt pour intégration"]
   *     responses:
   *       200:
   *         description: OK, retourne la formation mise à jour
   *         content:
   *            application/json:
   *              schema:
   *                   $ref: '#/components/schemas/formation'
   */
  router.put("/formations/:id", putFormation);
  router.put("/formations2021/:id", putFormation);

  router.post("/formations/:id/handle-rejection", handleRejection);
  router.post("/formations/:id/unhandle-rejection", unhandleRejection);

  router.post("/formations/:id/reinit-parcoursup-statut", reinitParcoursupStatut);

  /**
   * Route spéciale pour futurepro (ex "c'est qui le pro")
   * Retourne la liste des cle_ministere_educatif et des uai_formation associées sur le périmètre Affelnet
   */
  router.get(
    "/future-pro",
    tryCatch(async (req, res) => {
      const user = req.session?.passport?.user;

      if (!hasAccessTo(user, "page_other/future-pro")) {
        return Boom.unauthorized();
      }

      const results = await Formation.find(
        { affelnet_perimetre: true },
        { _id: 0, cle_ministere_educatif: 1, uai_formation: 1 }
      );

      res.json(results);
    })
  );
  return router;
};
