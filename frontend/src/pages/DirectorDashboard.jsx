import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import api from "../api/client";

export default function DirectorDashboard() {
  const [systemSummary, setSystemSummary] = useState(null);
  const [className, setClassName] = useState("");
  const [classSummary, setClassSummary] = useState(null);
  const [error, setError] = useState("");

  const loadSystem = async () => {
    try {
      setError("");
      const response = await api.get("/reports/summary/system");
      setSystemSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load school-wide summary");
    }
  };

  const loadClassSummary = async (event) => {
    event.preventDefault();
    if (!className.trim()) return;
    try {
      setError("");
      const response = await api.get(`/reports/summary/class/${encodeURIComponent(className.trim())}`);
      setClassSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load class summary");
    }
  };

  useEffect(() => {
    loadSystem();
  }, []);

  return (
    <Layout>
      <div className="stack">
        {error ? <div className="alert error">{error}</div> : null}

        <Card title="Whole School Performance Overview">
          {!systemSummary ? (
            <p className="muted">Loading...</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-box">
                <span>Total Students</span>
                <strong>{systemSummary.students}</strong>
              </div>
              <div className="stat-box">
                <span>Total Users</span>
                <strong>{systemSummary.users}</strong>
              </div>
              <div className="stat-box">
                <span>Parents</span>
                <strong>{systemSummary.usersByRole?.parent || 0}</strong>
              </div>
              <div className="stat-box">
                <span>Teachers</span>
                <strong>{systemSummary.usersByRole?.teacher || 0}</strong>
              </div>
              <div className="stat-box">
                <span>Directors</span>
                <strong>{systemSummary.usersByRole?.director || 0}</strong>
              </div>
              <div className="stat-box">
                <span>Attendance Records</span>
                <strong>{systemSummary.records?.attendance || 0}</strong>
              </div>
              <div className="stat-box">
                <span>Grade Records</span>
                <strong>{systemSummary.records?.grades || 0}</strong>
              </div>
              <div className="stat-box">
                <span>Behavior Reports</span>
                <strong>{systemSummary.records?.behaviorReports || 0}</strong>
              </div>
            </div>
          )}
        </Card>

        <Card title="Class Performance Report">
          <form onSubmit={loadClassSummary} className="form-stack">
            <input
              placeholder="Class name (e.g. Grade 7)"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
            />
            <button type="submit">Load Class Report</button>
          </form>
          {classSummary ? (
            <div className="stack">
              <p>
                <strong>Class:</strong> {classSummary.className}
              </p>
              <p>
                <strong>Average Attendance:</strong> {classSummary.overall?.averageAttendance ?? 0}%
              </p>
              <p>
                <strong>Average Grade:</strong> {classSummary.overall?.averageGrade ?? 0}%
              </p>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Attendance %</th>
                      <th>Average Grade %</th>
                      <th>Behavior Reports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(classSummary.students || []).map((student) => (
                      <tr key={student.studentId}>
                        <td>{student.studentName}</td>
                        <td>{student.attendanceRate}</td>
                        <td>{student.averageGradePercent}</td>
                        <td>{student.behaviorReportsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </Layout>
  );
}
