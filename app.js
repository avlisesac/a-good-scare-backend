require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var ratingRouter = require("./routes/rating");
var authModule = require("./routes/auth");
var watchlistRouter = require("./routes/watchlist");
const db = require("./db");
const { users } = require("./src/db/schema");
const { eq } = require("drizzle-orm");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const allowedOrigins = [
  "http://localhost:3000",
  "https://a-good-scare-frontend.onrender.com",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/rating", ratingRouter);
app.use("/api/auth", authModule.router);
app.use("/api/watchlist", watchlistRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "an error occured.");
});

module.exports = app;
