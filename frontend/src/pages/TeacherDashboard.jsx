import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import Layout from "../components/Layout";

const initialAttendance = {
  studentId: "",
  date: "",
  status: "present",
  note: "",
};

const initialGrade = {
  studentId: "",
  subject: "",
  assessmentType: "Assignment",
  score: "",
  maxScore: "100",
  examDate: "",
  term: "",
  remark: "",
};

const initialBehavior = {
  studentId: "",
  incidentDate: "",
  category: "",
  severity: "MEDIUM",
  description: "",
  actionTaken: "",
};

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({ attendance: [], grades: [], behaviorReports: [] });
  const [attendanceForm, setAttendanceForm] = useState(initialAttendance);
  const [gradeForm, setGradeForm] = useState(initialGrade);
  const [behaviorForm, setBehaviorForm] = useState(initialBehavior);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const studentOptions = useMemo(
    () => students.map((student) => ({ id: student.id, label: `${student.firstName} ${student.lastName}` })),
    [students],
  );

  const load = async () => {
    try {
      const [studentsRes, recordsRes] = await Promise.all([
        api.get("/teacher/students"),
        api.get("/teacher/records/recent"),
      ]);
      setStudents(studentsRes.data.data || []);
      setRecords(recordsRes.data.data || { attendance: [], grades: [], behaviorReports: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teacher data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitAttendance = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");
    try {
      await api.post("/teacher/attendance", {
        ...attendanceForm,
        studentId: Number(attendanceForm.studentId),
      });
      setFeedback("Attendance recorded");
      setAttendanceForm(initialAttendance);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record attendance");
    }
  };

  const submitGrade = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");
    try {
      await api.post("/teacher/grades", {
        ...gradeForm,
        studentId: Number(gradeForm.studentId),
        score: Number(gradeForm.score),
        maxScore: Number(gradeForm.maxScore),
      });
      setFeedback("Grade recorded");
      setGradeForm(initialGrade);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record grade");
    }
  };

  const submitBehavior = async (event) => {
    event.preventDefault();
    setError("");
    setFeedback("");
    try {
      await api.post("/teacher/behavior", {
        ...behaviorForm,
        studentId: Number(behaviorForm.studentId),
      });
      setFeedback("Behavior report recorded");
      setBehaviorForm(initialBehavior);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record behavior");
    }
  };

  return (
    <Layout>
      <div className="stack">
      {feedback && <div className="alert success">{feedback}</div>}
      {error && <div className="alert error">{error}</div>}

      <Card title="My Assigned Students">
        <ul className="simple-list">
          {students.map((student) => (
            <li key={student.id}>
              {student.firstName} {student.lastName} - Class {student.className}
              {student.section ? `/${student.section}` : ""}
            </li>
          ))}
          {!students.length && <li>No students assigned yet.</li>}
        </ul>
      </Card>

      <div className="grid">
        <Card title="Record Attendance">
          <form onSubmit={submitAttendance} className="form stack">
            <select
              required
              value={attendanceForm.studentId}
              onChange={(e) => setAttendanceForm((prev) => ({ ...prev, studentId: e.target.value }))}
            >
              <option value="">Select student</option>
              {studentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              required
              type="date"
              value={attendanceForm.date}
              onChange={(e) => setAttendanceForm((prev) => ({ ...prev, date: e.target.value }))}
            />
            <select
              value={attendanceForm.status}
              onChange={(e) => setAttendanceForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <textarea
              placeholder="Optional note"
              value={attendanceForm.note}
              onChange={(e) => setAttendanceForm((prev) => ({ ...prev, note: e.target.value }))}
            />
            <button type="submit">Save Attendance</button>
          </form>
        </Card>

        <Card title="Record Grade">
          <form onSubmit={submitGrade} className="form stack">
            <select
              required
              value={gradeForm.studentId}
              onChange={(e) => setGradeForm((prev) => ({ ...prev, studentId: e.target.value }))}
            >
              <option value="">Select student</option>
              {studentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="Subject"
              value={gradeForm.subject}
              onChange={(e) => setGradeForm((prev) => ({ ...prev, subject: e.target.value }))}
            />
            <input
              placeholder="Assessment type"
              value={gradeForm.assessmentType}
              onChange={(e) => setGradeForm((prev) => ({ ...prev, assessmentType: e.target.value }))}
            />
            <div className="row">
              <input
                required
                type="number"
                placeholder="Score"
                value={gradeForm.score}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, score: e.target.value }))}
              />
              <input
                required
                type="number"
                placeholder="Max Score"
                value={gradeForm.maxScore}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, maxScore: e.target.value }))}
              />
            </div>
            <input
              type="date"
              value={gradeForm.examDate}
              onChange={(e) => setGradeForm((prev) => ({ ...prev, examDate: e.target.value }))}
            />
            <input
              placeholder="Term"
              value={gradeForm.term}
              onChange={(e) => setGradeForm((prev) => ({ ...prev, term: e.target.value }))}
            />
            <textarea
              placeholder="Remark"
              value={gradeForm.remark}
              onChange={(e) => setGradeForm((prev) => ({ ...prev, remark: e.target.value }))}
            />
            <button type="submit">Save Grade</button>
          </form>
        </Card>

        <Card title="Record Behavior Report">
          <form onSubmit={submitBehavior} className="form stack">
            <select
              required
              value={behaviorForm.studentId}
              onChange={(e) => setBehaviorForm((prev) => ({ ...prev, studentId: e.target.value }))}
            >
              <option value="">Select student</option>
              {studentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              required
              type="date"
              value={behaviorForm.incidentDate}
              onChange={(e) => setBehaviorForm((prev) => ({ ...prev, incidentDate: e.target.value }))}
            />
            <input
              required
              placeholder="Category"
              value={behaviorForm.category}
              onChange={(e) => setBehaviorForm((prev) => ({ ...prev, category: e.target.value }))}
            />
            <select
              value={behaviorForm.severity}
              onChange={(e) => setBehaviorForm((prev) => ({ ...prev, severity: e.target.value }))}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <textarea
              required
              placeholder="Description"
              value={behaviorForm.description}
              onChange={(e) => setBehaviorForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <textarea
              placeholder="Action taken"
              value={behaviorForm.actionTaken}
              onChange={(e) => setBehaviorForm((prev) => ({ ...prev, actionTaken: e.target.value }))}
            />
            <button type="submit">Save Behavior Report</button>
          </form>
        </Card>
      </div>

      <Card title="Recent Records">
        <div className="grid">
          <div>
            <h3>Attendance</h3>
            <ul className="simple-list">
              {records.attendance?.map((item) => (
                <li key={`a-${item.id}`}>
                  {item.student?.firstName} {item.student?.lastName}: {item.status} ({item.date})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Grades</h3>
            <ul className="simple-list">
              {records.grades?.map((item) => (
                <li key={`g-${item.id}`}>
                  {item.student?.firstName} {item.student?.lastName}: {item.subject} {item.score}/{item.maxScore}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Behavior</h3>
            <ul className="simple-list">
              {records.behaviorReports?.map((item) => (
                <li key={`b-${item.id}`}>
                  {item.student?.firstName} {item.student?.lastName}: {item.category} ({item.severity})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
      </div>
    </Layout>
  );
}
