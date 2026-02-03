import { getAuthenticatedAthlete } from '../src/stravaClient.js';
import { loadConfig } from '../src/config.js';

async function test() {
  console.log('Testing API client...\n');

  const config = await loadConfig();
  const token = process.env.STRAVA_ACCESS_TOKEN //|| config.accessToken;

  if (!token) {
    console.log('❌ No access token found. Set STRAVA_ACCESS_TOKEN in .env');
    return;
  }

  try {
    console.log('Fetching athlete profile...');
    const athlete = await getAuthenticatedAthlete(token);

    console.log('\n✅ Success!');
    console.log('Name:', athlete.firstname, athlete.lastname);
    console.log('ID:', athlete.id);
    console.log('Location:', athlete.city, athlete.country);
  } catch (error) {
    console.log('\n❌ Error:', error);
  }
}

test();