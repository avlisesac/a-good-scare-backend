import { eq } from "drizzle-orm";
import { usersTable } from "../src/db/schema";
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var db = require("../db");

require("dotenv").config();

export const register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      msg: "Validation error",
      errors: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;
    const existingUserWithEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUserWithEmail) {
      return res.status(409).json({
        status: "error",
        msg: "User with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await db.insert(usersTable).values({
      email: email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    return res.status(201).json({
      status: "success",
      msg: "User created succesfully.",
      user: {
        id: newUser.id,
        email: newUser.email,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      msg: "Internal server error.",
      errors: error.message,
    });
  }
};
