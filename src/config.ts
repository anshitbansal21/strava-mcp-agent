import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { StravaConfig } from './types.js';

// Config file location: ~/.config/strava-mcp/config.json
const CONFIG_DIR = path.join(os.homedir(), '.config', 'strava-mcp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

//ensure config directory exists 
async function ensureConfigDir(): Promise<void> {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
        try {
            await fs.writeFile(CONFIG_FILE, "{}", { flag: "wx" });
        } catch (err: any) {
            if (err.code !== "EEXIST") {
                throw err; // real error
            }
            // EEXIST = file already present → all good
        }
    } catch (error) {
        console.error('Warning: Could not create config directory:', error);
    }
}

// load config from json file
async function loadConfigFile(): Promise<StravaConfig> {
    try {
        const content = await fs.readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(content) as StravaConfig;
    } catch (error) {
        console.error('Warning: Could not load config file:', error);
        return {};
    }
}

export async function saveConfig(config: StravaConfig): Promise<void> {
    await ensureConfigDir();
    const existing = await loadConfigFile();
    const merged = { ...existing, ...config };

    await fs.writeFile(
        CONFIG_FILE,
        JSON.stringify(merged, null, 2),
        'utf-8'
    );
    console.info('Config saved successfully');
}

/**
 * Loads Strava configuration from multiple sources.
 * Priority (highest to lowest):
 * 1. Environment variables
 * 2. ~/.config/strava-mcp/config.json
 * 3. Local .env file (handled by dotenv in server.ts)
 */
export async function loadConfig(): Promise<StravaConfig> {
    // Load from config file first
    const fileConfig = await loadConfigFile();

    // Environment variables take priority
    const config: StravaConfig = {
        clientId: process.env.STRAVA_CLIENT_ID || fileConfig.clientId,
        clientSecret: process.env.STRAVA_CLIENT_SECRET || fileConfig.clientSecret,
        accessToken: process.env.STRAVA_ACCESS_TOKEN || fileConfig.accessToken,
        refreshToken: process.env.STRAVA_REFRESH_TOKEN || fileConfig.refreshToken,
        expiresAt: fileConfig.expiresAt,
    };

    return config;
}

/**
 * Updates tokens in both the config file and process.env
 */
export async function updateTokens(
    accessToken: string,
    refreshToken: string,
    expiresAt?: number
): Promise<void> {
    // Update process.env for current session
    process.env.STRAVA_ACCESS_TOKEN = accessToken;
    process.env.STRAVA_REFRESH_TOKEN = refreshToken;

    // Save to config file for persistence
    await saveConfig({
        accessToken,
        refreshToken,
        expiresAt,
    });

    console.log('✅ Tokens updated');
}

export async function saveClientCredentials(clientId: string, clientSecret: string): Promise<void> {
    await saveConfig({ clientId, clientSecret });
    console.info('Client credentials saved successfully');
}

export function hasClientCredentials(config: StravaConfig): boolean {
    return !!(config.clientId && config.clientSecret);
}

export function hasValidTokens(config: StravaConfig): boolean {
    return !!(config.accessToken && config.refreshToken && config.expiresAt && config.expiresAt > Date.now());
}

/**
 * Gets the config file path (useful for display to users)
 */
export function getConfigPath(): string {
    return CONFIG_FILE;
}

/**
 * Clears all stored config (useful for logout/reset)
 */
export async function clearConfig(): Promise<void> {
    try {
        await fs.unlink(CONFIG_FILE);
        console.log('✅ Config cleared');
    } catch {
        // File might not exist, that's fine
    }
}