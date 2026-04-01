import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>Parent-School Platform</h1>
        <p>
          A modular system for attendance, grades, behavior tracking, reporting, notifications, and AI insights.
        </p>
        {user ? (
          <Link className="btn primary" to={`/${user.role}`}>
            Open Dashboard
          </Link>
        ) : (
          <div className="row gap">
            <Link className="btn primary" to="/login">
              Login
            </Link>
            <Link className="btn secondary" to="/register">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
