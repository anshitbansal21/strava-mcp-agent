/**
 * Shared type definitions used across the application
 */

// Configuration structure
export interface StravaConfig {
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number; // Unix timestamp
}

// Common API response types
export interface ErrorResponse {
    message: string;
    errors?: Array<{
        field: string;
        code: string;
        resource: string;
    }>;
}

// Tool execution result
export interface ToolResult {
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError?: boolean;
}