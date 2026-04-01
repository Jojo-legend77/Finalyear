const bcrypt = require("bcryptjs");
const {
  User,
  Student,
  ParentStudent,
  TeacherStudent,
  SystemSetting,
  Notification,
} = require("../models");
const { ok, created, fail } = require("../utils/response");

const listUsers = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["passwordHash"] },
      order: [["createdAt", "DESC"]],
    });
    return ok(res, users, "Users fetched");
  } catch (error) {
    return fail(res, "Failed to fetch users", 500, error.message);
  }
};

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      return fail(res, "fullName, email, password and role are required", 400);
    }

    if (!["parent", "teacher", "admin"].includes(role)) {
      return fail(res, "Invalid role", 400);
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return fail(res, "Email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, email, passwordHash, role, status: "active" });
    return created(
      res,
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      "User created",
    );
  } catch (error) {
    return fail(res, "Failed to create user", 500, error.message);
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      className,
      dateOfBirth,
      section,
      parentIds = [],
      teacherIds = [],
    } = req.body;

    if (!firstName || !lastName || !className) {
      return fail(res, "firstName, lastName and className are required", 400);
    }

    const student = await Student.create({
      firstName,
      lastName,
      className,
      dateOfBirth: dateOfBirth || null,
      section: section || null,
    });

    if (Array.isArray(parentIds) && parentIds.length > 0) {
      const parentUsers = await User.findAll({ where: { id: parentIds, role: "parent" } });
      await Promise.all(
        parentUsers.map((parent) =>
          ParentStudent.findOrCreate({ where: { parentId: parent.id, studentId: student.id } }),
        ),
      );
    }

    if (Array.isArray(teacherIds) && teacherIds.length > 0) {
      const teacherUsers = await User.findAll({ where: { id: teacherIds, role: "teacher" } });
      await Promise.all(
        teacherUsers.map((teacher) =>
          TeacherStudent.findOrCreate({ where: { teacherId: teacher.id, studentId: student.id } }),
        ),
      );
    }

    return created(res, student, "Student created");
  } catch (error) {
    return fail(res, "Failed to create student", 500, error.message);
  }
};

const listStudents = async (_req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        { model: User, as: "parents", attributes: ["id", "fullName", "email"], through: { attributes: [] } },
        { model: User, as: "teachers", attributes: ["id", "fullName", "email"], through: { attributes: [] } },
      ],
      order: [
        ["className", "ASC"],
        ["firstName", "ASC"],
      ],
    });
    return ok(res, students, "Students fetched");
  } catch (error) {
    return fail(res, "Failed to fetch students", 500, error.message);
  }
};

const assignParentToStudent = async (req, res) => {
  try {
    const { studentId, parentId } = req.body;
    if (!studentId || !parentId) {
      return fail(res, "studentId and parentId are required", 400);
    }

    const student = await Student.findByPk(studentId);
    const parent = await User.findOne({ where: { id: parentId, role: "parent" } });

    if (!student || !parent) {
      return fail(res, "Student or parent not found", 404);
    }

    await ParentStudent.findOrCreate({ where: { studentId, parentId } });
    return ok(res, null, "Parent assigned to student");
  } catch (error) {
    return fail(res, "Failed to assign parent", 500, error.message);
  }
};

const assignTeacherToStudent = async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;
    if (!studentId || !teacherId) {
      return fail(res, "studentId and teacherId are required", 400);
    }

    const student = await Student.findByPk(studentId);
    const teacher = await User.findOne({ where: { id: teacherId, role: "teacher" } });

    if (!student || !teacher) {
      return fail(res, "Student or teacher not found", 404);
    }

    await TeacherStudent.findOrCreate({ where: { studentId, teacherId } });
    return ok(res, null, "Teacher assigned to student");
  } catch (error) {
    return fail(res, "Failed to assign teacher", 500, error.message);
  }
};

const listSystemSettings = async (_req, res) => {
  try {
    const settings = await SystemSetting.findAll({ order: [["key", "ASC"]] });
    return ok(res, settings, "Settings fetched");
  } catch (error) {
    return fail(res, "Failed to fetch settings", 500, error.message);
  }
};

const upsertSystemSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return fail(res, "key and value are required", 400);
    }

    const [setting] = await SystemSetting.upsert({ key, value: String(value) });
    return ok(res, setting, "Setting updated");
  } catch (error) {
    return fail(res, "Failed to update setting", 500, error.message);
  }
};

const listNotifications = async (_req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "role"] }],
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    return ok(res, notifications, "Notifications fetched");
  } catch (error) {
    return fail(res, "Failed to fetch notifications", 500, error.message);
  }
};

module.exports = {
  listUsers,
  createUser,
  listStudents,
  createStudent,
  assignParentToStudent,
  assignTeacherToStudent,
  listSystemSettings,
  upsertSystemSetting,
  listNotifications,
};
