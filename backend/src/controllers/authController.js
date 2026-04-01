const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { signToken } = require("../utils/jwt");
const { ok, created, fail } = require("../utils/response");

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
});

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role = "parent" } = req.body;
    if (!fullName || !email || !password) {
      return fail(res, "fullName, email and password are required", 400);
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return fail(res, "Email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      passwordHash: hashedPassword,
      role,
      status: "active",
    });

    const token = signToken(user);
    return created(res, {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, "email and password are required", 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return fail(res, "Invalid credentials", 401);
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return fail(res, "Invalid credentials", 401);
    }

    if (user.status !== "active") {
      return fail(res, "Account is not active", 403);
    }

    const token = signToken(user);
    return ok(res, {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

exports.me = async (req, res) => {
  return ok(res, {
    user: sanitizeUser(req.user),
  });
};
