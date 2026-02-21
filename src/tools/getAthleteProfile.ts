import { z } from 'zod';
import { ToolResult } from '../types.js';
import { loadConfig } from '../config.js';
import { getAuthenticatedAthlete } from '../stravaClient.js';

export const getAthleteProfileTool = {
    name: 'get-athlete-profile',

    description: 'Get the authenticated athlete\'s profile information, ' +
        'including name, location, and account details.',

    inputSchema: z.object({}),

    execute: async (): Promise<ToolResult> => {
        try {
            const config = await loadConfig();
            const token = config.accessToken;

            if (!token) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: '❌ Not connected to Strava. Say "Connect my Strava account" first.'
                    }],
                    isError: true
                };
            }

            const athlete = await getAuthenticatedAthlete(token);

            const location = [athlete.city, athlete.state, athlete.country]
                .filter(Boolean)
                .join(', ') || 'Not set';

            const lines = [
                `👤 **${athlete.firstname} ${athlete.lastname}**`,
                `   ID: ${athlete.id}`,
                `   📍 ${location}`,
                `   🏅 ${athlete.premium ? 'Premium' : 'Free'} Account`,
                `   📅 Joined: ${new Date(athlete.created_at).toLocaleDateString()}`,
            ];

            return {
                content: [{
                    type: 'text' as const,
                    text: lines.join('\n')
                }]
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [{
                    type: 'text' as const,
                    text: `❌ Error fetching profile: ${message}`
                }],
                isError: true
            };
        }
    }
};