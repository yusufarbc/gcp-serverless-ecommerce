const http = require("http");

process.env.NODE_ENV = "test";
process.env.ADMIN_API_KEY = "test-secret-key-123";

const { app } = require("../apps/backend/dist/main.js");

async function runTests() {
  console.log("=== GCP Serverless Commerce Security & IDOR Verification ===");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`Test server running on ${baseUrl}`);

  async function request(path, options = {}) {
    const url = new URL(baseUrl + path);
    return new Promise((resolve, reject) => {
      const req = http.request(
        url,
        {
          method: options.method || "GET",
          headers: options.headers || {},
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            let parsed;
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = data;
            }
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          });
        }
      );
      req.on("error", reject);
      if (options.body) {
        req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: BOLA / IDOR - GET /api/checkout/orders (Enumeration)
    // ----------------------------------------------------
    console.log("\n1. Testing BOLA / IDOR on Orders List...");
    const unauthOrders = await request("/api/checkout/orders");
    assert(unauthOrders.status === 401, "GET /api/checkout/orders rejects unauthenticated caller with 401");

    const authOrders = await request("/api/checkout/orders", {
      headers: { Authorization: "Bearer test-secret-key-123" },
    });
    assert(authOrders.status === 200 && Array.isArray(authOrders.body.orders), "GET /api/checkout/orders succeeds with valid Admin API key");

    // ----------------------------------------------------
    // TEST 2: BOLA / IDOR - Single Order & Invoice by Order Number
    // ----------------------------------------------------
    console.log("\n2. Testing BOLA / IDOR on Single Order & VAT Invoice...");
    const unauthSingle = await request("/api/checkout/orders/ORD-EU-2026-7842");
    assert(unauthSingle.status === 403, "GET /api/checkout/orders/:orderNumber without token returns 403 Forbidden");

    const badTokenSingle = await request("/api/checkout/orders/ORD-EU-2026-7842?token=invalid_forged_token");
    assert(badTokenSingle.status === 403, "GET /api/checkout/orders/:orderNumber with invalid token returns 403 Forbidden");

    const validTokenSingle = await request("/api/checkout/orders/ORD-EU-2026-7842?token=demo-sec-token-7842-eu");
    assert(validTokenSingle.status === 200 && validTokenSingle.body.order?.orderNumber === "ORD-EU-2026-7842", "GET /api/checkout/orders/:orderNumber with valid cryptographic token returns 200 OK");

    const unauthInvoice = await request("/api/checkout/orders/ORD-EU-2026-7842/invoice");
    assert(unauthInvoice.status === 403, "GET /api/checkout/orders/:orderNumber/invoice without token returns 403 Forbidden");

    const validTokenInvoice = await request("/api/checkout/orders/ORD-EU-2026-7842/invoice?token=demo-sec-token-7842-eu");
    assert(validTokenInvoice.status === 200 && typeof validTokenInvoice.body === "string" && validTokenInvoice.body.includes("INVOICE"), "GET /api/checkout/orders/:orderNumber/invoice with valid token renders VAT invoice HTML");

    // ----------------------------------------------------
    // TEST 3: BOLA / IDOR - Support Tickets & Email Outbox
    // ----------------------------------------------------
    console.log("\n3. Testing BOLA / IDOR on Support Tickets & Email Outbox...");
    const unauthTickets = await request("/api/support/tickets");
    assert(unauthTickets.status === 401, "GET /api/support/tickets rejects unauthorized public access with 401");

    const authTickets = await request("/api/support/tickets", {
      headers: { "x-admin-key": "test-secret-key-123" },
    });
    assert(authTickets.status === 200 && Array.isArray(authTickets.body.tickets), "GET /api/support/tickets succeeds with Admin API key");

    const unauthOutbox = await request("/api/tasks/email-outbox");
    assert(unauthOutbox.status === 401, "GET /api/tasks/email-outbox rejects unauthorized public access with 401");

    // ----------------------------------------------------
    // TEST 4: Client-Side Price Tampering
    // ----------------------------------------------------
    console.log("\n4. Testing Client-Side Price Tampering Protection...");
    // Attempt to tamper with price: send price = 0.01 EUR for 249.00 EUR item
    const tamperedPayload = {
      cart: {
        id: "cart_tamper_01",
        items: [
          {
            productId: "prod_anc_headphones_01",
            variantId: "var_headphones_black",
            title: "Hacked Cheap Item",
            price: 0.01, // TAMPERED PRICE
            quantity: 1,
            parcels: [], // Attempt to bypass bulky fee
          },
        ],
      },
      shippingAddress: {
        firstName: "Attacker",
        lastName: "Test",
        email: "attacker@test.com",
        address1: "123 Hack Way",
        city: "Berlin",
        postalCode: "10115",
        countryCode: "DE",
      },
      paymentMethod: "google_pay",
    };

    const tamperRes = await request("/api/checkout/process-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: tamperedPayload,
    });

    assert(tamperRes.status === 201, "Order process completes successfully");
    const orderData = tamperRes.body.order;
    assert(orderData.subtotal === 249.0, `Server overwrote tampered price with catalog price: subtotal = 249.0 EUR (got ${orderData.subtotal})`);
    assert(orderData.items[0].price === 249.0, `Item price strictly forced to 249.0 EUR (got ${orderData.items[0].price})`);
    assert(Boolean(tamperRes.body.accessToken), "Server generated cryptographic accessToken for order");
    assert(tamperRes.body.invoicePreviewUrl.includes(tamperRes.body.accessToken), "Invoice preview URL contains secure accessToken parameter");

    // ----------------------------------------------------
    // TEST 5: Idempotency Key Handling
    // ----------------------------------------------------
    console.log("\n5. Testing Idempotency (Duplicate Request Management)...");
    const testIdemKey = "idem_sec_test_" + Date.now();

    const orderPayload = {
      cart: {
        id: "cart_idem_01",
        items: [
          {
            productId: "prod_commuter_backpack_02",
            variantId: "var_backpack_slate",
            quantity: 1,
          },
        ],
      },
      shippingAddress: {
        firstName: "Idempotent",
        lastName: "Customer",
        email: "idem@test.com",
        address1: "Friedrichstr 1",
        city: "Berlin",
        postalCode: "10117",
        countryCode: "DE",
      },
      paymentMethod: "google_pay",
    };

    // First request
    const firstReq = await request("/api/checkout/process-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": testIdemKey,
      },
      body: orderPayload,
    });
    assert(firstReq.status === 201, "First checkout with Idempotency-Key returns 201 Created");
    const firstOrderNumber = firstReq.body.order?.orderNumber;

    // Duplicate request with SAME Idempotency-Key
    const secondReq = await request("/api/checkout/process-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": testIdemKey,
      },
      body: orderPayload,
    });
    assert(secondReq.status === 201, "Duplicate checkout request returns cached 201 Created");
    assert(secondReq.headers["idempotent-replay"] === "true", "Response contains 'Idempotent-Replay: true' header");
    assert(secondReq.body.order?.orderNumber === firstOrderNumber, "Exact same order returned without duplicate creation");

  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
