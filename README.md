# Strava MCP Server
Strava MCP Server is a tool I built out of my passion for running, especially during a period of injury recovery. I wanted to create something that helps runners analyze their runs, gain deeper insights, and plan their workouts more effectively to minimize risk and maximize performance. 

This project allows you to export and analyze Strava activity data in new ways, with the goal of empowering athletes of all levels to make smarter training decisions. I have plans to keep building on this — expect new features that will help structure and optimize your workout plans even further!

If you're a runner looking to understand your training better or just curious about your data, give it a try and let me know your thoughts!

## Setup

1. Install dependencies:
```bash
   npm install
```

2. Configure environment (optional):
```bash
   cp .env.example .env
   # Edit .env with your Strava API credentials
```

3. Run in development:
```bash
   npm run dev
```

4. Build for production:
```bash
   npm run build
   npm start
```

## Add the MCP server 
```json
   {
      "strava-server": {
         "command": "<path to your node binary>", // you get this by running `which node`
         "args": [
            "<absolute path to dist/server.js file >"
         ]
      }
   }
```

## Connect Strava (OAuth)

This project supports an interactive OAuth flow via the MCP tool `connect-strava`.

1. Create a Strava API application at `https://www.strava.com/settings/api`
2. Set **Authorization Callback Domain** to `localhost`
3. Start the server:

```bash
npm run dev
```

4. In your MCP client, run the tool `connect-strava`
   - Enter your **Client ID** and **Client Secret** in the local setup page
   - Approve access in Strava

Tokens are stored in `~/.config/strava-mcp/config.json`.


