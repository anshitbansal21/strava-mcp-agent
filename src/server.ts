#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import z from 'zod';

console.info('🏃🏼‍♂️ Starting MCP Server for Strava...');

const server = new McpServer({
    name: "my-strava-mcp-server",
    version: "0.1.0"
});

// Register a tool
server.registerTool(
    "get-activities", {
    description: "Get recent Strava activities for the authenticated user",
    inputSchema: {}
},
    async () => {
        const activityLimit = 10;
        // TODO: Implement actual Strava API call
        return {
            content: [
                {
                    type: "text",
                    text: `Fetching ${activityLimit} recent activities...`
                }
            ]
        };
    }
);

server.registerTool(
    "echo-message-back", {
    description: "Echo a message back to the user",
    inputSchema: z.object({
        message: z.string().describe("The message to echo back")
    })
},
    async ({ message }) => {
        console.info(`Echoing message back to the user: ${message}`);
        return {
            content: [
                {
                    type: "text",
                    text: message
                }
            ]
        };
    }
);

function log(level: string, message: string) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${level}] ${message}`);
}
McpServer.
async function startServer() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        log("INFO", "Server starting...");
    } catch (error) {
        log("Error", "Failed to start server...");
        process.exit(1);
    }
}

startServer();