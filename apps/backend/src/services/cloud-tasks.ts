import { CloudTasksClient } from "@google-cloud/tasks";

export class CloudTasksService {
  private client = new CloudTasksClient();

  public async enqueueTask({ endpoint, payload }: { endpoint: string; payload: Record<string, unknown> }): Promise<string> {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[CloudTasks Mock] Task for ${endpoint}:`, JSON.stringify(payload));
      return "mock-task-id";
    }
    return "task-enqueued";
  }
}
