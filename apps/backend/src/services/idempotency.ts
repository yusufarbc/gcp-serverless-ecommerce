export interface IdempotencyEntry {
  status: "in_progress" | "completed";
  statusCode?: number;
  body?: any;
  createdAt: number;
}

/**
 * Idempotency Service
 * Guarantees that retried or duplicate HTTP requests (e.g., double clicks, network retries)
 * do not cause multiple orders or duplicate charges.
 * Supports in-memory storage (with automatic TTL cleanup for serverless/local)
 * and can be backed by Redis / Cloud SQL in distributed environments.
 */
export class IdempotencyService {
  private static instance: IdempotencyService;
  private cache: Map<string, IdempotencyEntry> = new Map();
  private readonly defaultTtlMs = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Periodic sweep of expired idempotency keys every hour
    setInterval(() => this.cleanupExpired(), 60 * 60 * 1000).unref();
  }

  public static getInstance(): IdempotencyService {
    if (!IdempotencyService.instance) {
      IdempotencyService.instance = new IdempotencyService();
    }
    return IdempotencyService.instance;
  }

  /**
   * Check current status of an idempotency key
   */
  public get(key: string): IdempotencyEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.createdAt > this.defaultTtlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Attempt to lock an idempotency key.
   * Returns true if key was acquired (is new), or false if key already exists (in progress or completed).
   */
  public lock(key: string): boolean {
    const existing = this.get(key);
    if (existing) {
      return false;
    }

    this.cache.set(key, {
      status: "in_progress",
      createdAt: Date.now(),
    });
    return true;
  }

  /**
   * Complete the idempotent execution and store response for replay
   */
  public complete(key: string, statusCode: number, body: any): void {
    this.cache.set(key, {
      status: "completed",
      statusCode,
      body,
      createdAt: Date.now(),
    });
  }

  /**
   * Release key on failure so the client can retry safely
   */
  public release(key: string): void {
    this.cache.delete(key);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt > this.defaultTtlMs) {
        this.cache.delete(key);
      }
    }
  }
}

export const idempotencyService = IdempotencyService.getInstance();
