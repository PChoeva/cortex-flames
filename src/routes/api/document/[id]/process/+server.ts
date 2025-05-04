import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document, documentContent } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { ContentType } from '$lib/constants';
import { processDocument } from '$lib/server/ai/process';
import { processingLogger as logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ params, request }) => {
    try {
        const { type, isRetry } = await request.json() as { type: ContentType; isRetry?: boolean };
        const documentId = parseInt(params.id);

        logger.info({ documentId, type, isRetry }, 'Starting document processing');

        const [doc] = await db.select()
            .from(document)
            .where(eq(document.id, documentId));

        if (!doc) {
            logger.error({ documentId }, 'Document not found');
            throw error(404, 'Document not found');
        }

        if (doc.processingStatus === 'processing' && !isRetry) {
            logger.warn({ documentId, status: doc.processingStatus }, 'Document already being processed');
            throw error(400, 'Document is already being processed');
        }

        if (isRetry) {
            logger.info({ documentId, type }, 'Retrying processing - deleting existing content');
            await db.delete(documentContent)
                .where(
                    and(
                        eq(documentContent.documentId, documentId),
                        eq(documentContent.type, type)
                    )
                );
        }

        logger.info({ documentId }, 'Updating document status to processing');
        await db.update(document)
            .set({ processingStatus: 'processing' })
            .where(eq(document.id, documentId));

        // Start processing in background
        processDocument(doc, type).catch((e) => {
            logger.error({ err: e, documentId, stack: e.stack }, 'Processing failed');
            
            // Update document status to failed
            db.update(document)
                .set({ processingStatus: 'failed' })
                .where(eq(document.id, documentId))
                .execute()
                .catch(console.error);
        });

        return json({ 
            success: true, 
            message: 'Processing started'
        });
    } catch (e) {
        logger.error({ err: e }, 'Failed to start processing');
        throw error(500, 'Failed to start processing');
    }
}; 