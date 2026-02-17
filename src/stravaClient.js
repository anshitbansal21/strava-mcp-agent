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
exports.stravaApi = void 0;
exports.handleApiError = handleApiError;
exports.getAuthenticatedAthlete = getAuthenticatedAthlete;
var axios_1 = require("axios");
var config_1 = require("./config");
var zod_1 = require("zod");
exports.stravaApi = axios_1.default.create({
    baseURL: 'https://www.strava.com/api/v3',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});
exports.stravaApi.interceptors.request.use();
/**
 * Request interceptor - adds auth header to all requests
 */
exports.stravaApi.interceptors.request.use(function (config) {
    var token = process.env.STRAVA_ACCESS_TOKEN;
    if (token) {
        config.headers.Authorization = "Bearer ".concat(token);
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
/**
 * Response interceptor - handles errors globally
 */
exports.stravaApi.interceptors.response.use(function (response) { return response; }, function (error) { return __awaiter(void 0, void 0, void 0, function () {
    var newToken, refreshError_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401)) return [3 /*break*/, 4];
                console.error('Unauthorized: Refreshing access token...');
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, refreshAccessToken()];
            case 2:
                _b.sent();
                if (error.config) {
                    newToken = process.env.STRAVA_ACCESS_TOKEN;
                    error.config.headers.Authorization = "Bearer ".concat(newToken);
                    return [2 /*return*/, (0, exports.stravaApi)(error.config)];
                }
                return [3 /*break*/, 4];
            case 3:
                refreshError_1 = _b.sent();
                console.error('Failed to refresh access token:', refreshError_1);
                throw new Error('Failed to refresh access token. Please reconnect your Strava account.');
            case 4: return [2 /*return*/, Promise.reject(error)];
        }
    });
}); });
/**
 * Refreshes the Strava API access token using the refresh token
 */
function refreshAccessToken() {
    return __awaiter(this, void 0, void 0, function () {
        var config, refreshToken, clientId, clientSecret, response, newAccessToken, newRefreshToken, expiresAt, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, config_1.loadConfig)()];
                case 1:
                    config = _a.sent();
                    refreshToken = config.refreshToken;
                    clientId = config.clientId;
                    clientSecret = config.clientSecret;
                    if (!refreshToken || !clientId || !clientSecret) {
                        throw new Error("Missing refresh credentials. PLease connect your strava account first.");
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, axios_1.default.post('https://www.strava.comn/oauth/token', {
                            client_id: clientId,
                            client_secret: clientSecret,
                            refresh_token: refreshToken,
                            grant_type: 'refresh_token'
                        })];
                case 3:
                    response = _a.sent();
                    newAccessToken = response.data.access_token;
                    newRefreshToken = response.data.refresh_token;
                    expiresAt = response.data.expires_at;
                    if (!newAccessToken || !newRefreshToken) {
                        throw new Error('Refresh response missing required tokens');
                    }
                    return [4 /*yield*/, (0, config_1.updateTokens)(newAccessToken, newRefreshToken, expiresAt)];
                case 4:
                    _a.sent();
                    console.log("\u2705 Token refreshed. Expires: ".concat(new Date(expiresAt * 1000).toLocaleString()));
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Failed to refresh access token", error_1);
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper function to handle API errors consistently
 */
function handleApiError(error, context, retryFn) {
    return __awaiter(this, void 0, void 0, function () {
        var status_1, responseData, message;
        var _a, _b;
        return __generator(this, function (_c) {
            // If it's a 401 and we have a retry function, the interceptor should have
            // already handled it. If we're here, something else went wrong.
            if (axios_1.default.isAxiosError(error)) {
                status_1 = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 'Unknown';
                responseData = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data;
                message = typeof (responseData === null || responseData === void 0 ? void 0 : responseData.message) === 'string' && responseData.message
                    ? responseData.message
                    : error.message;
                if (status_1 === 402) {
                    throw new Error("Subscription Required, this feature on strava needs strava subscription as it is a premium feature.");
                }
                else if (status_1 === 403) {
                    throw new Error("Trying to get forbidden resource. Context: ".concat(context));
                }
                else if (status_1 === 404) {
                    throw new Error("Not Found: The requested resource doesn't exist. Context: ".concat(context));
                }
                else if (status_1 === 429) {
                    throw new Error("Rate limited: Please wait for some time. Context: ".concat(context));
                }
                throw new Error("Strava API Error (".concat(status_1, ") in ").concat(context, ": ").concat(message));
            }
            // Non-Axios error
            if (error instanceof Error) {
                throw new Error("Error in ".concat(context, ": ").concat(error.message));
            }
            throw new Error("Unknown error in ".concat(context, ": ").concat(String(error)));
        });
    });
}
/**
 * Example: Define a Zod schema for Strava athlete
 */
var AthleteSchema = zod_1.default.object({
    id: zod_1.default.number(),
    firstname: zod_1.default.string(),
    lastname: zod_1.default.string(),
    city: zod_1.default.string().nullable(),
    state: zod_1.default.string().nullable(),
    country: zod_1.default.string().nullable(),
    sex: zod_1.default.enum(['M', 'F']).nullable(),
    premium: zod_1.default.boolean(),
    created_at: zod_1.default.string(),
    updated_at: zod_1.default.string(),
    profile_medium: zod_1.default.url(),
    profile: zod_1.default.url(),
});
function getAuthenticatedAthlete(accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var response, validationResult, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!accessToken) {
                        throw new Error('Access token is required.');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exports.stravaApi.get('/athlete', {
                            headers: {
                                Authorization: "Bearer ".concat(accessToken)
                            }
                        })];
                case 2:
                    response = _a.sent();
                    validationResult = AthleteSchema.safeParse(response.data);
                    if (!validationResult.success) {
                        console.error('Validation failed', validationResult.error);
                        throw new Error("Invalid data format from Strava api: ".concat(validationResult.error.message));
                    }
                    return [2 /*return*/, validationResult.data];
                case 3:
                    error_2 = _a.sent();
                    return [2 /*return*/, handleApiError(error_2, 'getAuthenticatedAthlete', function () { return __awaiter(_this, void 0, void 0, function () {
                            var newToken;
                            return __generator(this, function (_a) {
                                newToken = process.env.STRAVA_ACCESS_TOKEN;
                                return [2 /*return*/, getAuthenticatedAthlete(newToken)];
                            });
                        }); })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
