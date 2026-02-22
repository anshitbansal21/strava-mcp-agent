import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { loadConfig, updateTokens } from "./config.js";
import z from "zod";


export const stravaApi = axios.create({
    baseURL: 'https://www.strava.com/api/v3',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

stravaApi.interceptors.request.use()
/**
 * Request interceptor - adds auth header to all requests
 */
stravaApi.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = process.env.STRAVA_ACCESS_TOKEN;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - handles errors globally
 */
stravaApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            console.error('Unauthorized: Refreshing access token...');
            try {
                await refreshAccessToken();

                if (error.config) {
                    const newToken = process.env.STRAVA_ACCESS_TOKEN;
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return stravaApi(error.config);
                }
            } catch (refreshError) {
                console.error('Failed to refresh access token:', refreshError);
                throw new Error('Failed to refresh access token. Please reconnect your Strava account.');
            }
        }
        return Promise.reject(error);
    }
)

/**
 * Refreshes the Strava API access token using the refresh token
 */
async function refreshAccessToken(): Promise<void> {
    const config = await loadConfig();
    const refreshToken = config.refreshToken;
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;

    if (!refreshToken || !clientId || !clientSecret) {
        throw new Error(
            "Missing refresh credentials. PLease connect your strava account first."
        )
    }

    try {
        const response = await axios.post('https://www.strava.com/oauth/token', {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;
        const expiresAt = response.data.expires_at;

        if (!newAccessToken || !newRefreshToken) {
            throw new Error('Refresh response missing required tokens');
        }

        await updateTokens(newAccessToken, newRefreshToken, expiresAt);
        console.log(`✅ Token refreshed. Expires: ${new Date(expiresAt * 1000).toLocaleString()}`)
    } catch (error) {
        console.error("Failed to refresh access token", error)
        throw error;
    }
}

/**
 * Helper function to handle API errors consistently
 */
export async function handleApiError<T>(
    error: unknown,
    context: string,
    retryFn?: () => Promise<T>
): Promise<T> {
    // If it's a 401 and we have a retry function, the interceptor should have
    // already handled it. If we're here, something else went wrong.

    if (axios.isAxiosError(error)) {
        const status = error.response?.status || 'Unknown';
        const responseData = error.response?.data;

        // Extract error message
        // Yes, the 'as string' syntax doesn't work as a type guard here.
        // It just tells TypeScript to treat the value as a string (even if it isn't).
        // To safely check, use typeof:
        const message = typeof responseData?.message === 'string' && responseData.message
            ? responseData.message
            : error.message;

        if (status === 402) {
            throw new Error("Subscription Required, this feature on strava needs strava subscription as it is a premium feature.")
        } else if (status === 403) {
            throw new Error(`Trying to get forbidden resource. Context: ${context}`);
        } else if (status === 404) {
            throw new Error(
                `Not Found: The requested resource doesn't exist. Context: ${context}`
            );
        } else if (status === 429) {
            throw new Error(`Rate limited: Please wait for some time. Context: ${context}`)
        }

        throw new Error(`Strava API Error (${status}) in ${context}: ${message}`);
    }
    // Non-Axios error
    if (error instanceof Error) {
        throw new Error(`Error in ${context}: ${error.message}`);
    }
    throw new Error(`Unknown error in ${context}: ${String(error)}`);
}

/**
 * Example: Define a Zod schema for Strava athlete
 */
const AthleteSchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    sex: z.enum(['M', 'F']).nullable(),
    premium: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    profile_medium: z.url(),
    profile: z.url(),
});

export type StravaAthlete = z.infer<typeof AthleteSchema>;

