import { Router, Request, Response } from "express";

export const healthRouter = Router();

/**
 * Health check endpoint for Cloud Run container liveness/readiness probes.
 * Returns 200 OK immediately for scale-to-zero wakeups.
 */
healthRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "gcp-serverless-commerce-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

