// Types for database columns
export type ContentType = 'raw_text' | 'ocr_text' | 'pdf_text' | 'doc_text' | 'summary';
export type ProcessingStatus = 'processing' | 'completed' | 'failed';

// MIME Types
export const MIME_TYPES = {
    // Text files
    TXT: 'text/plain',
    MD: 'text/markdown',
    
    // PDFs
    PDF: 'application/pdf',
    
    // Images (for OCR)
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    WEBP: 'image/webp',
    
    // Documents
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ODT: 'application/vnd.oasis.opendocument.text'
} as const;

export const EXTENSION_TO_MIME: Record<string, string> = {
    '.txt': MIME_TYPES.TXT,
    '.md': MIME_TYPES.MD,
    '.pdf': MIME_TYPES.PDF,
    '.jpg': MIME_TYPES.JPEG,
    '.jpeg': MIME_TYPES.JPEG,
    '.png': MIME_TYPES.PNG,
    '.webp': MIME_TYPES.WEBP,
    '.doc': MIME_TYPES.DOC,
    '.docx': MIME_TYPES.DOCX,
    '.odt': MIME_TYPES.ODT
}; 