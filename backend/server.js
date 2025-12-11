import express from "express";
import cors from "cors";
import analyzerRoute from "./routes/analyzerRoute.cjs";


const app = express();

// CORS - allow all origins for testing
app.use(cors());

// Middleware
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "AI Resume Analyzer API",
    status: "Running"
  });
});

app.use("/analyze", analyzerRoute);

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});