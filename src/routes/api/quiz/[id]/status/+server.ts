import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { quiz } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const quizId = parseInt(params.id);

    const [quizData] = await db.select()
        .from(quiz)
        .where(eq(quiz.id, quizId));

    if (!quizData) {
        return new Response('Quiz not found', { status: 404 });
    }

    return json({
        status: quizData.status
    });
}; 