const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");

const { MONGODB_URI } = require("./shared/constants");

const app = express();

//Middlewares
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,search,access-token"
  );

  // if (req.method === "OPTIONS") return;
  next();
});

app.use("/user", userRoutes);
app.use("/task", taskRoutes);

app.use((req, res, next) => {
  res.status(404).json("Not found!");
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(8000);
    console.log("SERVER STARTED AT PORT 8000");
  })
  .catch((err) => {
    console.log("CONNECTION ERROR", err);
  });
