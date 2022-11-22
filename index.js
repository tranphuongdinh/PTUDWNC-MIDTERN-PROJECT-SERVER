import cookieSession from "cookie-session";
import cors from "cors";
import express from "express";
import route from "./components/root/root.route.js";
import DbConnect from "./config/db/index.js";
import { PORT } from "./constants/common.js";
const app = express();

DbConnect();

app.use(cookieSession({ name: "session", keys: ["ptudwnc-midterm"], maxAge: 24 * 60 * 60 * 100 }));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

route(app);

app.listen(PORT, () => {
  console.log("Server started on " + PORT);
});
