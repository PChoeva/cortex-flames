import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { ContentType } from '$lib/constants';
import { processDocument } from '$lib/server/ai/process';

export const POST: RequestHandler = async ({ params, request }) => {
    try {
        const { type } = await request.json() as { type: ContentType };
        const documentId = parseInt(params.id);

        console.log(`Starting processing for document ${documentId}, type: ${type}`);

        const [doc] = await db.select()
            .from(document)
            .where(eq(document.id, documentId));

        if (!doc) {
            throw error(404, 'Document not found');
        }

        if (doc.processingStatus === 'processing') {
            throw error(400, 'Document is already being processed');
        }

        // Update document status to processing
        await db.update(document)
            .set({ processingStatus: 'processing' })
            .where(eq(document.id, documentId));

        // Process document in the background
        processDocument(doc, type).catch((e) => {
            console.error('Processing failed:', e);
            // Update status to failed on error
            db.update(document)
                .set({ processingStatus: 'failed' })
                .where(eq(document.id, documentId))
                .execute()
                .catch(console.error);
        });

        return json({ success: true, message: 'Processing started' });
    } catch (e) {
        console.error('Processing request error:', e);
        throw error(500, 'Failed to process document');
    }
}; 