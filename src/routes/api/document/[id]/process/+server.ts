import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document, documentContent } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { ContentType } from '$lib/constants';
import { processDocument } from '$lib/server/ai/process';

export const POST: RequestHandler = async ({ params, request }) => {
    try {
        const { type, isRetry } = await request.json() as { type: ContentType; isRetry?: boolean };
        const documentId = parseInt(params.id);

        console.log(`Starting processing for document ${documentId}, type: ${type}, retry: ${isRetry}`);

        const [doc] = await db.select()
            .from(document)
            .where(eq(document.id, documentId));

        if (!doc) {
            throw error(404, 'Document not found');
        }

        if (doc.processingStatus === 'processing' && !isRetry) {
            throw error(400, 'Document is already being processed');
        }

        // If it's a retry, delete the existing failed content
        if (isRetry) {
            await db.delete(documentContent)
                .where(
                    and(
                        eq(documentContent.documentId, documentId),
                        eq(documentContent.type, type)
                    )
                );
        }

        // Update document status to processing
        await db.update(document)
            .set({ processingStatus: 'processing' })
            .where(eq(document.id, documentId));

        // Process document in the background
        processDocument(doc, type).catch((e) => {
            console.error('Processing failed:', e);
            // Store failed status in content
            db.insert(documentContent)
                .values({
                    documentId: doc.id,
                    type,
                    content: 'FAILED'
                })
                .onConflictDoUpdate({
                    target: [documentContent.documentId, documentContent.type],
                    set: { content: 'FAILED' }
                })
                .execute()
                .catch(console.error);

            // Update document status to failed
            db.update(document)
                .set({ processingStatus: 'failed' })
                .where(eq(document.id, documentId))
                .execute()
                .catch(console.error);
        });

        return json({ success: true, message: 'Processing started' });
    } catch (e) {
        console.error('Processing request error:', e);
        throw error(500, { message: e instanceof Error ? e.message : 'Failed to process document' });
    }
}; 