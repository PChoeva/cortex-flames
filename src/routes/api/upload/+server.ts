import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { uploadFile } from '$lib/server/storage/blob';
import type { RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

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

		// Check if file exists
		const existingFiles = await db.select()
			.from(document)
			.where(eq(document.originalName, file.name));

		// If file exists, append number
		let finalName = file.name;
		if (existingFiles.length > 0) {
			finalName = `${baseName} (${existingFiles.length})${ext}`;
		}

		const url = await uploadFile(file, finalName);

		const newDocument = await db.insert(document).values({
			filename: finalName,
			originalName: finalName,
			mimeType: file.type,
			size: file.size,
			url
		}).returning();

		return json({ success: true, document: newDocument[0] });
	} catch (e) {
		console.error('Upload error:', e);
		throw error(500, 'Failed to process upload');
	}
}
