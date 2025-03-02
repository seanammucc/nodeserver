# Puppeteer API Server

A Node.js server that uses Puppeteer with stealth mode to make API requests. This server works both locally and on a Digital Ocean droplet.

## Features

- Express.js server with API endpoints
- Puppeteer with stealth plugin to avoid detection
- Environment variable configuration
- Works both locally and on Digital Ocean droplets

## Installation

1. Clone this repository:

   ```
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   TARGET_API_URL=https://example.com/api
   ```

## Running Locally

Start the development server:

```
npm run dev
```

Or start the production server:

```
npm start
```

## Deploying to Digital Ocean

1. Create a new Digital Ocean droplet with Ubuntu.

2. Connect to your droplet via SSH:

   ```
   ssh root@your-droplet-ip
   ```

3. Install Node.js and npm:

   ```
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. Install additional dependencies required for Puppeteer:

   ```
   sudo apt-get update
   sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

5. Clone your repository and set up the application:

   ```
   git clone <your-repo-url>
   cd <your-repo-directory>
   npm install
   ```

6. Create the `.env` file with your configuration.

7. Start the server:

   ```
   npm start
   ```

8. (Optional) Set up PM2 to keep your application running:
   ```
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

## API Endpoints

- `GET /`: Check if the server is running
- `GET /api-request`: Make a request to the API URL specified in the `.env` file
- `POST /custom-request`: Make a custom request with parameters
  - Request body:
    ```json
    {
      "url": "https://example.com",
      "selector": "h1.title" // Optional CSS selector
    }
    ```

## License

MIT
