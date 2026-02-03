#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfig } from './config.js';
import { getAuthenticatedAthlete } from './stravaClient.js';

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

// Test tool: Get athlete profile
server.registerTool(
    "get-profile", {
    description: "Get the authenticated athlete's profile from Strava",
    inputSchema: {}
},
    async () => {
        try {
            // Load config
            const config = await loadConfig();
            const token = config.accessToken;

            if (!token) {
                return {
                    content: [{
                        type: "text" as const,
                        text: "❌ Not connected to Strava. Please set up authentication first."
                    }],
                    isError: true
                };
            }

            // Call API
            const athlete = await getAuthenticatedAthlete(token);

            // Format response
            const text = [
                `👤 **${athlete.firstname} ${athlete.lastname}** (ID: ${athlete.id})`,
                `📍 ${[athlete.city, athlete.state, athlete.country].filter(Boolean).join(', ') || 'Location not set'}`,
                `🏅 ${athlete.premium ? 'Premium' : 'Free'} account`,
                `📅 Joined: ${new Date(athlete.created_at).toLocaleDateString()}`,
            ].join('\n');

            return {
                content: [{
                    type: "text" as const,
                    text
                }]
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [{
                    type: "text" as const,
                    text: `❌ Error: ${message}`
                }],
                isError: true
            };
        }
    }
);

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

        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("✅ Server connected and ready!");
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

startServer();