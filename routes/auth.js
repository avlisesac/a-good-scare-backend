const jwt = require("jsonwebtoken");
var express = require("express");
var db = require("../db");
const { users } = require("../src/db/schema");
const { eq, sql } = require("drizzle-orm");
var router = express.Router();
var bcrypt = require("bcryptjs");

const onProd = process.env.NODE_ENV === "production";

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
    const { email: rawEmail, username: rawUsername, password } = req.body;

    const trimmedEmail = rawEmail.trim();
    const trimmedUsername = rawUsername.trim();

    let missingRequiredParametersMessage = "Missing required parameters: ";
    const missingRequiredParameters = [];
    if (!trimmedEmail) {
      missingRequiredParameters.push("email");
    }
    if (!trimmedUsername) {
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

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      throw "Username must be between 3 and 30 characters.";
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      throw "Username may only contain letters, numbers, and underscores.";
    }
    if (password.length < 8) {
      throw "Password must be at least 8 characters long.";
    }

    // Check for existing user w/ email.
    const existingUsersWithEmail = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${trimmedEmail})`);
    console.log("existingUsersWithEmail:", existingUsersWithEmail);

    if (existingUsersWithEmail && existingUsersWithEmail.length > 0) {
      emailExists = true;
      throw "User with this email already exists.";
    }

    // Check for existing user w/ username.
    const existingUsersWithUsername = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${trimmedUsername})`);
    console.log("existingUsersWithUsername:", existingUsersWithUsername);
    if (existingUsersWithUsername && existingUsersWithUsername.length > 0) {
      usernameExists = true;
      throw "User with this username already exists.";
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("hashedPassword:", hashedPassword);
    const insertValues = {
      email: trimmedEmail,
      username: trimmedUsername,
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
  const loginErrorMessage = "Invalid username/email or password.";
  try {
    const { idField: rawIdField, password } = req.body;
    const trimmedIdField = rawIdField.trim();
    let missingRequiredParametersMessage = "Missing required parameters: ";
    const missingRequiredParameters = [];
    if (!trimmedIdField) {
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
          LOWER(${users.email}) = LOWER(${trimmedIdField})
          OR LOWER(${users.username}) = LOWER(${trimmedIdField})
        `,
      )
      .limit(1);

    if (usersFound.length === 0) {
      console.error("username/email not found.");
      throw loginErrorMessage;
    }

    const targetUser = usersFound[0];

    const passwordsMatch = await bcrypt.compare(password, targetUser.password);

    if (!passwordsMatch) {
      console.error("password incorrect");
      throw loginErrorMessage;
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
      { expiresIn: process.env.JWT_EXPIRATION_TIME },
    );

    const cookieOptions = {
      httpOnly: true,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    };

    if (onProd) {
      cookieOptions.domain = ".agoodscare.com";
      cookieOptions.secure = true;
      cookieOptions.sameSite = "none";
    } else {
      cookieOptions.secure = false;
      cookieOptions.sameSite = "lax";
    }

    res.cookie("auth_token", token, cookieOptions);

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
    secure: onProd ? true : false,
    sameSite: onProd ? "none" : "lax",
  });
  res.json({ message: "Logged out." });
});

module.exports = {
  auth,
  router,
};
