import pino from 'pino';

export const logger = pino({
    level: 'info',
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    // This ensures logs are formatted in a way Vercel can parse
    transport: {
        target: 'pino/file',
        options: {
            destination: 1 // stdout
        }
    }
});

// Export named loggers that all use the same instance
export const apiLogger = logger.child({ component: 'api' });
export const dbLogger = logger.child({ component: 'db' });
export const quizLogger = logger.child({ component: 'quiz' });
export const processingLogger = logger.child({ component: 'processing' }); 