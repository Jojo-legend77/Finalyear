const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );

module.exports = { signToken };
