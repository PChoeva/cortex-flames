import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateDocumentQuiz } from '$lib/server/ai/quiz';
import { apiLogger as logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ params }) => {
    const documentId = parseInt(params.id);
    logger.info({ documentId }, 'Quiz generation requested');
    
    try {
        const quiz = await generateDocumentQuiz(documentId);
        logger.info({ documentId }, 'Quiz generation successful');
        return json({ success: true, quiz });
    } catch (e: any) {
        logger.error({
            err: e,
            documentId,
            stack: e.stack,
            message: e.message,
            name: e.name,
            context: {
                params,
                timestamp: new Date().toISOString()
            }
        }, 'Quiz generation failed with detailed error');
        
        // Check if it's a timeout error
        if (e.code === 'ETIMEDOUT' || e.message?.includes('timeout')) {
            throw error(504, 'Quiz generation timed out. Please try again.');
        }
        
        throw error(500, 'Failed to generate quiz');
    }
}; 