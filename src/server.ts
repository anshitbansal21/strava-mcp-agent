#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfig } from './config.js';
import { connectStravaTool, disconnectStravaTool } from "./tools/connectStrava.js";
import { getRecentActivitiesTool } from './tools/getRecentActivities.js';
import { getAthleteStatsTool } from "./tools/getAthleteStats.js";
import { getAuthenticatedAthleteTool } from "./tools/getAuthenticatedAthlete.js";
import { getActivityDetailsTool } from "./tools/getActivityDetails.js";
import { getAllActivitiesTool } from "./tools/getAllActivities.js";
// import { getAthleteStatsTool } from './tools/getAthleteStats.js';
// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

console.error("🚀 Starting My Strava MCP Server...");

const server = new McpServer({
    name: "my-strava-mcp-server",
    version: "0.1.0"
});

function registerTool(tool: any) {
    server.registerTool(
        tool.name,
        {
            description: tool.description,
            inputSchema: tool.inputSchema?.shape,
        },
        tool.execute
    );
}

// Register all tools
registerTool(connectStravaTool);
registerTool(disconnectStravaTool);
registerTool(getAthleteStatsTool);
registerTool(getAuthenticatedAthleteTool);
registerTool(getActivityDetailsTool);
registerTool(getAllActivitiesTool);

async function startServer() {
    try {
        // Load config on startup
        const config = await loadConfig();

        // Update process.env if config has tokens
        if (config.accessToken) {
            process.env.STRAVA_ACCESS_TOKEN = config.accessToken;
        }
        if (config.refreshToken) {
            process.env.STRAVA_REFRESH_TOKEN = config.refreshToken;
        }
        if (config.clientId) {
            process.env.STRAVA_CLIENT_ID = config.clientId;
        }
        if (config.clientSecret) {
            process.env.STRAVA_CLIENT_SECRET = config.clientSecret;
        }

        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("✅ Server connected and ready!");
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

startServer();