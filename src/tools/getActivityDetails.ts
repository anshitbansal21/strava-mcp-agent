import z from "zod";
import { getActivityById, getAthleteStats } from "../stravaClient.js";
import { loadConfig } from "../config.js";
import { ToolResult } from "../types.js";


export const getActivityDetailsTool = {
    name: 'get-activity-details',
    description: "Retrieve detailed information about a specific activity from Strava by providing its activity ID. Returns stats such as name, distance, duration, elevation, heart rate type, and key metrics.",
    inputSchema: z.object({
        activityId: z.number()
            .describe('The ID of the activity you want to fetch details for. You can get activity IDs from get-recent-activities or other activity listing endpoints.'),
    }),

    execute: async (args: { activityId: number }): Promise<ToolResult> => {
        try {
            // Get token
            const { activityId } = args;
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
            let activityInfo = await getActivityById(token, activityId);

            console.log("DEBUG", JSON.stringify(activityInfo))
            if (!activityInfo) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: '📭 Weird, we failed to query your stats data 😔'
                    }]
                };
            }

            const formattedStats = formatData(activityInfo);
            // Format output


            return {
                content: [{
                    type: 'text' as const,
                    text: formattedStats
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

function formatData(activity: any): string {
    // Helper functions
    const metersToKm = (m: number) => (m / 1000).toFixed(2);
    const metersToMi = (m: number) => (m / 1609.34).toFixed(2);
    const secondsToHM = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        let str = '';
        if (h > 0) str += `${h}h `;
        if (m > 0 || h > 0) str += `${m}m `;
        str += `${sec}s`
        return str.trim();
    };

    // Output each property in a readable way
    let output = `🏃 Activity Details\n`;

    output += `• Name: ${activity.name}\n`;
    output += `• Type: ${activity.sport_type ?? activity.type}\n`;
    output += `• Distance: ${metersToKm(activity.distance)} km (${metersToMi(activity.distance)} mi)\n`;
    output += `• Moving Time: ${secondsToHM(activity.moving_time)}\n`;
    output += `• Elapsed Time: ${secondsToHM(activity.elapsed_time)}\n`;

    if ('total_elevation_gain' in activity && typeof activity.total_elevation_gain === "number") {
        output += `• Elevation Gain: ${activity.total_elevation_gain.toFixed(1)} meters\n`;
    }
    if ('average_speed' in activity && typeof activity.average_speed === "number") {
        output += `• Average Speed: ${(activity.average_speed * 3.6).toFixed(2)} km/h\n`;
    }
    if ('max_speed' in activity && typeof activity.max_speed === "number") {
        output += `• Max Speed: ${(activity.max_speed * 3.6).toFixed(2)} km/h\n`;
    }
    if ('average_heartrate' in activity && typeof activity.average_heartrate === "number") {
        output += `• Avg HR: ${activity.average_heartrate.toFixed(0)} bpm\n`;
    }
    if ('max_heartrate' in activity && typeof activity.max_heartrate === "number") {
        output += `• Max HR: ${activity.max_heartrate.toFixed(0)} bpm\n`;
    }
    if ('start_date_local' in activity) {
        output += `• Start: ${activity.start_date_local}\n`;
    } else if ('start_date' in activity) {
        output += `• Start: ${activity.start_date}\n`;
    }
    output += `• Activity ID: ${activity.id}`;

    return output;
}
