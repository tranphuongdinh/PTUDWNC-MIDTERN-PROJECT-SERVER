import cookieSession from "cookie-session";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import findConfig from "find-config";
import route from "./components/root/root.route.js";
import DbConnect from "./config/db/index.js";
import { Server } from "socket.io";
import http from "http"
import presentationModel from "./models/presentation.model.js";

dotenv.config({ path: findConfig(".env") });

const app = express();

DbConnect();

app.use(cookieSession({ name: "session", keys: ["ptudwnc-midterm"], maxAge: 24 * 60 * 60 * 100 }));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

route(app);

const server = http.createServer(app)

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("vote", async (data) => {
    try {
      await presentationModel.findByIdAndUpdate(data._id, data);
      io.emit("voted", data);
    } catch (e) {
      io.emit("voted", null)
    }
  });

  socket.on("clientChangeSlideIndex", data => io.emit("changeSlideIndex", data))
});

server.listen(process.env.PORT || 1400, () => {
  console.log("Server started on " + process.env.PORT || 1400);
});