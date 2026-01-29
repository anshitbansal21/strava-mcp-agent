#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

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

async function startServer() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('🚀 MCP Server for Strava is running on stdin/stdout!');
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

startServer();