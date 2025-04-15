import { pgTable, serial, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

export const document = pgTable('document', {
	id: serial('id').primaryKey(),
	filename: varchar('filename', { length: 255 }).notNull(),
	originalName: varchar('original_name', { length: 255 }).notNull(),
	mimeType: varchar('mime_type', { length: 127 }).notNull(),
	size: integer('size').notNull(),
	url: text('url').notNull(),
	versionNumber: integer('version_number').notNull().default(1),
	baseFilename: varchar('base_filename', { length: 255 }).notNull(),
	uploadedAt: timestamp('uploaded_at').defaultNow().notNull()
});
