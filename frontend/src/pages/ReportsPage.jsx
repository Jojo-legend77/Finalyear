import { useState } from "react";
import api from "../api/client";
import Card from "../components/Card";

const ReportsPage = () => {
  const [studentId, setStudentId] = useState("");
  const [report, setReport] = useState(null);
  const [systemSummary, setSystemSummary] = useState(null);
  const [className, setClassName] = useState("");
  const [classSummary, setClassSummary] = useState(null);
  const [error, setError] = useState("");

  const fetchStudentReport = async (event) => {
    event.preventDefault();
    setError("");
    setReport(null);
    try {
      const response = await api.get(`/reports/student/${studentId}`);
      setReport(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchSystemSummary = async () => {
    setError("");
    try {
      const response = await api.get("/reports/summary/system");
      setSystemSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchClassSummary = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await api.get(`/reports/summary/class/${className}`);
      setClassSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="stack">
      <h2>Reports & Summaries</h2>
      {error ? <p className="error">{error}</p> : null}

      <div className="grid">
        <Card title="Student Report">
          <form onSubmit={fetchStudentReport} className="form-stack">
            <input
              placeholder="Student ID"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            />
            <button type="submit">Load Student Report</button>
          </form>
          {report ? (
            <pre className="json">{JSON.stringify(report.summary, null, 2)}</pre>
          ) : null}
        </Card>

        <Card title="System Summary (Admin)">
          <button onClick={fetchSystemSummary} type="button">
            Load System Summary
          </button>
          {systemSummary ? (
            <pre className="json">{JSON.stringify(systemSummary, null, 2)}</pre>
          ) : null}
        </Card>

        <Card title="Class Summary">
          <form onSubmit={fetchClassSummary} className="form-stack">
            <input
              placeholder="Class Name (e.g. Grade 4)"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
            />
            <button type="submit">Load Class Summary</button>
          </form>
          {classSummary ? (
            <pre className="json">{JSON.stringify(classSummary.overall, null, 2)}</pre>
          ) : null}
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
