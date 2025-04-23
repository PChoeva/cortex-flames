import pino from 'pino';

export const logger = pino({
    level: 'info'
});

// Create namespaced loggers for different parts of the application
export const quizLogger = logger.child({ module: 'quiz' });
export const apiLogger = logger.child({ module: 'api' });
export const dbLogger = logger.child({ module: 'database' });
export const documentLogger = logger.child({ module: 'document' });
export const processingLogger = logger.child({ module: 'processing' }); 