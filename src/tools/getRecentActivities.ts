import { z } from 'zod';
import { ToolResult } from '../types.js';
import { loadConfig } from '../config.js';
import { getRecentActivities as apiGetRecentActivities } from '../stravaClient.js';
import { formatDistance, formatDuration } from '../utils.js';

export const getRecentActivitiesTool = {
    name: 'get-recent-activities',

    description: 'Get the athlete\'s recent activities from Strava. ' +
        'Shows the latest workouts with key stats like distance, duration, and type.',

    inputSchema: z.object({
        type: z.enum(['Run', 'Ride', 'Swim', 'Walk']).optional()
            .describe('Filter by activity type'),
        perPage: z.number()
            .min(1)
            .max(100)
            .optional()
            .default(30)
            .describe('Number of activities to fetch (default: 30, max: 100)'),
    }),

    execute: async (args: { perPage?: number, type?: string }): Promise<ToolResult> => {
        const { perPage = 30, type = undefined } = args;

        try {
            // Get token
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

            // Fetch activities
            let activities = await apiGetRecentActivities(token, perPage);
            // Filter by type if specified
            if (args.type) {
                activities = activities.filter(a => a.sport_type === args.type);
            }
            console.log("DEBUG", activities)
            if (activities.length === 0) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: '📭 No recent activities found. Get out there and exercise! 💪'
                    }]
                };
            }

            // Format output
            const lines = [
                `🏃 **Recent Activities** (${activities.length} found)\n`,
            ];

            activities.forEach((activity, index) => {
                const emoji = getActivityEmoji(activity.sport_type);
                const date = new Date(activity.start_date_local).toLocaleDateString();
                const distance = formatDistance(activity.distance);
                const duration = formatDuration(activity.moving_time);
                const pace = activity.average_speed
                    ? `@ ${formatPace(activity.average_speed)}`
                    : '';

                lines.push(
                    `${index + 1}. ${emoji} **${activity.name}** (ID: ${activity.id})`,
                    `   📅 ${date} | 📏 ${distance} | ⏱️ ${duration} ${pace}`,
                    `   Type: ${activity.sport_type}`,
                    ''
                );
            });

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
                    text: `❌ Error fetching activities: ${message}`
                }],
                isError: true
            };
        }
    }
};

// Helper: Get emoji for activity type
function getActivityEmoji(sportType: string): string {
    const emojiMap: Record<string, string> = {
        'Run': '🏃',
        'Ride': '🚴',
        'Swim': '🏊',
        'Walk': '🚶',
        'Hike': '🥾',
        'AlpineSki': '⛷️',
        'BackcountrySki': '⛷️',
        'NordicSki': '⛷️',
        'Snowboard': '🏂',
        'Rowing': '🚣',
        'Kayaking': '🛶',
        'Workout': '💪',
        'WeightTraining': '🏋️',
        'Yoga': '🧘',
    };

    return emojiMap[sportType] || '🏃';
}

// Helper: Format pace
function formatPace(metersPerSecond: number): string {
    if (metersPerSecond === 0) return '';
    const minutesPerKm = (1000 / metersPerSecond) / 60;
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.floor((minutesPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}