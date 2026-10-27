function notFound(req, res) {
  res.status(404).json({ error: "Endpoint not found" });
}

function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
}

module.exports = { notFound, errorHandler };
