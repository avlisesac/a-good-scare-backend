const jwt = require("jsonwebtoken");
var express = require("express");
var db = require("../db");
const { users } = require("../src/db/schema");
const { eq, sql } = require("drizzle-orm");
var router = express.Router();
var bcrypt = require("bcryptjs");

const auth = async (req, res, next) => {
  try {
    console.log("auth cookies:", req.cookies);
    const token = await req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = decoded.user;
    console.log("user:", user);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

router.get("/me", auth, (req, res, next) => {
  const user = req.user;
  if (user) {
    res.json(user);
  }
  next();
});

router.post("/register", async (req, res, next) => {
  console.log("req.body:", req.body);
  let usernameExists = false;
  let emailExists = false;
  try {
    const { email, username, password } = req.body;
    let missingRequiredParametersMessage = "Missing required parameters: ";
    const missingRequiredParameters = [];
    if (!email) {
      missingRequiredParameters.push("email");
    }
    if (!username) {
      missingRequiredParameters.push("username");
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
      .where(sql`LOWER(${users.email}) = LOWER(${email})`);
    console.log("existingUsersWithEmail:", existingUsersWithEmail);

    if (existingUsersWithEmail && existingUsersWithEmail.length > 0) {
      emailExists = true;
      throw "User with this email already exists.";
    }

    // Check for existing user w/ username.
    const existingUsersWithUsername = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${username})`);
    console.log("existingUsersWithUsername:", existingUsersWithUsername);
    if (existingUsersWithUsername && existingUsersWithUsername.length > 0) {
      usernameExists = true;
      throw "User with this username already exists.";
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("hashedPassword:", hashedPassword);
    const insertValues = {
      email: email,
      username: username,
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
      reason: emailExists
        ? "emailExists"
        : usernameExists
        ? "usernameExists"
        : null,
      error,
    });
  }
});

router.post("/login", async (req, res) => {
  console.log("req.body:", req.body);
  try {
    const { idField, password } = req.body;
    let missingRequiredParametersMessage = "Missing required parameters: ";
    const missingRequiredParameters = [];
    if (!idField) {
      missingRequiredParameters.push("idField");
    }
    if (!password) {
      missingRequiredParameters.push("password");
    }
    if (missingRequiredParameters.length > 0) {
      console.log("missingRequiredParameters:", missingRequiredParameters);
      missingRequiredParametersMessage += missingRequiredParameters.join(", ");
      throw missingRequiredParametersMessage;
    }

    const usersFound = await db
      .select()
      .from(users)
      .where(
        sql`
          LOWER(${users.email}) = LOWER(${idField})
          OR LOWER(${users.username}) = LOWER(${idField})
        `
      )
      .limit(1);

    if (usersFound.length === 0) {
      throw "No user found with this email address or username.";
    }

    const targetUser = usersFound[0];

    const passwordsMatch = await bcrypt.compare(password, targetUser.password);

    if (!passwordsMatch) {
      throw "Password is incorrect.";
    }

    const token = jwt.sign(
      {
        user: {
          id: targetUser.id,
          email: targetUser.email,
          username: targetUser.username,
        },
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      // TODO: ensure this is set on live env.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).send({
      message: "Login Successful",
      user: {
        id: targetUser.id,
        email: targetUser.email,
        username: targetUser.username,
      },
    });
  } catch (error) {
    console.error("error:", error);
    res.status(400).send({
      error: error,
      message: error,
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out." });
});

module.exports = {
  auth,
  router,
};
