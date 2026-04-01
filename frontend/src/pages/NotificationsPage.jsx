import { useEffect, useState } from "react";
import Card from "../components/Card";
import api from "../api/client";
import Layout from "../components/Layout";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
    } catch (_err) {
      // no-op
    }
  };

  return (
    <Layout>
      <div className="stack">
        <Card title="Notifications">
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          {!notifications.length && !loading ? <p>No notifications yet.</p> : null}
          <ul className="simple-list">
            {notifications.map((item) => (
              <li key={item.id}>
                <div className="row between">
                  <div>
                    <strong>{item.title}</strong>
                    <div>{item.message}</div>
                    <small>
                      {item.type} · {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {!item.isRead ? (
                    <button className="btn secondary" onClick={() => markRead(item.id)}>
                      Mark read
                    </button>
                  ) : (
                    <span className="muted">Read</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Layout>
  );
}

