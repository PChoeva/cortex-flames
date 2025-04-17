import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const documentId = parseInt(params.id);

    const [doc] = await db.select()
        .from(document)
        .where(eq(document.id, documentId));

    if (!doc) {
        return new Response('Document not found', { status: 404 });
    }

    return json({
        status: doc.processingStatus
    });
}; 