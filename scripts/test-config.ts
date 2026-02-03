import { loadConfig, saveConfig, clearConfig, hasValidTokens } from '../src/config.js';

async function test() {
    console.log('Testing configuration system...\n');

    // Test 1: Load empty config
    console.log('1. Load config (should be empty):');
    await saveConfig({});
    let config = await loadConfig();
    console.log(config);

    // Test 2: Save some data
    console.log('\n2. Save test tokens:');
    await saveConfig({
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        expiresAt: Date.now() + 21600 // 6 hours from now
    });

    // Test 3: Load again
    console.log('\n3. Load config again:');
    config = await loadConfig();
    console.log(config);
    console.log('Has valid tokens?', hasValidTokens(config));

    // Test 4: Clear
    console.log('\n4. Clear config:');
    await clearConfig();

    console.log('\n✅ All tests passed!');
}

test().catch(console.error);