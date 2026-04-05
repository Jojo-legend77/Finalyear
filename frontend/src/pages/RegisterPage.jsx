import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { user } = useAuth();
  const adminPhone = import.meta.env.VITE_ADMIN_PHONE || "+000 000 000 000";

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Registration information</h1>
        <p>
          Registration is handled by the school administration only. Please contact the school admin or reach out to
          the school about your children for registration.
        </p>
        <p>
          <strong>School admin phone:</strong> {adminPhone}
        </p>
        <small>
          Already have an account? <Link to="/login">Login</Link>.
        </small>
      </div>
    </div>
  );
}
