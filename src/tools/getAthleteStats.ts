import z from "zod";
import { getAthleteStats } from "../stravaClient.js";
import { loadConfig } from "../config.js";
import { ToolResult } from "../types.js";


export const getAthleteStatsTool = {
    name: 'get-athlete-stats',
    description: "Get the athlete's overall training stats from Strava. Shows recent, year-to-date, and all-time totals for distance, time, and elevation for runs and rides.",
    inputSchema: z.object({
        athleteId: z.number()
            .describe('Athlete ID of the individual which you can get from the response of get-athlete-profile if you do not have it'),
    }),

    execute: async (args: { athleteId: number }): Promise<ToolResult> => {
        const { athleteId } = args;
        console.log("athleteid", athleteId)
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
            let athleteStats = await getAthleteStats(token, athleteId);

            console.log("DEBUG", athleteStats)
            if (!athleteStats) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: '📭 Weird, we failed to query your stats data 😔'
                    }]
                };
            }

            const formattedStats = formatStats(athleteStats);
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

function formatStats(athleteStats: any): string {
    // Helper functions
    const metersToKm = (m: number) => (m / 1000).toFixed(2);
    const metersToMi = (m: number) => (m / 1609.34).toFixed(2);
    const secondsToHM = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // Get stats for each group if present
    const statsSections = [
        { key: "recent_run_totals", label: "Recent Runs" },
        { key: "recent_ride_totals", label: "Recent Rides" },
        { key: "ytd_run_totals", label: "Year to Date Runs" },
        { key: "ytd_ride_totals", label: "Year to Date Rides" },
        { key: "all_run_totals", label: "All Time Runs" },
        { key: "all_ride_totals", label: "All Time Rides" },
    ];

    let output = "";

    for (const { key, label } of statsSections) {
        const st = athleteStats[key];
        if (!st) continue;

        output += `🏷️ ${label}\n`;
        output += `  • Activities: ${st.count}\n`;

        output += `  • Distance: ${metersToKm(st.distance)} km (${metersToMi(st.distance)} mi)\n`;

        output += `  • Moving Time: ${secondsToHM(st.moving_time)}\n`;
        output += `  • Elapsed Time: ${secondsToHM(st.elapsed_time)}\n`;
        output += `  • Elevation Gain: ${st.elevation_gain.toFixed(1)} meters\n\n`;
    }

    output = output.trim();
    if (!output) {
        output = "No stats available.";
    }

    return output;
}