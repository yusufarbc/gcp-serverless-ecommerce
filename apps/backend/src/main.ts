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

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://apexstore.eu",
  "https://staging.apexstore.eu",
  "https://commerce-storefront-pwa-989797182050.europe-west3.run.app",
  "https://commerce-storefront-pwa-staging-989797182050.europe-west3.run.app",
];

// Enable CORS with restricted origin check for Storefront PWA and sGTM
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".run.app") || origin.endsWith(".apexstore.eu")) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`[Core API] Serverless Commerce Engine listening on port ${port}`);
    console.log(`[Core API] Region: ${process.env.GCP_REGION || "europe-west3"}`);
  });
}

