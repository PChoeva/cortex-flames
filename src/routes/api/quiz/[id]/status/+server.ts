import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { quiz } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { apiLogger as logger } from '$lib/server/logger';

export const GET: RequestHandler = async ({ params }) => {
    const quizId = parseInt(params.id);
    
    console.log(`Checking status for quiz ${quizId}`);

    const [quizData] = await db.select()
        .from(quiz)
        .where(eq(quiz.id, quizId));

    if (!quizData) {
        console.warn(`Quiz ${quizId} not found`);
        return new Response('Quiz not found', { status: 404 });
    }

    console.log(`Quiz ${quizId} status: ${quizData.status}`);

    return json({
        status: quizData.status
    });
}; 