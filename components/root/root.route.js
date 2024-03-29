import authRoutes from "../auth/auth.routes.js";
import groupRoutes from "../group/group.routes.js";
import userRoutes from "../user/user.routes.js";
import presentationRouters from "../presentation/presentation.routes.js";

const route = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/group", groupRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/presentation", presentationRouters);
};

export default route;
