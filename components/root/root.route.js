import authRoutes from "../auth/auth.routes.js";
import userRoutes from "../user/user.routes.js"

const route = (app) => {
  app.use("/api", authRoutes);
  app.use("/api", userRoutes);
};

export default route;
