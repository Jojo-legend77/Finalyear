const sequelize = require("../config/database");
const User = require("./User");
const Student = require("./Student");
const ParentStudent = require("./ParentStudent");
const TeacherStudent = require("./TeacherStudent");
const Attendance = require("./Attendance");
const Grade = require("./Grade");
const BehaviorReport = require("./BehaviorReport");
const Notification = require("./Notification");
const SystemSetting = require("./SystemSetting");

User.belongsToMany(Student, {
  through: ParentStudent,
  as: "children",
  foreignKey: "parentId",
  otherKey: "studentId",
});
Student.belongsToMany(User, {
  through: ParentStudent,
  as: "parents",
  foreignKey: "studentId",
  otherKey: "parentId",
});

User.belongsToMany(Student, {
  through: TeacherStudent,
  as: "assignedStudents",
  foreignKey: "teacherId",
  otherKey: "studentId",
});
Student.belongsToMany(User, {
  through: TeacherStudent,
  as: "teachers",
  foreignKey: "studentId",
  otherKey: "teacherId",
});

TeacherStudent.belongsTo(Student, { foreignKey: "studentId", as: "student" });
TeacherStudent.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });
ParentStudent.belongsTo(Student, { foreignKey: "studentId", as: "student" });
ParentStudent.belongsTo(User, { foreignKey: "parentId", as: "parent" });

Student.hasMany(Attendance, { foreignKey: "studentId", as: "attendanceRecords" });
Attendance.belongsTo(Student, { foreignKey: "studentId", as: "student" });
Attendance.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

Student.hasMany(Grade, { foreignKey: "studentId", as: "grades" });
Grade.belongsTo(Student, { foreignKey: "studentId", as: "student" });
Grade.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

Student.hasMany(BehaviorReport, { foreignKey: "studentId", as: "behaviorReports" });
BehaviorReport.belongsTo(Student, { foreignKey: "studentId", as: "student" });
BehaviorReport.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  Student,
  ParentStudent,
  TeacherStudent,
  Attendance,
  Grade,
  BehaviorReport,
  Notification,
  SystemSetting,
};
