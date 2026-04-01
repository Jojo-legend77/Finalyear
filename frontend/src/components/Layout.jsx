import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleLinks = {
  parent: [
    { to: "/parent", label: "Dashboard" },
    { to: "/notifications", label: "Notifications" },
    { to: "/ai", label: "AI Insights" },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard" },
    { to: "/notifications", label: "Notifications" },
    { to: "/ai", label: "AI Insights" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/notifications", label: "Notifications" },
    { to: "/reports", label: "Reports" },
    { to: "/ai", label: "AI Insights" },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = roleLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          Parent-School Platform
        </Link>
        <div className="topbar-right">
          <span>{user?.fullName}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <div className="shell-body">
        <aside className="sidebar">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              {link.label}
            </NavLink>
          ))}
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
