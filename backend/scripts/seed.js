require("dotenv").config();
const bcrypt = require("bcryptjs");
const {
  sequelize,
  User,
  Student,
  ParentStudent,
  TeacherStudent,
  SystemSetting,
} = require("../src/models");

async function run() {
  await sequelize.sync({ alter: true });

  const adminPass = await bcrypt.hash("Admin@123", 10);
  const teacherPass = await bcrypt.hash("Teacher@123", 10);
  const parentPass = await bcrypt.hash("Parent@123", 10);

  const [admin] = await User.findOrCreate({
    where: { email: "admin@school.local" },
    defaults: {
      fullName: "System Admin",
      email: "admin@school.local",
      passwordHash: adminPass,
      role: "admin",
      status: "active",
    },
  });

  const [teacher] = await User.findOrCreate({
    where: { email: "teacher@school.local" },
    defaults: {
      fullName: "Class Teacher",
      email: "teacher@school.local",
      passwordHash: teacherPass,
      role: "teacher",
      status: "active",
    },
  });

  const [parent] = await User.findOrCreate({
    where: { email: "parent@school.local" },
    defaults: {
      fullName: "Parent User",
      email: "parent@school.local",
      passwordHash: parentPass,
      role: "parent",
      status: "active",
    },
  });

  const [student] = await Student.findOrCreate({
    where: { registrationNumber: "STU-0001" },
    defaults: {
      firstName: "Ali",
      lastName: "Hassan",
      className: "Grade 7",
      section: "A",
      registrationNumber: "STU-0001",
      status: "active",
    },
  });

  await ParentStudent.findOrCreate({
    where: { parentId: parent.id, studentId: student.id },
    defaults: { relationship: "Guardian" },
  });

  await TeacherStudent.findOrCreate({
    where: { teacherId: teacher.id, studentId: student.id },
  });

  await SystemSetting.findOrCreate({
    where: { key: "school_name" },
    defaults: {
      value: "Future School",
      description: "Displayed school name",
    },
  });

  console.log("Seed complete.");
  console.log("Admin:", admin.email, "password:", "Admin@123");
  console.log("Teacher:", teacher.email, "password:", "Teacher@123");
  console.log("Parent:", parent.email, "password:", "Parent@123");
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
