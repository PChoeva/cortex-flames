import { db } from '$lib/server/db';
import { quiz, document } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // Get all quizzes with their associated document names
    const quizzes = await db.select({
        id: quiz.id,
        title: quiz.title,
        createdAt: quiz.createdAt,
        documentId: quiz.documentId,
        documentName: document.filename
    })
    .from(quiz)
    .innerJoin(document, eq(quiz.documentId, document.id))
    .orderBy(desc(quiz.createdAt));

    return { quizzes };
}; 