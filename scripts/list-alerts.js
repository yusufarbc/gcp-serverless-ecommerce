const { execSync } = require('child_process');
const raw = execSync('gh api repos/yusufarbc/gcp-serverless-ecommerce/code-scanning/alerts --paginate').toString();
const alerts = JSON.parse(raw);
const openAlerts = alerts.filter(a => a.state === 'open');
console.log('Total Open Alerts:', openAlerts.length);
openAlerts.forEach(a => {
  const loc = a.most_recent_instance?.location;
  console.log(`#${a.number} | ${a.tool.name} | ${a.rule.id} | ${loc?.path}:${loc?.start_line}`);
});
