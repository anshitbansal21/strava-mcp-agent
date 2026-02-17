"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthUrl = getAuthUrl;
exports.startAuthServer = startAuthServer;
var http_1 = require("http");
var url_1 = require("url");
var axios_1 = require("axios");
var pages_1 = require("./pages");
var config_1 = require("../config");
var stravaClient_1 = require("../stravaClient");
var PORT = 8111;
var REDIRECT_URI = "http://localhost:".concat(PORT, "/auth/callback");
var authServer = null;
var authResolve;
var tempCredentials;
function getAuthUrl() {
    return "http://localhost:".concat(PORT, "/auth/setup");
}
function startAuthServer() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    authResolve = resolve;
                    authServer = http_1.default.createServer(handleRequest);
                    authServer.listen(PORT, function () {
                        console.error("\uD83C\uDF10 Auth server listening on http://localhost:".concat(PORT));
                    });
                    setTimeout(function () {
                        if (authServer) {
                            // shutdownDServer();
                            resolve({
                                success: false,
                                message: 'Authentication timed out. Try again.'
                            });
                        }
                    }, 5 * 60 * 1000);
                })];
        });
    });
}
function handleRequest(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var url, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new url_1.URL(req.url || '/', "http://localhost:".concat(PORT));
                    console.log("Request: ".concat(req.method, " ").concat(url.pathname, ". URL: ").concat(req.url));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    if (!(url.pathname === '/auth/setup' && req.method === 'GET')) return [3 /*break*/, 2];
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end((0, pages_1.setupPage)());
                    return [3 /*break*/, 6];
                case 2:
                    if (!(url.pathname === '/auth/start' && req.method === 'POST')) return [3 /*break*/, 4];
                    return [4 /*yield*/, handleAuthStart(req, res)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    if (!(url.pathname === '/auth/callback' && req.method === 'GET')) return [3 /*break*/, 6];
                    // Handle OAuth callback from Strava
                    return [4 /*yield*/, handleCallback(url, res)];
                case 5:
                    // Handle OAuth callback from Strava
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('❌ Error handling request:', error_1);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end((0, pages_1.errorPage)('Internal server error'));
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function handleAuthStart(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, params, clientId, clientSecret, stravaAuthUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parseBody(req)];
                case 1:
                    body = _a.sent();
                    params = new URLSearchParams(body);
                    clientId = params.get('clientId');
                    clientSecret = params.get('clientSecret');
                    if (!clientId || !clientSecret) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end((0, pages_1.errorPage)('Missing client ID or client secret'));
                        return [2 /*return*/];
                    }
                    // Save credentials temporarily
                    tempCredentials = { clientId: clientId, clientSecret: clientSecret };
                    // Save to config file
                    return [4 /*yield*/, (0, config_1.saveClientCredentials)(clientId, clientSecret)];
                case 2:
                    // Save to config file
                    _a.sent();
                    stravaAuthUrl = "https://www.strava.com/oauth/authorize?" +
                        "client_id=".concat(clientId, "&") +
                        "redirect_uri=".concat(encodeURIComponent(REDIRECT_URI), "&") +
                        "response_type=code&" +
                        "scope=activity:read_all,profile:read_all";
                    console.log('Redirecting to Strava...');
                    res.writeHead(302, { Location: stravaAuthUrl });
                    res.end();
                    return [2 /*return*/];
            }
        });
    });
}
function handleCallback(url, res) {
    return __awaiter(this, void 0, void 0, function () {
        var code, error, tokenResponse, accessToken, refreshToken, expiresAt, athleteName, athlete, _a, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    code = url.searchParams.get('code');
                    error = url.searchParams.get('error');
                    // Check for errors
                    if (error) {
                        console.error('❌ OAuth error:', error);
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end((0, pages_1.errorPage)("Strava error: ".concat(error)));
                        if (authResolve) {
                            authResolve({
                                success: false,
                                message: "Strava authorization failed: ".concat(error)
                            });
                        }
                        shutdownServer();
                        return [2 /*return*/];
                    }
                    if (!code) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end((0, pages_1.errorPage)('Missing authorization code'));
                        if (authResolve) {
                            authResolve({
                                success: false,
                                message: 'Missing authorization code from Strava'
                            });
                        }
                        shutdownServer();
                        return [2 /*return*/];
                    }
                    if (!tempCredentials) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end((0, pages_1.errorPage)('Missing credentials'));
                        if (authResolve) {
                            authResolve({
                                success: false,
                                message: 'Internal error: missing credentials'
                            });
                        }
                        shutdownServer();
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    console.log('Exchanging code for token...');
                    return [4 /*yield*/, axios_1.default.post('https://www.strava.com/oauth/token', {
                            client_id: tempCredentials.clientId,
                            client_secret: tempCredentials.clientSecret,
                            code: code,
                            grant_type: 'authorization_code'
                        })];
                case 2:
                    tokenResponse = _b.sent();
                    accessToken = tokenResponse.data.access_token;
                    refreshToken = tokenResponse.data.refresh_token;
                    expiresAt = tokenResponse.data.expires_at;
                    if (!accessToken || !refreshToken) {
                        throw new Error('Missing tokens in response');
                    }
                    console.error('✅ Tokens received');
                    // Save tokens
                    return [4 /*yield*/, (0, config_1.updateTokens)(accessToken, refreshToken, expiresAt)];
                case 3:
                    // Save tokens
                    _b.sent();
                    athleteName = void 0;
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, stravaClient_1.getAuthenticatedAthlete)(accessToken)];
                case 5:
                    athlete = _b.sent();
                    athleteName = "".concat(athlete.firstname, " ").concat(athlete.lastname);
                    return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 7:
                    // Show success page
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end((0, pages_1.successPage)(athleteName));
                    // Resolve the promise
                    if (authResolve) {
                        authResolve({
                            success: true,
                            message: 'Successfully connected to Strava',
                            athleteName: athleteName
                        });
                    }
                    // Shutdown server after a delay
                    setTimeout(function () {
                        shutdownServer();
                    }, 1000);
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _b.sent();
                    console.error('❌ Token exchange failed:', error_2);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end((0, pages_1.errorPage)('Failed to exchange authorization code for tokens. ' +
                        'Please check your credentials and try again.'));
                    if (authResolve) {
                        authResolve({
                            success: false,
                            message: "Token exchange failed: ".concat(error_2 instanceof Error ? error_2.message : String(error_2))
                        });
                    }
                    shutdownServer();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Parses POST body data
 */
function parseBody(req) {
    return new Promise(function (resolve, reject) {
        var body = '';
        req.on('data', function (chunk) {
            body += chunk.toString();
        });
        req.on('end', function () {
            resolve(body);
        });
        req.on('error', reject);
    });
}
/**
 * Shuts down the HTTP server
 */
function shutdownServer() {
    if (authServer) {
        console.error('🛑 Shutting down auth server...');
        authServer.close();
        authServer = null;
        authResolve = null;
        tempCredentials = null;
    }
}
startAuthServer();
