import { z } from 'zod';
import { ToolResult } from '../types.js';
import { loadConfig, hasValidTokens, getConfigPath, clearConfig } from '../config.js';
import { startAuthServer, getAuthUrl } from '../auth/server.js';
import { getAuthenticatedAthlete } from '../stravaClient.js';
import open from 'open';

export const connectStravaTool = {
    name: 'connect-strava',
    description: 'Connect your Strava account to enable activity tracking. ' +
        'Opens a browser window for secure authentication.',
    inputSchema: z.object({
        force: z.boolean()
            .optional()
            .describe('Force re-authentication even if already connected'),
    }),
    execute: async (args: { force?: boolean }): Promise<ToolResult> => {
        const { force = false } = args;
        try {
            // Check if already authenticated
            if (!force) {
                const config = await loadConfig();
                if (hasValidTokens(config)) {
                    // Try to verify the tokens work
                    try {
                        const token = config.accessToken!;
                        const athlete = await getAuthenticatedAthlete(token);
                        return {
                            content: [{
                                type: 'text' as const,
                                text: `✅ Already connected to Strava as ${athlete.firstname} ${athlete.lastname}.\n\n` +
                                    `You can ask me about your activities, stats, routes, and more!\n\n` +
                                    `If you want to connect a different account, use the force option.`,
                            }],
                        };
                    } catch {
                        // Token might be expired, continue to re-auth
                    }
                }
            }

            console.error('🚀 Starting OAuth flow...');
            const authUrl = getAuthUrl();

            // Open browser
            await open(authUrl);
            console.error('📱 Browser opened to:', authUrl);

            // Start server and wait for completion
            const result = await startAuthServer();

            if (result.success) {
                const greeting = result.athleteName
                    ? `Welcome, ${result.athleteName}! 🎉`
                    : 'Successfully connected! 🎉';

                return {
                    content: [{
                        type: 'text' as const,
                        text: `✅ ${greeting}\n\n` +
                            `Your Strava account is now connected. You can ask me about:\n` +
                            `• Your recent activities\n` +
                            `• Training statistics\n` +
                            `• Routes and segments\n` +
                            `• And much more!\n\n` +
                            `Try asking: "Show me my recent activities" or "What are my stats for this year?"`,
                    }],
                };
            } else {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `❌ ${result.message}\n\n` +
                            `Please try again. If the issue persists, make sure:\n` +
                            `1. You have a Strava API application (create at https://www.strava.com/settings/api)\n` +
                            `2. Authorization Callback Domain is set to "localhost"\n` +
                            `3. You're using the correct Client ID and Client Secret`,
                    }],
                    isError: true,
                };
            }
        } catch (error: any) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `❌ Error connecting to Strava: ${error.message}\n\n` +
                        `Please try again. If the browser didn't open, visit: ${getAuthUrl()}`,
                }],
                isError: true,
            };
        }
    }
}

/**
 * Tool: disconnect-strava
 * Removes stored credentials and tokens
 */
export const disconnectStravaTool = {
    name: 'disconnect-strava',
    description: 'Disconnect your Strava account and remove stored credentials.',

    inputSchema: z.object({}),

    execute: async (): Promise<ToolResult> => {
        try {
            await clearConfig();

            // Clear from process.env as well
            delete process.env.STRAVA_ACCESS_TOKEN;
            delete process.env.STRAVA_REFRESH_TOKEN;
            delete process.env.STRAVA_CLIENT_ID;
            delete process.env.STRAVA_CLIENT_SECRET;

            return {
                content: [{
                    type: 'text' as const,
                    text: '✅ Disconnected from Strava. Your credentials have been removed.\n\n' +
                        'To reconnect, just say "Connect my Strava account".',
                }],
            };
        } catch (error: any) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `❌ Error disconnecting: ${error.message}`,
                }],
                isError: true,
            };
        }
    },
};