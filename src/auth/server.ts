import http from 'http';
import { URL } from 'url';
import axios from 'axios';
import open from 'open';
import { errorPage, setupPage, successPage } from './pages.js';
import { saveClientCredentials, updateTokens } from '../config.js';
import { getAuthenticatedAthlete } from '../stravaClient.js';

export interface AuthResult {
    success: boolean;
    message: string;
    athleteName?: string;
}

const PORT = 8111;
const REDIRECT_URI = `http://localhost:${PORT}/auth/callback`;

let authServer: http.Server | null = null;
let authResolve: any;
let tempCredentials: any;

export function getAuthUrl() {
    return `http://localhost:${PORT}/auth/setup`
}

export async function startAuthServer(): Promise<AuthResult> {
    return new Promise((resolve) => {
        authResolve = resolve;

        authServer = http.createServer(handleRequest);

        authServer.listen(PORT, () => {
            console.error(`🌐 Auth server listening on http://localhost:${PORT}`);
        });

        setTimeout(() => {
            if (authServer) {
                shutdownServer();
                resolve({
                    success: false,
                    message: 'Authentication timed out. Try again.'
                })
            }
        }, 5 * 60 * 1000)
    })
}

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    console.log(`Request: ${req.method} ${url.pathname}. URL: ${req.url}`);

    try {
        if (url.pathname === '/auth/setup' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(setupPage());
        } else if (url.pathname === '/auth/start' && req.method === 'POST') {
            await handleAuthStart(req, res);
        } else if (url.pathname === '/auth/callback' && req.method === 'GET') {
            // Handle OAuth callback from Strava
            await handleCallback(url, res);
        }
    } catch (error) {
        console.error('❌ Error handling request:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(errorPage('Internal server error'));
    }
}

async function handleAuthStart(
    req: http.IncomingMessage,
    res: http.ServerResponse
): Promise<void> {
    const body = await parseBody(req);
    const params = new URLSearchParams(body);

    const clientId = params.get('clientId');
    const clientSecret = params.get('clientSecret');

    if (!clientId || !clientSecret) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(errorPage('Missing client ID or client secret'));
        return;
    }

    // Save credentials temporarily
    tempCredentials = { clientId, clientSecret };

    // Save to config file
    await saveClientCredentials(clientId, clientSecret);

    // Build Strava authorization URL
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=activity:read_all,profile:read_all`;

    console.log('Redirecting to Strava...')
    res.writeHead(302, { Location: stravaAuthUrl });
    res.end();
}

async function handleCallback(url: URL,
    res: http.ServerResponse) {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // Check for errors
    if (error) {
        console.error('❌ OAuth error:', error);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(errorPage(`Strava error: ${error}`));

        if (authResolve) {
            authResolve({
                success: false,
                message: `Strava authorization failed: ${error}`
            });
        }

        shutdownServer();
        return;
    }

    if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(errorPage('Missing authorization code'));

        if (authResolve) {
            authResolve({
                success: false,
                message: 'Missing authorization code from Strava'
            });
        }

        shutdownServer();
        return;
    }

    if (!tempCredentials) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(errorPage('Missing credentials'));

        if (authResolve) {
            authResolve({
                success: false,
                message: 'Internal error: missing credentials'
            });
        }

        shutdownServer();
        return;
    }

    try {
        console.log('Exchanging code for token...');
        const tokenResponse = await axios.post(
            'https://www.strava.com/oauth/token',
            {
                client_id: tempCredentials.clientId,
                client_secret: tempCredentials.clientSecret,
                code: code,
                grant_type: 'authorization_code'
            }
        );

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;
        const expiresAt = tokenResponse.data.expires_at;

        if (!accessToken || !refreshToken) {
            throw new Error('Missing tokens in response');
        }

        console.error('✅ Tokens received');
        // Save tokens
        await updateTokens(accessToken, refreshToken, expiresAt);

        // Get athlete info for welcome message
        let athleteName: string | undefined;
        try {
            const athlete = await getAuthenticatedAthlete(accessToken);
            athleteName = `${athlete.firstname} ${athlete.lastname}`;
        } catch {
            // Not critical if this fails
        }

        // Show success page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(successPage(athleteName));

        // Resolve the promise
        if (authResolve) {
            authResolve({
                success: true,
                message: 'Successfully connected to Strava',
                athleteName
            });
        }

        // Shutdown server after a delay
        setTimeout(() => {
            shutdownServer();
        }, 1000);
    } catch (error) {
        console.error('❌ Token exchange failed:', error);

        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(errorPage(
            'Failed to exchange authorization code for tokens. ' +
            'Please check your credentials and try again.'
        ));

        if (authResolve) {
            authResolve({
                success: false,
                message: `Token exchange failed: ${error instanceof Error ? error.message : String(error)}`
            });
        }

        shutdownServer();
    }
}

/**
 * Parses POST body data
 */
function parseBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(body);
        });
        req.on('error', reject);
    });
}

/**
 * Shuts down the HTTP server
 */
function shutdownServer(): void {
    if (authServer) {
        console.error('🛑 Shutting down auth server...');
        authServer.close();
        authServer = null;
        authResolve = null;
        tempCredentials = null;
    }
}