import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import Layout from "../components/Layout";

const emptyUser = { fullName: "", email: "", password: "", role: "parent" };
const emptyStudent = {
  firstName: "",
  lastName: "",
  className: "",
  section: "",
  dateOfBirth: "",
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState([]);
  const [systemSummary, setSystemSummary] = useState(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [settingForm, setSettingForm] = useState({ key: "", value: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const [usersRes, studentsRes, settingsRes, summaryRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/students"),
        api.get("/admin/settings"),
        api.get("/reports/summary/system"),
      ]);
      setUsers(usersRes.data.data || []);
      setStudents(studentsRes.data.data || []);
      setSettings(settingsRes.data.data || []);
      setSystemSummary(summaryRes.data.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setStatus("");
      setError("");
      await api.post("/admin/users", userForm);
      setStatus("User created.");
      setUserForm(emptyUser);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      setStatus("");
      setError("");
      await api.post("/admin/students", studentForm);
      setStatus("Student created.");
      setStudentForm(emptyStudent);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create student.");
    }
  };

  const handleSaveSetting = async (e) => {
    e.preventDefault();
    try {
      setStatus("");
      setError("");
      await api.post("/admin/settings", settingForm);
      setStatus("Setting saved.");
      setSettingForm({ key: "", value: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save setting.");
    }
  };

  return (
    <Layout>
      <div className="grid">
      {error ? <div className="alert error">{error}</div> : null}
      {status ? <div className="alert success">{status}</div> : null}

      <Card title="System Summary">
        {!systemSummary ? (
          <p className="muted">Loading summary...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-box">
              <span>Total Users</span>
              <strong>{systemSummary.totalUsers}</strong>
            </div>
            <div className="stat-box">
              <span>Total Students</span>
              <strong>{systemSummary.totalStudents}</strong>
            </div>
            <div className="stat-box">
              <span>Attendance Entries</span>
              <strong>{systemSummary.totalAttendanceRecords}</strong>
            </div>
            <div className="stat-box">
              <span>Grades</span>
              <strong>{systemSummary.totalGrades}</strong>
            </div>
            <div className="stat-box">
              <span>Behavior Reports</span>
              <strong>{systemSummary.totalBehaviorReports}</strong>
            </div>
            <div className="stat-box">
              <span>Unread Notifications</span>
              <strong>{systemSummary.unreadNotifications}</strong>
            </div>
          </div>
        )}
      </Card>

      <Card title="Create User">
        <form className="form" onSubmit={handleCreateUser}>
          <label>
            Full Name
            <input
              value={userForm.fullName}
              onChange={(e) => setUserForm((s) => ({ ...s, fullName: e.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
          </label>
          <label>
            Role
            <select
              value={userForm.role}
              onChange={(e) => setUserForm((s) => ({ ...s, role: e.target.value }))}
            >
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit">Create User</button>
        </form>
      </Card>

      <Card title="Create Student">
        <form className="form" onSubmit={handleCreateStudent}>
          <label>
            First Name
            <input
              value={studentForm.firstName}
              onChange={(e) => setStudentForm((s) => ({ ...s, firstName: e.target.value }))}
              required
            />
          </label>
          <label>
            Last Name
            <input
              value={studentForm.lastName}
              onChange={(e) => setStudentForm((s) => ({ ...s, lastName: e.target.value }))}
              required
            />
          </label>
          <label>
            Class
            <input
              value={studentForm.className}
              onChange={(e) => setStudentForm((s) => ({ ...s, className: e.target.value }))}
              required
            />
          </label>
          <label>
            Section
            <input
              value={studentForm.section}
              onChange={(e) => setStudentForm((s) => ({ ...s, section: e.target.value }))}
            />
          </label>
          <label>
            Date of Birth
            <input
              type="date"
              value={studentForm.dateOfBirth}
              onChange={(e) => setStudentForm((s) => ({ ...s, dateOfBirth: e.target.value }))}
            />
          </label>
          <button type="submit">Create Student</button>
        </form>
      </Card>

      <Card title="System Settings">
        <form className="form" onSubmit={handleSaveSetting}>
          <label>
            Key
            <input
              value={settingForm.key}
              onChange={(e) => setSettingForm((s) => ({ ...s, key: e.target.value }))}
              required
            />
          </label>
          <label>
            Value
            <input
              value={settingForm.value}
              onChange={(e) => setSettingForm((s) => ({ ...s, value: e.target.value }))}
              required
            />
          </label>
          <button type="submit">Save Setting</button>
        </form>
        <ul className="stack">
          {settings.map((s) => (
            <li key={s.id}>
              <strong>{s.key}</strong>: {s.value}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Users">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Students">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.firstName} {s.lastName}
                  </td>
                  <td>{s.className}</td>
                  <td>{s.section || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </Layout>
  );
}
