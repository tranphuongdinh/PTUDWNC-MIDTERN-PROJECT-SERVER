const authRoutes = require("../auth/auth.routes");

const route = (app) => {
  app.use("/api", authRoutes);
};

module.exports = route;