export async function getAuthenticatedAthlete(
    accessToken: string
): Promise<StravaAthlete> {
    if (!accessToken) {
        throw new Error('Access token is required.');
    }

    try {
        const response = await stravaApi.get('/athlete', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        const validationResult = AthleteSchema.safeParse(response.data);

        if (!validationResult.success) {
            console.error('Validation failed', validationResult.error);
            throw new Error(
                `Invalid data format from Strava api: ${validationResult.error.message}`
            )
        }
        return validationResult.data;
    } catch (error) {
        return handleApiError<StravaAthlete>(
            error,
            'getAuthenticatedAthlete',
            async () => {
                const newToken = process.env.STRAVA_ACCESS_TOKEN as string;
                return getAuthenticatedAthlete(newToken);
            }
        )
    }
}

// Activity Schema
const ActivitySchema = z.object({
    id: z.number(),
    name: z.string(),
    distance: z.number(),
    moving_time: z.number(),
    elapsed_time: z.number(),
    total_elevation_gain: z.number().optional(),
    type: z.string(),
    sport_type: z.string(),
    start_date: z.string(),
    start_date_local: z.string(),
    average_speed: z.number().optional(),
    max_speed: z.number().optional(),
    average_heartrate: z.number().optional(),
    max_heartrate: z.number().optional(),
});

export type StravaActivity = z.infer<typeof ActivitySchema>;

/**
 * Get recent activities
 */
export async function getRecentActivities(
    accessToken: string,
    perPage: number = 30
): Promise<StravaActivity[]> {
    if (!accessToken) {
        throw new Error('Access token required')
    }

    try {
        const response = await stravaApi.get('/athlete/activities', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { per_page: perPage }
        })

        const validated = z.array(ActivitySchema).parse(response.data);
        return validated;
    } catch (error) {
        return handleApiError<StravaActivity[]>(
            error,
            'getRecentActivities',
            async () => getRecentActivities(process.env.STRAVA_ACCESS_TOKEN!, perPage)
        )
    }
}

/**
 * Get activity by ID
 */
