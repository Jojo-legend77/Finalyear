const axios = require("axios");
const env = require("../config/env");
const { Attendance, Grade, BehaviorReport, Student, ParentStudent, TeacherStudent } = require("../models");
const { ok, fail } = require("../utils/response");

const getStudentIdsForUser = async (user) => {
  if (user.role === "admin") {
    const students = await Student.findAll({ attributes: ["id"] });
    return students.map((item) => item.id);
  }

  if (user.role === "parent") {
    const links = await ParentStudent.findAll({ where: { parentId: user.id }, attributes: ["studentId"] });
    return links.map((item) => item.studentId);
  }

  if (user.role === "teacher") {
    const links = await TeacherStudent.findAll({ where: { teacherId: user.id }, attributes: ["studentId"] });
    return links.map((item) => item.studentId);
  }

  return [];
};

const buildFeaturesForStudent = async (studentId) => {
  const [student, attendance, grades, behaviorReports] = await Promise.all([
    Student.findByPk(studentId),
    Attendance.findAll({ where: { studentId } }),
    Grade.findAll({ where: { studentId } }),
    BehaviorReport.findAll({ where: { studentId } }),
  ]);

  const attendanceRate = attendance.length
    ? attendance.filter((record) => record.status === "present").length / attendance.length
    : 1;
  const avgGradePercent = grades.length
    ? grades.reduce((sum, item) => sum + Number(item.score / item.maxScore) * 100, 0) / grades.length
    : 0;
  const behaviorRiskScore = behaviorReports.length
    ? behaviorReports.reduce((sum, item) => {
        const map = { LOW: 1, MEDIUM: 2, HIGH: 3 };
        return sum + (map[item.severity] || 0);
      }, 0) / behaviorReports.length
    : 0;

  return {
    studentId,
    studentName: `${student.firstName} ${student.lastName}`,
    attendanceRate: Number(attendanceRate.toFixed(4)),
    avgGradePercent: Number(avgGradePercent.toFixed(2)),
    behaviorRiskScore: Number(behaviorRiskScore.toFixed(2)),
    attendanceCount: attendance.length,
    gradeCount: grades.length,
    behaviorCount: behaviorReports.length,
  };
};

const buildDataset = async (studentIds) => {
  if (!studentIds.length) return [];
  return Promise.all(studentIds.map((id) => buildFeaturesForStudent(id)));
};

const predictRisk = async (req, res) => {
  try {
    const studentIds = await getStudentIdsForUser(req.user);
    const ids = req.query.studentId
      ? studentIds.filter((id) => id === Number(req.query.studentId))
      : studentIds;

    if (!ids.length) return ok(res, { records: [], predictions: [] }, "No accessible students");

    const records = await buildDataset(ids);
    const response = await axios.post(
      `${env.aiServiceUrl}/predict`,
      { records },
      {
        timeout: 15000,
      },
    );

    return ok(res, response.data, "AI risk prediction generated");
  } catch (error) {
    return fail(res, error.response?.data?.message || error.message, 500);
  }
};

const trainModel = async (req, res) => {
  try {
    const studentIds = await getStudentIdsForUser(req.user);
    if (!studentIds.length) return fail(res, "No students available for training", 400);

    const records = await buildDataset(studentIds);
    const response = await axios.post(
      `${env.aiServiceUrl}/train`,
      { records },
      {
        timeout: 20000,
      },
    );

    return ok(res, response.data, "AI model trained");
  } catch (error) {
    return fail(res, error.response?.data?.message || error.message, 500);
  }
};

const aiSummary = async (req, res) => {
  try {
    const studentIds = await getStudentIdsForUser(req.user);
    if (!studentIds.length) return ok(res, { summary: "No student data available yet." });

    const records = await buildDataset(studentIds);
    const response = await axios.post(`${env.aiServiceUrl}/summary`, { records }, { timeout: 10000 });
    return ok(res, response.data, "AI summary generated");
  } catch (error) {
    return fail(res, error.response?.data?.message || error.message, 500);
  }
};

module.exports = { predictRisk, trainModel, aiSummary };
