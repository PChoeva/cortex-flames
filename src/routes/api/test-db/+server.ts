import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { dbLogger as logger } from '$lib/server/logger';

export const GET = async () => {
    try {
        logger.info('Testing database connection');
        const documents = await db.query.document.findMany();
        logger.info({ documentCount: documents.length }, 'Database connection successful');
        return json({
            success: true,
            message: 'Database connected successfully',
            documentCount: documents.length
        });
    } catch (e: any) {
        logger.error({ 
            err: e,
            stack: e.stack 
        }, 'Database test failed');
        return json({
            success: false,
            error: 'Failed to query database'
        }, { status: 500 });
    }
}; 