const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./config/db");
const route = require("./components/root/root.route");

const { PORT } = require("./constants/common");

db.connect();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

route(app);

app.listen(PORT, () => {
  console.log("Server started on " + PORT);
});
