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
            stack: e.stack
        }, 'Quiz generation failed');
        throw error(500, 'Failed to generate quiz');
    }
}; 