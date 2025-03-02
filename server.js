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

    // Navigate to the target API URL
    console.log(`Navigating to ${process.env.TARGET_API_URL}...`);
    await page.goto("https://www.google.com", { waitUntil: "networkidle2" });

    // Example: Extract data from the page
    const data = await page.evaluate(() => {
      // This function runs in the browser context
      // Modify this to extract the data you need from the page
      return {
        title: document.title,
        content: document.body.innerText.substring(0, 500), // First 500 chars of body text
      };
    });

    await browser.close();
    browser = null;

    res.json({
      success: true,
      data,
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

// Custom API endpoint with parameters
app.post("/custom-request", async (req, res) => {
  const { url, selector } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL is required",
    });
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2" });

    let result;

    if (selector) {
      // Wait for the selector to be available
      await page.waitForSelector(selector, { timeout: 5000 }).catch(() => {
        console.log(`Selector "${selector}" not found, proceeding anyway`);
      });

      // Extract data based on the selector
      result = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element ? element.innerText : "Element not found";
      }, selector);
    } else {
      // Default behavior if no selector is provided
      result = await page.evaluate(() => {
        return {
          title: document.title,
          content: document.body.innerText.substring(0, 500),
        };
      });
    }

    await browser.close();
    browser = null;

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error during custom request:", error);
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
  console.log(`- GET / - Check server status`);
  console.log(
    `- GET /api-request - Make request to ${process.env.TARGET_API_URL}`
  );
  console.log(
    `- POST /custom-request - Make custom request with URL and optional selector`
  );
});
