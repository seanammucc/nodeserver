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
      executablePath: "/usr/bin/chromium-browser",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNlYW5hbW04QGdtYWlsLmNvbSIsInVuaXF1ZV9uYW1lIjoiU0VBTiBEQU5JRUwiLCJmYW1pbHlfbmFtZSI6IkFNTSIsInN1YiI6Ijk0NGMxN2I5LWM0OTYtZWUxMS1hZjg4LTAwNTA1NmI5YjUwYyIsInBwc24iOiIxNjQ5Mzk0RSIsIjJmYWF1dGgiOiJ0cnVlIiwibXlnb3YiOiJ0cnVlIiwibXlnb3Z0b2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW10cFpDSTZJbk5wWjI1cGJtZHJaWGt1YlhsbmIzWnBaQzUyTVNJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGVIQWlPakUzTkRFd05EY3hOVEVzSW01aVppSTZNVGMwTVRBME5UTTFNU3dpZG1WeUlqb2lNUzR3SWl3aWFYTnpJam9pYUhSMGNITTZMeTloWTJOdmRXNTBMbTE1WjI5MmFXUXVhV1V2WlRFNU4yVmhPV1V0TURKbE5TMDBZMkkyTFRrMllqSXROVFUzTVdOa05qUTFOelUwTDNZeUxqQXZJaXdpYzNWaUlqb2lhV1kwVW5Nd1dFTlFiRTVuTVhsQmVWRXZiRkp6TTJKeVIyZDBSVzFGY0VsNlNqaFVVRTVKTWtWb1p6MGlMQ0poZFdRaU9pSmtOV1k1WmpobVppMWxPVEExTFRSa09ERXRPVGc0WWkxaFlXSTFNV1l6T0RjeU9UTWlMQ0pwWVhRaU9qRTNOREV3TkRVek5URXNJbUYxZEdoZmRHbHRaU0k2TVRjME1UQTBOVE0xTVN3aVpXMWhhV3dpT2lKelpXRnVZVzF0T0VCbmJXRnBiQzVqYjIwaUxDSnZhV1FpT2lJd05XWmlNV0kxTnkxak4yTXlMVFExWmpZdFlqZGlaaTAyTmpJeU1qZGlOV1EzTnpNaUxDSlFkV0pzYVdOVFpYSjJhV05sVG5WdFltVnlJam9pTVRZME9UTTVORVVpTENKQ2FYSjBhRVJoZEdVaU9pSXdOQzh3TlM4eU1EQTFJaXdpVEdGemRFcHZkWEp1WlhraU9pSk1iMmRwYmlJc0ltZHBkbVZ1VG1GdFpTSTZJbE5sWVc0aUxDSnpkWEp1WVcxbElqb2lRVzF0SWl3aWJXOWlhV3hsSWpvaU16VXpNRGcxTWpJM01qQTNOQ0lzSWtSVFVFOXViR2x1WlV4bGRtVnNJam9pTWlJc0lrUlRVRTl1YkdsdVpVeGxkbVZzVTNSaGRHbGpJam9pTWlJc0lrTjFjM1J2YldWeVNXUWlPaUkzTURFNU5qWXdJaXdpUVdOalpYQjBaV1JRY21sMllXTjVWR1Z5YlhNaU9uUnlkV1VzSWtGalkyVndkR1ZrVUhKcGRtRmplVlJsY20xelZtVnljMmx2Yms1MWJXSmxjaUk2SWpjaUxDSlRUVk15UmtGRmJtRmliR1ZrSWpwbVlXeHpaU3dpVkc5MGNESkdRVVZ1WVdKc1pXUWlPbVpoYkhObExDSkJZMk5sY0hSbFpGQnlhWFpoWTNsVVpYSnRjMFJoZEdWVWFXMWxJam94TmpnM09UWTJPVGszTENKMGNuVnpkRVp5WVcxbGQyOXlhMUJ2YkdsamVTSTZJa0l5UTE4eFFWOXphV2R1YVc0dFZqVXRURWxXUlNJc0lrTnZjbkpsYkdGMGFXOXVTV1FpT2lKaU56Um1PVFF4T0MwNE1qZ3lMVFJsWldFdE9UYzJaaTB3TldFeVpEQXlZVGs1TkRFaWZRLjVtUFREU1Q0ZDZ6WkctYm4yczBMWDNVb3Q0VlZjQXo5Rm5LQTRTQmNGbzNDakNPbHVTbDQ3dWdscGdUQzdsY20wWml3Y1MzRXRWYlFGMURhNjlwcE1TbUZDSndnVElQSXFXMDlZNFFiaTNLUGI2bExvM2xMVUg5dzBuRzE1MGV2MU1QTS1Od3pPMjJmeVVOY1RvalNMZTY4SDQ2dDUteUotSmUzemJJV0poTmlZVGQ5OVdlU3JyRGRlQmNqRXVuYm9VYmlwZTB4cWZiajhteUNPWHdBU3hlQWNyM25ueXU1Z1ZYNFdkdndqSzY0TUJtNVRONUxSRG83azZkemlXaVQyMHRoaW0wT2t2cGJUa1NvcHNSM1M5X0J4NVF5U29VQnVERW5ZNGs5U2FjMzZ0ZDBRckxCRGphNVBwZWNubFpmV1NVcTJJSV90d2kxRFV0dXhCaDVtQSIsIm5iZiI6MTc0MTA0NTM1MiwiZXhwIjoxNzQxMDUyNTUyLCJpYXQiOjE3NDEwNDUzNTIsImlzcyI6Im15cm9hZHNhZmV0eS5yc2EuaWUiLCJhdWQiOiJteXJvYWRzYWZldHkucnNhLmllIn0.tyxUVEEOE9NDo8VMUTHaxWZfAUohAkLSclN_WOpQKPQ";
    // Set a realistic user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.setRequestInterception(true);

    // Handle request interception
    page.on("request", async (request) => {
      const headers = {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Cookie:
          "OptanonAlertBoxClosed=2025-03-01T15:56:32.156Z; token=" +
          process.env.RSA_TOKEN,
        referer:
          "https://myroadsafety.rsa.ie/portal/booking/new/e5bbe47a-3f94-e911-a2be-0050568fd8e0/d2dc5f8c-2506-ea11-a2c3-0050568fd8e0",
      };

      // If this is the specific API request we want to intercept
      if (
        request.url().includes("myroadsafety.rsa.ie/api/v1/Availability/All")
      ) {
        const response = await fetch(request.url(), {
          headers: headers,
          method: "GET",
        });
        console.log(response);

        if (response.ok) {
          const data = await response.json();
          console.log(data);
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
