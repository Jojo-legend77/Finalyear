const { Op } = require("sequelize");
const { Notification } = require("../models");
const { ok, fail } = require("../utils/response");

const listMyNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const sinceMinutes = Number(req.query.sinceMinutes || 0);
    const where = { userId: req.user.id };

    if (Number.isFinite(sinceMinutes) && sinceMinutes > 0) {
      where.createdAt = { [Op.gte]: new Date(Date.now() - sinceMinutes * 60 * 1000) };
    }

    const notifications = await Notification.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
    });
    return ok(res, notifications);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) return fail(res, "Notification not found", 404);

    notification.isRead = true;
    await notification.save();
    return ok(res, notification, "Notification marked as read");
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

module.exports = { listMyNotifications, markNotificationRead };
