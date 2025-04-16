import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const document = pgTable('document', {
	id: integer('id').primaryKey(),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	url: text('url').notNull(),
	uploadedAt: timestamp('uploaded_at').defaultNow(),
	deleted: boolean('deleted').notNull().default(false),
});
