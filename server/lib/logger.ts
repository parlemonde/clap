import { createLogger, format, transports } from 'winston';

/**
 * Display messages in the console.
 */
const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format:
        process.env.NODE_ENV === 'production'
            ? format.combine(
                  format.splat(),
                  format.timestamp(),
                  format.printf(({ level, message, timestamp }) => `[${timestamp} ${level}]: ${message}`),
              )
            : format.combine(format.splat(), format.colorize(), format.simple()),
    transports: [new transports.Console()],
});

export { logger };
