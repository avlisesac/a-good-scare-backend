const { Router } = require("express");
const { body } = require('express-validator');
const { register } = require("../controllers/auth");
const router = Router();

const validateRegister = [
    body('email').isEmail().notEmpty().withMessage('Email is a required field.').trim().escape(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.').trim().escape(),
];

router.post('/register', validateRegister, register);

module.exports = router;