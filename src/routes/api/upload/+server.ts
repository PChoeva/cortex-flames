import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { uploadFile } from '$lib/server/storage/blob';
import type { RequestHandler } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('document');

		if (!file || !(file instanceof File)) {
			throw error(400, 'No file uploaded');
		}

		// Get base name and extension
		const ext = file.name.match(/\.[^/.]+$/)?.[0] || '';
		const baseName = file.name.slice(0, -ext.length);

		// Check for both active and deleted files with the same name
		const existingFiles = await db.select()
			.from(document)
			.where(
				and(
					eq(document.originalName, file.name),
					or(
						eq(document.deleted, true),
						eq(document.deleted, false)
					)
				)
			);

		// If file exists (whether deleted or not), append number
		const finalName = existingFiles.length > 0 
			? `${baseName} (${existingFiles.length})${ext}`
			: file.name;

		const url = await uploadFile(file, finalName);

		// Insert new document
		const [newDocument] = await db.insert(document)
			.values({
				filename: finalName,
				originalName: file.name,  // Store original name without numbering
				mimeType: file.type,
				size: file.size,
				url,
				deleted: false,
				uploadedAt: new Date()
			})
			.returning();

		return json({ success: true, document: newDocument });
	} catch (e) {
		console.error('Upload error:', e);
		throw error(500, 'Failed to process upload');
	}
}
