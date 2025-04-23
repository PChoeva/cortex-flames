import pino from 'pino';

const transport = pino.transport({
    target: 'pino-pretty',
    options: {
        colorize: true,
        translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
        ignore: 'pid,hostname'
    }
});

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
}, transport);

// Create namespaced loggers for different parts of the application
export const quizLogger = logger.child({ module: 'quiz' });
export const apiLogger = logger.child({ module: 'api' });
export const dbLogger = logger.child({ module: 'database' });
export const documentLogger = logger.child({ module: 'document' });
export const processingLogger = logger.child({ module: 'processing' }); 