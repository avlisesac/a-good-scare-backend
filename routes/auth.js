const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = decodedToken;
    console.log("user:", user);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: new Error("Invalid request."),
    });
  }
};

module.exports = auth;
