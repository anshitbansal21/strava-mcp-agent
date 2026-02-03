type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export function log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${level}] ${message}`);
    if (data) {
        console.error(JSON.stringify(data, null, 2));
    }
}

export const logger = {
    debug: (msg: string, data?: unknown) => log('DEBUG', msg, data),
    info: (msg: string, data?: unknown) => log('INFO', msg, data),
    warn: (msg: string, data?: unknown) => log('WARN', msg, data),
    error: (msg: string, data?: unknown) => log('ERROR', msg, data),
};