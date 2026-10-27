const app = require("./app");
const config = require("./config");

const server = app.listen(config.port, () => {
  console.log(`SerieApp backend lyssnar på port ${config.port}`);
});

module.exports = server;
