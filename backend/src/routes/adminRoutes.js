const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  listUsers,
  createUser,
  createStudent,
  assignParentToStudent,
  assignTeacherToStudent,
  listStudents,
  listSystemSettings,
  upsertSystemSetting,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.get("/students", listStudents);
router.post("/students", createStudent);
router.post("/students/assign-parent", assignParentToStudent);
router.post("/students/assign-teacher", assignTeacherToStudent);
router.get("/settings", listSystemSettings);
router.post("/settings", upsertSystemSetting);

module.exports = router;
