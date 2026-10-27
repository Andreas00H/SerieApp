function notFound(req, res) {
  res.status(404).json({ error: "Slutpunkten hittades inte" });
}

function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Ogiltig JSON i anropet" });
  }
  console.error(err);
  res.status(500).json({ error: "Något gick fel på servern" });
}

module.exports = { notFound, errorHandler };
