import * as fs from 'fs';
import * as path from 'path';

export function logToFile(message: string) {
    const logPath = path.join(process.cwd(), 'debug-log.txt');
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
        // Fallback to console if file write fails (though unlikely)
        console.error('Failed to write to log file:', e);
    }
}
