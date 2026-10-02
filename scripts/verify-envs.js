const https = require("https");

function check(name, url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        console.log(`[${name}] Status: ${res.statusCode} | Content: ${d.slice(0, 80).replace(/\n/g, "")}`);
        resolve({ status: res.statusCode });
      });
    }).on("error", (err) => {
      console.error(`[${name}] Error:`, err.message);
      resolve({ status: 500, error: err.message });
    });
  });
}

function postJson(name, url, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          console.log(`[${name}] Status: ${res.statusCode} | Content: ${d.slice(0, 100).replace(/\n/g, "")}`);
          resolve({ status: res.statusCode });
        });
      }
    );
    req.on("error", (err) => {
      console.error(`[${name}] Error:`, err.message);
      resolve({ status: 500, error: err.message });
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log("==================================================");
  console.log("  GCP MULTI-ENVIRONMENT COMPREHENSIVE VERIFICATION");
  console.log("==================================================");

  const envs = [
    {
      name: "PRODUCTION",
      backend: "https://commerce-core-api-989797182050.europe-west3.run.app",
      storefront: "https://commerce-storefront-pwa-989797182050.europe-west3.run.app",
    },
    {
      name: "STAGING",
      backend: "https://commerce-core-api-staging-989797182050.europe-west3.run.app",
      storefront: "https://commerce-storefront-pwa-staging-989797182050.europe-west3.run.app",
    },
  ];

  for (const env of envs) {
    console.log(`\n--- [${env.name} ENVIRONMENT] ---`);
    await check(`${env.name} Health`, `${env.backend}/health`);
    await check(`${env.name} Catalog List`, `${env.backend}/api/catalog/products`);
    await check(`${env.name} Catalog Item`, `${env.backend}/api/catalog/products/aura-pro-anc-headphones`);
    await check(`${env.name} GMC Feed XML`, `${env.backend}/api/gmc/feed.xml`);
    await postJson(`${env.name} OSS Tax Calc (DE)`, `${env.backend}/api/checkout/calculate-tax`, {
      subtotal: 199.0,
      countryCode: "DE",
    });
    await postJson(`${env.name} PayPal Create Order`, `${env.backend}/api/checkout/paypal/create-order`, {
      amount: 49.9,
      currency: "EUR",
      customId: "CART-1234",
    });
    await postJson(`${env.name} OSS Tax Calc (IT 22%)`, `${env.backend}/api/checkout/calculate-tax`, {
      subtotal: 100.0,
      countryCode: "IT",
    });
    await check(`${env.name} Storefront Home (EN)`, `${env.storefront}/en`);
    await check(`${env.name} Storefront Home (IT)`, `${env.storefront}/it`);
    await check(`${env.name} Storefront Home (DE)`, `${env.storefront}/de`);
    await check(`${env.name} Storefront Product (IT)`, `${env.storefront}/it/products/aura-pro-anc-headphones`);
    await check(`${env.name} Storefront GDPR Privacy (IT)`, `${env.storefront}/it/privacy`);
    await check(`${env.name} Storefront Checkout (IT)`, `${env.storefront}/it/checkout`);
    await check(`${env.name} Storefront Manifest`, `${env.storefront}/manifest.json`);
    await check(`${env.name} Storefront API Proxy (Catalog)`, `${env.storefront}/api/catalog/products`);
  }
  console.log("\n==================================================");
  console.log("  ALL TESTS COMPLETED");
  console.log("==================================================");
}

main();
