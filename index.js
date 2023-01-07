import cookieSession from "cookie-session";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import findConfig from "find-config";
import route from "./components/root/root.route.js";
import DbConnect from "./config/db/index.js";
import { Server } from "socket.io";
import http from "http";
import presentationModel from "./models/presentation.model.js";
import questionModel from "./models/question.model.js";

dotenv.config({ path: findConfig(".env") });

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

DbConnect();

app.use(cookieSession({ name: "session", keys: ["ptudwnc-midterm"], maxAge: 24 * 60 * 60 * 100 }));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

route(app);

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("vote", async (data) => {
    try {
      await presentationModel.findByIdAndUpdate(data._id, data);
      io.emit("voted", data);
    } catch (e) {
      io.emit("voted", null);
    }
  });

  socket.on("clientChangeSlideIndex", (data) =>
    io.emit("changeSlideIndex", data)
  );

  socket.on("clientStartPresent", (data) => io.emit("startPresent", data));

  socket.on("clientStopPresent", async (data) => {
    try {
      await questionModel.remove({ presentationId: data });
    } catch (error) {}

    io.emit("stopPresent", data);
  });

  socket.on("clientSendQuestion", async (data) => {
    try {
      const { userName, presentationId, content } = data;
      const newQuestion = await questionModel.create({
        userName,
        presentationId,
        content,
        hasAnswer: false,
        createdDate: new Date(),
        vote: 0,
      });

      io.emit("sendQuestion", newQuestion);
    } catch (error) {
      io.emit("sendQuestion", null);
    }
  });
  socket.on("clientUpdateQuestion", async (data) => {
    try {
      const newQuestion = await questionModel.findOneAndUpdate(
        { _id: data?._id },
        {
          $set: {
            vote: data.vote,
          },
        }
      );
      io.emit("updateQuestion", newQuestion);
    } catch (error) {
      io.emit("updateQuestion", null);
    }
  });
  socket.on("clientSendQuestion", async (data) => {
    try {
      const { userName, presentationId, content } = data;
      const newQuestion = await questionModel.create({
        userName,
        presentationId,
        content,
        hasAnswer: false,
        createdDate: new Date(),
        vote: 0,
      });

      io.emit("sendQuestion", newQuestion);
    } catch (error) {
      io.emit("sendQuestion", null);
    }
  });
  socket.on("clientUpdateQuestion", async (data) => {
    try {
      const newQuestion = await questionModel.findOneAndUpdate(
        { _id: data?._id },
        {
          $set: {
            vote: data.vote,
          },
        }
      );
      io.emit("updateQuestion", newQuestion);
    } catch (error) {
      io.emit("updateQuestion", null);
    }
  });
});

server.listen(process.env.PORT || 1400, () => {
  console.log("Server started on " + process.env.PORT || 1400);
});
