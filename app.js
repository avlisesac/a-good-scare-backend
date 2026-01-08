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

// TODO: Move to route file
app.post("/api/register", async (req, res, next) => {
  console.log("req.body:", req.body);
  try {
    const { email, password } = req.body;
    let missingRequiredParametersMessage = "Missing required parameters: ";
    const missingRequiredParameters = [];
    if (!email) {
      missingRequiredParameters.push("email");
    }
    if (!password) {
      missingRequiredParameters.push("password");
    }
    if (missingRequiredParameters.length > 0) {
      console.log("missingRequiredParameters:", missingRequiredParameters);
      missingRequiredParametersMessage += missingRequiredParameters.join(", ");
      throw missingRequiredParametersMessage;
    }

    // Check for existing user w/ email.
    const existingUsersWithEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    console.log("existingUsersWithEmail:", existingUsersWithEmail);

    if (existingUsersWithEmail && existingUsersWithEmail.length > 0) {
      throw "User with this email already exists.";
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("hashedPassword:", hashedPassword);
    const insertValues = {
      email: email,
      password: hashedPassword,
    };
    console.log("insertValues:", insertValues);
    const newUser = await db.insert(users).values(insertValues);

    res.status(201).send({
      message: "user created successfully",
      newUser,
    });
  } catch (error) {
    console.error("error:", error);
    res.status(500).send({
      message: ("Error creating user:", error),
      error,
    });
  }
});

app.get("/api/free-endpoint", (req, res) => {
  res.json({ message: "this data is avail to all!" });
});

app.get("/api/auth-endpoint", authModule.auth, (req, res) => {
  res.json({ message: "this data is limited to authorized users." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "an error occured.");
});

module.exports = app;
