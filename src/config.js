"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.saveConfig = saveConfig;
exports.loadConfig = loadConfig;
exports.updateTokens = updateTokens;
exports.saveClientCredentials = saveClientCredentials;
exports.hasClientCredentials = hasClientCredentials;
exports.hasValidTokens = hasValidTokens;
exports.getConfigPath = getConfigPath;
exports.clearConfig = clearConfig;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var os_1 = require("os");
// Config file location: ~/.config/strava-mcp/config.json
var CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.config', 'strava-mcp');
var CONFIG_FILE = path_1.default.join(CONFIG_DIR, 'config.json');
//ensure config directory exists 
function ensureConfigDir() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, promises_1.default.mkdir(CONFIG_DIR, { recursive: true })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, promises_1.default.writeFile(CONFIG_FILE, "{}", { flag: "wx" })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    if (err_1.code !== "EEXIST") {
                        throw err_1; // real error
                    }
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Warning: Could not create config directory:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// load config from json file
function loadConfigFile() {
    return __awaiter(this, void 0, void 0, function () {
        var content, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promises_1.default.readFile(CONFIG_FILE, 'utf-8')];
                case 1:
                    content = _a.sent();
                    return [2 /*return*/, JSON.parse(content)];
                case 2:
                    error_2 = _a.sent();
                    console.error('Warning: Could not load config file:', error_2);
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function saveConfig(config) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, merged;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureConfigDir()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadConfigFile()];
                case 2:
                    existing = _a.sent();
                    merged = __assign(__assign({}, existing), config);
                    return [4 /*yield*/, promises_1.default.writeFile(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8')];
                case 3:
                    _a.sent();
                    console.info('Config saved successfully');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Loads Strava configuration from multiple sources.
 * Priority (highest to lowest):
 * 1. Environment variables
 * 2. ~/.config/strava-mcp/config.json
 * 3. Local .env file (handled by dotenv in server.ts)
 */
function loadConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var fileConfig, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadConfigFile()];
                case 1:
                    fileConfig = _a.sent();
                    config = {
                        clientId: process.env.STRAVA_CLIENT_ID || fileConfig.clientId,
                        clientSecret: process.env.STRAVA_CLIENT_SECRET || fileConfig.clientSecret,
                        accessToken: process.env.STRAVA_ACCESS_TOKEN || fileConfig.accessToken,
                        refreshToken: process.env.STRAVA_REFRESH_TOKEN || fileConfig.refreshToken,
                        expiresAt: fileConfig.expiresAt,
                    };
                    return [2 /*return*/, config];
            }
        });
    });
}
/**
 * Updates tokens in both the config file and process.env
 */
function updateTokens(accessToken, refreshToken, expiresAt) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Update process.env for current session
                    process.env.STRAVA_ACCESS_TOKEN = accessToken;
                    process.env.STRAVA_REFRESH_TOKEN = refreshToken;
                    // Save to config file for persistence
                    return [4 /*yield*/, saveConfig({
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            expiresAt: expiresAt,
                        })];
                case 1:
                    // Save to config file for persistence
                    _a.sent();
                    console.log('✅ Tokens updated');
                    return [2 /*return*/];
            }
        });
    });
}
function saveClientCredentials(clientId, clientSecret) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, saveConfig({ clientId: clientId, clientSecret: clientSecret })];
                case 1:
                    _a.sent();
                    console.info('Client credentials saved successfully');
                    return [2 /*return*/];
            }
        });
    });
}
function hasClientCredentials(config) {
    return !!(config.clientId && config.clientSecret);
}
function hasValidTokens(config) {
    return !!(config.accessToken && config.refreshToken && config.expiresAt && config.expiresAt > Date.now());
}
/**
 * Gets the config file path (useful for display to users)
 */
function getConfigPath() {
    return CONFIG_FILE;
}
/**
 * Clears all stored config (useful for logout/reset)
 */
function clearConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promises_1.default.unlink(CONFIG_FILE)];
                case 1:
                    _b.sent();
                    console.log('✅ Config cleared');
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
