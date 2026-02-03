/**
 * Utility functions used across the application
 */

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) {
        return 'N/A';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (hours > 0) {
        parts.push(hours.toString().padStart(2, '0'));
    }
    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(secs.toString().padStart(2, '0'));

    return parts.join(':');
}

/**
 * Format distance in meters to kilometers
 */
export function formatDistance(meters: number): string {
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
}

/**
 * Format speed from m/s to km/h
 */
export function formatSpeed(metersPerSecond: number): string {
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
}

/**
 * Format pace from m/s to min/km
 */
export function formatPace(metersPerSecond: number): string {
    if (metersPerSecond === 0) return 'N/A';
    const minutesPerKm = (1000 / metersPerSecond) / 60;
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.floor((minutesPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

/**
 * Safe JSON stringify with error handling
 */
export function safeStringify(obj: unknown): string {
    try {
        return JSON.stringify(obj, null, 2);
    } catch {
        return String(obj);
    }
}
