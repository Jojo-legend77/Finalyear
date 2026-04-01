import { useEffect, useState } from "react";
import Card from "../components/Card";
import Layout from "../components/Layout";
import api from "../api/client";

export default function ParentDashboard() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const listRes = await api.get("/parent/students");
      setStudents(listRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    }
  };

  const loadStudent = async (studentId) => {
    if (!studentId) return;
    try {
      setError("");
      const [detailsRes, summaryRes] = await Promise.all([
        api.get(`/parent/students/${studentId}`),
        api.get(`/parent/students/${studentId}/summary`),
      ]);
      setDetails(detailsRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout>
      <div className="grid cols-2">
        <Card title="My Children">
          <select
            className="input"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              loadStudent(e.target.value);
            }}
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.className})
              </option>
            ))}
          </select>
          {error && <p className="error">{error}</p>}
        </Card>

        <Card title="Progress Summary">
          {summary ? (
            <ul className="list">
              <li>Attendance Rate: {summary.attendanceRate}%</li>
              <li>Average Grade: {summary.averageGradePercent}%</li>
              <li>Behavior Reports: {summary.behaviorReportsCount}</li>
            </ul>
          ) : (
            <p>Select a child to view summary.</p>
          )}
        </Card>
      </div>

      {details && (
        <div className="grid cols-3">
          <Card title="Attendance">
            <ul className="list small">
              {details.records?.attendance?.map((item) => (
                <li key={item.id}>
                  {item.date}: {item.status}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Grades">
            <ul className="list small">
              {details.records?.grades?.map((item) => (
                <li key={item.id}>
                  {item.subject}: {item.score}/{item.maxScore}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Behavior Reports">
            <ul className="list small">
              {details.records?.behaviorReports?.map((item) => (
                <li key={item.id}>
                  {item.incidentDate}: {item.category} ({item.severity})
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </Layout>
  );
}
