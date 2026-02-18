import {
    getAuthenticatedAthlete,
    getRecentActivities,
    getAthleteStats,
    listAthleteRoutes,
    exportRouteGpx,
    fetchAllPages,
} from '../src/stravaClient.js';
import { loadConfig } from '../src/config.js';

async function testAllApis() {
    console.log('🧪 Testing all API functions...\n');

    const config = await loadConfig();
    const token = config.accessToken;

    if (!token) {
        console.error('❌ No access token. Run connect-strava first.');
        return;
    }

    try {
        // Test 1: Get athlete
        console.log('1️⃣ Testing getAuthenticatedAthlete...');
        const athlete = await getAuthenticatedAthlete(token);
        console.log(`✅ ${athlete.firstname} ${athlete.lastname} (ID: ${athlete.id})\n`);

        // Test 2: Get activities
        console.log('2️⃣ Testing getRecentActivities...');
        const activities = await getRecentActivities(token, 5);
        console.log(`✅ Found ${JSON.stringify(activities, null, 4)} activities\n`);

        // Test 3: Get stats
        console.log('3️⃣ Testing getAthleteStats...');
        const stats = await getAthleteStats(token, athlete.id);
        console.log(`✅ Recent Run: ${(stats.recent_run_totals.distance / 1000).toFixed(1)} km\n`);

        // Test 4: Get routes
        console.log('4️⃣ Testing listAthleteRoutes...');
        const routes = await listAthleteRoutes(token, 1, 5);
        console.log(`✅ Found ${JSON.stringify(routes, null, 4)} routes\n`);

        const allActivities = await fetchAllPages(
            (page) => getRecentActivities(token, 5), 10
        );

        console.log(`✅ All Activities ${JSON.stringify(allActivities, null, 4)}\n`);
        console.log('🎉 All API tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}



testAllApis()