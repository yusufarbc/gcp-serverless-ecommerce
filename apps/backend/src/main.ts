import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { healthRouter } from "./api/routes/health";
import { catalogRouter } from "./api/routes/catalog";
import { gmcFeedRouter } from "./api/routes/gmc-feed";
import { checkoutRouter } from "./api/routes/checkout";
import { tasksRouter } from "./api/routes/tasks";
import { supportRouter } from "./api/routes/support";

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

// Enable CORS for Storefront PWA and sGTM
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.use("/health", healthRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/gmc", gmcFeedRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/support", supportRouter);

// Root route
app.get("/", (_req, res) => {
  res.json({
    name: "GCP Serverless Commerce Core API",
    version: "1.0.0",
    status: "healthy",
    docs: "/health",
  });
});

app.listen(port, () => {
  console.log(`[Core API] Serverless Commerce Engine listening on port ${port}`);
  console.log(`[Core API] Region: ${process.env.GCP_REGION || "europe-west3"}`);
});

