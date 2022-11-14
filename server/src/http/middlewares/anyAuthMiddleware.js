const config = require("config");

module.exports = (req, res, next) => {
  // console.log(req.user);
  switch (true) {
    // Auth via passport (cookie)
    case !!req.user:
      next();
      break;
    // Auth via API-KEY
    case !!req.get("API-Key"):
      if (config.apiKey === req.get("API-Key")) {
        next();
      } else {
        res.status(401).json({ error: "Unauthorized API Key" });
      }
      break;
    default:
      res.status(401).json({ message: "Accès non autorisé" });
      break;
  }
};
