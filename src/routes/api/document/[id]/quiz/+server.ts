import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { quiz } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateDocumentQuiz } from '$lib/server/ai/quiz';
import { apiLogger as logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ params }) => {
    const documentId = parseInt(params.id);
    logger.info({ documentId }, 'Quiz generation requested');
    
    try {
        // Create a quiz record immediately with 'processing' status
        const [newQuiz] = await db.insert(quiz)
            .values({
                documentId,
                title: 'Quiz Generation in Progress...',
                status: 'processing'
            })
            .returning();

        // Start generation in background
        generateDocumentQuiz(documentId, newQuiz.id).catch((e) => {
            logger.error({
                err: e,
                documentId,
                quizId: newQuiz.id,
                stack: e.stack
            }, 'Quiz generation failed');

            // Update quiz status to failed
            db.update(quiz)
                .set({ 
                    status: 'failed',
                    title: 'Quiz Generation Failed'
                })
                .where(eq(quiz.id, newQuiz.id))
                .execute()
                .catch(console.error);
        });

        return json({ 
            success: true, 
            message: 'Quiz generation started',
            quizId: newQuiz.id
        });
    } catch (e: any) {
        logger.error({ err: e, documentId }, 'Failed to start quiz generation');
        throw error(500, 'Failed to start quiz generation');
    }
}; 