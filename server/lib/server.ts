import { logger } from './logger';

/**
 * Return a valid port number or false.
 * @param val
 */
export function normalizePort(val: number | string): number | false {
    if (typeof val === 'number') {
        return Number(val) || false;
    }
    const parsedPort = parseInt(val, 10);
    if (Number.isNaN(parsedPort)) {
        return false;
    }
    if (parsedPort >= 0) {
        return parsedPort;
    }
    return false;
}

/**
 * Display an error message if the server can't start and stop the program.
 * @param error
 */
export function onError(error: Error & { syscall: string; code: string }): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error('Exiting. Elevated privileges required.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error('Exiting. Port is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
