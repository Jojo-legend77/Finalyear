import { useEffect, useState } from "react";
import Card from "../components/Card";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function AIInsightsPage() {
  const { user } = useAuth();
  const [riskData, setRiskData] = useState(null);
  const [summary, setSummary] = useState("");
  const [trainMessage, setTrainMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [riskRes, summaryRes] = await Promise.all([
        api.get("/ai/risk-summary"),
        api.get("/ai/summary"),
      ]);
      setRiskData(riskRes.data.data || { records: [], predictions: [] });
      setSummary(summaryRes.data.data?.summary || summaryRes.data.summary || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTrain = async () => {
    setError("");
    try {
      const response = await api.post("/ai/train");
      setTrainMessage(response.data.message || "Training triggered");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to train model");
    }
  };

  return (
    <div className="stack">
      {error ? <p className="error">{error}</p> : null}
      {trainMessage ? <p className="success">{trainMessage}</p> : null}

      <Card title="AI Summary">
        {loading ? <p>Loading...</p> : <p>{summary || "No summary available yet."}</p>}
      </Card>

      <Card title="Risk Predictions">
        <button className="btn secondary" type="button" onClick={load}>
          Refresh
        </button>
        {user?.role === "admin" || user?.role === "director" ? (
          <button className="btn primary" type="button" onClick={handleTrain}>
            Train Model
          </button>
        ) : null}
        <pre className="json">
          {JSON.stringify(riskData || { records: [], predictions: [] }, null, 2)}
        </pre>
      </Card>
    </div>
  );
}

export default AIInsightsPage;
