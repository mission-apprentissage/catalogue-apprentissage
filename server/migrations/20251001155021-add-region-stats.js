module.exports = {
  async up(db, client) {
    const consoleStats = db.collection("consolestats");

    await consoleStats.updateMany({ academie: null }, { $set: { region: null } });

    const correspondances = new Map([
      ["Lyon", "Auvergne-Rhône-Alpes"],
      ["Montpellier", "Occitanie"],
      ["Nancy-Metz", "Grand Est"],
      ["Poitiers", "Nouvelle-Aquitaine"],
      ["Rennes", "Bretagne"],
      ["Strasbourg", "Grand Est"],
      ["Toulouse", "Occitanie"],
      ["Nantes", "Pays de la Loire"],
      ["Orléans-Tours", "Centre-Val de Loire"],
      ["Reims", "Grand Est"],
      ["Amiens", "Hauts-de-France"],
      ["Limoges", "Nouvelle-Aquitaine"],
      ["Nice", "Provence-Alpes-Côte d'Azur"],
      ["Créteil", "Île-de-France"],
      ["Versailles", "Île-de-France"],
      ["Corse", "Corse"],
      ["La Réunion", "La Réunion"],
      ["Martinique", "Martinique"],
      ["Guadeloupe", "Guadeloupe"],
      ["Guyane", "Guyane"],
      ["Mayotte", "Mayotte"],
      ["Normandie", "Normandie"],
      ["Paris", "Île-de-France"],
      ["Aix-Marseille", "Provence-Alpes-Côte d'Azur"],
      ["Besançon", "Bourgogne-Franche-Comté"],
      ["Bordeaux", "Nouvelle-Aquitaine"],
      ["Clermont-Ferrand", "Auvergne-Rhône-Alpes"],
      ["Dijon", "Bourgogne-Franche-Comté"],
      ["Grenoble", "Auvergne-Rhône-Alpes"],
      ["Lille", "Hauts-de-France"],
    ]);

    for (const [academie, region] of correspondances) {
      console.log([academie, region]);
      await consoleStats.updateMany({ academie }, { $set: { region } });
    }
  },

  async down(db, client) {},
};
