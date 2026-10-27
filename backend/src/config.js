require("dotenv").config();

const config = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  nodeEnv: process.env.NODE_ENV || "development"
};

if (!config.jwtSecret) {
  if (config.nodeEnv === "production") {
    throw new Error("JWT_SECRET måste sättas i produktion");
  }
  config.jwtSecret = "dev-secret";
}

module.exports = config;
