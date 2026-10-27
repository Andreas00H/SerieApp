const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const titlesRoutes = require("./routes/titles");
const tvmazeRoutes = require("./routes/tvmaze");
const { notFound, errorHandler } = require("./middleware/errors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/titles", titlesRoutes);
app.use("/api/tvmaze", tvmazeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
