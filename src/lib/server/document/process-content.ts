import { MIME_TYPES } from '$lib/constants';
import type { ContentType } from '$lib/constants';

// Process text files (txt, md)
async function processTextFile(file: Blob): Promise<string> {
    try {
        const text = await file.text();
        if (!text) {
            throw new Error('No text content found in file');
        }
        return text;
    } catch (error) {
        console.error('Error processing text file:', error);
        throw new Error('Failed to process text file');
    }
}

// Process PDF files
async function processPdfFile(file: Blob): Promise<string> {
    // TODO: Implement PDF text extraction
    // We'll need a PDF parsing library like pdf-parse
    throw new Error('PDF processing not implemented yet');
}

// Process images using GPT-4 Vision
async function processImageFile(file: Blob): Promise<string> {
    // TODO: Implement image OCR using GPT-4 Vision
    throw new Error('Image OCR not implemented yet');
}

// Process doc/docx files
async function processDocFile(file: Blob): Promise<string> {
    // TODO: Implement doc/docx processing
    // We'll need a library like mammoth for this
    throw new Error('DOC processing not implemented yet');
}

export async function extractContent(file: Blob, mimeType: string): Promise<{ type: ContentType; content: string }> {
    console.log('Extracting content for mime type:', mimeType);
    
    switch (mimeType) {
        case MIME_TYPES.TXT:
        case MIME_TYPES.MD:
            return {
                type: 'raw_text',
                content: await processTextFile(file)
            };

        case MIME_TYPES.PDF:
            return {
                type: 'pdf_text',
                content: await processPdfFile(file)
            };

        case MIME_TYPES.JPEG:
        case MIME_TYPES.PNG:
        case MIME_TYPES.WEBP:
            return {
                type: 'ocr_text',
                content: await processImageFile(file)
            };

        case MIME_TYPES.DOC:
        case MIME_TYPES.DOCX:
        case MIME_TYPES.ODT:
            return {
                type: 'doc_text',
                content: await processDocFile(file)
            };

        default:
            throw new Error(`Unsupported mime type: ${mimeType}`);
    }
} 