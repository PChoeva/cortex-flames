import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
    level: 'info',
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    ...(isDevelopment ? {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: false,
                translateTime: true,
                ignore: 'pid,hostname',
            }
        }
    } : {})
});

// Create specific loggers for different areas
export const apiLogger = logger.child({ component: 'api' });
export const quizLogger = logger.child({ component: 'quiz' });
export const dbLogger = logger.child({ component: 'db' });
export const processingLogger = logger.child({ component: 'processing' }); 