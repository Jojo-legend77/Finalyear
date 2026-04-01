const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(payload.id, {
      attributes: ["id", "fullName", "email", "role", "status"],
    });

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Unauthorized account" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authenticate };