export async function getActivityById(
    accessToken: string,
    activityId: number
): Promise<StravaActivity> {
    if (!accessToken || !activityId) {
        throw new Error('Access token and activity ID required');
    }

    try {
        const response = await stravaApi.get(`/activities/${activityId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const validated = ActivitySchema.parse(response.data);
        return validated;
    } catch (error) {
        return handleApiError<StravaActivity>(
            error,
            `getActivityById(${activityId})`,
            async () => getActivityById(process.env.STRAVA_ACCESS_TOKEN!, activityId)
        );
    }
}

// Stats Schema
const ActivityTotalSchema = z.object({
    count: z.number(),
    distance: z.number(),
    moving_time: z.number(),
    elapsed_time: z.number(),
    elevation_gain: z.number(),
});

const StatsSchema = z.object({
    recent_run_totals: ActivityTotalSchema,
    recent_ride_totals: ActivityTotalSchema,
    ytd_run_totals: ActivityTotalSchema,
    ytd_ride_totals: ActivityTotalSchema,
    all_run_totals: ActivityTotalSchema,
    all_ride_totals: ActivityTotalSchema,
});

export type StravaStats = z.infer<typeof StatsSchema>;

/**
 * Get athlete stats
 */
export async function getAthleteStats(
    accessToken: string,
    athleteId: number
): Promise<StravaStats> {
    if (!accessToken || !athleteId) {
        throw new Error('Access token and athlete ID required');
    }

    try {
        const response = await stravaApi.get(`/athletes/${athleteId}/stats`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const validated = StatsSchema.parse(response.data);
        return validated;
    } catch (error) {
        return handleApiError<StravaStats>(
            error,
            `getAthleteStats(${athleteId})`,
            async () => getAthleteStats(process.env.STRAVA_ACCESS_TOKEN!, athleteId)
        );
    }
}

// Route Schema
const RouteSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    distance: z.number(),
    elevation_gain: z.number().nullable(),
    map: z.object({
        summary_polyline: z.string().optional(),
    }).nullable(),
});

export type StravaRoute = z.infer<typeof RouteSchema>;

/**
 * List athlete routes
 */
export async function listAthleteRoutes(
    accessToken: string,
    page: number = 1,
    perPage: number = 30
): Promise<StravaRoute[]> {
    if (!accessToken) {
        throw new Error('Access token required');
    }

    try {
        const response = await stravaApi.get('/athlete/routes', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page, per_page: perPage }
        });

        const validated = z.array(RouteSchema).parse(response.data);
        return validated;
    } catch (error) {
        return handleApiError<StravaRoute[]>(
            error,
            'listAthleteRoutes',
            async () => listAthleteRoutes(process.env.STRAVA_ACCESS_TOKEN!, page, perPage)
        );
    }
}

/**
 * Export route as GPX
 */
export async function exportRouteGpx(
    accessToken: string,
    routeId: string
): Promise<string> {
    if (!accessToken || !routeId) {
        throw new Error('Access token and route ID required');
    }

    try {
        const response = await stravaApi.get(`/routes/${routeId}/export_gpx`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: 'text'
        });

        if (typeof response.data !== 'string') {
            throw new Error('Invalid GPX format received');
        }

        return response.data;
    } catch (error) {
        return handleApiError<string>(
            error,
            `exportRouteGpx(${routeId})`,
            async () => exportRouteGpx(process.env.STRAVA_ACCESS_TOKEN!, routeId)
        );
    }
}

// Segment Schema
const SegmentSchema = z.object({
    id: z.number(),
    name: z.string(),
    distance: z.number(),
    average_grade: z.number(),
    maximum_grade: z.number(),
    elevation_high: z.number().optional(),
    elevation_low: z.number().optional(),
    climb_category: z.number(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
});

export type StravaSegment = z.infer<typeof SegmentSchema>;

/**
 * Get segment by ID
 */
export async function getSegmentById(
    accessToken: string,
    segmentId: number
): Promise<StravaSegment> {
    if (!accessToken || !segmentId) {
        throw new Error('Access token and segment ID required');
    }

    try {
        const response = await stravaApi.get(`/segments/${segmentId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const validated = SegmentSchema.parse(response.data);
        return validated;
    } catch (error) {
        return handleApiError<StravaSegment>(
            error,
            `getSegmentById(${segmentId})`,
            async () => getSegmentById(process.env.STRAVA_ACCESS_TOKEN!, segmentId)
        );
    }
}

// Get activity streams (heart rate, watts, GPS, etc.)
export async function getActivityStreams(
    accessToken: string,
    activityId: number,
    types: string[] // ['heartrate', 'watts', 'latlng', 'altitude']
): Promise<any> {
    if (!accessToken || !activityId) {
        throw new Error('Access token and activity id are required params')
    }

    try {
        const response = await stravaApi.get(`/activities/${activityId}/streams`)
        return response.data;
    } catch (error) {
        return handleApiError<any>(
            error,
            `getActivityStreams(${activityId})`,
            async () => getActivityStreams(process.env.STRAVA_ACCESS_TOKEN!, activityId, types)
        );
    }

}

// Get activity laps
export async function getActivityLaps(
    accessToken: string,
    activityId: number
): Promise<any> {
    if (!accessToken || !activityId) {
        throw new Error('Access token and activity id are required params')
    }

    try {
        const response = await stravaApi.get(`/activities/${activityId}/laps`);
        return response.data;
    } catch (error) {
        return handleApiError<any>(
            error,
            `getActivityLaps(${activityId})`,
            async () => getActivityLaps(process.env.STRAVA_ACCESS_TOKEN!, activityId)
        );
    }

}

export async function fetchAllPages<T>(
    fetchFn: (page: number) => Promise<T[]>,
    maxPages: number = 10
): Promise<T[]> {
    const allResults: T[] = [];
    for (let page = 1; page <= maxPages; page++) {
        const results = await fetchFn(page);

        if (results.length === 0) {
            break; // No more results
        }

        allResults.push(...results);
    }

    return allResults;
}