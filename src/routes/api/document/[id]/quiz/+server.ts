import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateDocumentQuiz } from '$lib/server/ai/quiz';
import { apiLogger as logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ params }) => {
    const documentId = parseInt(params.id);
    logger.info({ documentId }, 'Quiz generation requested');
    
    try {
        const quiz = await generateDocumentQuiz(documentId);
        logger.info({ documentId }, 'Quiz generation successful'); // Removed quizId since quiz is an array
        return json({ success: true, quiz });
    } catch (e: any) {
        logger.error({
            err: e,
            documentId,
            stack: e.stack,
            message: e.message,
            name: e.name,
            // Add any additional context that might be helpful
            context: {
                params,
                timestamp: new Date().toISOString()
            }
        }, 'Quiz generation failed with detailed error');
        throw error(500, new Error('Failed to generate quiz'));
    }
}; 