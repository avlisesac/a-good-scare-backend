require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bcrypt = require("bcryptjs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const db = require("./db");
const { usersTable } = require("./src/db/schema");
const { eq } = require("drizzle-orm");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);

app.post("/api/register", async (req, res, next) => {
  console.log("req.body:", req.body);
  try {
    const { email, password } = req.body;
    const missingRequiredParametersMessage = "Missing required parameters:";
    const missingRequiredParameters = [];
    if (!email) {
      missingRequiredParameters.push("email");
    }
    if (!password) {
      missingRequiredParameters.push("password");
    }
    if (missingRequiredParameters.length > 0) {
      missingRequiredParametersMessage +=
        missingRequiredParameters.concat(", ");
      throw missingRequiredParametersMessage;
    }

    // Check for existing user w/ email.
    const existingUsersWithEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
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
    const newUser = await db.insert(usersTable).values(insertValues);

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

module.exports = app;
