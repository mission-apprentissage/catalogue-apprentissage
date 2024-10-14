module.exports = {
  async up(db) {
    await db.collection("users").updateMany(
      {},
      {
        $pull: {
          roles: "user",
          acl: {
            $in: [
              "page_reconciliation_ps",
              "page_reconciliation_ps/validation_rejection",
              "page_reconciliation_ps/send_rapport_anomalies",
              "page_actions_expertes",
            ],
          },
        },
      }
    );
  },

  async down() {
    return Promise.resolve("ok");
  },
};
