import { db } from '$lib/server/db';
import { document, documentContent } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { ContentType } from '$lib/constants';
import { generateSummary } from './openai';
import { extractContent } from '../document/process-content';

export async function processDocument(
    doc: typeof document.$inferSelect,  // Get type from schema
    type: ContentType
) {
    try {
        let content: string;

        switch (type) {
            case 'summary': {
                // For now, let's assume we have the raw text already
                const [rawText] = await db.select()
                    .from(documentContent)
                    .where(
                        and(
                            eq(documentContent.documentId, doc.id),
                            eq(documentContent.type, 'raw_text')
                        )
                    );

                if (!rawText) {
                    throw new Error('No raw text available for summarization');
                }

                content = await generateSummary(rawText.content);
                break;
            }

            case 'raw_text':
            case 'ocr_text':
            case 'pdf_text':
            case 'doc_text': {
                // Fetch the file from storage
                const response = await fetch(doc.url);
                const file = await response.blob();
                
                const result = await extractContent(file, doc.mimeType);
                content = result.content;
                break;
            }
        }

        // Store the processed content
        await db.insert(documentContent)
            .values({
                documentId: doc.id,
                type,
                content
            });

        // Update document status to completed
        await db.update(document)
            .set({ processingStatus: 'completed' })
            .where(eq(document.id, doc.id));

    } catch (error) {
        // Update document status to failed
        await db.update(document)
            .set({ processingStatus: 'failed' })
            .where(eq(document.id, doc.id));

        throw error;
    }
} 