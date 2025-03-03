require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// Apply stealth plugin
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route to check if server is running
app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

// Route to make API request using Puppeteer
app.get("/api-request", async (req, res) => {
  let browser = null;

  try {
    console.log("Launching browser...");

    // Launch browser with appropriate options for both local and DO environments
    browser = await puppeteer.launch({
      headless: "new",
      // executablePath: "/usr/bin/chromium-browser",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.setRequestInterception(true);

    // Handle request interception
    page.on("request", async (request) => {
      const headers = {
        "Content-Type": "application/json",
        referer:
          "https://myroadsafety.rsa.ie/portal/booking/new/e5bbe47a-3f94-e911-a2be-0050568fd8e0/d2dc5f8c-2506-ea11-a2c3-0050568fd8e0",
        Authorization: `Bearer ${process.env.RSA_TOKEN}`, // Make sure to add RSA_TOKEN to your .env file
      };

      // If this is the specific API request we want to intercept
      if (
        request.url().includes("myroadsafety.rsa.ie/api/v1/Availability/All")
      ) {
        const response = await fetch(request.url(), {
          headers: headers,
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          request.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(data),
          });
        } else {
          request.respond({
            status: response.status,
            contentType: "application/json",
            body: JSON.stringify({ error: "Request failed" }),
          });
        }
      } else {
        // For all other requests, continue normally
        request.continue();
      }
    });

    // Navigate to the target URL
    await page.goto(
      "https://myroadsafety.rsa.ie/api/v1/Availability/All/7ebe5a36-871b-ef11-af89-005056b9b50c/0fed074d-c2d6-e811-a2c0-005056823b22",
      {
        waitUntil: "networkidle0",
      }
    );

    // Get the response data
    const data = await page.evaluate(() => {
      return document.body.textContent;
    });

    await browser.close();
    browser = null;

    res.json({
      success: true,
      data: JSON.parse(data),
    });
  } catch (error) {
    console.error("Error during API request:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
