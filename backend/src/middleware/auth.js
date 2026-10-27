const jwt = require("jsonwebtoken");
const config = require("../config");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Du måste vara inloggad" });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Ogiltig eller utgången session" });
  }
}

module.exports = { authRequired };
