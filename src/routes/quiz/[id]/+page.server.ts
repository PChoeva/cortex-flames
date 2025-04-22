import { db } from '$lib/server/db';
import { quiz, question, option, document } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const quizId = parseInt(params.id);

    // Get quiz with document info
    const [quizData] = await db
        .select({
            id: quiz.id,
            title: quiz.title,
            documentId: quiz.documentId,
            documentName: document.filename,
            createdAt: quiz.createdAt
        })
        .from(quiz)
        .innerJoin(document, eq(quiz.documentId, document.id))
        .where(eq(quiz.id, quizId));

    if (!quizData) {
        throw error(404, 'Quiz not found');
    }

    // Get all questions
    const questions = await db
        .select()
        .from(question)
        .where(eq(question.quizId, quizId));

    // Get all options for these questions
    const options = await db
        .select()
        .from(option)
        .where(sql`${option.questionId} IN ${questions.map(q => q.id)}`);

    // Combine questions with their options
    const questionsWithOptions = questions.map(q => ({
        ...q,
        options: options.filter(o => o.questionId === q.id)
    }));

    return {
        quiz: quizData,
        questions: questionsWithOptions
    };
}; 