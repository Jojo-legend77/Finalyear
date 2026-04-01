const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { listMyNotifications, markNotificationRead } = require("../controllers/notificationController");

const router = express.Router();

router.use(authenticate);
router.get("/", listMyNotifications);
router.patch("/:id/read", markNotificationRead);

module.exports = router;
