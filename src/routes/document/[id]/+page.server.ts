import { db } from '$lib/server/db';
import { document, documentContent, quiz } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const documentId = parseInt(params.id);

    const [doc] = await db.select()
        .from(document)
        .where(eq(document.id, documentId));

    if (!doc) {
        throw error(404, 'Document not found');
    }

    // Get all content for this document
    const contents = await db.select()
        .from(documentContent)
        .where(eq(documentContent.documentId, documentId));

    // Get all quizzes for this document
    const quizzes = await db.select()
        .from(quiz)
        .where(eq(quiz.documentId, documentId));

    // Fetch the original file content
    let originalContent: string | null = null;
    try {
        const response = await fetch(doc.url);
        if (response.ok) {
            originalContent = await response.text();
        }
    } catch (e) {
        console.error('Failed to fetch original file:', e);
    }

    return {
        document: {
            ...doc,
            content: originalContent
        },
        contents,
        quizzes
    };
}; 