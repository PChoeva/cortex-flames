import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { uploadFile } from '$lib/server/storage/blob';
import { EXTENSION_TO_MIME } from '$lib/constants';
import type { RequestHandler } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('document');

		if (!file || !(file instanceof File)) {
			throw error(400, 'No file uploaded');
		}

		const ext = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase() || '';
		const mimeType = EXTENSION_TO_MIME[ext];

		if (!mimeType) {
			throw error(400, 'Unsupported file type');
		}

		const baseName = file.name.slice(0, -ext.length);

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

		const finalName = existingFiles.length > 0 
			? `${baseName} (${existingFiles.length})${ext}`
			: file.name;

		const url = await uploadFile(file, finalName);

		const [newDocument] = await db.insert(document)
			.values({
				filename: finalName,
				originalName: file.name,
				mimeType,  // Use our mapped MIME type
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
