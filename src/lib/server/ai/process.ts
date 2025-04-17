import { db } from '$lib/server/db';
import { document, documentContent } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { ContentType } from '$lib/constants';
import { generateSummary } from './openai';
import { extractContent } from '../document/process-content';

export async function processDocument(
    doc: typeof document.$inferSelect,
    type: ContentType
) {
    try {
        let content: string;

        switch (type) {
            case 'summary': {
                if (doc.mimeType === 'text/plain') {
                    const response = await fetch(doc.url);
                    const text = await response.text();
                    content = await generateSummary(text);
                } else {
                    const [rawText] = await db.select()
                        .from(documentContent)
                        .where(
                            and(
                                eq(documentContent.documentId, doc.id),
                                eq(documentContent.type, 'raw_text')
                            )
                        );

                    if (!rawText) {
                        throw new Error('No raw text available for overview generation');
                    }

                    content = await generateSummary(rawText.content);
                }
                break;
            }

            case 'raw_text':
            case 'ocr_text':
            case 'pdf_text':
            case 'doc_text': {
                const response = await fetch(doc.url);
                const file = await response.blob();
                
                const result = await extractContent(file, doc.mimeType);
                content = result.content;
                break;
            }
        }

        // Simple insert of the processed content
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
        console.error('Processing error:', error);
        throw error;
    }
} 