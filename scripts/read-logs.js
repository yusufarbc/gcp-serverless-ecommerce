const { execSync } = require('child_process');

try {
  const filter = 'resource.type="cloud_run_revision"';
  const cmd = `gcloud logging read "${filter}" --limit=20 --format="json" --project=gcp-serverless-ecommerce`;
  const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  const logs = JSON.parse(output);
  console.log(`Fetched ${logs.length} log entries:`);
  logs.forEach((entry, i) => {
    const service = entry.resource?.labels?.service_name || 'unknown';
    const text = entry.textPayload || entry.jsonPayload?.message || JSON.stringify(entry.jsonPayload) || '';
    const req = entry.httpRequest ? `[${entry.httpRequest.requestMethod} ${entry.httpRequest.requestUrl} -> ${entry.httpRequest.status}]` : '';
    console.log(`[${entry.timestamp}] [${entry.severity || 'DEFAULT'}] [${service}] ${req}: ${text}`);
  });
} catch (e) {
  console.error("Error reading logs:", e.message);
  if (e.stdout) console.log("Stdout:", e.stdout.toString());
  if (e.stderr) console.error("Stderr:", e.stderr.toString());
}
