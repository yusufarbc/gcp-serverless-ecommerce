const https = require("https");

function check(name, url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        console.log(`[${name}] Status: ${res.statusCode} | Preview: ${d.slice(0, 80).replace(/\n/g, "")}`);
        resolve({ status: res.statusCode });
      });
    }).on("error", (err) => {
      console.error(`[${name}] Error:`, err.message);
      resolve({ status: 500, error: err.message });
    });
  });
}

async function main() {
  console.log("==================================================");
  console.log("  GCP MULTI-ENVIRONMENT VERIFICATION REPORT");
  console.log("==================================================");
  await check("PROD Core API", "https://commerce-core-api-989797182050.europe-west3.run.app/health");
  await check("PROD Storefront", "https://commerce-storefront-pwa-989797182050.europe-west3.run.app/de");
  await check("STAGING Core API", "https://commerce-core-api-staging-989797182050.europe-west3.run.app/health");
  await check("STAGING Storefront", "https://commerce-storefront-pwa-staging-989797182050.europe-west3.run.app/de");
  console.log("==================================================");
}

main();
