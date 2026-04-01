const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const parentRoutes = require("./routes/parentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { error } = require("./utils/response");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => error(res, "Route not found", 404));

app.use((err, _req, res, _next) => {
  return error(res, err.message || "Internal server error", err.statusCode || 500);
});

module.exports = app;
