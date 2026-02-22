import { getAuthenticatedAthlete } from "../stravaClient.js";
import { loadConfig } from "../config.js";
import { ToolResult } from "../types.js";


export const getAuthenticatedAthleteTool = {
    name: 'get-authenticated-athlete',
    description: "Retrieve detailed information about the authenticated user, including athlete ID, name, location, account type, and other profile details from Strava.",
    inputSchema: {},
    execute: async (): Promise<ToolResult> => {
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
            let authenticatedAthleteInfo = await getAuthenticatedAthlete(token);
            if (!authenticatedAthleteInfo) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: '📭 Weird, we failed to query this data 😔'
                    }]
                };
            }

            const formattedData = formatStats(authenticatedAthleteInfo);
            // Format output
            console.log("DEBUG auth tool", formattedData)

            return {
                content: [{
                    type: 'text' as const,
                    text: formattedData
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

function formatStats(athlete: any): string {
    const locationParts = [athlete.city, athlete.state, athlete.country].filter(Boolean);
    const location = locationParts.length ? locationParts.join(', ') : 'Not set';
    const gender =
        athlete.sex === "M"
            ? "Male"
            : athlete.sex === "F"
                ? "Female"
                : "Not specified";
    const accountType = athlete.premium ? "Premium" : "Free";
    const joined = new Date(athlete.created_at).toLocaleDateString();
    const updated = new Date(athlete.updated_at).toLocaleDateString();

    return [
        `👤 Name: ${athlete.firstname} ${athlete.lastname}`,
        `🆔 Athlete ID: ${athlete.id}`,
        `📍 Location: ${location}`,
        `⚧️ Gender: ${gender}`,
        `🏅 Account Type: ${accountType}`,
        `🗓️ Joined: ${joined}`,
        `🔄 Last Updated: ${updated}`,
        `🖼️ Profile (small): ${athlete.profile_medium}`,
        `🖼️ Profile (full): ${athlete.profile}`
    ].join('\n');
}