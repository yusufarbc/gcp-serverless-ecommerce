import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { databaseService } from "../db/database-service";

/**
 * Timing-safe string comparison to prevent timing side-channel attacks
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Checks whether the incoming request has valid Admin privileges
 */
export function isAdminRequest(req: Request): boolean {
  const adminSecret = process.env.ADMIN_API_KEY || "apex-admin-sec-key-2026";
  const authHeader = req.headers.authorization;
  const adminKeyHeader = req.headers["x-admin-key"] as string | undefined;

  let candidate = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    candidate = authHeader.slice(7).trim();
  } else if (adminKeyHeader) {
    candidate = adminKeyHeader.trim();
  }

  if (!candidate) {
    return false;
  }

  return timingSafeEqualString(candidate, adminSecret);
}

/**
 * Enforces Admin authentication for sensitive endpoints (e.g., listing all orders, inspecting email outbox, internal support desk)
 * Protects against Broken Object Level Authorization (BOLA / IDOR)
 */
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (isAdminRequest(req)) {
    return next();
  }

  res.status(401).json({
    error: "Unauthorized: Admin privileges or valid API key required to access this resource.",
  });
}

/**
 * Enforces Order Access Control to prevent BOLA / IDOR on order endpoints (/orders/:orderNumber and /orders/:orderNumber/invoice).
 * Access is granted if:
 * 1. The caller is an authenticated Admin, OR
 * 2. The caller provides the unguessable cryptographic accessToken generated at checkout
 *    via query param (`?token=...`), header (`x-order-token`), or Bearer token.
 */
export async function orderAccessMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    res.status(400).json({ error: "orderNumber parameter is required" });
    return;
  }

  // 1. Fetch order from database
  const order = await databaseService.getOrder(orderNumber);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // 2. Allow unrestricted access if caller is verified admin
  if (isAdminRequest(req)) {
    (req as any).order = order;
    return next();
  }

  // 3. Extract order access token
  const queryToken = (req.query.token as string) || "";
  const headerToken = (req.headers["x-order-token"] as string) || "";
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  const providedToken = queryToken || headerToken || bearerToken;

  if (!providedToken) {
    res.status(403).json({
      error: "Access denied: Missing order access token. Provide '?token=<token>' or 'x-order-token' header.",
      code: "ORDER_ACCESS_TOKEN_REQUIRED",
    });
    return;
  }

  // 4. Verify token using timing-safe comparison
  const expectedToken = order.accessToken || "";
  if (!expectedToken || !timingSafeEqualString(providedToken, expectedToken)) {
    res.status(403).json({
      error: "Access denied: Invalid order access token. Unauthorized access to order.",
      code: "ORDER_ACCESS_FORBIDDEN",
    });
    return;
  }

  (req as any).order = order;
  next();
}
