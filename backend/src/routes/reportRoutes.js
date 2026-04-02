const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  getStudentReport,
  getSystemSummary,
  getClassSummary,
  getMySummary,
} = require("../controllers/reportController");

const router = express.Router();

router.use(authenticate);

router.get("/my-summary", authorize("parent", "teacher", "admin", "director"), getMySummary);
router.get("/summary/system", authorize("admin", "director"), getSystemSummary);
router.get("/summary/class/:className", authorize("teacher", "admin", "director"), getClassSummary);
router.get("/student/:studentId", authorize("parent", "teacher", "admin", "director"), getStudentReport);

module.exports = router;
