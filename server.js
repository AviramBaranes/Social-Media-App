const express = require("express");
const http = require("http");
const next = require("next");
const cors = require("cors");

const app = express();
const server = http.Server(app);

const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });

const handler = nextApp.getRequestHandler();

require("dotenv").config({ path: "./config.env" });

const signupRoute = require("./Backend/routes/signup");
const authRoute = require("./Backend/routes/auth");

const connectDb = require("./utilsServer/connectDb");

connectDb();
app.use(express.json());
const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  app.use(cors());
  app.use("/api/signup", signupRoute);
  app.use("/api/auth", authRoute);

  app.all("*", (req, res) => handler(req, res));
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Express server running on ${PORT}`);
  });
});
