import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { user } = useAuth();
  const adminPhone = import.meta.env.VITE_ADMIN_CONTACT_PHONE || "+000-000-0000";
  const adminEmail = import.meta.env.VITE_ADMIN_CONTACT_EMAIL || "admin@school.local";
  const schoolContact = import.meta.env.VITE_SCHOOL_CONTACT || "Future School, Main Office";

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <div className="auth-shell">
      <div className="contact-card">
        <h1>Registration is handled by the admin</h1>
        <p>
          Please contact admin or reachout to the school with your children for registration.
        </p>

        <div className="contact-details">
          <p>
            <strong>Admin phone:</strong> {adminPhone}
          </p>
          <p>
            <strong>Admin email:</strong> {adminEmail}
          </p>
          <p>
            <strong>School contact:</strong> {schoolContact}
          </p>
        </div>

        <ul className="simple-list">
          <li>Share the student full name, class, and parent details.</li>
          <li>Bring any required school documents during registration.</li>
          <li>Admin will create your account and provide login credentials.</li>
        </ul>

        <p className="muted small">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
