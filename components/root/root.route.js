import authRoutes from "../auth/auth.routes.js";
import groupRoutes from '../group/group.routes.js';

const route = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/group', groupRoutes);
};

export default route;
