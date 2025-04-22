import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateDocumentQuiz } from '$lib/server/ai/quiz';

export const POST: RequestHandler = async ({ params }) => {
    try {
        const documentId = parseInt(params.id);
        const quiz = await generateDocumentQuiz(documentId);
        return json({ success: true, quiz });
    } catch (e) {
        console.error('Quiz generation error:', e);
        throw error(500, 'Failed to generate quiz');
    }
}; 