import http from 'http';
import { URL } from 'url';
import axios from 'axios';
import { setupPage } from './pages';

const PORT = 8111;
const REDIRECT_URI = `http://localhost:${PORT}/auth/callback`;

export interface AuthResult {
    success: boolean;
    message: string;
    athleteName?: string;
}

export function getAuthUrl(): string {
    return `http://localhost:${PORT}/auth/setup`;
}

let authServer: http.Server | null = null;
let authResolve: ((result: AuthResult) => void) | null = null;
let tempCredentials: { clientId: string; clientSecret: string } | null = null;

export async function startAuthServer(): Promise<AuthResult> {
    return new Promise((resolve) => {
        authResolve = resolve;

        authServer = http.createServer(handleRequest);
        authServer.listen(PORT, () => {
            console.log(`🌐 Auth server listening`)
        });

        setTimeout(() => {
            if (authServer) {
                shutdownServer();
                resolve({
                    success: false,
                    message: 'Authentication timeout'
                })
            }
        }, 5 * 60 * 1000);
    })
}

async function handleRequest(req: any, res: any): Promise<void> {
    const url = new URL(req.url || '/', `http:localhost:${PORT}`);

    if (url.pathname === '/auth/setup' && req.method === 'GET') {
        res.end(setupPage());
    } else if (url.pathname === '/auth/start' && req.method === 'POST') {
        await handleAuthStart(req, res);
    } else if (url.pathname === '/auth/callback' && req.method === 'GET') {
        await handleCallBack(url, res);
    } else {
        res.end('Not Found');
    }
}

async function handleAuthStart(req, res) {
    const body = await parseBody(req);
    const params = new URLSearchParams(body);

    const clientId = params.get('clientId');
    const clientSecret = params.get('clientSecret');

    tempCredentials = { clientId, clientSecret };
    await saveClientCredentials(clientId, clientSecret);

    res.writeHead(302, { Location: stravaAuthUrl });
    res.end();
}

async function handleCallback(url, res) {
    const code = url.searchParams.get('code');
    const tokenResponse = await axios.post(...);
    await updateTokens(...);

    if (authResolve) {
        authResolve({ success: true })
    }
    shutdownServer();
}