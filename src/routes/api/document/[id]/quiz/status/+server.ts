import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { quiz } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const documentId = parseInt(params.id);

    // Get the most recent quiz for this document
    const [latestQuiz] = await db.select()
        .from(quiz)
        .where(eq(quiz.documentId, documentId))
        .orderBy(desc(quiz.createdAt))
        .limit(1);

    if (!latestQuiz) {
        return json({ status: 'not_found' });
    }

    return json({ status: latestQuiz.status });
}; 