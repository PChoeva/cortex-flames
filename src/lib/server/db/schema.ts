import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { serial } from 'drizzle-orm/pg-core';
import type { ContentType, ProcessingStatus } from '$lib/constants';

// Common MIME types we'll handle
const commonMimeTypes = [
	'text/plain',          // .txt files
	'application/pdf',     // .pdf files
	'image/jpeg',          // .jpg, .jpeg files
	'image/png',          // .png files
	'application/msword',  // .doc files
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
] as const;

export const document = pgTable('document', {
	id: serial('id').primaryKey(),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	url: text('url').notNull(),
	uploadedAt: timestamp('uploaded_at').defaultNow(),
	deleted: boolean('deleted').notNull().default(false),
	processingStatus: text('processing_status').$type<ProcessingStatus>(),
});

export const documentContent = pgTable('document_content', {
	id: serial('id').primaryKey(),
	documentId: integer('document_id').references(() => document.id).notNull(),
	type: text('type').notNull().$type<ContentType>(),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
});
