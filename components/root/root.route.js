import authRoutes from "../auth/auth.routes.js";

const route = (app) => {
  app.use("/api", authRoutes);
};

export default route;
